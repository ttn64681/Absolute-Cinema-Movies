'use client';

import { useState } from 'react';
import { PiPencilSimple } from 'react-icons/pi';

interface TicketPrices {
  child: number;
  adult: number;
  senior: number;
}

interface TicketPriceEditorProps {
  prices: TicketPrices;
  onSave: (prices: TicketPrices) => void;
}

const formatCurrency = (amount: number) => {
  return `$${amount.toFixed(2)}`;
};

export default function TicketPriceEditor({ prices, onSave }: TicketPriceEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localPrices, setLocalPrices] = useState(prices);

  const handleChange = (type: 'child' | 'adult' | 'senior', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setLocalPrices((prev) => ({
        ...prev,
        [type]: numValue,
      }));
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    onSave(localPrices);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLocalPrices(prices);
  };

  return (
    <>
      <div className="mb-6">
        <div className="font-afacad text-xl sm:text-2xl">Ticket Prices</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Child', type: 'child' as const, price: formatCurrency(localPrices.child) },
          { label: 'Adult', type: 'adult' as const, price: formatCurrency(localPrices.adult) },
          { label: 'Senior', type: 'senior' as const, price: formatCurrency(localPrices.senior) },
        ].map((p) => (
          <div key={p.label} className="flex items-center justify-between rounded-lg px-4 py-3 bg-transparent">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-afacad">{p.label}:</span>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/60">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={localPrices[p.type]}
                    onChange={(e) => handleChange(p.type, e.target.value)}
                    className="w-20 pl-6 pr-2 py-1 bg-white/10 border-2 border-[#FF478B] rounded text-white placeholder-white/60 
                    focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    placeholder="0.00"
                  />
                </div>
              </div>
            ) : (
              <div className="text-lg sm:text-xl font-afacad">
                {p.label}: {p.price}
              </div>
            )}
            <div className="w-6"></div>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-4 mb-8">
        {isEditing ? (
          <>
            <button
              title="Cancel"
              type="button"
              onClick={handleCancel}
              className="text-gray-300 hover:text-white transition-colors px-4 py-2"
            >
              Cancel
            </button>
            <button
              title="Save"
              type="button"
              onClick={handleSave}
              className="text-black px-5 py-2 rounded-full transition-colors hover:opacity-90 font-afacad font-bold bg-gradient-to-r 
              from-[#FF478B] to-[#FF5C33]"
            >
              Save
            </button>
          </>
        ) : (
          <>
            <button
              title="Edit"
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <PiPencilSimple className="text-2xl" />
            </button>
            <button
              title="Add"
              type="button"
              className="text-black px-5 py-2 rounded-full transition-colors hover:opacity-90 font-afacad font-bold bg-gradient-to-r 
              from-[#FF478B] to-[#FF5C33]"
            >
              Add +
            </button>
          </>
        )}
      </div>
    </>
  );
}

