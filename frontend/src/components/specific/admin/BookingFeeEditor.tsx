'use client';

import { useState, useEffect } from 'react';
import { PiPencilSimple } from 'react-icons/pi';
import { bookingFeeClient, BookingFee } from '@/clients/bookingFeeClient';
import { useToast } from '@/contexts/ToastContext';
import Spinner from '@/components/common/Spinner';

export default function BookingFeeEditor() {
  const [isEditing, setIsEditing] = useState(false);
  const [fees, setFees] = useState<BookingFee[]>([]);
  const [localFees, setLocalFees] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { showToast } = useToast();

  // Fetch booking fees from backend (only once on mount)
  useEffect(() => {
    let isMounted = true;

    const fetchFees = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const fetchedFees = await bookingFeeClient.getAllBookingFees();

        if (!isMounted) return;

        setFees(fetchedFees);

        const feesMap: { [key: string]: number } = {};
        fetchedFees.forEach((fee) => {
          feesMap[fee.name] = typeof fee.price === 'number' ? fee.price : parseFloat(String(fee.price)) || 0;
        });
        setLocalFees(feesMap);
      } catch (error) {
        console.error('Error fetching booking fees:', error);
        if (isMounted) {
          setHasError(true);
          showToast('Failed to load booking fees', 'error');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFees();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only fetch once on mount

  const handleChange = (feeName: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setLocalFees((prev) => ({
        ...prev,
        [feeName]: numValue,
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update each fee in backend
      const updatePromises = fees.map(async (fee) => {
        const newPrice = localFees[fee.name];
        if (fee.price !== newPrice) {
          return bookingFeeClient.updateBookingFee(fee.id, {
            name: fee.name,
            price: newPrice,
          });
        }
        return Promise.resolve(fee);
      });

      await Promise.all(updatePromises);

      // Refresh fees from backend
      const updatedFees = await bookingFeeClient.getAllBookingFees();
      setFees(updatedFees);

      const feesMap: { [key: string]: number } = {};
      updatedFees.forEach((fee) => {
        feesMap[fee.name] = typeof fee.price === 'number' ? fee.price : parseFloat(String(fee.price)) || 0;
      });
      setLocalFees(feesMap);

      setIsEditing(false);
      showToast('Booking fees updated successfully', 'success');
    } catch (error) {
      console.error('Error saving booking fees:', error);
      showToast('Failed to update booking fees', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to current fees prices
    const feesMap: { [key: string]: number } = {};
    fees.forEach((fee) => {
      feesMap[fee.name] = typeof fee.price === 'number' ? fee.price : parseFloat(String(fee.price)) || 0;
    });
    setLocalFees(feesMap);
  };

  const formatFeeDisplay = (feeName: string, price: number) => {
    if (feeName === 'Sales Tax') {
      // Display as percentage
      return `${(price * 100).toFixed(2)}%`;
    }
    // Display as currency
    return `$${price.toFixed(2)}`;
  };

  const formatFeeInput = (feeName: string, price: number) => {
    if (feeName === 'Sales Tax') {
      // Display as percentage for input
      return (price * 100).toFixed(2);
    }
    return price.toFixed(2);
  };

  const parseFeeInput = (feeName: string, value: string) => {
    if (feeName === 'Sales Tax') {
      // Convert percentage to decimal
      return parseFloat(value) / 100;
    }
    return parseFloat(value);
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="font-afacad text-xl sm:text-2xl mb-4">Booking Fees</div>
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" color="pink" />
          <span className="ml-4 text-white/60">Loading booking fees...</span>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="mb-8">
        <div className="font-afacad text-xl sm:text-2xl mb-4">Booking Fees</div>
        <div className="flex items-center justify-center py-8">
          <span className="text-red-400">Failed to load booking fees. Please refresh the page.</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="font-afacad text-xl sm:text-2xl">Booking Fees</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {fees.map((fee) => (
          <div key={fee.id} className="flex items-center justify-between rounded-lg px-4 py-3 bg-transparent">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-afacad">{fee.name}:</span>
                <div className="relative">
                  {fee.name === 'Sales Tax' ? (
                    <>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formatFeeInput(fee.name, localFees[fee.name] || 0)}
                        onChange={(e) => handleChange(fee.name, String(parseFeeInput(fee.name, e.target.value)))}
                        className="w-20 pl-2 pr-8 py-1 bg-white/10 border-2 border-[#FF478B] rounded text-white placeholder-white/60 
                        focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        placeholder="0.00"
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60">%</span>
                    </>
                  ) : (
                    <>
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/60">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formatFeeInput(fee.name, localFees[fee.name] || 0)}
                        onChange={(e) => handleChange(fee.name, e.target.value)}
                        className="w-20 pl-6 pr-2 py-1 bg-white/10 border-2 border-[#FF478B] rounded text-white placeholder-white/60 
                        focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        placeholder="0.00"
                      />
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-lg sm:text-xl font-afacad">
                {fee.name}: {formatFeeDisplay(fee.name, localFees[fee.name] || 0)}
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
              className="text-gray-300 hover:text-white transition-colors px-4 py-2 cursor-pointer"
            >
              Cancel
            </button>
            <button
              title="Save"
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="text-black px-5 py-2 rounded-full transition-colors hover:opacity-90 font-afacad font-bold bg-gradient-to-r 
              from-[#FF478B] to-[#FF5C33] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </>
        ) : (
          <button
            title="Edit"
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <PiPencilSimple className="text-2xl" />
          </button>
        )}
      </div>
    </>
  );
}
