'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Checkbox from '@/components/common/forms/Checkbox';
import NavBar from '@/components/common/navBar/NavBar';
import { useProfile } from '@/contexts/ProfileContext';
import styles from './profile.module.css';
import { useToast } from '@/contexts/ToastContext';

// Hook to retrieve user from backend
import { useUser } from '@/hooks/useUser';
import { getUserIdFromToken } from '@/utils/auth';

function validatePhoneNumber(phoneNumber: string) {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phoneNumber);
}

function checkPasswordSecurity(currentPwd: string, newPwd: string) {
  if (currentPwd == newPwd) {
    return { secure: false, message: 'The new password should be different from the old password.' };
  }
  if (newPwd.length < 8) {
    return { secure: false, message: 'The new password must be at least 8 characters long.' };
  }
  if (!/(?=.*[a-z])/.test(newPwd)) {
    return { secure: false, message: 'The new password must contain at least one lowercase letter.' };
  }
  if (!/(?=.*[A-Z])/.test(newPwd)) {
    return { secure: false, message: 'The new password must contain at least one uppercase letter.' };
  }
  if (!/(?=.*\d)/.test(newPwd)) {
    return { secure: false, message: 'The new password must contain at least one number.' };
  }
  return { secure: true };
}

export default function ProfilePage() {
  // Initialize user profile data
  // Get the user profile data from the backend
  // useUser expects number, use nullish coalescing w/ 0 fallback for now
  const { user, isLoading, error, updateUser, updatePassword } = useUser(getUserIdFromToken() ?? 0);

  // Promotions subscription state
  const [subscribeToPromotions, setSubscribeToPromotions] = useState(false);


  const { setProfilePic, profilePicUrl, setProfilePicUrl } = useProfile();

  const { showToast } = useToast();

  // States for save button
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [userData, setUserData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    homeStreet: '',
    homeCity: '',
    homeState: '',
    homeZip: '',
    homeCountry: '',
    profileImageLink: '',
  });

  useEffect(() => {
    //console.log(user);
    if (user) {
      setUserData({
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phoneNumber || '',
        homeStreet: user.homeStreet || '',
        homeCity: user.homeCity || '',
        homeState: user.homeState || '',
        homeZip: user.homeZip || '',
        homeCountry: user.homeCountry || '',
        profileImageLink: user.profileImageLink || '',
      });

      // Set the initial promotion enrollment state from user data
      setSubscribeToPromotions(user.enrolledForPromotions || false);

      // Set profile picture URL if user has one
      if (user.profileImageLink) {
        setProfilePicUrl(user.profileImageLink);
      }
      console.log(user.email);
      console.log("Promotion status in component: " + user.enrolledForPromotions);

      //console.log("User data set");
    }
  }, [user, setProfilePicUrl]);

  // Send updated user data to the backend
  const saveProfileChanges = async () => {
    setSavingProfile(true);
    if (validatePhoneNumber(userData.phone)) {
      const success = await updateUser({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phone,
        homeStreet: userData.homeStreet,
        homeCity: userData.homeCity,
        homeState: userData.homeState,
        homeZip: userData.homeZip,
        homeCountry: userData.homeCountry,
        enrolledForPromotions: subscribeToPromotions,
        profileImageLink: userData.profileImageLink,
      });

      if (success) {
        showToast('Profile updated successfully.','success',8000);
      } else {
        showToast('Failed to update user profile.','error',8000);
      }
    } else {
      showToast('The phone number is invalid. Check that it contains only numbers.','error',8000);
    }
    setSavingProfile(false);
  };

  // Send updated password data to the backend
  const savePasswordChange = async () => {
    setSavingPassword(true);
    // Check if new password meets security requirements
    const { secure, message } = checkPasswordSecurity(userData.currentPassword, userData.newPassword);

    // If it does, send the password inputs to the backend
    if (secure) {
      const success = await updatePassword({
        currentPassword: userData.currentPassword,
        newPassword: userData.newPassword,
      });

      // Password was updated successfully
      if (success) {
        showToast('Password changed successfully.','success',8000);
      } else {
        // Password was not updated: current password is incorrect
        showToast('Failed to update password. Check that your current password is correct.','error',8000);
      }
    } else {
      // If the new password does not meet security requirements, tell the user why
      if (message) {
        showToast(message,'error',8000);
      } else {
        showToast('Unknown error','error',8000);
      }
    }
    setSavingPassword(false);
  };

  const onImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePic(file);
      setProfilePicUrl(URL.createObjectURL(file));

      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        console.log(base64String);
        setUserData((prev) => ({ ...prev, profileImageLink: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="text-white min-h-screen bg-[#1C1C1C]">
        <NavBar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-white text-xl">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-white min-h-screen bg-[#1C1C1C]">
        <NavBar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-red-400 text-xl">Failed to load profile: {error || 'Unknown error'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white min-h-screen bg-[#1C1C1C]">
      <NavBar />
      <div className="h-30" />

      {/* Navigation */}
      <div className="flex items-center justify-center gap-10 mt-2 mb-18 font-red-rose text-[30px]">
        <Link href="/user/profile" className="relative font-bold text-acm-pink">
          Account Info
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-acm-pink rounded-full" />
        </Link>
        <Link href="/user/payments" className="font-bold text-gray-300 hover:text-white transition-colors">
          Payment
        </Link>
        <Link href="/user/orders" className="font-bold text-gray-300 hover:text-white transition-colors">
          Order History
        </Link>
      </div>

      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-8 pb-16 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 items-start">
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
              <div className="rounded-full flex items-center justify-center transition-colors w-[170px] h-[170px] bg-[#2B2B2B]">
                {profilePicUrl || user?.profileImageLink ? (
                  <Image
                    src={profilePicUrl || (user?.profileImageLink as string)}
                    alt="Profile"
                    width={170}
                    height={170}
                    className="w-full h-full rounded-full object-cover"
                    loading="lazy"
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
            <button className="text-[#FF478B] hover:text-[#FF3290] font-afacad text-lg cursor-pointer" type="button">
              Log Out
            </button>
          </aside>

          {/* Form */}
          <section className="max-w-3xl">
            <div className="mb-8 pb-4 border-b border-white/10">
              <h1 className="text-3xl text-acm-pink font-red-rose mb-2">Edit Personal Info</h1>
              <p className="text-white/60 text-sm">Update your profile information</p>
            </div>

            <div className="space-y-6">
              {/* Email (read only) */}
              <div>
                <label className="block text-white font-afacad text-lg font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={userData.email}
                  readOnly
                  disabled
                  placeholder={userData.email}
                  className={`${styles.emailInput} cursor-not-allowed opacity-60`}
                />
                <p className="text-xs text-gray-500 mt-1 font-afacad">Email cannot be changed</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-white font-afacad text-lg font-bold mb-2">Name</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block font-afacad">First Name</label>
                    <input
                      type="text"
                      value={userData.firstName}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setUserData((prev) => ({ ...prev, firstName: newValue }));
                      }}
                      className={styles.profileInput}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block font-afacad">Last Name</label>
                    <input
                      type="text"
                      value={userData.lastName}
                      onChange={(e) => setUserData((prev) => ({ ...prev, lastName: e.target.value }))}
                      className={styles.profileInput}
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              {/* Home Address */}
              <div>
                <label className="block text-white font-afacad text-lg font-bold mb-2">Home Address</label>
                <div className="space-y-4">
                  {/* Street - Full width */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block font-afacad">Street Address</label>
                    <input
                      type="text"
                      value={userData.homeStreet}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setUserData((prev) => ({ ...prev, homeStreet: newValue }));
                      }}
                      className={styles.profileInput}
                      placeholder="123 Main Street, Apt 4B"
                    />
                  </div>
                  {/* City, State, ZIP - 3 columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block font-afacad">City</label>
                      <input
                        type="text"
                        value={userData.homeCity}
                        onChange={(e) => setUserData((prev) => ({ ...prev, homeCity: e.target.value }))}
                        className={styles.profileInput}
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block font-afacad">State</label>
                      <input
                        type="text"
                        value={userData.homeState}
                        onChange={(e) => setUserData((prev) => ({ ...prev, homeState: e.target.value }))}
                        className={styles.profileInput}
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block font-afacad">ZIP Code</label>
                      <input
                        type="text"
                        value={userData.homeZip}
                        onChange={(e) => setUserData((prev) => ({ ...prev, homeZip: e.target.value }))}
                        className={styles.profileInput}
                        placeholder="10001"
                      />
                    </div>
                  </div>
                  {/* Country - Full width */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block font-afacad">Country</label>
                    <input
                      type="text"
                      value={userData.homeCountry}
                      onChange={(e) => setUserData((prev) => ({ ...prev, homeCountry: e.target.value }))}
                      className={styles.profileInput}
                      placeholder="United States"
                    />
                  </div>
                </div>
              </div>

              {/* Phone number */}
              <div>
                <label className="block text-white font-afacad text-lg font-bold mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={userData.phone}
                  onChange={(e) => setUserData((prev) => ({ ...prev, phone: e.target.value }))}
                  className={styles.profileInput}
                  placeholder="+1 (555) 123-4567"
                />
                <p className="text-xs text-gray-500 mt-1 font-afacad">Include country code if outside US</p>
              </div>
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
            {savingProfile ? (
              <div className="flex justify-center mt-8">
                <button
                  title="Save Changes"
                  type="button"
                  className="px-10 py-3 rounded-full font-afacad font-bold text-white cursor-not-allowed transition-all bg-gradient-to-r from-acm-pink to-acm-orange border-none"
                >
                  Saving...
                </button>
              </div>
            ) : (
              <div className="flex justify-center mt-8">
                <button
                  title="Save Changes"
                  type="button"
                  onClick={saveProfileChanges}
                  className="px-10 py-3 rounded-full font-afacad font-bold text-white cursor-pointer hover:shadow-lg hover:underline hover:shadow-acm-pink/50 transition-all bg-gradient-to-r from-acm-pink to-acm-orange border-none"
                >
                  Save Changes
                </button>
              </div>
            )}

            {/* Change Password */}
            <div className="mt-16 pt-6 border-t border-white/10">
              <div className="mb-6 pb-2 border-b border-white/10">
                <h1 className="text-3xl text-acm-pink font-red-rose mb-2">Change Password</h1>
                <p className="text-white/60 text-sm">Update your account password</p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-afacad text-lg font-bold mb-2">Current Password</label>
                  <input
                    type="password"
                    value={userData.currentPassword}
                    onChange={(e) => setUserData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    className={styles.profileInput}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-white font-afacad text-lg font-bold mb-2">New Password</label>
                  <input
                    type="password"
                    value={userData.newPassword}
                    onChange={(e) => setUserData((prev) => ({ ...prev, newPassword: e.target.value }))}
                    className={styles.profileInput}
                    placeholder="Must be at least 8 characters with uppercase, lowercase, and number"
                  />
                  <p className="text-xs text-gray-500 mt-1 font-afacad">
                    Must contain: 8+ characters, uppercase, lowercase, and number
                  </p>
                </div>
              </div>

              {/* Change password button */}
              {savingPassword ? (
              <div className="flex justify-center mt-8">
                <button
                  title="Saving"
                  type="button"
                  className="px-10 py-3 rounded-full font-afacad font-bold text-white cursor-not-allowed transition-all bg-gradient-to-r from-acm-pink to-acm-orange border-none"
                >
                  Saving...
                </button>
              </div>
            ) : (
              <div className="flex justify-center mt-8">
                <button
                  title="Save Changes"
                  type="button"
                  onClick={savePasswordChange}
                  className="px-10 py-3 rounded-full font-afacad font-bold text-white cursor-pointer hover:shadow-lg hover:underline hover:shadow-acm-pink/50 transition-all bg-gradient-to-r from-acm-pink to-acm-orange border-none"
                >
                  Change Password
                </button>
              </div>
            )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
