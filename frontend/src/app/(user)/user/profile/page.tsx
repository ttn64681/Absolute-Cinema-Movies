'use client';

import NavBar from '@/components/common/navBar/NavBar';
import UserNavTabs from '@/components/specific/user/UserNavTabs';
import ProfileForm from '@/components/specific/user/ProfileForm';
import ProfilePictureUpload from '@/components/specific/user/ProfilePictureUpload';
import { useProfileForm } from '@/hooks/useProfileForm';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Profile Page - Follows architecture pattern
 *
 * Architecture:
 * Page -> Hook -> Client -> Backend
 *
 * ONE hook (useProfileForm) handles everything:
 * - Form state management
 * - Business logic
 * - Client calls
 * - Validation
 */
export default function ProfilePage() {
  const {
    user,
    isLoading,
    error,
    userData,
    subscribeToPromotions,
    savingProfile,
    savingPassword,
    profilePicUrl,
    updateField,
    setSubscribeToPromotions,
    handleImageUpload,
    saveProfileChanges,
    savePasswordChange,
  } = useProfileForm();

  const { logout } = useAuth();

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

      <UserNavTabs activeTab="profile" />

      <div className="max-w-7xl mx-auto px-8 pb-16 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 items-start">
          <aside className="flex flex-col items-center gap-6 -mt-2 md:-mt-20">
            <ProfilePictureUpload
              profilePicUrl={profilePicUrl}
              userProfileImageLink={user.profileImageLink}
              onImageUpload={handleImageUpload}
            />
            <button
              className="text-[#FF478B] hover:text-[#FF3290] font-afacad text-lg cursor-pointer"
              type="button"
              onClick={logout}
              title="Log out"
            >
              Log Out
            </button>
          </aside>

          <ProfileForm
            userData={userData}
            subscribeToPromotions={subscribeToPromotions}
            savingProfile={savingProfile}
            savingPassword={savingPassword}
            onFieldChange={updateField}
            onPromotionsChange={setSubscribeToPromotions}
            onSaveProfile={saveProfileChanges}
            onSavePassword={savePasswordChange}
          />
        </div>
      </div>
    </div>
  );
}
