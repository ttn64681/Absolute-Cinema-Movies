'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useProfile } from '@/contexts/ProfileContext';
import { getUserIdFromToken } from '@/utils/auth';
import { validatePhoneNumber, checkPasswordSecurity } from '@/utils/profile';
import { BackendUser } from '@/types/user';

/**
 * Hook for profile form operations
 *
 * Responsibilities:
 * - Form state management (profile data, password data)
 * - Profile picture upload handling
 * - Form validation
 * - Save operations (profile & password)
 * - Integration with AuthContext for immediate UI updates
 *
 * Delegates to:
 * - useUser: User data fetching and updates
 * - useAuth: AuthContext updates for navbar
 * - useToast: User feedback
 * - useProfile: Profile picture context
 *
 * @returns Form state, handlers, and operations
 */
export function useProfileForm() {
  const userId = getUserIdFromToken() ?? 0;
  const { user, isLoading, error, updateUser, updatePassword } = useUser(userId);
  const { updateUser: updateAuthUser } = useAuth();
  const { setProfilePic, profilePicUrl, setProfilePicUrl } = useProfile();
  const { showToast } = useToast();

  // Form state
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

  const [subscribeToPromotions, setSubscribeToPromotions] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Initialize form data when user loads
  useEffect(() => {
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

      setSubscribeToPromotions(user.enrolledForPromotions || false);

      if (user.profileImageLink) {
        setProfilePicUrl(user.profileImageLink);
      }
    }
  }, [user, setProfilePicUrl]);

  // Handle profile picture upload
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePic(file);
      setProfilePicUrl(URL.createObjectURL(file));

      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUserData((prev) => ({ ...prev, profileImageLink: base64String }));
      };
      reader.readAsDataURL(file);
    }
  }, [setProfilePic, setProfilePicUrl]);

  // Update form field
  const updateField = useCallback((field: string, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Save profile changes
  const saveProfileChanges = useCallback(async () => {
    setSavingProfile(true);
    
    if (!validatePhoneNumber(userData.phone)) {
      showToast('The phone number is invalid. Check that it contains only numbers.', 'error', 8000);
      setSavingProfile(false);
      return;
    }

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
      // Update AuthContext immediately so navbar reflects changes
      updateAuthUser({
        firstName: userData.firstName,
        lastName: userData.lastName,
      });
      showToast('Profile updated successfully.', 'success', 8000);
    } else {
      showToast('Failed to update user profile.', 'error', 8000);
    }
    
    setSavingProfile(false);
  }, [userData, subscribeToPromotions, updateUser, updateAuthUser, showToast]);

  // Save password change
  const savePasswordChange = useCallback(async () => {
    setSavingPassword(true);
    
    const { secure, message } = checkPasswordSecurity(userData.currentPassword, userData.newPassword);

    if (!secure) {
      if (message) {
        showToast(message, 'error', 8000);
      } else {
        showToast('Unknown error', 'error', 8000);
      }
      setSavingPassword(false);
      return;
    }

    const success = await updatePassword({
      currentPassword: userData.currentPassword,
      newPassword: userData.newPassword,
    });

    if (success) {
      showToast('Password changed successfully.', 'success', 8000);
      // Clear password fields after successful change
      setUserData((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
    } else {
      showToast('Failed to update password. Check that your current password is correct.', 'error', 8000);
    }
    
    setSavingPassword(false);
  }, [userData.currentPassword, userData.newPassword, updatePassword, showToast]);

  return {
    // User data
    user,
    isLoading,
    error,
    
    // Form state
    userData,
    subscribeToPromotions,
    savingProfile,
    savingPassword,
    profilePicUrl,
    
    // Handlers
    updateField,
    setSubscribeToPromotions,
    handleImageUpload,
    saveProfileChanges,
    savePasswordChange,
  };
}



