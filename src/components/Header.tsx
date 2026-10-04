import React, { useState } from 'react';
import { RotateCcw, Share2, Printer, Check, Sparkles, RefreshCw } from 'lucide-react';
import { BillConfig, Friend } from '../types';
import { calculateTotalBill, formatCurrency, generateWhatsAppSummary } from '../utils/calculations';

interface HeaderProps {
  config: BillConfig;
  friends: Friend[];
  onUpdateConfig: (newConfig: Partial<BillConfig>) => void;
  onResetDefaults: () => void;
  onOpenReceipt: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  friends,
  onUpdateConfig,
  onResetDefaults,
  onOpenReceipt,
}) => {
  const [copied, setCopied] = useState(false);
  const [reloading, setReloading] = useState(false);
  const total = calculateTotalBill(config);

  const handleCopySummary = async () => {
    const text = generateWhatsAppSummary(config, friends);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleReloadPage = () => {
    setReloading(true);
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <a href="#" className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              ₹/$
            </span>
            <span>Bill Splitter</span>
          </a>
          <span className="hidden sm:inline-block text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
            Auto-Saved Locally
          </span>
        </div>

        {/* Zone 2: Clean navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-600">
          <a href="#bill-section" className="hover:text-stone-900 transition-colors">Bill Setup</a>
          <a href="#friends-section" className="hover:text-stone-900 transition-colors">Friends Share</a>
          <a href="#balances-section" className="hover:text-stone-900 transition-colors">Balance Status</a>
          <a href="#settlement-section" className="hover:text-stone-900 transition-colors">Who Pays Whom</a>
          <a href="#activity-section" className="hover:text-stone-900 transition-colors">Payment Ledger</a>
        </nav>

        {/* Zone 3: Primary actions & reload verification */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Switcher */}
          <select
            value={config.currency}
            onChange={(e) => onUpdateConfig({ currency: e.target.value })}
            className="text-xs font-mono font-semibold bg-stone-100 hover:bg-stone-200/80 border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
            title="Change Currency"
          >
            <option value="₹">₹ INR</option>
            <option value="$">$ USD</option>
            <option value="€">€ EUR</option>
            <option value="£">£ GBP</option>
            <option value="AED">AED</option>
            <option value="C$">C$ CAD</option>
          </select>

          {/* Reload & Verify State Persistence button (Requested by user) */}
          <button
            onClick={handleReloadPage}
            disabled={reloading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors"
            title="Reload browser page to test state persistence from localStorage"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reloading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reload & Verify</span>
          </button>

          {/* Share / WhatsApp Copy */}
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors"
            title="Copy WhatsApp shareable bill breakdown"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share Split</span>
              </>
            )}
          </button>

          {/* Receipt Print */}
          <button
            onClick={onOpenReceipt}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors"
            title="View printable restaurant dining receipt"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Receipt</span>
          </button>

          {/* Reset Defaults */}
          <button
            onClick={onResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
            title="Reset to Birthday Party (5 friends @ 500 each)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden lg:inline">Reset Party</span>
          </button>
        </div>
      </div>
    </header>
  );
};
