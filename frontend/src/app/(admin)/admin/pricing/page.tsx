'use client';

import Link from 'next/link';
import { PiPencilSimple, PiX, PiPlus } from 'react-icons/pi';
import { useState } from 'react';
import AdminNavBar from '@/components/common/navBar/AdminNavBar';
import { formatDateInput } from '@/components/specific/admin/movieFormUtils';

export default function AdminPricingPage() {
  // modals
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [showBookingFeeModal, setShowBookingFeeModal] = useState(false);

  // promotions
  const [promotions, setPromotions] = useState([
    { id: 1, name: 'Promotion 1', value: '% off', expirationDate: '12/31/2025' },
    { id: 2, name: 'Promotion 2', value: '$$ off', expirationDate: '01/15/2026' },
  ]);
  const [promotionForm, setPromotionForm] = useState({
    image: '',
    name: '',
    discount: '',
    expirationDate: '',
  });
  const [editingPromotionId, setEditingPromotionId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');

  // ticket pricing
  const [isEditingTicketPrices, setIsEditingTicketPrices] = useState(false);
  const [ticketPrices, setTicketPrices] = useState({
    child: 3.29,
    adult: 3.29,
    senior: 3.29,
  });

  // booking fees
  const [bookingFees, setBookingFees] = useState([
    { id: 1, name: 'Service Fee', amount: 2.5 },
    { id: 2, name: 'Processing Fee', amount: 1.0 },
  ]);
  const [bookingFeeForm, setBookingFeeForm] = useState({
    name: '',
    amount: 0,
  });
  const [editingBookingFeeId, setEditingBookingFeeId] = useState<number | null>(null);

  const handlePromotionSubmit = () => {
    if (!promotionForm.name || !promotionForm.discount || !promotionForm.expirationDate) return;

    if (editingPromotionId) {
      setPromotions(
        promotions.map((promo) => {
          if (promo.id === editingPromotionId) {
            return { ...promo, name: promotionForm.name, value: promotionForm.discount, expirationDate: promotionForm.expirationDate };
          }
          return promo;
        })
      );
    } else {
      setPromotions([
        ...promotions,
        {
          id: Date.now(),
          name: promotionForm.name,
          value: promotionForm.discount,
          expirationDate: promotionForm.expirationDate,
        },
      ]);
    }

    setShowPromotionModal(false);
    setPromotionForm({ image: '', name: '', discount: '', expirationDate: '' });
    setImagePreview(null);
    setImageName('');
    setEditingPromotionId(null);
  };

  const closeModal = () => {
    setShowPromotionModal(false);
    setPromotionForm({ image: '', name: '', discount: '', expirationDate: '' });
    setImagePreview(null);
    setImageName('');
    setEditingPromotionId(null);
  };

  const editPromotion = (promo: { id: number; name: string; value: string; expirationDate?: string }) => {
    setPromotionForm({
      image: '',
      name: promo.name,
      discount: promo.value,
      expirationDate: promo.expirationDate || '',
    });
    setEditingPromotionId(promo.id);
    setShowPromotionModal(true);
  };

  const deletePromotion = (promoId: number) => {
    setPromotions(promotions.filter((promo) => promo.id !== promoId));
  };

  // Check if a promotion is active (not past expiration date)
  const isPromotionActive = (expirationDate: string): boolean => {
    if (!expirationDate) return false;
    
    // Parse mm/dd/yyyy format
    const parts = expirationDate.split('/');
    if (parts.length !== 3) return false;
    
    const month = parseInt(parts[0], 10) - 1; // Month is 0-indexed in Date
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    if (isNaN(month) || isNaN(day) || isNaN(year)) return false;
    
    const expiration = new Date(year, month, day);
    expiration.setHours(23, 59, 59, 999); // End of expiration day
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return expiration >= today;
  };

  const handleBookingFeeSubmit = () => {
    if (!bookingFeeForm.name || bookingFeeForm.amount <= 0) {
      return;
    }

    if (editingBookingFeeId) {
      setBookingFees(
        bookingFees.map((fee) => {
          if (fee.id === editingBookingFeeId) {
            return { ...fee, name: bookingFeeForm.name, amount: bookingFeeForm.amount };
          }
          return fee;
        })
      );
    } else {
      setBookingFees([
        ...bookingFees,
        {
          id: Date.now(),
          name: bookingFeeForm.name,
          amount: bookingFeeForm.amount,
        },
      ]);
    }

    setShowBookingFeeModal(false);
    setBookingFeeForm({ name: '', amount: 0 });
    setEditingBookingFeeId(null);
  };

  const closeBookingFeeModal = () => {
    setShowBookingFeeModal(false);
    setBookingFeeForm({ name: '', amount: 0 });
    setEditingBookingFeeId(null);
  };

  const editBookingFee = (fee: { id: number; name: string; amount: number }) => {
    setBookingFeeForm({
      name: fee.name,
      amount: fee.amount,
    });
    setEditingBookingFeeId(fee.id);
    setShowBookingFeeModal(true);
  };

  const removeBookingFee = (feeId: number) => {
    setBookingFees(bookingFees.filter((fee) => fee.id !== feeId));
  };

  const handleTicketPriceChange = (type: 'child' | 'adult' | 'senior', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setTicketPrices((prev) => ({
        ...prev,
        [type]: numValue,
      }));
    }
  };

  const handleSaveTicketPrices = () => {
    setIsEditingTicketPrices(false);
    console.log('saving prices:', ticketPrices);
    // TODO: actually save these somewhere
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setPromotionForm({ ...promotionForm, image: result });
    };
    reader.readAsDataURL(file);
  };

  // format currency for display
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="text-white" style={{ backgroundColor: '#1C1C1C', minHeight: '100vh' }}>
      <AdminNavBar />
      <div style={{ height: '120px' }} />

      {/* Tabs (reuse look from Movies page) */}
      <div className="flex items-center justify-center gap-10 text-[30px] font-red-rose mt-2 mb-18">
        <Link
          href="/admin/movies"
          className="text-gray-300 hover:text-white transition-colors"
          style={{ fontWeight: 'bold' }}
        >
          Movies & Showtimes
        </Link>
        <Link href="/admin/pricing" className="relative" style={{ color: '#FF478B', fontWeight: 'bold' }}>
          Pricing & Promotions
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-acm-pink rounded-full" />
        </Link>
        <Link
          href="/admin/users"
          className="text-gray-300 hover:text-white transition-colors"
          style={{ fontWeight: 'bold' }}
        >
          Users & Admins
        </Link>
      </div>

      <div className="max-w-[65rem] mx-auto px-4">
        {/* Ticket Prices */}
        <div className="mb-6">
          <div className="font-afacad text-xl sm:text-2xl">Ticket Prices</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Child', type: 'child' as const, price: formatCurrency(ticketPrices.child) },
            { label: 'Adult', type: 'adult' as const, price: formatCurrency(ticketPrices.adult) },
            { label: 'Senior', type: 'senior' as const, price: formatCurrency(ticketPrices.senior) },
          ].map((p) => (
            <div key={p.label} className="flex items-center justify-between rounded-lg px-4 py-3 bg-transparent">
              {isEditingTicketPrices ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-afacad">{p.label}:</span>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/60">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={ticketPrices[p.type]}
                      onChange={(e) => handleTicketPriceChange(p.type, e.target.value)}
                      className="w-20 pl-6 pr-2 py-1 bg-white/10 border-2 border-[#FF478B] rounded text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
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
          {isEditingTicketPrices ? (
            <>
              <button
                title="Cancel"
                type="button"
                onClick={() => setIsEditingTicketPrices(false)}
                className="text-gray-300 hover:text-white transition-colors px-4 py-2"
              >
                Cancel
              </button>
              <button
                title="Save"
                type="button"
                onClick={handleSaveTicketPrices}
                className="text-black px-5 py-2 rounded-full transition-colors hover:opacity-90 font-afacad font-bold"
                style={{ background: 'linear-gradient(to right, #FF478B, #FF5C33)' }}
              >
                Save
              </button>
            </>
          ) : (
            <>
              <button
                title="Edit"
                type="button"
                onClick={() => setIsEditingTicketPrices(true)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <PiPencilSimple className="text-2xl" />
              </button>
              <button
                title="Add"
                type="button"
                className="text-black px-5 py-2 rounded-full transition-colors hover:opacity-90 font-afacad font-bold"
                style={{ background: 'linear-gradient(to right, #FF478B, #FF5C33)' }}
              >
                Add +
              </button>
            </>
          )}
        </div>

        {/* Booking Fees */}
        <div className="mb-10">
          <div className="text-xl font-afacad mb-3">Booking Fees</div>
          <div
            className="rounded-md overflow-hidden shadow-lg h-48 overflow-y-auto"
            style={{ backgroundColor: '#242424' }}
          >
            {bookingFees.map((fee, idx) => (
              <div key={fee.id} className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex-1 font-afacad flex items-center">
                  <span className="w-32">{fee.name}:</span>
                  <span>{formatCurrency(fee.amount)}</span>
                </div>
                <div className="w-24 text-center"></div>
                <div className="flex items-center gap-4 text-gray-300">
                  <button
                    type="button"
                    title="Edit"
                    className="hover:text-white transition-colors"
                    onClick={() => editBookingFee(fee)}
                  >
                    <PiPencilSimple className="text-lg" />
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    className="hover:text-white transition-colors"
                    onClick={() => removeBookingFee(fee.id)}
                  >
                    <PiX className="text-lg" />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-end py-5 pr-5">
              <button
                type="button"
                title="Add booking fee"
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => setShowBookingFeeModal(true)}
              >
                <PiPlus className="text-lg" />
              </button>
            </div>
          </div>
        </div>

        {/* Promotions */}
        <div className="mb-16">
          <div className="text-xl font-afacad mb-3">Promotions</div>
          <div
            className="rounded-md overflow-hidden shadow-lg h-48 overflow-y-auto"
            style={{ backgroundColor: '#242424' }}
          >
            {promotions.map((promo) => {
              const isActive = isPromotionActive(promo.expirationDate || '');
              return (
                <div key={promo.id} className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                  <div className="flex-1 font-afacad flex items-center gap-4">
                    <span className="w-32">{promo.name}:</span>
                    <span className="w-32">{promo.value}</span>
                    <span className="w-40 text-white/60 text-sm">Expires: {promo.expirationDate || 'N/A'}</span>
                  </div>
                  <div className="w-24 text-center"></div>
                  <div className="flex items-center gap-4 text-gray-300">
                    <span className="text-gray-400 text-sm">{isActive ? 'Active' : 'Inactive'}</span>
                    <button
                      title="Edit"
                      type="button"
                      className="hover:text-white transition-colors"
                      onClick={() => editPromotion(promo)}
                    >
                      <PiPencilSimple className="text-lg" />
                    </button>
                    <button
                      title="Delete"
                      type="button"
                      className="hover:text-white transition-colors"
                      onClick={() => deletePromotion(promo.id)}
                    >
                      <PiX className="text-lg" />
                    </button>
                  </div>
                </div>
              );
            })}
            <div className="flex items-center justify-end py-5 pr-5">
              <button
                type="button"
                title="Add promotion"
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => setShowPromotionModal(true)}
              >
                <PiPlus className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* bottom spacing */}
      <div className="h-20"></div>

      {/* promotion modal */}
      {showPromotionModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="bg-white/3 backdrop-blur-md rounded-lg p-8 w-full max-w-md mx-4 relative"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)' }}
          >
            <button
              title="Close"
              type="button"
              onClick={closeModal}
              className="absolute top-3 right-4 text-white text-2xl hover:text-white/70 transition-colors leading-none"
            >
              ×
            </button>

            <div className="space-y-6">
              <h2 className="text-white text-xl font-bold">
                {editingPromotionId ? 'Edit Promotion' : 'Add Promotion'}
              </h2>

              {/* Image Field */}
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

              {/* Name Field */}
              <div>
                <label className="block text-white text-sm mb-2">Name:</label>
                <input
                  type="text"
                  value={promotionForm.name}
                  onChange={(e) => setPromotionForm({ ...promotionForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent"
                  placeholder="Enter promotion name"
                />
              </div>

              {/* Discount Field */}
              <div>
                <label className="block text-white text-sm mb-2">Discount:</label>
                <input
                  type="text"
                  value={promotionForm.discount}
                  onChange={(e) => setPromotionForm({ ...promotionForm, discount: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent"
                  placeholder="Enter discount"
                />
              </div>

              {/* Expiration Date Field */}
              <div>
                <label className="block text-white text-sm mb-2">Expiration Date:</label>
                <input
                  type="text"
                  value={promotionForm.expirationDate}
                  onChange={(e) => setPromotionForm({ ...promotionForm, expirationDate: formatDateInput(e.target.value) })}
                  placeholder="mm/dd/yyyy"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent"
                />
              </div>

              {/* Save/Send Button */}
              <div className="flex justify-end">
                <button
                  onClick={handlePromotionSubmit}
                  className="text-white hover:text-gray-300 transition-colors font-medium"
                >
                  {editingPromotionId ? 'Save' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Fee Modal */}
      {showBookingFeeModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="bg-white/3 backdrop-blur-md rounded-lg p-8 w-full max-w-md mx-4 relative"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)' }}
          >
            <button
              title="Close"
              type="button"
              onClick={closeBookingFeeModal}
              className="absolute top-3 right-4 text-white text-2xl hover:text-white/70 transition-colors leading-none"
            >
              ×
            </button>

            <div className="space-y-6">
              <h2 className="text-white text-xl font-bold">
                {editingBookingFeeId ? 'Edit Booking Fee' : 'Add Booking Fee'}
              </h2>

              {/* Name Field */}
              <div>
                <label className="block text-white text-sm mb-2">Name:</label>
                <input
                  type="text"
                  value={bookingFeeForm.name}
                  onChange={(e) => setBookingFeeForm({ ...bookingFeeForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent"
                  placeholder="Enter fee name"
                />
              </div>

              {/* Amount Field */}
              <div>
                <label className="block text-white text-sm mb-2">Amount:</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">$</span>
                  <input
                    title="Amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={bookingFeeForm.amount}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        setBookingFeeForm({ ...bookingFeeForm, amount: value });
                      }
                    }}
                    className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleBookingFeeSubmit}
                  className="text-white hover:text-gray-300 transition-colors font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}