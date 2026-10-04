import React, { useState } from 'react';
import { X, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';
import { BillConfig, Friend, BillItem } from '../types';
import { calculateTotalBill, computeFriendBalances, formatCurrency } from '../utils/calculations';

interface PrintReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BillConfig;
  friends: Friend[];
  items: BillItem[];
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  isOpen,
  onClose,
  config,
  friends,
  items,
}) => {
  const [imageError, setImageError] = useState(false);
  if (!isOpen) return null;

  const total = calculateTotalBill(config);
  const balances = computeFriendBalances(friends, config);
  const totalPaid = friends.reduce((sum, f) => sum + (f.amountPaid || 0), 0);
  const isFullySettled = totalPaid >= total;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden">
        {/* Top bar controls */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-stone-50 no-print">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Printable Restaurant Dining Receipt
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bill</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-6 sm:p-8 bg-stone-50/50 font-mono text-xs">
          {/* Header Image Aesthetic */}
          <div className="mb-4 rounded-lg overflow-hidden border border-stone-200 h-28 relative">
            {!imageError ? (
              <img
                src="/src/assets/images/restaurant_bill_receipt_1791091288444.jpg"
                alt="Restaurant bill receipt"
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover filter brightness-95"
              />
            ) : (
              <div className="w-full h-full bg-stone-800 flex items-center justify-center text-stone-400 text-xs">
                {config.venueName}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-3">
              <span className="text-white text-xs font-bold">Official Dining Slip</span>
            </div>
          </div>

          {/* Restaurant Brand */}
          <div className="text-center pb-4 border-b border-dashed border-stone-300">
            <h3 className="text-base font-bold text-stone-900 font-sans uppercase">
              {config.venueName}
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Occasion: {config.occasionName}
            </p>
            <p className="text-[11px] text-stone-500">
              Date: {config.date} · Split between {friends.length} Guests
            </p>
          </div>

          {/* Itemized Order */}
          <div className="py-4 border-b border-dashed border-stone-300 space-y-2">
            <div className="flex justify-between font-bold text-stone-700 uppercase text-[10px]">
              <span>Item Description</span>
              <span>Amount</span>
            </div>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-stone-700">
                <span>
                  {item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}
                </span>
                <span className="tabular-nums font-bold">
                  {formatCurrency(item.price * item.quantity, config.currency)}
                </span>
              </div>
            ))}
          </div>

          {/* Math breakdown */}
          <div className="py-3 border-b border-dashed border-stone-300 space-y-1.5">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal:</span>
              <span className="tabular-nums">{formatCurrency(config.subtotal, config.currency)}</span>
            </div>
            {config.tipPercent > 0 && (
              <div className="flex justify-between text-stone-600">
                <span>Tip ({config.tipPercent}%):</span>
                <span className="tabular-nums">
                  +{formatCurrency((config.subtotal * config.tipPercent) / 100, config.currency)}
                </span>
              </div>
            )}
            {config.taxPercent > 0 && (
              <div className="flex justify-between text-stone-600">
                <span>Tax ({config.taxPercent}%):</span>
                <span className="tabular-nums">
                  +{formatCurrency((config.subtotal * config.taxPercent) / 100, config.currency)}
                </span>
              </div>
            )}
            {config.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span className="tabular-nums">-{formatCurrency(config.discountAmount, config.currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-stone-900 pt-1">
              <span>Grand Total:</span>
              <span className="tabular-nums">{formatCurrency(total, config.currency)}</span>
            </div>
          </div>

          {/* Individual Share & Payment Stamp */}
          <div className="py-4 border-b border-dashed border-stone-300 space-y-2">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Individual Guest Settlement:
            </span>
            {balances.map((b) => (
              <div key={b.friendId} className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-stone-800">{b.name}</span>
                <div className="text-right">
                  <span className="tabular-nums text-stone-700">
                    Paid {formatCurrency(b.amountPaid, config.currency)}
                  </span>
                  <span className={`ml-2 font-bold ${
                    b.statusType === 'zero'
                      ? 'text-emerald-700'
                      : b.statusType === 'negative'
                      ? 'text-blue-700'
                      : 'text-amber-700'
                  }`}>
                    [{b.statusType === 'zero' ? 'PAID' : b.statusType === 'negative' ? 'CREDIT' : 'OWES'}]
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bill Stamp */}
          <div className="pt-4 text-center">
            <div className={`inline-block px-4 py-1.5 border-2 rounded-lg font-bold text-sm tracking-wider uppercase ${
              isFullySettled
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                : 'border-amber-600 text-amber-700 bg-amber-50'
            }`}>
              {isFullySettled ? '✓ ALL PAYMENTS SETTLED' : 'PARTIAL TABLE SETTLEMENT'}
            </div>
            <p className="text-[10px] text-stone-400 mt-2">
              Thank you for dining! Settle directly via UPI or card.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
