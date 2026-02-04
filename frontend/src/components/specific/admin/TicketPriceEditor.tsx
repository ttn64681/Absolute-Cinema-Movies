'use client';

import { useState, useEffect } from 'react';
import { PiPencilSimple } from 'react-icons/pi';
import { ticketCategoryClient, TicketCategory } from '@/clients/ticketCategoryClient';
import { useToast } from '@/contexts/ToastContext';
import Spinner from '@/components/common/Spinner';

interface TicketPrices {
  child: number;
  adult: number;
  senior: number;
}

interface TicketPriceEditorProps {
  prices?: TicketPrices;
  onSave?: (prices: TicketPrices) => void;
}

const formatCurrency = (amount: number) => {
  return `$${amount.toFixed(2)}`;
};

export default function TicketPriceEditor({ prices: propPrices, onSave: propOnSave }: TicketPriceEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localPrices, setLocalPrices] = useState<TicketPrices>({
    child: 0,
    adult: 0,
    senior: 0,
  });
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  // Fetch ticket categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const fetchedCategories = await ticketCategoryClient.getAllTicketCategories();
        setCategories(fetchedCategories);

        // Map categories to prices object
        const pricesMap: TicketPrices = {
          child: 0,
          adult: 0,
          senior: 0,
        };

        fetchedCategories.forEach((cat) => {
          const name = cat.name.toLowerCase();
          if (name === 'child' || name === 'adult' || name === 'senior') {
            pricesMap[name as keyof TicketPrices] = Number(cat.price);
          }
        });

        setLocalPrices(pricesMap);
      } catch (error) {
        console.error('Error fetching ticket categories:', error);
        showToast('Failed to load ticket prices', 'error');
        // Fallback to prop prices if provided
        if (propPrices) {
          setLocalPrices(propPrices);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [propPrices, showToast]);

  const handleChange = (type: 'child' | 'adult' | 'senior', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setLocalPrices((prev) => ({
        ...prev,
        [type]: numValue,
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update each category in backend
      const updatePromises = categories.map(async (cat) => {
        const name = cat.name.toLowerCase();
        if (name === 'child' || name === 'adult' || name === 'senior') {
          const newPrice = localPrices[name as keyof TicketPrices];
          if (cat.price !== newPrice) {
            return ticketCategoryClient.updateTicketCategory(cat.id, {
              name: cat.name,
              price: newPrice,
            });
          }
        }
        return Promise.resolve(cat);
      });

      await Promise.all(updatePromises);

      // Refresh categories from backend
      const updatedCategories = await ticketCategoryClient.getAllTicketCategories();
      setCategories(updatedCategories);

      // Update local prices
      const pricesMap: TicketPrices = {
        child: 0,
        adult: 0,
        senior: 0,
      };
      updatedCategories.forEach((cat) => {
        const name = cat.name.toLowerCase();
        if (name === 'child' || name === 'adult' || name === 'senior') {
          pricesMap[name as keyof TicketPrices] = Number(cat.price);
        }
      });
      setLocalPrices(pricesMap);

      setIsEditing(false);
      showToast('Ticket prices updated successfully', 'success');

      // Call prop onSave if provided (for backward compatibility)
      if (propOnSave) {
        propOnSave(pricesMap);
      }
    } catch (error) {
      console.error('Error saving ticket prices:', error);
      showToast('Failed to update ticket prices', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to current categories prices
    const pricesMap: TicketPrices = {
      child: 0,
      adult: 0,
      senior: 0,
    };
    categories.forEach((cat) => {
      const name = cat.name.toLowerCase();
      if (name === 'child' || name === 'adult' || name === 'senior') {
        pricesMap[name as keyof TicketPrices] = Number(cat.price);
      }
    });
    setLocalPrices(pricesMap);
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="font-afacad text-xl sm:text-2xl mb-4">Ticket Prices</div>
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" color="pink" />
          <span className="ml-4 text-white/60">Loading ticket prices...</span>
        </div>
      </div>
    );
  }

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
              disabled={isSaving}
              className="text-black px-5 py-2 rounded-full transition-colors hover:opacity-90 font-afacad font-bold bg-linear-to-r 
              from-[#FF478B] to-[#FF5C33] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </>
        ) : (
          <>
            <button
              title="Edit"
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <PiPencilSimple className="text-2xl" />
            </button>
            <button
              title="Add"
              type="button"
              className="text-black hover:text-white px-5 py-2 rounded-full transition-colors hover:opacity-90 font-afacad font-bold bg-linear-to-r 
              from-[#FF478B] to-[#FF5C33] cursor-pointer"
            >
              Add +
            </button>
          </>
        )}
      </div>
    </>
  );
}
