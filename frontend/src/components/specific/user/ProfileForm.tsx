'use client';

import Checkbox from '@/components/common/forms/Checkbox';
import styles from '@/app/(user)/user/profile/profile.module.css';

interface ProfileFormProps {
  userData: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    homeStreet: string;
    homeCity: string;
    homeState: string;
    homeZip: string;
    homeCountry: string;
    currentPassword: string;
    newPassword: string;
  };
  subscribeToPromotions: boolean;
  savingProfile: boolean;
  savingPassword: boolean;
  onFieldChange: (field: string, value: string) => void;
  onPromotionsChange: (checked: boolean) => void;
  onSaveProfile: () => void;
  onSavePassword: () => void;
}

export default function ProfileForm({
  userData,
  subscribeToPromotions,
  savingProfile,
  savingPassword,
  onFieldChange,
  onPromotionsChange,
  onSaveProfile,
  onSavePassword,
}: ProfileFormProps) {
  return (
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
            title="Email address"
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
                onChange={(e) => onFieldChange('firstName', e.target.value)}
                className={styles.profileInput}
                placeholder="John"
                title="First name"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block font-afacad">Last Name</label>
              <input
                type="text"
                value={userData.lastName}
                onChange={(e) => onFieldChange('lastName', e.target.value)}
                className={styles.profileInput}
                placeholder="Doe"
                title="Last name"
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
                onChange={(e) => onFieldChange('homeStreet', e.target.value)}
                className={styles.profileInput}
                placeholder="123 Main Street, Apt 4B"
                title="Street address"
              />
            </div>
            {/* City, State, ZIP - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block font-afacad">City</label>
                <input
                  type="text"
                  value={userData.homeCity}
                  onChange={(e) => onFieldChange('homeCity', e.target.value)}
                  className={styles.profileInput}
                  placeholder="New York"
                  title="City"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block font-afacad">State</label>
                <input
                  type="text"
                  value={userData.homeState}
                  onChange={(e) => onFieldChange('homeState', e.target.value)}
                  className={styles.profileInput}
                  placeholder="NY"
                  title="State"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block font-afacad">ZIP Code</label>
                <input
                  type="text"
                  value={userData.homeZip}
                  onChange={(e) => onFieldChange('homeZip', e.target.value)}
                  className={styles.profileInput}
                  placeholder="10001"
                  title="ZIP code"
                />
              </div>
            </div>
            {/* Country - Full width */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block font-afacad">Country</label>
              <input
                type="text"
                value={userData.homeCountry}
                onChange={(e) => onFieldChange('homeCountry', e.target.value)}
                className={styles.profileInput}
                placeholder="United States"
                title="Country"
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
            onChange={(e) => onFieldChange('phone', e.target.value)}
            className={styles.profileInput}
            placeholder="+1 (555) 123-4567"
            title="Phone number"
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
          onChange={onPromotionsChange}
        />
      </div>

      {/* Save button */}
      {savingProfile ? (
        <div className="flex justify-center mt-8">
          <button
            title="Saving"
            type="button"
            className="px-10 py-3 rounded-full font-afacad font-bold text-white cursor-not-allowed transition-all bg-linear-to-r from-acm-pink to-acm-orange border-none"
          >
            Saving...
          </button>
        </div>
      ) : (
        <div className="flex justify-center mt-8">
          <button
            title="Save Changes"
            type="button"
            onClick={onSaveProfile}
            className="px-10 py-3 rounded-full font-afacad font-bold text-white cursor-pointer hover:shadow-lg hover:underline hover:shadow-acm-pink/50 transition-all bg-linear-to-r from-acm-pink to-acm-orange border-none"
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
              onChange={(e) => onFieldChange('currentPassword', e.target.value)}
              className={styles.profileInput}
              placeholder="••••••••"
              title="Current password"
            />
          </div>

          <div>
            <label className="block text-white font-afacad text-lg font-bold mb-2">New Password</label>
            <input
              type="password"
              value={userData.newPassword}
              onChange={(e) => onFieldChange('newPassword', e.target.value)}
              className={styles.profileInput}
              placeholder="Must be at least 8 characters with uppercase, lowercase, and number"
              title="New password"
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
              className="px-10 py-3 rounded-full font-afacad font-bold text-white cursor-not-allowed transition-all bg-linear-to-r from-acm-pink to-acm-orange border-none"
            >
              Saving...
            </button>
          </div>
        ) : (
          <div className="flex justify-center mt-8">
            <button
              title="Save Changes"
              type="button"
              onClick={onSavePassword}
              className="px-10 py-3 rounded-full font-afacad font-bold text-white cursor-pointer hover:shadow-lg hover:underline hover:shadow-acm-pink/50 transition-all bg-linear-to-r from-acm-pink to-acm-orange border-none"
            >
              Change Password
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
