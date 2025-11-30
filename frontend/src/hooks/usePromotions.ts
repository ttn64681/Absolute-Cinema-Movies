'use client';

import { BackendPromotion } from "@/types/promotion";
import { useState, useEffect } from "react";
import { promotionClient } from "@/clients/promotionClient";

/**
 * Hook for promotion operations
 *
 * Responsibilities:
 * - React state management (promotions, loading, error)
 * - Fetch promotions from backend via promotionClient
 *
 * Delegates to:
 * - promotionClient (Facade): API calls
 *
 * @returns Promotion state, loading status, and error state
 */
export function usePromotions() {
    const [promotions, setPromotions] = useState<BackendPromotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function getPromotions() {
      try {
        setLoading(true);
        setError(null);
        const data = await promotionClient.getAllPromotions();
        setPromotions(data);
      } catch (err) {
        console.error('Error fetching promotions:', err);
        setError('Failed to load promotions. Please try again later.');
        setPromotions([]);
      } finally {
        setLoading(false);
      }
    }

    async function addPromotion(newPromotion: Omit<BackendPromotion, 'id'>) {
      try {
        setLoading(true);
        await promotionClient.createPromotion(newPromotion);
        await getPromotions(); // Refresh list
      } catch (err) {
        console.error('Error adding promotion:', err);
        throw err; // Re-throw for caller to handle
      } finally {
        setLoading(false);
      }
    }

    async function updatePromotion(promotionId: number, updatedPromotion: Partial<BackendPromotion>) {
      try {
        setLoading(true);
        await promotionClient.updatePromotion(promotionId, updatedPromotion);
        await getPromotions(); // Refresh list
      } catch (err) {
        console.error('Error updating promotion:', err);
        throw err; // Re-throw for caller to handle
      } finally {
        setLoading(false);
      }
    }

    async function deletePromotion(promotionId: number) {
      try {
        setLoading(true);
        await promotionClient.deletePromotion(promotionId);
        await getPromotions(); // Refresh list
        return true;
      } catch (err) {
        console.error('Error deleting promotion:', err);
        throw err; // Re-throw for caller to handle
      } finally {
        setLoading(false);
      }
    }

    // Auto-fetch on mount (only for public pages)
    // Admin pages should call getPromotions() manually
    useEffect(() => {
      getPromotions();
    }, []);

    return {
        promotions,
        setPromotions,
        loading,
        error,
        getPromotions,
        addPromotion,
        updatePromotion,
        deletePromotion,
    };

}