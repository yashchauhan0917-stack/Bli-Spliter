import React, { useState } from 'react';
import { Calendar, Users, UtensilsCrossed, Edit2, Check, ArrowRight } from 'lucide-react';
import { BillConfig, Friend } from '../types';
import { calculateTotalBill, formatCurrency } from '../utils/calculations';

interface HeroBannerProps {
  config: BillConfig;
  friends: Friend[];
  onUpdateConfig: (newConfig: Partial<BillConfig>) => void;
  onApplyPreset: (preset: 'birthday' | 'casual' | 'office') => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  config,
  friends,
  onUpdateConfig,
  onApplyPreset,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(config.occasionName);
  const [imageError, setImageError] = useState(false);

  const totalBill = calculateTotalBill(config);
  const friendCount = friends.length || 1;
  const perPersonShare = Math.round((totalBill / friendCount) * 100) / 100;
  const totalPaid = friends.reduce((sum, f) => sum + (f.amountPaid || 0), 0);
  const percentCollected = Math.min(100, Math.round((totalPaid / (totalBill || 1)) * 100));

  const handleSaveTitle = () => {
    if (titleInput.trim()) {
      onUpdateConfig({ occasionName: titleInput.trim() });
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-stone-900 text-white shadow-xl mb-8">
      {/* Background Image with Measured Contrast Scrim */}
      <div className="absolute inset-0 z-0">
        {!imageError ? (
          <img
            src="/src/assets/images/dinner_celebration_table_1791091275926.jpg"
            alt="Dinner celebration with friends"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center opacity-35 filter brightness-75 scale-105 transform duration-700 hover:scale-100"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 opacity-90" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/80 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Unboxed Metadata without pills */}
            <div className="flex items-center gap-2 text-xs font-medium text-amber-300">
              <span className="flex items-center gap-1">
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>{config.venueName || 'Dinner Celebration'}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{config.date}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{friends.length} Friends at Table</span>
              </span>
            </div>

            {/* Editable Occasion Title */}
            <div className="flex items-center gap-3">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                    className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-stone-800/90 text-white px-3 py-1 rounded-lg border border-amber-400 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="p-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-white"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="group flex items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                    {config.occasionName}
                  </h1>
                  <button
                    onClick={() => {
                      setTitleInput(config.occasionName);
                      setIsEditingTitle(true);
                    }}
                    className="opacity-60 hover:opacity-100 p-1.5 rounded-md hover:bg-white/10 transition-opacity"
                    title="Edit occasion name"
                  >
                    <Edit2 className="w-4 h-4 text-amber-300" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Dinner is done, drinks are emptied, and the moment has come to pay the bill.
              Splitting equally across {friends.length} friends at{' '}
              <strong className="text-white font-semibold font-mono">
                {formatCurrency(perPersonShare, config.currency)}
              </strong>{' '}
              each.
            </p>

            {/* Preset shortcuts */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-stone-400">Quick Presets:</span>
              <button
                onClick={() => onApplyPreset('birthday')}
                className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10 transition-colors"
              >
                🎂 Birthday Party (5 friends @ 500)
              </button>
              <button
                onClick={() => onApplyPreset('casual')}
                className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10 transition-colors"
              >
                🍕 Weekend Dinner (4 friends @ 350)
              </button>
              <button
                onClick={() => onApplyPreset('office')}
                className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10 transition-colors"
              >
                💼 Team Feast (6 friends @ 600)
              </button>
            </div>
          </div>

          {/* Metric Highlight Card */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-5 min-w-[280px] sm:min-w-[320px] backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
              <span>Total Dinner Bill</span>
              <span>Each Share</span>
            </div>
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                {formatCurrency(totalBill, config.currency)}
              </span>
              <span className="text-xl font-bold text-amber-400 font-mono">
                ~{formatCurrency(perPersonShare, config.currency)}
              </span>
            </div>

            {/* Collection Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-stone-300">
                  Collected: <span className="font-mono text-white">{formatCurrency(totalPaid, config.currency)}</span>
                </span>
                <span className="font-mono text-amber-400 font-semibold">{percentCollected}%</span>
              </div>
              <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${percentCollected}%` }}
                />
              </div>
              <div className="text-[11px] text-stone-400 text-right pt-0.5">
                {totalPaid >= totalBill ? (
                  <span className="text-emerald-400 font-medium">✓ Bill 100% covered</span>
                ) : (
                  <span>
                    Remaining:{' '}
                    <span className="font-mono text-stone-300">
                      {formatCurrency(totalBill - totalPaid, config.currency)}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
