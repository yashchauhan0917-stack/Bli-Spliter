import React, { useState, useEffect } from 'react';
import { BillConfig, Friend, PaymentTransaction, BillItem, SettlementTransfer } from './types';
import { loadAppState, saveAppState, resetAppStateToDefault, INITIAL_CONFIG, INITIAL_FRIENDS, INITIAL_ITEMS, INITIAL_TRANSACTIONS } from './utils/storage';
import { calculateTotalBill, computeFriendBalances } from './utils/calculations';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { DashboardStatus } from './components/DashboardStatus';
import { BillCalculator } from './components/BillCalculator';
import { FriendsList } from './components/FriendsList';
import { DirectPayModal } from './components/DirectPayModal';
import { SettlementSummary } from './components/SettlementSummary';
import { ItemsManager } from './components/ItemsManager';
import { ActivityLedger } from './components/ActivityLedger';
import { PrintReceiptModal } from './components/PrintReceiptModal';

export default function App() {
  // Initialize state from local storage or defaults
  const [state, setState] = useState(() => loadAppState());
  const [selectedPayFriend, setSelectedPayFriend] = useState<Friend | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'zero' | 'positive' | 'negative'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-sync state changes to localStorage
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Config updates
  const handleUpdateConfig = (newConfig: Partial<BillConfig>) => {
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, ...newConfig },
    }));
  };

  // Direct Pay Actions
  const handleOpenPayModal = (friend: Friend) => {
    setSelectedPayFriend(friend);
    setIsPayModalOpen(true);
  };

  const handleClosePayModal = () => {
    setIsPayModalOpen(false);
    setSelectedPayFriend(null);
  };

  const handleConfirmPayment = (tx: Omit<PaymentTransaction, 'id' | 'timestamp'>) => {
    const newTx: PaymentTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setState((prev) => {
      const updatedFriends = prev.friends.map((f) => {
        if (f.id === tx.friendId) {
          return {
            ...f,
            amountPaid: Math.round(((f.amountPaid || 0) + tx.amount) * 100) / 100,
          };
        }
        return f;
      });

      return {
        ...prev,
        friends: updatedFriends,
        transactions: [newTx, ...prev.transactions],
      };
    });

    showToast(`Payment of ${state.config.currency}${tx.amount} recorded for ${tx.friendName}!`);
  };

  const handleQuickMarkPaid = (friendId: string) => {
    const friend = state.friends.find((f) => f.id === friendId);
    if (!friend) return;

    const totalBill = calculateTotalBill(state.config);
    const equalShare = Math.round((totalBill / (state.friends.length || 1)) * 100) / 100;
    const assigned = state.config.splitMode === 'equal' ? equalShare : (friend.assignedShare || 0);
    const owed = Math.max(0, Math.round((assigned - (friend.amountPaid || 0)) * 100) / 100);

    if (owed <= 0) return;

    const mockTx: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      friendId: friend.id,
      friendName: friend.name,
      amount: owed,
      method: 'UPI',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      referenceId: `QUICK-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: 'Quick settlement to zero balance',
    };

    setState((prev) => ({
      ...prev,
      friends: prev.friends.map((f) =>
        f.id === friendId ? { ...f, amountPaid: Math.round(((f.amountPaid || 0) + owed) * 100) / 100 } : f
      ),
      transactions: [mockTx, ...prev.transactions],
    }));

    showToast(`Marked ${friend.name}'s share as fully paid! Zero balance achieved.`);
  };

  const handleAddFriend = (name: string, customShare?: number) => {
    const colors = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#ea580c', '#475569'];
    const newFriend: Friend = {
      id: `f-${Date.now()}`,
      name,
      avatarColor: colors[state.friends.length % colors.length],
      isOrganizer: false,
      assignedShare: customShare || 500,
      amountPaid: 0,
      notes: 'Added to bill',
    };

    setState((prev) => ({
      ...prev,
      friends: [...prev.friends, newFriend],
    }));

    showToast(`Added ${name} to dinner split.`);
  };

  const handleRemoveFriend = (friendId: string) => {
    const friend = state.friends.find((f) => f.id === friendId);
    if (!friend || friend.isOrganizer) return;

    setState((prev) => ({
      ...prev,
      friends: prev.friends.filter((f) => f.id !== friendId),
      transactions: prev.transactions.filter((t) => t.friendId !== friendId),
    }));

    showToast(`Removed ${friend.name} from bill.`);
  };

  const handleUpdateFriendShare = (friendId: string, newShare: number) => {
    setState((prev) => ({
      ...prev,
      friends: prev.friends.map((f) => (f.id === friendId ? { ...f, assignedShare: newShare } : f)),
    }));
  };

  const handleReversePayment = (txId: string) => {
    const tx = state.transactions.find((t) => t.id === txId);
    if (!tx) return;

    setState((prev) => ({
      ...prev,
      friends: prev.friends.map((f) => {
        if (f.id === tx.friendId) {
          return {
            ...f,
            amountPaid: Math.max(0, Math.round(((f.amountPaid || 0) - tx.amount) * 100) / 100),
          };
        }
        return f;
      }),
      transactions: prev.transactions.filter((t) => t.id !== txId),
    }));

    showToast(`Reversed payment of ${state.config.currency}${tx.amount} for ${tx.friendName}.`);
  };

  const handleSettleTransfer = (transfer: SettlementTransfer) => {
    const tx: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      friendId: transfer.fromId,
      friendName: transfer.fromName,
      amount: transfer.amount,
      method: 'UPI',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      referenceId: `SETTLE-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: `Settlement transfer from ${transfer.fromName} to ${transfer.toName}`,
    };

    setState((prev) => ({
      ...prev,
      friends: prev.friends.map((f) => {
        if (f.id === transfer.fromId) {
          return { ...f, amountPaid: Math.round(((f.amountPaid || 0) + transfer.amount) * 100) / 100 };
        }
        return f;
      }),
      transactions: [tx, ...prev.transactions],
    }));

    showToast(`Recorded settlement: ${transfer.fromName} paid ${state.config.currency}${transfer.amount} to ${transfer.toName}.`);
  };

  // Dish items management
  const handleAddItem = (item: Omit<BillItem, 'id'>) => {
    const newItem: BillItem = { ...item, id: `i-${Date.now()}` };
    setState((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    showToast(`Added ${item.name} to dishes.`);
  };

  const handleRemoveItem = (itemId: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== itemId),
    }));
  };

  const handleToggleFriendOnItem = (itemId: string, friendId: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) => {
        if (i.id === itemId) {
          const exists = i.sharedByFriendIds.includes(friendId);
          return {
            ...i,
            sharedByFriendIds: exists
              ? i.sharedByFriendIds.filter((id) => id !== friendId)
              : [...i.sharedByFriendIds, friendId],
          };
        }
        return i;
      }),
    }));
  };

  // Presets
  const handleApplyPreset = (preset: 'birthday' | 'casual' | 'office') => {
    if (preset === 'birthday') {
      // 5 friends @ 500 = 2500
      setState(resetAppStateToDefault());
      showToast('Loaded Birthday Party preset (5 friends @ 500 each).');
    } else if (preset === 'casual') {
      // 4 friends @ 350 = 1400
      setState({
        config: {
          ...INITIAL_CONFIG,
          occasionName: 'Weekend Pizza & Craft Beer',
          venueName: 'Slice & Pint Pizzeria',
          subtotal: 1400,
          currency: state.config.currency,
        },
        friends: INITIAL_FRIENDS.slice(0, 4).map((f) => ({ ...f, assignedShare: 350, amountPaid: 0 })),
        items: [
          { id: 'i1', name: 'Wood-fired Pepperoni Pizza', price: 600, quantity: 1, sharedByFriendIds: [] },
          { id: 'i2', name: 'Craft IPA Pitcher', price: 500, quantity: 1, sharedByFriendIds: [] },
          { id: 'i3', name: 'Garlic Knots & Buffalo Wings', price: 300, quantity: 1, sharedByFriendIds: [] },
        ],
        transactions: [],
      });
      showToast('Loaded Weekend Pizza preset (4 friends @ 350 each).');
    } else if (preset === 'office') {
      // 6 friends @ 600 = 3600
      const extraFriend: Friend = {
        id: 'f6',
        name: 'David Kim',
        avatarColor: '#0891b2',
        isOrganizer: false,
        assignedShare: 600,
        amountPaid: 0,
        notes: 'Engineering team',
      };
      setState({
        config: {
          ...INITIAL_CONFIG,
          occasionName: 'Team Project Celebration Feast',
          venueName: 'Spice Route Bistro',
          subtotal: 3600,
          currency: state.config.currency,
        },
        friends: [...INITIAL_FRIENDS.map((f) => ({ ...f, assignedShare: 600, amountPaid: 0 })), extraFriend],
        items: INITIAL_ITEMS,
        transactions: [],
      });
      showToast('Loaded Team Feast preset (6 friends @ 600 each).');
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all split records back to Birthday Party default state?')) {
      const fresh = resetAppStateToDefault();
      setState(fresh);
      showToast('Reset to Birthday Party defaults (5 friends @ 500 each).');
    }
  };

  // Compute active target share for selected friend in pay modal
  const total = calculateTotalBill(state.config);
  const equalShare = Math.round((total / (state.friends.length || 1)) * 100) / 100;
  const currentFriendShare = selectedPayFriend
    ? state.config.splitMode === 'equal'
      ? equalShare
      : (selectedPayFriend.assignedShare || 500)
    : 500;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-stone-700 flex items-center gap-2 transform transition-all animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        config={state.config}
        friends={state.friends}
        onUpdateConfig={handleUpdateConfig}
        onResetDefaults={handleResetDefaults}
        onOpenReceipt={() => setIsReceiptModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Dinner Celebration Hero */}
        <HeroBanner
          config={state.config}
          friends={state.friends}
          onUpdateConfig={handleUpdateConfig}
          onApplyPreset={handleApplyPreset}
        />

        {/* Dynamic Balance & Dashboard Status Engine */}
        <DashboardStatus
          config={state.config}
          friends={state.friends}
          onSelectStatusFilter={(filter) => setFilterStatus(filter)}
          activeFilter={filterStatus}
        />

        {/* Bill & Tip Calculator Section */}
        <BillCalculator
          config={state.config}
          friends={state.friends}
          onUpdateConfig={handleUpdateConfig}
        />

        {/* Friends Roster & Direct Payment Cards */}
        <FriendsList
          config={state.config}
          friends={state.friends}
          onOpenPayModal={handleOpenPayModal}
          onQuickMarkPaid={handleQuickMarkPaid}
          onAddFriend={handleAddFriend}
          onRemoveFriend={handleRemoveFriend}
          onUpdateFriendShare={handleUpdateFriendShare}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />

        {/* Who Pays Whom: Minimized Settlements */}
        <SettlementSummary
          config={state.config}
          friends={state.friends}
          onSettleTransfer={handleSettleTransfer}
        />

        {/* Itemized Dinner Dishes */}
        <ItemsManager
          items={state.items}
          friends={state.friends}
          config={state.config}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onToggleFriendOnItem={handleToggleFriendOnItem}
        />

        {/* Transaction History & Audit Ledger */}
        <ActivityLedger
          transactions={state.transactions}
          config={state.config}
          onReversePayment={handleReversePayment}
        />
      </main>

      {/* Direct Payment Simulator Modal */}
      <DirectPayModal
        isOpen={isPayModalOpen}
        onClose={handleClosePayModal}
        friend={selectedPayFriend}
        config={state.config}
        calculatedShare={currentFriendShare}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* Printable Receipt Modal */}
      <PrintReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        config={state.config}
        friends={state.friends}
        items={state.items}
      />

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 mt-12 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Bill Splitter · Group Dinner & Birthday Party Settlement</span>
          <span>Automatic Local Storage Persistence Enabled</span>
        </div>
      </footer>
    </div>
  );
}
