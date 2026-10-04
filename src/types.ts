export interface Friend {
  id: string;
  name: string;
  email?: string;
  avatarColor: string;
  isOrganizer: boolean;
  assignedShare: number; // What they are supposed to pay
  amountPaid: number;    // What they have paid so far
  notes?: string;
}

export interface PaymentTransaction {
  id: string;
  friendId: string;
  friendName: string;
  amount: number;
  method: 'UPI' | 'Card' | 'Cash' | 'ApplePay' | 'GooglePay';
  timestamp: string;
  referenceId: string;
  notes?: string;
}

export interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sharedByFriendIds: string[]; // empty means all
}

export interface BillConfig {
  occasionName: string;
  venueName: string;
  date: string;
  currency: string;
  subtotal: number;
  taxPercent: number;
  tipPercent: number;
  discountAmount: number;
  splitMode: 'equal' | 'itemized' | 'custom';
  organizerId: string;
}

export interface SettlementTransfer {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
}

export type BalanceStatusType = 'zero' | 'positive' | 'negative';

export interface FriendBalance {
  friendId: string;
  name: string;
  assignedShare: number;
  amountPaid: number;
  balance: number; // positive = owes money, negative = overpaid/credit, 0 = settled
  statusType: BalanceStatusType;
  statusMessage: string;
}
