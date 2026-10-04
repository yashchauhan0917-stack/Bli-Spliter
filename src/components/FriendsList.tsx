import React, { useState } from 'react';
import { Users, UserPlus, Search, CheckCircle2, AlertCircle, TrendingDown, DollarSign, X, Edit3, Trash2, ArrowRight } from 'lucide-react';
import { BillConfig, Friend, FriendBalance } from '../types';
import { computeFriendBalances, formatCurrency } from '../utils/calculations';

interface FriendsListProps {
  config: BillConfig;
  friends: Friend[];
  onOpenPayModal: (friend: Friend) => void;
  onQuickMarkPaid: (friendId: string) => void;
  onAddFriend: (name: string, customShare?: number) => void;
  onRemoveFriend: (friendId: string) => void;
  onUpdateFriendShare: (friendId: string, newShare: number) => void;
  filterStatus: 'all' | 'zero' | 'positive' | 'negative';
  onFilterChange: (filter: 'all' | 'zero' | 'positive' | 'negative') => void;
}

export const FriendsList: React.FC<FriendsListProps> = ({
  config,
  friends,
  onOpenPayModal,
  onQuickMarkPaid,
  onAddFriend,
  onRemoveFriend,
  onUpdateFriendShare,
  filterStatus,
  onFilterChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');
  const [editingShareId, setEditingShareId] = useState<string | null>(null);
  const [editingShareVal, setEditingShareVal] = useState<string>('');

  const balances: FriendBalance[] = computeFriendBalances(friends, config);
  const balanceMap = new Map<string, FriendBalance>(balances.map((b) => [b.friendId, b]));

  // Apply Search & Filter
  const filteredFriends = friends.filter((friend) => {
    const matchesSearch = friend.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (filterStatus === 'all') return true;
    const b = balanceMap.get(friend.id);
    if (!b) return true;
    return b.statusType === filterStatus;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFriendName.trim()) {
      onAddFriend(newFriendName.trim());
      setNewFriendName('');
      setIsAddingFriend(false);
    }
  };

  const handleSaveShare = (friendId: string) => {
    const num = parseFloat(editingShareVal);
    if (!isNaN(num) && num >= 0) {
      onUpdateFriendShare(friendId, num);
    }
    setEditingShareId(null);
  };

  return (
    <section id="friends-section" className="bg-white border border-stone-200 rounded-xl p-6 sm:p-7 mb-8 shadow-sm">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-stone-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-stone-900">
              Friends Roster & Payment Actions
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Click 'Pay Directly' on any friend to simulate instant UPI/Card/Cash settlement.
          </p>
        </div>

        {/* Controls: Search, Filter tabs, and Add Friend button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search friend..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Add Friend Trigger */}
          <button
            onClick={() => setIsAddingFriend(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-amber-500 hover:bg-amber-600 shadow-sm transition-colors whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Friend</span>
          </button>
        </div>
      </div>

      {/* Filter Segmented Controls */}
      <div className="flex flex-wrap items-center gap-1.5 py-4 border-b border-stone-100 text-xs">
        <span className="text-stone-500 mr-1 text-xs">Filter Status:</span>
        <button
          onClick={() => onFilterChange('all')}
          className={`px-3 py-1 rounded-md transition-colors ${
            filterStatus === 'all'
              ? 'bg-stone-900 text-white font-medium'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          All Friends ({friends.length})
        </button>
        <button
          onClick={() => onFilterChange('positive')}
          className={`px-3 py-1 rounded-md transition-colors ${
            filterStatus === 'positive'
              ? 'bg-amber-500 text-white font-medium'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          Owes Balance ({balances.filter((b) => b.statusType === 'positive').length})
        </button>
        <button
          onClick={() => onFilterChange('zero')}
          className={`px-3 py-1 rounded-md transition-colors ${
            filterStatus === 'zero'
              ? 'bg-emerald-600 text-white font-medium'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          Settled ($0) ({balances.filter((b) => b.statusType === 'zero').length})
        </button>
        <button
          onClick={() => onFilterChange('negative')}
          className={`px-3 py-1 rounded-md transition-colors ${
            filterStatus === 'negative'
              ? 'bg-blue-600 text-white font-medium'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          Overpaid / Credit ({balances.filter((b) => b.statusType === 'negative').length})
        </button>
      </div>

      {/* Add Friend Form Drawer/Box */}
      {isAddingFriend && (
        <form onSubmit={handleAddSubmit} className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Friend's Full Name
            </label>
            <input
              type="text"
              value={newFriendName}
              onChange={(e) => setNewFriendName(e.target.value)}
              placeholder="e.g. Rohan Gupta"
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto pt-2 sm:pt-4">
            <button
              type="submit"
              disabled={!newFriendName.trim()}
              className="px-4 py-2 text-xs font-semibold bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white rounded-lg shadow-sm"
            >
              Add to Dinner Table
            </button>
            <button
              type="button"
              onClick={() => setIsAddingFriend(false)}
              className="px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Friends Cards Grid */}
      {filteredFriends.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
          {filteredFriends.map((friend) => {
            const b = balanceMap.get(friend.id) || {
              assignedShare: 500,
              amountPaid: 0,
              balance: 500,
              statusType: 'positive' as const,
              statusMessage: 'Pending',
            };

            const isZero = b.statusType === 'zero';
            const isPositive = b.statusType === 'positive';
            const isNegative = b.statusType === 'negative';

            return (
              <div
                key={friend.id}
                className={`rounded-xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                  isZero
                    ? 'border-emerald-200 bg-emerald-50/20 shadow-sm'
                    : isNegative
                    ? 'border-blue-200 bg-blue-50/20 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-amber-300 shadow-sm'
                }`}
              >
                <div>
                  {/* Card Header: Avatar, Name, Role & Delete */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                        style={{ backgroundColor: friend.avatarColor }}
                      >
                        {friend.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-stone-900 text-sm">{friend.name}</h3>
                          {friend.isOrganizer && (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              Organizer
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500">
                          {friend.notes || 'Guest at party'}
                        </p>
                      </div>
                    </div>

                    {!friend.isOrganizer && (
                      <button
                        onClick={() => onRemoveFriend(friend.id)}
                        className="text-stone-300 hover:text-red-500 p-1 rounded transition-colors"
                        title="Remove friend from bill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Financial Breakdown: Target Share vs Paid */}
                  <div className="bg-stone-50/80 rounded-lg p-3 text-xs space-y-1.5 mb-3 border border-stone-100 font-mono">
                    <div className="flex justify-between items-center text-stone-600">
                      <span>Assigned Share:</span>
                      {config.splitMode === 'custom' && editingShareId === friend.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editingShareVal}
                            onChange={(e) => setEditingShareVal(e.target.value)}
                            className="w-16 px-1 py-0.5 text-xs border rounded bg-white"
                          />
                          <button
                            onClick={() => handleSaveShare(friend.id)}
                            className="text-[10px] text-emerald-600 font-bold"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-stone-900">
                            {formatCurrency(b.assignedShare, config.currency)}
                          </span>
                          {config.splitMode === 'custom' && (
                            <button
                              onClick={() => {
                                setEditingShareId(friend.id);
                                setEditingShareVal(String(b.assignedShare));
                              }}
                              className="text-stone-400 hover:text-stone-600"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between text-stone-600">
                      <span>Paid so far:</span>
                      <span className="font-bold text-stone-900">
                        {formatCurrency(b.amountPaid, config.currency)}
                      </span>
                    </div>

                    <div className="flex justify-between pt-1 border-t border-stone-200/70 font-semibold">
                      <span className="text-stone-700">Net Balance:</span>
                      <span
                        className={`tabular-nums ${
                          isZero
                            ? 'text-emerald-700'
                            : isNegative
                            ? 'text-blue-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {isZero && '0.00 (Settled)'}
                        {isPositive && `+${formatCurrency(b.balance, config.currency)} owed`}
                        {isNegative && `-${formatCurrency(Math.abs(b.balance), config.currency)} credit`}
                      </span>
                    </div>
                  </div>

                  {/* Explicit Balance Status Message (User Requirement) */}
                  <div
                    className={`rounded-lg p-2.5 text-xs flex items-start gap-2 mb-4 ${
                      isZero
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : isPositive
                        ? 'bg-amber-50 text-amber-900 border border-amber-200'
                        : 'bg-blue-50 text-blue-900 border border-blue-200'
                    }`}
                  >
                    {isZero ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : isPositive ? (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-snug font-medium">
                      {b.statusMessage}
                    </span>
                  </div>
                </div>

                {/* Direct Payment Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  {isPositive ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenPayModal(friend)}
                        className="flex-1 py-2 px-3 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>⚡ Pay Directly</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onQuickMarkPaid(friend.id)}
                        className="py-2 px-2.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg transition-colors"
                        title="Mark exact share as paid"
                      >
                        Full Paid
                      </button>
                    </div>
                  ) : isZero ? (
                    <div className="flex items-center justify-between py-1 px-1">
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Payment Done</span>
                      </span>
                      <button
                        onClick={() => onOpenPayModal(friend)}
                        className="text-[11px] text-stone-500 hover:text-stone-900 underline underline-offset-2"
                      >
                        Add extra tip
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between py-1 px-1 text-xs text-blue-700 font-medium">
                      <span>Holds overpayment credit</span>
                      <button
                        onClick={() => onOpenPayModal(friend)}
                        className="text-[11px] text-stone-500 hover:text-stone-900 underline underline-offset-2"
                      >
                        Adjust
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Explicit "No Result" State (Prompt requirement: "also show no result") */
        <div className="py-12 px-4 text-center bg-stone-50/70 border border-dashed border-stone-300 rounded-xl my-4">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-800">
            No Matching Friends Found
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `No friend matches "${searchTerm}" in the current filter.`
              : `There are currently no friends with "${filterStatus}" balance status.`}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setSearchTerm('');
                onFilterChange('all');
              }}
              className="px-4 py-2 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition-colors"
            >
              Reset Search & Show All
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
