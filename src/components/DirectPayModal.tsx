import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, QrCode, CreditCard, Banknote, Smartphone, ShieldCheck, ArrowRight, Copy, Check } from 'lucide-react';
import { BillConfig, Friend, PaymentTransaction } from '../types';
import { formatCurrency } from '../utils/calculations';

interface DirectPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: Friend | null;
  config: BillConfig;
  calculatedShare: number;
  onConfirmPayment: (tx: Omit<PaymentTransaction, 'id' | 'timestamp'>) => void;
}

export const DirectPayModal: React.FC<DirectPayModalProps> = ({
  isOpen,
  onClose,
  friend,
  config,
  calculatedShare,
  onConfirmPayment,
}) => {
  if (!isOpen || !friend) return null;

  const currentOwed = Math.max(0, calculatedShare - (friend.amountPaid || 0));
  const [payAmount, setPayAmount] = useState<number>(currentOwed || 500);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Cash' | 'GooglePay'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successTxId, setSuccessTxId] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [paymentNote, setPaymentNote] = useState('');

  // Reset when friend changes
  useEffect(() => {
    const owed = Math.max(0, calculatedShare - (friend.amountPaid || 0));
    setPayAmount(owed > 0 ? owed : 500);
    setIsProcessing(false);
    setIsSuccess(false);
    setPaymentNote('');
  }, [friend, calculatedShare]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('yash.organizer@oksbi');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleExecutePayment = () => {
    if (payAmount <= 0) return;

    setIsProcessing(true);
    const mockRefId = paymentMethod === 'UPI'
      ? `UPI-${Math.floor(1000000 + Math.random() * 9000000)}`
      : paymentMethod === 'Card'
      ? `CARD-${Math.floor(10000 + Math.random() * 90000)}`
      : paymentMethod === 'Cash'
      ? `CASH-${Math.floor(1000 + Math.random() * 9000)}`
      : `GPAY-${Math.floor(100000 + Math.random() * 900000)}`;

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setSuccessTxId(mockRefId);

      onConfirmPayment({
        friendId: friend.id,
        friendName: friend.name,
        amount: Number(payAmount),
        method: paymentMethod,
        referenceId: mockRefId,
        notes: paymentNote.trim() || `Direct settlement for ${config.occasionName}`,
      });
    }, 400);
  };

  const newBalance = calculatedShare - ((friend.amountPaid || 0) + Number(payAmount));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden transform transition-all">
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200 bg-stone-50/70">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm"
              style={{ backgroundColor: friend.avatarColor }}
            >
              {friend.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Direct Dinner Payment: {friend.name}
              </h3>
              <p className="text-xs text-stone-500">
                {config.occasionName} · Share: {formatCurrency(calculatedShare, config.currency)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!isSuccess ? (
            <div className="space-y-5">
              {/* Owed Summary Banner */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-800 font-medium block">
                    Remaining Balance Owed
                  </span>
                  <span className="text-2xl font-extrabold text-stone-900 font-mono">
                    {formatCurrency(currentOwed, config.currency)}
                  </span>
                  <span className="text-[11px] text-stone-500 block mt-0.5">
                    Already paid: {formatCurrency(friend.amountPaid || 0, config.currency)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-600 block mb-1">Quick Fill:</span>
                  <button
                    onClick={() => setPayAmount(currentOwed > 0 ? currentOwed : 500)}
                    className="text-xs font-semibold px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors shadow-sm"
                  >
                    Pay Full Balance
                  </button>
                </div>
              </div>

              {/* Amount to Pay Input */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Amount to Pay Now ({config.currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-stone-400 font-mono font-bold text-lg">
                    {config.currency}
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={payAmount}
                    onChange={(e) => setPayAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-10 pr-4 py-2.5 text-xl font-bold font-mono bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 tabular-nums"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[100, 250, 500, currentOwed].filter((v) => v > 0).map((amt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPayAmount(amt)}
                      className="text-xs font-mono px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors"
                    >
                      {amt === currentOwed ? `Exact ${config.currency}${amt}` : `+${config.currency}${amt}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                  Select Payment Channel
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${
                      paymentMethod === 'UPI'
                        ? 'border-amber-500 bg-amber-50/50 text-amber-900 ring-2 ring-amber-500/20'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-amber-600" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('GooglePay')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${
                      paymentMethod === 'GooglePay'
                        ? 'border-amber-500 bg-amber-50/50 text-amber-900 ring-2 ring-amber-500/20'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-blue-600" />
                    <span>GPay / PhonePe</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('Card')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${
                      paymentMethod === 'Card'
                        ? 'border-amber-500 bg-amber-50/50 text-amber-900 ring-2 ring-amber-500/20'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    <span>Debit/Card</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('Cash')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${
                      paymentMethod === 'Cash'
                        ? 'border-amber-500 bg-amber-50/50 text-amber-900 ring-2 ring-amber-500/20'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-green-600" />
                    <span>Cash at Table</span>
                  </button>
                </div>
              </div>

              {/* Method Details Box */}
              {paymentMethod === 'UPI' && (
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                      Organizer UPI ID
                    </span>
                    <p className="text-sm font-mono font-bold text-stone-800">
                      yash.organizer@oksbi
                    </p>
                    <span className="text-[11px] text-stone-500">
                      Accepts Google Pay, PhonePe, Paytm, BHIM
                    </span>
                  </div>
                  <button
                    onClick={handleCopyUpi}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white hover:bg-stone-100 border border-stone-300 rounded-lg text-stone-700 transition-colors"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUpi ? 'Copied' : 'Copy UPI'}</span>
                  </button>
                </div>
              )}

              {paymentMethod === 'Card' && (
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-stone-600 flex items-center justify-between">
                  <span>Simulated POS Terminal Transaction (Tap or Chip)</span>
                  <span className="font-mono text-stone-900 font-semibold">VISA •••• 4242</span>
                </div>
              )}

              {paymentMethod === 'Cash' && (
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-stone-600">
                  Direct physical cash handover to table organizer Yash.
                </div>
              )}

              {/* Payment Note (Optional) */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Optional Note / Reference
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="e.g. Birthday dinner share"
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Projected Post-Payment Balance */}
              <div className="text-xs text-stone-600 flex items-center justify-between pt-2 border-t border-stone-200">
                <span>Resulting Balance after payment:</span>
                <span className={`font-mono font-bold ${
                  newBalance <= 0 ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {newBalance <= 0
                    ? `Settled (₹0.00 left${newBalance < 0 ? `, +₹${Math.abs(newBalance)} credit` : ''})`
                    : `Pending ${formatCurrency(newBalance, config.currency)}`}
                </span>
              </div>

              {/* Submit Pay Button */}
              <button
                onClick={handleExecutePayment}
                disabled={isProcessing || payAmount <= 0}
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  <>
                    <span>Pay {formatCurrency(payAmount, config.currency)} Directly</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Success Receipt View */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-extrabold text-stone-900">
                  Payment Successfully Done!
                </h4>
                <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto">
                  {friend.name} has directly paid{' '}
                  <strong className="text-stone-900 font-mono font-semibold">
                    {formatCurrency(payAmount, config.currency)}
                  </strong>{' '}
                  via {paymentMethod}.
                </p>
              </div>

              {/* Digital Receipt Card */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-left font-mono text-xs space-y-1.5 max-w-sm mx-auto">
                <div className="flex justify-between text-stone-500">
                  <span>Transaction ID:</span>
                  <span className="text-stone-900 font-semibold">{successTxId}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Date & Time:</span>
                  <span className="text-stone-900">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>New Balance Status:</span>
                  <span className={`font-semibold ${newBalance <= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {newBalance <= 0 ? 'ZERO (SETTLED)' : `${formatCurrency(newBalance, config.currency)} OWED`}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow transition-colors"
                >
                  Done & Back to Table
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
