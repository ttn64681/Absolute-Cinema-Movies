'use client';

import { useState } from 'react';
import NavBar from '@/components/common/navBar/NavBar';
import CheckoutSections from '@/components/specific/booking/order/CheckoutSections';
import OrderDetails from '@/components/specific/booking/order/OrderDetails';

const checkoutSteps = [
  { number: 1, label: 'Billing Address' },
  { number: 2, label: 'Payment' },
  { number: 3, label: 'Promo Code' },
  { number: 4, label: 'Review' },
];

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="min-h-screen bg-black">
      <NavBar />

      <div className="w-full flex flex-row gap-6 p-30 pt-28 items-stretch">
        <div className="flex-1 flex flex-col">
          <StepTracker steps={checkoutSteps} currentStep={currentStep} />
          <CheckoutSections currentStep={currentStep} setCurrentStep={setCurrentStep} />
        </div>

        <div className="w-96 flex-shrink-0 flex flex-col">
          {/* Spacer keeps OrderDetails aligned with the form column */}
          <div className="w-full pb-6">
            <div className="max-w-4xl mx-auto invisible pointer-events-none">
              <StepTracker steps={checkoutSteps} currentStep={currentStep} ghost />
            </div>
          </div>
          <OrderDetails />
        </div>
      </div>
    </div>
  );
}

type Step = { number: number; label: string };

interface StepTrackerProps {
  steps: Step[];
  currentStep: number;
  ghost?: boolean;
}

function StepTracker({ steps, currentStep, ghost = false }: StepTrackerProps) {
  return (
    <div className={ghost ? 'opacity-0' : 'w-full pb-6'}>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-4 items-center gap-0">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center justify-center relative">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-colors relative z-10 ${
                    currentStep >= step.number
                      ? 'bg-white text-black'
                      : 'bg-black border-2 border-white text-white'
                  }`}
                >
                  {step.number}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className="absolute left-full top-1/2 -translate-y-1/2 w-full flex items-center"
                  style={{ width: 'calc(100% - 3rem)', left: 'calc(50% + 1.5rem)' }}
                >
                  <div className="w-full h-1 bg-white" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center mt-2">
          {steps.map((step) => {
            const labelColor = currentStep >= step.number ? 'text-white' : 'text-white/60';
            return (
              <div key={step.number} className="flex-1 text-center">
                <span className={`text-sm ${labelColor}`}>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
