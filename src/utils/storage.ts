import { BillConfig, Friend, PaymentTransaction, BillItem } from '../types';

export const STORAGE_KEY = 'bill_splitter_app_v1';

export const INITIAL_CONFIG: BillConfig = {
  occasionName: 'Birthday Party',
  venueName: 'The Grand Bistro & Lounge',
  date: new Date().toISOString().split('T')[0],
  currency: '₹', // Default Indian Rupee as asked in prompt, easily toggleable to $, €, £
  subtotal: 2500,
  taxPercent: 0,
  tipPercent: 0,
  discountAmount: 0,
  splitMode: 'equal',
  organizerId: 'f1',
};

export const INITIAL_FRIENDS: Friend[] = [
  {
    id: 'f1',
    name: 'Yash (Organizer)',
    email: 'yash@example.com',
    avatarColor: '#4f46e5',
    isOrganizer: true,
    assignedShare: 500,
    amountPaid: 500, // Yash already paid their own share
    notes: 'Paid table advance & booked party',
  },
  {
    id: 'f2',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    avatarColor: '#059669',
    isOrganizer: false,
    assignedShare: 500,
    amountPaid: 500, // Alex paid via UPI
    notes: 'Paid via GPay',
  },
  {
    id: 'f3',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    avatarColor: '#d97706',
    isOrganizer: false,
    assignedShare: 500,
    amountPaid: 650, // Overpaid! (Negative balance / Credit of 150)
    notes: 'Contributed extra for birthday balloons',
  },
  {
    id: 'f4',
    name: 'Liam Chen',
    email: 'liam@example.com',
    avatarColor: '#dc2626',
    isOrganizer: false,
    assignedShare: 500,
    amountPaid: 0, // Owes 500 (Positive balance)
    notes: 'Awaiting direct pay',
  },
  {
    id: 'f5',
    name: 'Sofia Martinez',
    email: 'sofia@example.com',
    avatarColor: '#7c3aed',
    isOrganizer: false,
    assignedShare: 500,
    amountPaid: 200, // Partial payment (Owes 300 remaining)
    notes: 'Paid 200 cash, 300 remaining',
  },
];

export const INITIAL_ITEMS: BillItem[] = [
  { id: 'i1', name: 'Chef Special Pizza (x2)', price: 700, quantity: 2, sharedByFriendIds: [] },
  { id: 'i2', name: 'Artisan Garlic Bread & Dip', price: 300, quantity: 1, sharedByFriendIds: [] },
  { id: 'i3', name: 'Birthday Chocolate Truffle Cake', price: 650, quantity: 1, sharedByFriendIds: [] },
  { id: 'i4', name: 'Signature Mocktails & Shakes', price: 550, quantity: 1, sharedByFriendIds: [] },
  { id: 'i5', name: 'Crispy Gourmet Fries Platter', price: 300, quantity: 1, sharedByFriendIds: [] },
];

export const INITIAL_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'tx-1',
    friendId: 'f1',
    friendName: 'Yash (Organizer)',
    amount: 500,
    method: 'Card',
    timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    referenceId: 'TXN-90281-POS',
    notes: 'Card payment at billing counter',
  },
  {
    id: 'tx-2',
    friendId: 'f2',
    friendName: 'Alex Johnson',
    amount: 500,
    method: 'UPI',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    referenceId: 'UPI-8492028-OK',
    notes: 'Instant UPI settlement via Google Pay',
  },
  {
    id: 'tx-3',
    friendId: 'f3',
    friendName: 'Priya Sharma',
    amount: 650,
    method: 'UPI',
    timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    referenceId: 'UPI-9923841-OK',
    notes: 'Included extra 150 for decorations',
  },
  {
    id: 'tx-4',
    friendId: 'f5',
    friendName: 'Sofia Martinez',
    amount: 200,
    method: 'Cash',
    timestamp: new Date(Date.now() - 1800000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    referenceId: 'CSH-HANDOVER-01',
    notes: 'Handed 200 cash at table',
  },
];

export interface AppState {
  config: BillConfig;
  friends: Friend[];
  items: BillItem[];
  transactions: PaymentTransaction[];
}

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.config && Array.isArray(parsed.friends)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse saved state from localStorage:', err);
  }

  return {
    config: INITIAL_CONFIG,
    friends: INITIAL_FRIENDS,
    items: INITIAL_ITEMS,
    transactions: INITIAL_TRANSACTIONS,
  };
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function resetAppStateToDefault(): AppState {
  const fresh: AppState = {
    config: { ...INITIAL_CONFIG, date: new Date().toISOString().split('T')[0] },
    friends: JSON.parse(JSON.stringify(INITIAL_FRIENDS)),
    items: JSON.parse(JSON.stringify(INITIAL_ITEMS)),
    transactions: JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS)),
  };
  saveAppState(fresh);
  return fresh;
}
