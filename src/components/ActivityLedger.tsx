import React from 'react';
import { History, QrCode, CreditCard, Banknote, Smartphone, Undo2, CheckCircle2 } from 'lucide-react';
import { PaymentTransaction, BillConfig } from '../types';
import { formatCurrency } from '../utils/calculations';

interface ActivityLedgerProps {
  transactions: PaymentTransaction[];
  config: BillConfig;
  onReversePayment: (transactionId: string) => void;
}

export const ActivityLedger: React.FC<ActivityLedgerProps> = ({
  transactions,
  config,
  onReversePayment,
}) => {
  const getMethodIcon = (method: PaymentTransaction['method']) => {
    switch (method) {
      case 'UPI':
        return <QrCode className="w-3.5 h-3.5 text-amber-600" />;
      case 'Card':
        return <CreditCard className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Cash':
        return <Banknote className="w-3.5 h-3.5 text-green-600" />;
      case 'GooglePay':
      case 'ApplePay':
        return <Smartphone className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-stone-600" />;
    }
  };

  return (
    <section id="activity-section" className="bg-white border border-stone-200 rounded-xl p-6 sm:p-7 mb-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-200 gap-2">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-600" />
            <span>Direct Payment History & Ledger</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Audit log of all instant payments, receipts, timestamps, and settlement methods recorded during the meal.
          </p>
        </div>

        <span className="text-xs font-mono font-medium text-stone-500">
          {transactions.length} Total Transactions
        </span>
      </div>

      <div className="pt-4">
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Friend</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Ref ID</th>
                  <th className="py-2.5 px-3">Notes</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-3 text-stone-500 whitespace-nowrap">
                      {tx.timestamp}
                    </td>
                    <td className="py-3 px-3 font-semibold text-stone-900 font-sans whitespace-nowrap">
                      {tx.friendName}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-[11px] font-sans text-stone-700">
                        {getMethodIcon(tx.method)}
                        <span>{tx.method}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-stone-500 text-[11px] whitespace-nowrap">
                      {tx.referenceId}
                    </td>
                    <td className="py-3 px-3 text-stone-600 font-sans text-[11px] max-w-xs truncate">
                      {tx.notes || '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-stone-900 tabular-nums">
                      {formatCurrency(tx.amount, config.currency)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onReversePayment(tx.id)}
                        className="p-1 text-stone-400 hover:text-red-600 rounded transition-colors"
                        title="Reverse/Undo this transaction"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-stone-500">
            No payments recorded yet. Click 'Pay Directly' on any friend to simulate payment.
          </div>
        )}
      </div>
    </section>
  );
};
