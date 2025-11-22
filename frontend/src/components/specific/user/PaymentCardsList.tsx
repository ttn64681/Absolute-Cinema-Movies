'use client';

import PaymentCardItem from './PaymentCardItem';

interface PaymentCard {
  id: number;
  cardholderName: string;
  cardNumber: string;
  expirationDate: string;
  paymentCardType: string;
  isDefault: boolean;
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  billingCountry?: string;
}

interface PaymentCardsListProps {
  paymentCards: PaymentCard[];
  isLoading: boolean;
  error: string | null | undefined;
  onEdit: (card: PaymentCard) => void;
  onDelete: (cardId: number) => void;
  onAdd: () => void;
}

export default function PaymentCardsList({
  paymentCards,
  isLoading,
  error,
  onEdit,
  onDelete,
  onAdd,
}: PaymentCardsListProps) {
  return (
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
              <PaymentCardItem key={card.id} card={card} onEdit={() => onEdit(card)} onDelete={() => onDelete(card.id)} />
            ))}

            {paymentCards.length === 0 && (
              <div className="text-center py-12 text-white/60 font-afacad">No payment methods yet.</div>
            )}
          </div>

          {/* Add button */}
          {paymentCards.length < 3 && (
            <div className="mt-6">
              <button
                onClick={onAdd}
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
  );
}

