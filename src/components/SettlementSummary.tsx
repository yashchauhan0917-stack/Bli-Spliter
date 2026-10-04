import React, { useState } from 'react';
import { ArrowRight, Share2, Check, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { BillConfig, Friend, SettlementTransfer } from '../types';
import { calculateSettlements, calculateTotalBill, formatCurrency, generateWhatsAppSummary } from '../utils/calculations';

interface SettlementSummaryProps {
  config: BillConfig;
  friends: Friend[];
  onSettleTransfer: (transfer: SettlementTransfer) => void;
}

export const SettlementSummary: React.FC<SettlementSummaryProps> = ({
  config,
  friends,
  onSettleTransfer,
}) => {
  const [copied, setCopied] = useState(false);
  const settlements = calculateSettlements(friends, config);
  const total = calculateTotalBill(config);
  const totalPaid = friends.reduce((sum, f) => sum + (f.amountPaid || 0), 0);
  const pendingAmount = Math.max(0, total - totalPaid);

  const handleCopyWhatsApp = async () => {
    const text = generateWhatsAppSummary(config, friends);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="settlement-section" className="bg-white border border-stone-200 rounded-xl p-6 sm:p-7 mb-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-200 gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>Smart Debt Settlement Matrix (Who Pays Whom)</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Optimized minimal cash flow algorithm so friends settle debts with the fewest possible transactions.
          </p>
        </div>

        <button
          onClick={handleCopyWhatsApp}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 hover:bg-stone-800 text-white shadow-sm transition-colors self-start sm:self-auto"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy WhatsApp Bill Text'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        {/* Transfers List */}
        <div className="lg:col-span-2 space-y-3">
          {settlements.length > 0 ? (
            settlements.map((tx, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-stone-50 border border-stone-200 gap-3 hover:border-amber-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                    <span className="text-stone-950 font-bold">{tx.fromName}</span>
                    <span className="text-xs text-stone-500 font-normal">pays</span>
                    <ArrowRight className="w-4 h-4 text-amber-600" />
                    <span className="text-stone-950 font-bold">{tx.toName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span className="text-base font-extrabold font-mono text-stone-900">
                    {formatCurrency(tx.amount, config.currency)}
                  </span>
                  <button
                    onClick={() => onSettleTransfer(tx)}
                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-colors"
                    title="Mark this transfer as paid"
                  >
                    Mark Settled
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 px-4 text-center bg-emerald-50/50 border border-emerald-200 rounded-xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-emerald-900">
                100% Settle Balance Achieved!
              </h4>
              <p className="text-xs text-emerald-700 mt-1 max-w-sm mx-auto">
                No peer-to-peer transfers are required. Every friend has paid their target dinner share.
              </p>
            </div>
          )}
        </div>

        {/* Ledger Health Card */}
        <div className="bg-stone-50/80 border border-stone-200 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-3">
              Table Balance Ledger
            </span>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-stone-600">
                <span>Total Bill Value:</span>
                <span className="font-bold text-stone-900">{formatCurrency(total, config.currency)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Collected so far:</span>
                <span className="font-bold text-emerald-700">{formatCurrency(totalPaid, config.currency)}</span>
              </div>
              <div className="flex justify-between text-stone-600 pt-2 border-t border-stone-200">
                <span>Outstanding Gap:</span>
                <span className={`font-bold ${pendingAmount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {pendingAmount > 0 ? formatCurrency(pendingAmount, config.currency) : '0.00 (Fully Paid)'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 mt-4">
            <p className="text-[11px] text-stone-500 leading-normal">
              💡 Tip: When everyone pays via UPI/Card, the organizer receives the amounts and settles the restaurant bill directly at the counter.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
