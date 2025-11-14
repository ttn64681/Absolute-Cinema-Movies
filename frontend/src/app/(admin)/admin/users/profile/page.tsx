"use client";

import Link from "next/link";
import { useState } from "react";
import NavBar from "@/components/common/navBar/NavBar";
import { useProfile } from "@/contexts/ProfileContext";
import Checkbox from "@/components/common/forms/Checkbox";
import styles from "./profile.module.css";

export default function ProfilePage() {
  // User profile data
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });


  
  // Promotions subscription state
  const [subscribeToPromotions, setSubscribeToPromotions] = useState(false);
  
  const { profilePic, setProfilePic, profilePicUrl, setProfilePicUrl } = useProfile();

  // Handle profile picture upload - was a real pain to get working
  const onImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePic(file);
      setProfilePicUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="text-white min-h-screen bg-[#1C1C1C]">
      <NavBar />
      <div className="h-30" />

      {/* Navigation */}
      <div className="flex items-center justify-center gap-10 mt-2 mb-18 font-red-rose" style={{ fontSize: '30px' }}>
        <Link 
          href="/user/profile" 
          className="relative font-bold"
          style={{ color: '#FF478B' }}
        >
          Account Info
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
          href="/user/payments" 
          className="font-bold text-gray-300 hover:text-white transition-colors"
        >
          Payment
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
            <div className="relative group">
              <input
                title="Upload Profile Picture"
                type="file"
                accept="image/*"
                onChange={onImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full z-10"
              />
              <div 
                className="rounded-full flex items-center justify-center transition-colors"
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
                {/* Edit overlay on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-60 transition-opacity">
                  <span className="text-white font-afacad text-lg font-bold">Edit</span>
                </div>
              </div>
            </div>
            <button
              className="text-[#FF478B] hover:text-[#FF3290] font-afacad text-lg"
              type="button"
            >
              Log Out
            </button>
          </aside>

          {/* Form */}
          <section className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-y-6 gap-x-6">
              <label className="self-center text-white font-afacad text-lg font-bold">Email</label>
              <input
                type="email"
                value={userData.email}
                readOnly
                className={styles.emailInput}
                placeholder="Email address"
              />

              <label className="self-center text-white font-afacad text-lg font-bold">Password</label>
              <input
                type="password"
                value={userData.password}
                onChange={(e) => setUserData(prev => ({ ...prev, password: e.target.value }))}
                className={styles.profileInput}
                placeholder="Enter password"
              />

              <label className="self-center text-white font-afacad text-lg font-bold">Name</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-2 font-afacad">First</div>
                  <input
                    type="text"
                    value={userData.firstName}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setUserData(prev => ({ ...prev, firstName: newValue }));
                    }}
                    className={styles.profileInput}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-2 font-afacad">Last</div>
                  <input
                    type="text"
                    value={userData.lastName}
                    onChange={(e) => setUserData(prev => ({ ...prev, lastName: e.target.value }))}
                    className={styles.profileInput}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <label className="self-center text-white font-afacad text-lg font-bold">Phone Number</label>
              <input
                type="text"
                value={userData.phone}
                onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                className={styles.profileInput}
                placeholder="Enter phone number"
              />
            </div>

            {/* Promotions checkbox */}
            <div className="mt-8">
              <Checkbox
                id="promotions"
                label="Subscribe to promotions"
                checked={subscribeToPromotions}
                onChange={setSubscribeToPromotions}
              />
            </div>

            {/* Save button */}
            <div className="flex justify-center mt-10">
              <button
                type="button"
                title="Save Changes"
                className="px-8 py-3 rounded-full font-afacad font-bold text-black"
                style={{ 
                  background: "linear-gradient(to right, #FF478B, #FF5C33)",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Save Changes
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
