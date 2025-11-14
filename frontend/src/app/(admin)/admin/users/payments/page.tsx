"use client";

import Link from "next/link";
import { useState } from "react";
import NavBar from "@/components/common/navBar/NavBar";
import { useProfile } from "@/contexts/ProfileContext";

export default function PaymentsPage() {
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: "Mastercard", number: "**** **** **** 6973", isDefault: true },
    { id: 2, type: "Mastercard", number: "**** **** **** 9999", isDefault: false }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCardData, setNewCardData] = useState({
    cardType: "",
    cardNumber: "",
    expirationDate: "",
    cvv: "",
    cardholderName: "",
    billingAddress: "",
    city: "",
    state: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { profilePicUrl } = useProfile();

  const addCard = async () => {
    // check if all fields filled
    const fields = ['cardType', 'cardNumber', 'expirationDate', 'cvv', 'cardholderName', 'billingAddress', 'city', 'state'];
    const allFilled = fields.every(field => newCardData[field as keyof typeof newCardData]);
    
    if (!allFilled) {
      console.log('Missing required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const card = {
        id: Date.now(),
        type: newCardData.cardType,
        number: `**** **** **** ${newCardData.cardNumber.slice(-4)}`,
        isDefault: false
      };
      
      setPaymentMethods(prev => [...prev, card]);
      
      clearForm();
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add card:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // clear form data
  const clearForm = () => {
    setNewCardData({
      cardType: "",
      cardNumber: "",
      expirationDate: "",
      cvv: "",
      cardholderName: "",
      billingAddress: "",
      city: "",
      state: ""
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    clearForm();
  };

  // format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = cleaned.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return cleaned;
    }
  };

  // format exp date
  const formatExpirationDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  return (
    <div className="text-white min-h-screen bg-[#1C1C1C]">
      <NavBar />
      <div className="h-30" />

      {/* Navigation */}
      <div className="flex items-center justify-center gap-10 mt-2 mb-18 font-red-rose" style={{ fontSize: '30px' }}>
        <Link 
          href="/user/profile" 
          className="font-bold text-gray-300 hover:text-white transition-colors"
        >
          Account Info
        </Link>
        <Link 
          href="/user/payments" 
          className="relative font-bold"
          style={{ color: '#FF478B' }}
        >
          Payment
          <span 
            className="absolute rounded-full"
            style={{ 
              bottom: '-8px', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              width: '32px', 
              height: '2px', 
              backgroundColor: '#FF478B' 
            }} 
          />
        </Link>
        <Link 
          href="/user/orders" 
          className="font-bold text-gray-300 hover:text-white transition-colors"
        >
          Order History
        </Link>
      </div>

      {/* Main content area */}
      <div className="max-w-6xl mx-auto px-6 pb-16 ml-20">
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-10 items-start">
          {/* Profile sidebar */}
          <aside className="flex flex-col items-center gap-6 -mt-2 md:-mt-20">
            <div 
              className="rounded-full flex items-center justify-center"
              style={{ 
                width: '170px', 
                height: '170px', 
                backgroundColor: '#2B2B2B' 
              }}
            >
              {profilePicUrl ? (
                <img
                  src={profilePicUrl}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="#EDEDED" strokeWidth="1.2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M3 21c2.2-4.2 6.1-6 9-6s6.8 1.8 9 6" />
                </svg>
              )}
            </div>
            <button
              className="text-[#FF478B] hover:text-[#FF3290] font-afacad text-lg"
              type="button"
            >
              Log Out
            </button>
          </aside>

          {/* Payment methods */}
          <section className="p-0">
            <div className="space-y-0">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center py-4 border-b border-white">
                  <div className="w-24">
                    {method.isDefault && (
                      <span className="text-white font-afacad font-bold">Default</span>
                    )}
                  </div>
                  <div className="flex items-center flex-1 justify-center">
                    <span className="text-white font-afacad text-xl w-32 text-left">{method.type}</span>
                    <span className="text-white font-afacad text-xl">{method.number}</span>
                  </div>
                </div>
              ))}
              
              {/* Add payment method button */}
              <div className="mt-6">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-2 rounded-full font-afacad font-bold text-white border-2 transition-colors hover:bg-[#FF478B] hover:border-[#FF478B]"
                  style={{ 
                    borderColor: '#FF478B',
                    backgroundColor: 'transparent'
                  }}
                >
                  Add +
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white/3 backdrop-blur-md rounded-lg p-8 w-full max-w-md mx-4 ">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white font-afacad">Add Payment Method</h2>
            </div>

            <form className="space-y-4">
              {/* Card Type */}
              <div>
                <label className="block text-white text-sm mb-2 font-afacad">Card Type</label>
                <select
                  title="Card Type"
                  value={newCardData.cardType}
                  onChange={(e) => setNewCardData({...newCardData, cardType: e.target.value})}
                  className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent cursor-pointer"
                  required
                >
                  <option value="">Select Card Type</option>
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="American Express">American Express</option>
                  <option value="Discover">Discover</option>
                </select>
              </div>

              {/* Card Number */}
              <div>
                <label className="block text-white text-sm mb-2 font-afacad">Card Number</label>
                <input
                  type="text"
                  value={newCardData.cardNumber}
                  onChange={(e) => setNewCardData({...newCardData, cardNumber: formatCardNumber(e.target.value)})}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  maxLength={19}
                  required
                />
              </div>

              {/* Name on card */}
              <div>
                <label className="block text-white text-sm mb-2 font-afacad">Name on Card</label>
                <input
                  type="text"
                  value={newCardData.cardholderName}
                  onChange={(e) => setNewCardData({...newCardData, cardholderName: e.target.value})}
                  placeholder="Name"
                  className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent"
                  required
                />
              </div>

              {/* Expiration Date and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm mb-2 font-afacad">Expiration Date</label>
                  <input
                    type="text"
                    value={newCardData.expirationDate}
                    onChange={(e) => setNewCardData({...newCardData, expirationDate: formatExpirationDate(e.target.value)})}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent"
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2 font-afacad">CVV</label>
                  <input
                    type="text"
                    value={newCardData.cvv}
                    onChange={(e) => setNewCardData({...newCardData, cvv: e.target.value.replace(/\D/g, '')})}
                    placeholder="123"
                    className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent"
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              {/* Separator line */}
              <div className="border-t border-white/20 my-4"></div>

              {/* Billing Address */}
              <div>
                <label className="block text-white text-sm mb-2 font-afacad">Billing Address</label>
                <input
                  type="text"
                  value={newCardData.billingAddress}
                  onChange={(e) => setNewCardData({...newCardData, billingAddress: e.target.value})}
                  placeholder="123 Main St"
                  className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent"
                  required
                />
              </div>

              {/* City and State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm mb-2 font-afacad">City</label>
                  <input
                    type="text"
                    value={newCardData.city}
                    onChange={(e) => setNewCardData({...newCardData, city: e.target.value})}
                    placeholder="New York"
                    className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2 font-afacad">State</label>
                  <input
                    type="text"
                    value={newCardData.state}
                    onChange={(e) => setNewCardData({...newCardData, state: e.target.value})}
                    placeholder="NY"
                    className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF478B] focus:border-transparent"
                    maxLength={2}
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 rounded-md font-afacad font-bold text-white border-2 border-white/20 hover:border-white/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addCard}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-md font-afacad font-bold text-white bg-gradient-to-r from-[#FF478B] to-[#FF5C33] hover:from-[#FF5C33] hover:to-[#FF478B] transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
