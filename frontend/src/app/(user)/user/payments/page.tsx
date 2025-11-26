'use client';

import NavBar from '@/components/common/navBar/NavBar';
import { useProfile } from '@/contexts/ProfileContext';
import { useUserId } from '@/hooks/useUserId';
import { usePaymentCards } from '@/hooks/usePaymentCards';
import UserProfileSidebar from '@/components/specific/user/UserProfileSidebar';
import UserNavTabs from '@/components/specific/user/UserNavTabs';
import PaymentCardsList from '@/components/specific/user/PaymentCardsList';
import PaymentCardModal from '@/components/specific/user/PaymentCardModal';

/**
 * Payments Page - Follows same pattern as Movies page
 *
 * Architecture:
 * Page -> Hook -> Client -> Backend
 *
 * ONE hook (usePaymentCards) handles everything:
 * - Card data fetching
 * - Modal state
 * - Business logic
 * - Client calls
 */
export default function PaymentsPage() {
  const { userId } = useUserId();
  const { profilePicUrl } = useProfile();

  // ONE hook - just like useMovies
  const payment = usePaymentCards(userId);

  return (
    <div className="text-white min-h-screen bg-[#1C1C1C]">
      <NavBar />
      <div className="h-30" />

      <UserNavTabs activeTab="payments" />

      <div className="max-w-7xl mx-auto px-8 pb-16 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 items-start">
          <UserProfileSidebar profilePicUrl={profilePicUrl} />

          <PaymentCardsList
            paymentCards={payment.paymentCards}
            isLoading={payment.isLoading}
            error={payment.error}
            onEdit={payment.openEdit}
            onDelete={payment.handleDelete}
            onAdd={payment.openAdd}
          />
        </div>
      </div>

      <PaymentCardModal
        isOpen={payment.isOpen}
        mode={payment.mode}
        onClose={payment.close}
        onSubmit={payment.handleSubmit}
        isSubmitting={payment.isSubmitting}
        initialData={
          payment.editingCard
            ? {
                cardId: payment.editingCard.id,
                cardType: payment.editingCard.paymentCardType,
                cardNumber: payment.editingCard.cardNumber,
                expirationDate: payment.editingCard.expirationDate,
                cardholderName: payment.editingCard.cardholderName,
                billingStreet: payment.editingCard.billingStreet || '',
                billingCity: payment.editingCard.billingCity || '',
                billingState: payment.editingCard.billingState || '',
                billingZip: payment.editingCard.billingZip || '',
                billingCountry: payment.editingCard.billingCountry || 'US',
                isDefault: payment.editingCard.isDefault,
              }
            : undefined
        }
      />
    </div>
  );
}
