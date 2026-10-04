import React from 'react';
import { CheckCircle2, AlertCircle, TrendingDown, Info, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { BillConfig, Friend, FriendBalance } from '../types';
import { computeFriendBalances, formatCurrency } from '../utils/calculations';

interface DashboardStatusProps {
  config: BillConfig;
  friends: Friend[];
  onSelectStatusFilter: (status: 'all' | 'zero' | 'positive' | 'negative') => void;
  activeFilter: 'all' | 'zero' | 'positive' | 'negative';
}

export const DashboardStatus: React.FC<DashboardStatusProps> = ({
  config,
  friends,
  onSelectStatusFilter,
  activeFilter,
}) => {
  const balances: FriendBalance[] = computeFriendBalances(friends, config);

  const zeroFriends = balances.filter((b) => b.statusType === 'zero');
  const positiveFriends = balances.filter((b) => b.statusType === 'positive');
  const negativeFriends = balances.filter((b) => b.statusType === 'negative');

  const totalOwed = positiveFriends.reduce((sum, b) => sum + b.balance, 0);
  const totalCredit = negativeFriends.reduce((sum, b) => sum + Math.abs(b.balance), 0);

  // Generate the central high-level dashboard message
  let overallMessage = '';
  let overallColorClass = '';

  if (positiveFriends.length === 0) {
    overallMessage = `All ${friends.length} friends have completely paid! No outstanding balances remain at the table. Everyone is settled up!`;
    overallColorClass = 'bg-emerald-50 border-emerald-200 text-emerald-900';
  } else if (positiveFriends.length === 1) {
    overallMessage = `${positiveFriends[0].name} has a pending balance of ${formatCurrency(positiveFriends[0].balance, config.currency)} left to pay. All other friends have cleared their share.`;
    overallColorClass = 'bg-amber-50 border-amber-200 text-amber-900';
  } else {
    overallMessage = `${positiveFriends.length} friends currently have pending balances totaling ${formatCurrency(totalOwed, config.currency)}. Direct payment can be completed below.`;
    overallColorClass = 'bg-stone-50 border-stone-200 text-stone-900';
  }

  return (
    <section id="balances-section" className="mb-8">
      {/* Central Announcement Banner */}
      <div className={`p-4 sm:p-5 rounded-xl border mb-6 flex items-start gap-3.5 transition-colors ${overallColorClass}`}>
        {positiveFriends.length === 0 ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700">
              Live Balance & Settlement Dashboard Status
            </h2>
            <span className="text-xs font-mono text-stone-500">
              Updated in real-time
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed font-medium">
            {overallMessage}
          </p>
          {negativeFriends.length > 0 && (
            <p className="mt-1 text-xs text-stone-600 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>
                Note: {negativeFriends.map((f) => f.name).join(', ')} contributed extra ({formatCurrency(totalCredit, config.currency)} total overpaid credit).
              </span>
            </p>
          )}
        </div>
      </div>

      {/* 3 Metric Cards for the 3 Explicit States: Zero, Positive, Negative */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* State 1: Zero Balance (Settled / Paid Full) */}
        <div
          onClick={() => onSelectStatusFilter(activeFilter === 'zero' ? 'all' : 'zero')}
          className={`cursor-pointer rounded-xl border p-4 sm:p-5 transition-all duration-200 ${
            activeFilter === 'zero'
              ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
              : 'border-stone-200 bg-white hover:border-emerald-300 hover:bg-stone-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Zero Balance ($0)
              </span>
            </div>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {zeroFriends.length} Settled
            </span>
          </div>

          <div className="text-2xl font-bold font-mono text-stone-900 mb-1">
            {zeroFriends.length} of {friends.length} Friends
          </div>

          <p className="text-xs text-stone-600 mb-3 leading-relaxed">
            {zeroFriends.length > 0
              ? `${zeroFriends.map((f) => f.name.split(' ')[0]).join(', ')} paid full share with exactly 0.00 left.`
              : 'No one has settled to zero balance yet.'}
          </p>

          <div className="text-[11px] font-medium text-emerald-700 flex items-center gap-1 pt-2 border-t border-stone-100">
            <span>Filter settled friends</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* State 2: Positive Balance (Pending / Needs to Pay) */}
        <div
          onClick={() => onSelectStatusFilter(activeFilter === 'positive' ? 'all' : 'positive')}
          className={`cursor-pointer rounded-xl border p-4 sm:p-5 transition-all duration-200 ${
            activeFilter === 'positive'
              ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
              : 'border-stone-200 bg-white hover:border-amber-300 hover:bg-stone-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <AlertCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Positive Balance (Owes)
              </span>
            </div>
            <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {positiveFriends.length} Pending
            </span>
          </div>

          <div className="text-2xl font-bold font-mono text-amber-700 mb-1">
            {formatCurrency(totalOwed, config.currency)}
          </div>

          <p className="text-xs text-stone-600 mb-3 leading-relaxed">
            {positiveFriends.length > 0
              ? `${positiveFriends.map((f) => `${f.name.split(' ')[0]} (${formatCurrency(f.balance, config.currency)})`).join(', ')} have pending amounts.`
              : 'Zero pending balance! Everyone has paid.'}
          </p>

          <div className="text-[11px] font-medium text-amber-700 flex items-center gap-1 pt-2 border-t border-stone-100">
            <span>Filter friends who owe</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* State 3: Negative Balance (Credit / Overpaid) */}
        <div
          onClick={() => onSelectStatusFilter(activeFilter === 'negative' ? 'all' : 'negative')}
          className={`cursor-pointer rounded-xl border p-4 sm:p-5 transition-all duration-200 ${
            activeFilter === 'negative'
              ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
              : 'border-stone-200 bg-white hover:border-blue-300 hover:bg-stone-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <TrendingDown className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Negative Balance (Credit)
              </span>
            </div>
            <span className="text-xs font-medium text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {negativeFriends.length} Overpaid
            </span>
          </div>

          <div className="text-2xl font-bold font-mono text-blue-700 mb-1">
            {formatCurrency(totalCredit, config.currency)}
          </div>

          <p className="text-xs text-stone-600 mb-3 leading-relaxed">
            {negativeFriends.length > 0
              ? `${negativeFriends.map((f) => `${f.name.split(' ')[0]} (+${formatCurrency(Math.abs(f.balance), config.currency)})`).join(', ')} paid more than their share.`
              : 'No overpayments or credit balances recorded.'}
          </p>

          <div className="text-[11px] font-medium text-blue-700 flex items-center gap-1 pt-2 border-t border-stone-100">
            <span>Filter credit holders</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </section>
  );
};
