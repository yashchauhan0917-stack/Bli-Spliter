import React, { useState } from 'react';
import { Utensils, Plus, Trash2, Tag, Check } from 'lucide-react';
import { BillItem, BillConfig, Friend } from '../types';
import { formatCurrency } from '../utils/calculations';

interface ItemsManagerProps {
  items: BillItem[];
  friends: Friend[];
  config: BillConfig;
  onAddItem: (item: Omit<BillItem, 'id'>) => void;
  onRemoveItem: (itemId: string) => void;
  onToggleFriendOnItem: (itemId: string, friendId: string) => void;
}

export const ItemsManager: React.FC<ItemsManagerProps> = ({
  items,
  friends,
  config,
  onAddItem,
  onRemoveItem,
  onToggleFriendOnItem,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(price);
    const q = parseInt(quantity, 10);
    if (name.trim() && !isNaN(p) && p > 0) {
      onAddItem({
        name: name.trim(),
        price: p,
        quantity: isNaN(q) || q < 1 ? 1 : q,
        sharedByFriendIds: [],
      });
      setName('');
      setPrice('');
      setQuantity('1');
      setIsAdding(false);
    }
  };

  const totalItemCost = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <section className="bg-white border border-stone-200 rounded-xl p-6 sm:p-7 mb-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-200 gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-600" />
            <span>Dinner Dishes & Itemized Orders</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Track individual items like birthday cake, beverages, and shared platters ordered at the table.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Dish / Item</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddSubmit} className="mt-4 p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-wrap items-end gap-3 text-xs">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
              Dish / Item Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Birthday Cake, Mocktails"
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              autoFocus
            />
          </div>

          <div className="w-28">
            <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
              Price ({config.currency})
            </label>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="500"
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 tabular-nums"
            />
          </div>

          <div className="w-20">
            <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
              Qty
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 font-mono text-center focus:outline-none focus:ring-2 focus:ring-amber-500 tabular-nums"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-sm"
            >
              Add Item
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-2 text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="pt-4 divide-y divide-stone-100">
        {items.map((item) => {
          const isSharedByAll = item.sharedByFriendIds.length === 0;

          return (
            <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-900 text-sm">
                    {item.name}
                  </span>
                  {item.quantity > 1 && (
                    <span className="text-[11px] font-mono text-stone-500">
                      ×{item.quantity}
                    </span>
                  )}
                </div>

                {/* Who shares this dish */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="text-stone-500 text-[11px]">Shared by:</span>
                  <button
                    onClick={() => {
                      // Toggle all
                      if (!isSharedByAll) {
                        // Reset to all
                        friends.forEach((f) => {
                          if (item.sharedByFriendIds.includes(f.id)) {
                            onToggleFriendOnItem(item.id, f.id);
                          }
                        });
                      }
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      isSharedByAll
                        ? 'bg-amber-100 text-amber-900 font-semibold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    All Table ({friends.length})
                  </button>

                  {friends.map((f) => {
                    const isIncluded = isSharedByAll || item.sharedByFriendIds.includes(f.id);
                    return (
                      <button
                        key={f.id}
                        onClick={() => onToggleFriendOnItem(item.id, f.id)}
                        className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                          item.sharedByFriendIds.includes(f.id)
                            ? 'bg-amber-500 text-white font-semibold'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {f.name.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <span className="font-mono font-bold text-sm text-stone-900 tabular-nums">
                  {formatCurrency(item.price * item.quantity, config.currency)}
                </span>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="text-stone-300 hover:text-red-500 p-1 rounded transition-colors"
                  title="Remove dish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-3 mt-2 border-t border-stone-200 flex justify-between items-center text-xs font-mono">
        <span className="text-stone-500">Itemized Total:</span>
        <span className="font-bold text-stone-900 text-sm">{formatCurrency(totalItemCost, config.currency)}</span>
      </div>
    </section>
  );
};
