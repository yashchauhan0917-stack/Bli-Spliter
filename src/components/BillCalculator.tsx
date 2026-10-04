import React from 'react';
import { Calculator, Percent, Sparkles, Receipt, DollarSign } from 'lucide-react';
import { BillConfig, Friend } from '../types';
import { calculateTotalBill, formatCurrency } from '../utils/calculations';

interface BillCalculatorProps {
  config: BillConfig;
  friends: Friend[];
  onUpdateConfig: (newConfig: Partial<BillConfig>) => void;
}

export const BillCalculator: React.FC<BillCalculatorProps> = ({
  config,
  friends,
  onUpdateConfig,
}) => {
  const total = calculateTotalBill(config);
  const friendCount = friends.length || 1;
  const equalShare = Math.round((total / friendCount) * 100) / 100;

  const handleSubtotalChange = (val: string) => {
    const num = parseFloat(val);
    onUpdateConfig({ subtotal: isNaN(num) ? 0 : Math.max(0, num) });
  };

  const handleTipChange = (percent: number) => {
    onUpdateConfig({ tipPercent: percent });
  };

  const handleTaxChange = (val: string) => {
    const num = parseFloat(val);
    onUpdateConfig({ taxPercent: isNaN(num) ? 0 : Math.max(0, num) });
  };

  const handleDiscountChange = (val: string) => {
    const num = parseFloat(val);
    onUpdateConfig({ discountAmount: isNaN(num) ? 0 : Math.max(0, num) });
  };

  return (
    <section id="bill-section" className="bg-white border border-stone-200 rounded-xl p-6 sm:p-7 mb-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-200 gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-600" />
            <span>Bill & Contribution Setup</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure the table bill, dining occasion, tip, and calculate individual contributions.
          </p>
        </div>

        {/* Split mode switcher */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => onUpdateConfig({ splitMode: 'equal' })}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              config.splitMode === 'equal'
                ? 'bg-white text-stone-900 shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Equal Split (Recommended)
          </button>
          <button
            onClick={() => onUpdateConfig({ splitMode: 'custom' })}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              config.splitMode === 'custom'
                ? 'bg-white text-stone-900 shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Custom Item Shares
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
        {/* Occasion & Venue */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Occasion Name
            </label>
            <input
              type="text"
              value={config.occasionName}
              onChange={(e) => onUpdateConfig({ occasionName: e.target.value })}
              placeholder="e.g. Birthday Party, Dinner Meetup"
              className="w-full text-sm bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Restaurant / Venue
            </label>
            <input
              type="text"
              value={config.venueName}
              onChange={(e) => onUpdateConfig({ venueName: e.target.value })}
              placeholder="e.g. The Grand Bistro"
              className="w-full text-sm bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Base Subtotal & Currency */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Base Bill Subtotal ({config.currency})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-stone-500 font-mono text-sm font-bold">
                {config.currency}
              </span>
              <input
                type="number"
                min="0"
                step="10"
                value={config.subtotal || ''}
                onChange={(e) => handleSubtotalChange(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-base font-mono font-bold bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 tabular-nums"
                placeholder="2500"
              />
            </div>
            <div className="flex gap-2 mt-2">
              {[1500, 2000, 2500, 3000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => onUpdateConfig({ subtotal: amt })}
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200"
                >
                  {config.currency}{amt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Discount / Voucher Voucher ({config.currency})
            </label>
            <input
              type="number"
              min="0"
              value={config.discountAmount || ''}
              onChange={(e) => handleDiscountChange(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 text-sm font-mono bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 tabular-nums"
            />
          </div>
        </div>

        {/* Tip & Tax Controls */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Tip to Waitstaff
              </label>
              <span className="text-xs font-mono font-semibold text-stone-600">
                {config.tipPercent}% ({formatCurrency((config.subtotal * config.tipPercent) / 100, config.currency)})
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 5, 10, 15].map((pct) => (
                <button
                  key={pct}
                  onClick={() => handleTipChange(pct)}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    config.tipPercent === pct
                      ? 'bg-amber-500 text-white border-amber-600 font-semibold shadow-sm'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Taxes / Service Charge (%)
              </label>
              <span className="text-xs font-mono font-semibold text-stone-600">
                {formatCurrency((config.subtotal * config.taxPercent) / 100, config.currency)}
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={config.taxPercent || ''}
                onChange={(e) => handleTaxChange(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-sm font-mono bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 tabular-nums"
              />
              <span className="self-center text-xs font-semibold text-stone-500">%</span>
            </div>
          </div>
        </div>

        {/* Calculation Summary Box */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Contribution Breakdown
            </span>
            <div className="mt-2 space-y-1.5 text-xs text-stone-600 border-b border-amber-200/60 pb-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono text-stone-900">{formatCurrency(config.subtotal, config.currency)}</span>
              </div>
              {config.tipPercent > 0 && (
                <div className="flex justify-between">
                  <span>Tip ({config.tipPercent}%):</span>
                  <span className="font-mono text-stone-900">
                    +{formatCurrency((config.subtotal * config.tipPercent) / 100, config.currency)}
                  </span>
                </div>
              )}
              {config.taxPercent > 0 && (
                <div className="flex justify-between">
                  <span>Tax ({config.taxPercent}%):</span>
                  <span className="font-mono text-stone-900">
                    +{formatCurrency((config.subtotal * config.taxPercent) / 100, config.currency)}
                  </span>
                </div>
              )}
              {config.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span className="font-mono">
                    -{formatCurrency(config.discountAmount, config.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-stone-900 pt-1 text-sm">
                <span>Net Total Bill:</span>
                <span className="font-mono text-stone-950">{formatCurrency(total, config.currency)}</span>
              </div>
            </div>
          </div>

          <div className="pt-3">
            <span className="text-[11px] text-stone-500 block">
              Divided by {friendCount} friends:
            </span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-xs font-semibold text-stone-800">Equal Target Share:</span>
              <span className="text-xl font-extrabold font-mono text-amber-900">
                {formatCurrency(equalShare, config.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
