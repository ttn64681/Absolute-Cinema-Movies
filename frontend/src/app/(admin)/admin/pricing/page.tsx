'use client';

import Link from 'next/link';
import { PiPencilSimple, PiX, PiPlus } from 'react-icons/pi';
import { useState } from 'react';
import AdminNavBar from '@/components/common/navBar/AdminNavBar';
import PromotionModal from '@/components/specific/admin/PromotionModal';
import BookingFeeModal from '@/components/specific/admin/BookingFeeModal';
import TicketPriceEditor from '@/components/specific/admin/TicketPriceEditor';

interface Promotion {
  id: number;
  name: string;
  value: string;
  expirationDate?: string;
  description?: string;
  promoCode?: string;
  discountType?: string;
  sent: boolean;
  active: boolean;
}

interface BookingFee {
  id: number;
  name: string;
  amount: number;
}

interface TicketPrices {
  child: number;
  adult: number;
  senior: number;
}

const formatCurrency = (amount: number) => {
  return `$${amount.toFixed(2)}`;
};

const formatDiscountValue = (value: string, discountType: string) => {
  if (discountType === '% off') {
    return `${value}% off`;
  } else if (discountType === '$ off') {
    return `$${value} off`;
  }
  return value;
};

export default function AdminPricingPage() {
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [showBookingFeeModal, setShowBookingFeeModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [editingBookingFee, setEditingBookingFee] = useState<BookingFee | null>(null);

  const [promotions, setPromotions] = useState<Promotion[]>([
    { id: 1, name: 'Summer Sale', value: '20', expirationDate: '12/31/2025', description: 'Get 20% off on all tickets this summer!', promoCode: 'SUMMER20', discountType: '% off', sent: true, active: true },
    { id: 2, name: 'Student Discount', value: '5.00', expirationDate: '01/15/2026', description: 'Students save $5 on every ticket purchase', promoCode: 'STUDENT5', discountType: '$ off', sent: true, active: true },
  ]);

  const [ticketPrices, setTicketPrices] = useState<TicketPrices>({
    child: 3.29,
    adult: 3.29,
    senior: 3.29,
  });

  const [bookingFees, setBookingFees] = useState<BookingFee[]>([
    { id: 1, name: 'Service Fee', amount: 2.5 },
    { id: 2, name: 'Processing Fee', amount: 1.0 },
  ]);

  const handlePromotionSave = (promoData: Omit<Promotion, 'id' | 'sent' | 'active'>) => {
    if (editingPromotion) {
      setPromotions(
        promotions.map((promo) => {
          if (promo.id === editingPromotion.id) {
            return { ...promo, ...promoData };
          }
          return promo;
        })
      );
    } else {
      setPromotions([
        ...promotions,
        {
          id: Date.now(),
          ...promoData,
          sent: false,
          active: false,
        },
      ]);
    }
    setEditingPromotion(null);
  };

  const editPromotion = (promo: Promotion) => {
    setEditingPromotion(promo);
    setShowPromotionModal(true);
  };

  const deletePromotion = (promoId: number) => {
    setPromotions(promotions.filter((promo) => promo.id !== promoId));
  };

  const sendPromotion = (promoId: number) => {
    setPromotions(
      promotions.map((promo) => {
        if (promo.id === promoId) {
          return { ...promo, sent: true, active: true };
        }
        return promo;
      })
    );
  };

  const handleBookingFeeSave = (feeData: { name: string; amount: number }) => {
    if (editingBookingFee) {
      setBookingFees(
        bookingFees.map((fee) => {
          if (fee.id === editingBookingFee.id) {
            return { ...fee, ...feeData };
          }
          return fee;
        })
      );
    } else {
      setBookingFees([
        ...bookingFees,
        {
          id: Date.now(),
          ...feeData,
        },
      ]);
    }
    setEditingBookingFee(null);
  };

  const editBookingFee = (fee: BookingFee) => {
    setEditingBookingFee(fee);
    setShowBookingFeeModal(true);
  };

  const removeBookingFee = (feeId: number) => {
    setBookingFees(bookingFees.filter((fee) => fee.id !== feeId));
  };

  const handleSaveTicketPrices = (prices: TicketPrices) => {
    setTicketPrices(prices);
    console.log('saving prices:', prices);
  };

  return (
    <div className="text-white bg-[#1C1C1C] min-h-screen">
      <AdminNavBar />
      <div className="h-[120px]" />

      <div className="flex items-center justify-center gap-10 text-[30px] font-red-rose mt-2 mb-18">
        <Link
          href="/admin/movies"
          className="text-gray-300 hover:text-white transition-colors font-bold"
        >
          Movies & Showtimes
        </Link>
        <Link href="/admin/pricing" className="relative text-[#FF478B] font-bold">
          Pricing & Promotions
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-acm-pink rounded-full" />
        </Link>
        <Link
          href="/admin/users"
          className="text-gray-300 hover:text-white transition-colors font-bold"
        >
          Users & Admins
        </Link>
      </div>

      <div className="max-w-[65rem] mx-auto px-4">
        <TicketPriceEditor prices={ticketPrices} onSave={handleSaveTicketPrices} />

        {/* Booking Fees */}
        <div className="mb-10">
          <div className="text-xl font-afacad mb-3">Booking Fees</div>
          <div className="rounded-md overflow-hidden shadow-lg h-48 overflow-y-auto bg-[#242424]">
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
                onClick={() => {
                  setEditingBookingFee(null);
                  setShowBookingFeeModal(true);
                }}
              >
                <PiPlus className="text-lg" />
              </button>
            </div>
          </div>
        </div>

        {/* Promotions */}
        <div className="mb-16">
          <div className="text-xl font-afacad mb-3">Promotions</div>
          <div className="rounded-md overflow-hidden shadow-lg h-48 overflow-y-auto bg-[#242424]">
            {promotions.map((promo) => (
                <div key={promo.id} className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                  <div className="flex-1 font-afacad flex items-center gap-4">
                    <span className="w-32">{promo.name}:</span>
                    <span className="w-32">{formatDiscountValue(promo.value, promo.discountType || '% off')}</span>
                    <span className="w-40 text-white/60 text-sm">Expires: {promo.expirationDate || 'N/A'}</span>
                  </div>
                  <div className="w-24 text-center"></div>
                  <div className="flex items-center gap-4 text-gray-300">
                    {promo.sent ? (
                      <span className="text-gray-400 text-sm">{promo.active ? 'Active' : 'Inactive'}</span>
                    ) : (
                      <button
                        title="Send"
                        type="button"
                        onClick={() => sendPromotion(promo.id)}
                        className="text-black px-4 py-1 rounded-full transition-colors hover:opacity-90 font-afacad font-bold text-sm bg-gradient-to-r from-[#FF478B] to-[#FF5C33]"
                      >
                        Send
                      </button>
                    )}
                    <button
                      title={promo.active ? "Cannot edit active promotion" : "Edit"}
                      type="button"
                      className={promo.active ? "transition-colors text-gray-500 opacity-50" : "transition-colors hover:text-white"}
                      onClick={() => !promo.active && editPromotion(promo)}
                      disabled={promo.active}
                    >
                      <PiPencilSimple className="text-lg" />
                    </button>
                    <button
                      title={promo.active ? "Cannot delete active promotion" : "Delete"}
                      type="button"
                      className={promo.active ? "transition-colors text-gray-500 opacity-50" : "transition-colors hover:text-white"}
                      onClick={() => !promo.active && deletePromotion(promo.id)}
                      disabled={promo.active}
                    >
                      <PiX className="text-lg" />
                    </button>
                  </div>
                </div>
            ))}
            <div className="flex items-center justify-end py-5 pr-5">
              <button
                type="button"
                title="Add promotion"
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => {
                  setEditingPromotion(null);
                  setShowPromotionModal(true);
                }}
              >
                <PiPlus className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-20"></div>

      <PromotionModal
        isOpen={showPromotionModal}
        onClose={() => {
          setShowPromotionModal(false);
          setEditingPromotion(null);
        }}
        onSave={handlePromotionSave}
        editingPromo={editingPromotion}
      />

      <BookingFeeModal
        isOpen={showBookingFeeModal}
        onClose={() => {
          setShowBookingFeeModal(false);
          setEditingBookingFee(null);
        }}
        onSave={handleBookingFeeSave}
        editingFee={editingBookingFee}
      />
    </div>
  );
}