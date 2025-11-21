'use client';

import { useState, useEffect } from 'react';
import { formatDateInput } from './movieFormUtils';

interface Promotion {
  id: number;
  name: string;
  value: number;
  expirationDate: string;
  description: string;
  promoCode: string;
  discountType: string;
  sent: boolean;
  active: boolean;
  imageLink: string;
}

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promo: Omit<Promotion, 'id' | 'sent' | 'active'>) => void;
  editingPromo?: Promotion | null;
}

export default function PromotionModal({ isOpen, onClose, onSave, editingPromo }: PromotionModalProps) {
  const [form, setForm] = useState({
    image: '',
    name: '',
    discount: 0,
    discountType: '% off' as '% off' | '$ off',
    expirationDate: '',
    description: '',
    promoCode: '',
  });
  const [imageName, setImageName] = useState('');

  useEffect(() => {
    if (editingPromo) {
      const discountValue = editingPromo.value || 0;      
      const formattedExpirationDate = `${editingPromo.expirationDate.substring(5, 7)}/${editingPromo.expirationDate.substring(8, 10)}/${editingPromo.expirationDate.substring(0, 4)}`;
      
      setForm({
        image: editingPromo.imageLink,
        name: editingPromo.name,
        discount: discountValue,
        discountType: (editingPromo.discountType || '% off') as '% off' | '$ off',
        expirationDate: formattedExpirationDate || '',
        description: editingPromo.description || '',
        promoCode: editingPromo.promoCode || '',
      });
    } else {
      setForm({ image: '', name: '', discount: 0, discountType: '% off', expirationDate: '', description: '', promoCode: '' });
      setImageName('');
    }
  }, [editingPromo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!form.name || !form.expirationDate) return;
    if (form.discount <= 0) return;
    
    if (form.discountType === '% off') {
      const wholeNumber = Math.floor(form.discount);
      if (wholeNumber <= 0 || wholeNumber >= 101 || wholeNumber !== form.discount) {
        return;
      }
    } else {
      const roundedValue = Math.round(form.discount * 100) / 100;
      if (Math.abs(form.discount - roundedValue) > 0.0001) {
        return;
      }
    }

    const formattedExpirationDate = `${form.expirationDate.substring(6, 10)}-${form.expirationDate.substring(0, 2)}-${form.expirationDate.substring(3, 5)}T00:00:00`;

    onSave({
      name: form.name,
      value: form.discount,
      expirationDate: formattedExpirationDate,
      description: form.description,
      promoCode: form.promoCode,
      discountType: form.discountType,
      imageLink: form.image
    });
    onClose();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setForm({ ...form, image: result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="bg-white/3 backdrop-blur-md rounded-lg p-6 sm:p-8 w-full max-w-md mx-4 relative max-h-[90vh] overflow-y-auto"
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
            {editingPromo ? 'Edit Promotion' : 'Add Promotion'}
          </h2>

          <div>
            <label className="block text-white text-sm mb-2">Image:</label>
            <div className="relative">
              <input
                title="Upload image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-full h-32 bg-white/10 rounded-lg border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
                {imageName ? (
                  <span className="text-white">{imageName}</span>
                ) : (
                  <span className="text-white/60">Click to upload image</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-white text-sm mb-2">Name:</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent"
              placeholder="Enter promotion name"
            />
          </div>

          <div>
            <label className="block text-white text-sm mb-2">Discount:</label>
            <div className="flex gap-2">
              <input
                type="number"
                step={form.discountType === '% off' ? '1' : '0.01'}
                min="0"
                max={form.discountType === '% off' ? '100' : undefined}
                value={form.discount === 0 ? '' : form.discount}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (inputValue === '') {
                    setForm({ ...form, discount: 0 });
                    return;
                  }
                  
                  const value = parseFloat(inputValue);
                  if (isNaN(value)) {
                    return;
                  }
                  
                  if (form.discountType === '% off') {
                    const wholeNumber = Math.floor(value);
                    if (wholeNumber > 0 && wholeNumber < 101) {
                      setForm({ ...form, discount: wholeNumber });
                    } else if (wholeNumber === 0) {
                      setForm({ ...form, discount: 0 });
                    }
                  } else {
                    if (value >= 0) {
                      const roundedValue = Math.round(value * 100) / 100;
                      setForm({ ...form, discount: roundedValue });
                    }
                  }
                }}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                placeholder="Enter discount"
              />
              <select
                value={form.discountType}
                onChange={(e) => {
                  const newType = e.target.value as '% off' | '$ off';
                  if (newType === '% off' && form.discount > 0) {
                    const wholeNumber = Math.floor(form.discount);
                    setForm({ 
                      ...form, 
                      discountType: newType,
                      discount: wholeNumber > 100 ? 100 : (wholeNumber > 0 ? wholeNumber : 0)
                    });
                  } else {
                    setForm({ ...form, discountType: newType });
                  }
                }}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent cursor-pointer"
                style={{ minWidth: '100px' }}
              >
                <option value="% off" className="bg-gray-800 text-white">% off</option>
                <option value="$ off" className="bg-gray-800 text-white">$ off</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white text-sm mb-2">Description:</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent resize-none"
              placeholder="Enter promotion description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-white text-sm mb-2">Promo Code:</label>
            <input
              type="text"
              value={form.promoCode}
              onChange={(e) => setForm({ ...form, promoCode: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent"
              placeholder="Enter promo code"
            />
          </div>

          <div>
            <label className="block text-white text-sm mb-2">Expiration Date:</label>
            <input
              type="text"
              value={form.expirationDate}
              onChange={(e) => setForm({ ...form, expirationDate: formatDateInput(e.target.value) })}
              placeholder="mm/dd/yyyy"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="text-white hover:text-gray-300 transition-colors font-medium"
            >
              {editingPromo ? 'Save' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

