'use client';

import { useState, useEffect } from 'react';

interface BookingFee {
  id: number;
  name: string;
  amount: number;
}

interface BookingFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fee: Omit<BookingFee, 'id'>) => void;
  editingFee?: BookingFee | null;
}

export default function BookingFeeModal({ isOpen, onClose, onSave, editingFee }: BookingFeeModalProps) {
  const [form, setForm] = useState({ name: '', amount: 0 });

  useEffect(() => {
    if (editingFee) {
      setForm({ name: editingFee.name, amount: editingFee.amount });
    } else {
      setForm({ name: '', amount: 0 });
    }
  }, [editingFee, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!form.name || form.amount <= 0) {
      return;
    }
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="bg-white/3 backdrop-blur-md rounded-lg p-8 w-full max-w-md mx-4 relative"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)' }}
      >
        <button
          title="Close"
          type="button"
          onClick={onClose}
          className="absolute top-3 right-4 text-white text-2xl hover:text-white/70 transition-colors leading-none"
        >
          ×
        </button>

        <div className="space-y-6">
          <h2 className="text-white text-xl font-bold">
            {editingFee ? 'Edit Booking Fee' : 'Add Booking Fee'}
          </h2>

          <div>
            <label className="block text-white text-sm mb-2">Name:</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent"
              placeholder="Enter fee name"
            />
          </div>

          <div>
            <label className="block text-white text-sm mb-2">Amount:</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">$</span>
              <input
                title="Amount"
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value >= 0) {
                    setForm({ ...form, amount: value });
                  }
                }}
                className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="text-white hover:text-gray-300 transition-colors font-medium"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

