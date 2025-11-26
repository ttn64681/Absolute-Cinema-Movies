'use client';

import { MdCreditCard, MdEdit, MdDelete } from 'react-icons/md';
import { displayCardNumber, formatExpirationDate } from '@/utils/payment';

interface PaymentCardData {
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

interface PaymentCardItemProps {
  card: PaymentCardData;
  onEdit: () => void;
  onDelete: () => void;
}

export default function PaymentCardItem({ card, onEdit, onDelete }: PaymentCardItemProps) {
  return (
    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <MdCreditCard className="text-3xl text-acm-pink" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-afacad text-lg">{card.cardholderName}</span>
              {card.isDefault && (
                <span className="text-acm-pink text-xs font-bold bg-acm-pink/20 px-2 py-1 rounded">DEFAULT</span>
              )}
            </div>
            <span className="text-white/70 font-afacad text-sm">{displayCardNumber(card.cardNumber)}</span>
            <div className="text-white/60 font-afacad text-xs">
              {formatExpirationDate(card.expirationDate)} • {card.paymentCardType.toUpperCase()}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="p-2 text-white hover:text-acm-pink transition-colors cursor-pointer"
            title="Edit"
          >
            <MdEdit className="text-2xl" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-2 text-white hover:text-red-500 transition-colors cursor-pointer"
            title="Delete"
          >
            <MdDelete className="text-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
}

