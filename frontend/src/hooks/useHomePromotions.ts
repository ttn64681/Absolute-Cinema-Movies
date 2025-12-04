'use client';

import { useState, useEffect } from 'react';
import { promotionClient } from '@/clients/promotionClient';
import { BackendPromotion, DiscountType, PromotionStatus } from '@/types/promotion';
import { formatDiscount, formatDiscountForSmallPromo } from '@/utils/promotion';

interface HeroPromo {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
  ctaText: string;
}

interface SmallPromoData {
  discount: string;
  promo: string;
  imageUrl?: string;
}

export interface FullPromo {
  id: number;
  promoCode: string;
  title: string;
  description: string;
  imageUrl: string;
  type: DiscountType;
  discount: string;
  discountTag: string;
  expirationDate: string;
}

/**
 * Hook for homepage promotion operations
 *
 * Responsibilities:
 * - React state management (hero promos, small promos, loading, error)
 * - Fetch active promotions from backend via promotionClient
 * - Transform promotions to component-specific formats
 *
 * Delegates to:
 * - promotionClient (Facade): API calls
 * - promotion utils: Formatting functions
 */
export function useHomePromotions() {
  const [heroPromos, setHeroPromos] = useState<HeroPromo[]>([]);
  const [smallPromos, setSmallPromos] = useState<SmallPromoData[]>([]);
  const [fullPromos, setFullPromos] = useState<FullPromo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPromotions() {
      try {
        setIsLoading(true);
        setError(null);
        const allPromotions = await promotionClient.getAllPromotions();

        // Filter active promotions - handle both string and enum values
        const activePromotions = allPromotions.filter((p) => {
          const status = p.status?.toLowerCase?.() || p.status;
          return status === 'active' || status === PromotionStatus.active;
        });

        // Transform to HeroPromo format
        const heroPromosData = activePromotions.map((p: BackendPromotion) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          image: p.imageLink,
          link: '/promos',
          ctaText: 'Learn More',
        }));

        // Transform to SmallPromoData format
        const smallPromosData = activePromotions.map((p: BackendPromotion) => ({
          discount: formatDiscountForSmallPromo(p),
          promo: p.title.toUpperCase(),
          imageUrl: p.imageLink,
        }));

        // Transform to FullPromo format
        const fullPromosData = activePromotions.map((p: BackendPromotion) => ({
          id: p.id,
          promoCode: p.promoCode,
          title: p.title,
          description: p.description,
          imageUrl: p.imageLink,
          type: p.discountType,
          discount: formatDiscountForSmallPromo(p),
          discountTag: formatDiscount(p),
          expirationDate: p.expirationDate,
        }))

        setHeroPromos(heroPromosData);
        setSmallPromos(smallPromosData);
        setFullPromos(fullPromosData);
        
      } catch (err) {
        console.error('Error fetching promotions:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load promotions...';
        setError(errorMessage);
        setHeroPromos([]);
        setSmallPromos([]);
        setFullPromos([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPromotions();
  }, []);

  return {
    heroPromos,
    smallPromos,
    fullPromos,
    isLoading,
    error,
  };
}
