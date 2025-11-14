'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MdDelete, MdEdit, MdCreditCard } from 'react-icons/md';
import NavBar from '@/components/common/navBar/NavBar';
import { useProfile } from '@/contexts/ProfileContext';
import PaymentCardModal from '@/components/specific/user/PaymentCardModal';
import { PaymentCardFormData } from '@/types/payment';
import { useUserId } from '@/hooks/useUserId';
import { usePaymentCardModal } from '@/hooks/usePaymentCardModal';
import { usePaymentCards } from '@/hooks/usePaymentCards';
import { displayCardNumber, formatExpirationDate } from '@/utils/payment';

export default function PaymentsPage() {
  const { userId } = useUserId();
  const { profilePicUrl } = useProfile();
  const { isOpen, mode, editingCard, openAdd, openEdit, close } = usePaymentCardModal();
  const { paymentCards, isLoading, error, isSubmitting, createCard, updateCard, deleteCard } = usePaymentCards(userId);

  // Handle delete w/ confirmation
  const handleDeleteCard = async (cardId: number) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }
    await deleteCard(cardId);
  };

  // Handle form submission
  const handleSubmit = async (formData: PaymentCardFormData) => {
    let success = false;

    if (mode === 'Add') {
      success = await createCard(formData);
    } else if (editingCard) {
      success = await updateCard(editingCard.id, formData);
    }

    if (success) {
      close();
    }
  };

  return (
    <div className="text-white min-h-screen bg-[#1C1C1C]">
      <NavBar />
      <div className="h-30" />

      {/* Navigation */}
      <div className="flex items-center justify-center gap-10 mt-2 mb-18 font-red-rose text-[30px]">
        <Link href="/user/profile" className="font-bold text-gray-300 hover:text-white transition-colors">
          Account Info
        </Link>
        <Link href="/user/payments" className="relative font-bold text-acm-pink">
          Payment
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-acm-pink rounded-full" />
        </Link>
        <Link href="/user/orders" className="font-bold text-gray-300 hover:text-white transition-colors">
          Order History
        </Link>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-8 pb-16 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 items-start">
          {/* Profile sidebar */}
          <aside className="flex flex-col items-center gap-6 -mt-2 md:-mt-20">
            <div className="rounded-full flex items-center justify-center w-[170px] h-[170px] bg-[#2B2B2B]">
              {profilePicUrl ? (
                <Image
                  src={profilePicUrl}
                  alt="Profile"
                  width={170}
                  height={170}
                  className="w-full h-full rounded-full object-cover"
                  loading="lazy"
                />
              ) : (
                <svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="#EDEDED" strokeWidth="1.2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M3 21c2.2-4.2 6.1-6 9-6s6.8 1.8 9 6" />
                </svg>
              )}
            </div>
            <button className="text-[#FF478B] hover:text-[#FF3290] font-afacad text-lg cursor-pointer" type="button">
              Log Out
            </button>
          </aside>

          {/* Payment methods */}
          <section className="p-0">
            <div className="mb-8 pb-4 border-b border-white/10">
              <h1 className="text-3xl text-acm-pink font-red-rose mb-2">Payment Methods</h1>
              <p className="text-white/60 text-sm">Manage your payment information</p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-md">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12 text-white/60 font-afacad">Loading payment methods...</div>
            ) : (
              <>
                <div className="space-y-4">
                  {paymentCards.map((card) => (
                    <div key={card.id} className="bg-white/5 border border-white/20 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <MdCreditCard className="text-3xl text-acm-pink" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-afacad text-lg">{card.cardholderName}</span>
                              {card.isDefault && (
                                <span className="text-acm-pink text-xs font-bold bg-acm-pink/20 px-2 py-1 rounded">
                                  DEFAULT
                                </span>
                              )}
                            </div>
                            <span className="text-white/70 font-afacad text-sm">
                              {displayCardNumber(card.cardNumber)}
                            </span>
                            <div className="text-white/60 font-afacad text-xs">
                              {formatExpirationDate(card.expirationDate)} • {card.paymentCardType.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(card)}
                            className="p-2 text-white hover:text-acm-pink transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <MdEdit className="text-2xl" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCard(card.id)}
                            className="p-2 text-white hover:text-red-500 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <MdDelete className="text-2xl" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {paymentCards.length === 0 && (
                    <div className="text-center py-12 text-white/60 font-afacad">No payment methods yet.</div>
                  )}
                </div>

                {/* Add button */}
                {paymentCards.length < 3 && (
                  <div className="mt-6">
                    <button
                      onClick={openAdd}
                      className="px-6 py-3 rounded-full font-afacad font-bold text-white border-2 border-acm-pink hover:bg-acm-pink transition-colors cursor-pointer"
                    >
                      Add Payment Method +
                    </button>
                  </div>
                )}

                {paymentCards.length >= 3 && (
                  <div className="mt-4 text-center text-white/60 text-sm font-afacad">
                    Maximum of 3 payment methods reached.
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {/* Payment Card Modal */}
      <PaymentCardModal
        isOpen={isOpen}
        mode={mode}
        onClose={close}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        initialData={
          editingCard
            ? {
                cardId: editingCard.id,
                cardType: editingCard.paymentCardType,
                cardNumber: editingCard.cardNumber,
                expirationDate: editingCard.expirationDate,
                cardholderName: editingCard.cardholderName,
                billingStreet: editingCard.billingStreet || '',
                billingCity: editingCard.billingCity || '',
                billingState: editingCard.billingState || '',
                billingZip: editingCard.billingZip || '',
                billingCountry: editingCard.billingCountry || 'US',
                isDefault: editingCard.isDefault,
              }
            : undefined
        }
      />
    </div>
  );
}
