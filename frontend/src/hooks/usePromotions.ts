'use client';

import { BackendPromotion } from "@/types/promotion";

import { useState } from "react";
import { buildUrl, endpoints } from "@/config/api";

export function usePromotions() {
    const [promotions, setPromotions] = useState<BackendPromotion[]>([]);
    const [loading, setLoading] = useState(true);

    async function getPromotions() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        // Fetch payment cards from new endpoint
        const response = await fetch(buildUrl(endpoints.promotions.getPromotions()), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
        });

        if (response.ok) {
          const data = (await response.json()) as BackendPromotion[];
          console.log('Fetched promotion: ', data);
          setPromotions(data);
        }
      } catch (error) {
        console.error('Error fetching promotions:', error);
      } finally {
        setLoading(false);
      }
    }

    async function addPromotion(newPromotion: Omit<BackendPromotion, 'id'>) {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(buildUrl(endpoints.promotions.addPromotion()), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(newPromotion),
        });
        

        if (response.ok) {
          // const data = (await response.json()) as BackendPromotion;
          // console.log('Added promotion: ', data);
          // setPromotions(prev => [...prev, data]);
          await getPromotions(); // refresh list
        }
      } catch (error) {
        console.error('Error adding promotion:', error);
      } finally {
        setLoading(false);
      }
    }

    async function updatePromotion(promotionId: number, updatedPromotion: Partial<BackendPromotion>) {
      console.log(updatedPromotion);
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(buildUrl(endpoints.promotions.updatePromotion(promotionId)), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(updatedPromotion),
        });
        console.log("Response: " + response.ok);
        
        if (response.ok) {
          await getPromotions(); // refresh list
          // const data = (await response.json()) as BackendPromotion;
          // console.log('Updated promotion: ', data);
          // setPromotions(prev => prev.map(promo => promo.id === promotionId ? data : promo));
        }
      } catch (error) {
        console.error('Update payment error ', error);      
      } finally {
        setLoading(false);
      }
    }

    async function deletePromotion(promotionId: number) {
      try {
        console.log("Attempting to delete...");
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(buildUrl(endpoints.promotions.deletePromotion(promotionId)), {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        if (response.ok) await getPromotions(); // refresh list
        return response.ok;
      } catch (error) {
        console.error('Delete payment error ', error);        
      } finally {
        setLoading(false);
      }
    }

    return {
        promotions,
        setPromotions,
        loading,
        getPromotions,
        addPromotion,
        updatePromotion,
        deletePromotion
    };

}