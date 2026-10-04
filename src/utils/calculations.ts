import { BillConfig, Friend, FriendBalance, SettlementTransfer } from '../types';

export function calculateTotalBill(config: BillConfig): number {
  const subtotal = Math.max(0, Number(config.subtotal) || 0);
  const tax = (subtotal * (Number(config.taxPercent) || 0)) / 100;
  const tip = (subtotal * (Number(config.tipPercent) || 0)) / 100;
  const discount = Math.max(0, Number(config.discountAmount) || 0);
  return Math.max(0, Math.round((subtotal + tax + tip - discount) * 100) / 100);
}

export function formatCurrency(amount: number, currency: string = '₹'): string {
  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency}${formatted}`;
}

export function computeFriendBalances(friends: Friend[], config: BillConfig): FriendBalance[] {
  const totalBill = calculateTotalBill(config);
  const friendCount = friends.length || 1;
  const equalShare = Math.round((totalBill / friendCount) * 100) / 100;

  return friends.map((f) => {
    // If split mode is equal, we dynamically compute the share.
    // If custom, we use f.assignedShare.
    const assigned = config.splitMode === 'equal' ? equalShare : (f.assignedShare || 0);
    const paid = f.amountPaid || 0;
    const balance = Math.round((assigned - paid) * 100) / 100;

    let statusType: 'zero' | 'positive' | 'negative';
    let statusMessage: string;

    if (Math.abs(balance) < 0.01) {
      statusType = 'zero';
      statusMessage = 'Payment complete · Settled ($0 balance remaining)';
    } else if (balance > 0) {
      statusType = 'positive';
      statusMessage = `Pending balance: Has to pay ${formatCurrency(balance, config.currency)}`;
    } else {
      statusType = 'negative';
      statusMessage = `Overpaid by ${formatCurrency(Math.abs(balance), config.currency)} (Credit / Refund due)`;
    }

    return {
      friendId: f.id,
      name: f.name,
      assignedShare: assigned,
      amountPaid: paid,
      balance,
      statusType,
      statusMessage,
    };
  });
}

/**
 * Calculates the minimal number of debt settlement transfers
 * using a greedy algorithm for debtor-creditor matching.
 */
export function calculateSettlements(friends: Friend[], config: BillConfig): SettlementTransfer[] {
  const balances = computeFriendBalances(friends, config);

  // debtors owe money (balance > 0)
  const debtors: { id: string; name: string; amount: number }[] = [];
  // creditors are owed money or overpaid (balance < 0)
  const creditors: { id: string; name: string; amount: number }[] = [];

  for (const b of balances) {
    if (b.balance > 0.01) {
      debtors.push({ id: b.friendId, name: b.name, amount: b.balance });
    } else if (b.balance < -0.01) {
      creditors.push({ id: b.friendId, name: b.name, amount: Math.abs(b.balance) });
    }
  }

  // If there are debtors but no explicit creditors (e.g. money goes to organizer or restaurant)
  const transfers: SettlementTransfer[] = [];
  const organizer = friends.find((f) => f.id === config.organizerId) || friends[0];

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];
    const transferAmount = Math.min(debtor.amount, creditor.amount);

    if (transferAmount > 0.01) {
      transfers.push({
        fromId: debtor.id,
        fromName: debtor.name,
        toId: creditor.id,
        toName: creditor.name,
        amount: Math.round(transferAmount * 100) / 100,
      });
    }

    debtor.amount -= transferAmount;
    creditor.amount -= transferAmount;

    if (debtor.amount <= 0.01) dIdx++;
    if (creditor.amount <= 0.01) cIdx++;
  }

  // Any remaining debtors pay directly to organizer if not already settled
  while (dIdx < debtors.length) {
    const debtor = debtors[dIdx];
    if (debtor.amount > 0.01 && debtor.id !== organizer?.id) {
      transfers.push({
        fromId: debtor.id,
        fromName: debtor.name,
        toId: organizer?.id || 'organizer',
        toName: organizer?.name || 'Organizer / Restaurant Counter',
        amount: Math.round(debtor.amount * 100) / 100,
      });
    }
    dIdx++;
  }

  return transfers;
}

export function generateWhatsAppSummary(config: BillConfig, friends: Friend[]): string {
  const total = calculateTotalBill(config);
  const balances = computeFriendBalances(friends, config);
  const settlements = calculateSettlements(friends, config);

  let text = `🎉 *${config.occasionName.toUpperCase()} — DINNER BILL SPLIT* 🎉\n`;
  text += `📍 Venue: ${config.venueName || 'Restaurant'}\n`;
  text += `📅 Date: ${config.date}\n`;
  text += `💰 Total Bill: ${formatCurrency(total, config.currency)}\n`;
  text += `👥 Split among ${friends.length} friends (${formatCurrency(total / (friends.length || 1), config.currency)} each)\n\n`;

  text += `📋 *INDIVIDUAL STATUS:*\n`;
  balances.forEach((b) => {
    let icon = '⏳';
    if (b.statusType === 'zero') icon = '✅';
    else if (b.statusType === 'negative') icon = '⭐';
    
    text += `${icon} *${b.name}*: Paid ${formatCurrency(b.amountPaid, config.currency)} / Share ${formatCurrency(b.assignedShare, config.currency)}`;
    if (b.statusType === 'zero') {
      text += ` (Settled)\n`;
    } else if (b.statusType === 'positive') {
      text += ` (Owes: ${formatCurrency(b.balance, config.currency)})\n`;
    } else {
      text += ` (Credit: +${formatCurrency(Math.abs(b.balance), config.currency)})\n`;
    }
  });

  if (settlements.length > 0) {
    text += `\n🤝 *HOW TO SETTLE UP:*\n`;
    settlements.forEach((s) => {
      text += `👉 ${s.fromName} pays ${formatCurrency(s.amount, config.currency)} to ${s.toName}\n`;
    });
  } else {
    text += `\n🎊 *All payments are 100% settled! No one owes anything.*\n`;
  }

  text += `\nGenerated via Bill Splitter 🍽️`;
  return text;
}
