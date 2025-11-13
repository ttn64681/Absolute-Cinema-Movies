export interface BackendPromotion {
  id: number;
  promoCode: string;
  title: string;
  description: string;
  imageLink: string;
  discountValue: number;
  discountType: DiscountType;
  status: PromotionStatus;
  expirationDate: string;
}

// Enum for DiscountType
export enum DiscountType {
  percentage = 'percentage',
  fixed = 'fixed',
}

export enum PromotionStatus {
  active = 'active',
  inactive = 'inactive',
}