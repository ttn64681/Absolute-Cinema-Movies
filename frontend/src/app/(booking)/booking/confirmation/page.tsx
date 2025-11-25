'use client';

import NavBar from '@/components/common/navBar/NavBar';
import OrderConfirm from '@/components/specific/booking/order/OrderConfirm';

export default function ConfirmationPage() {
  // TODO: Get actual order data from context/state/API
  // For now, using placeholder data matching the image
  
  return (
    <div className="min-h-screen bg-black">
      <NavBar />
      <div className="pt-28">
        <OrderConfirm />
      </div>
    </div>
  );
}
