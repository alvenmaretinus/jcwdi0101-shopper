import { create } from 'zustand';
import { getUserByEmail } from '@/services/user/getUserByEmail';

interface AuthState {
  isSuperAdmin: boolean;
  userStoreId: string;
  isLoading: boolean;
  userEmail: string | null;
  
  // Actions
  fetchUserRole: (email: string) => Promise<void>;
  reset: () => void;
}

/**
 * Global auth store - manages user role and store assignment
 * Use this instead of fetching user data in every component
 */
export const useAuthStore = create<AuthState>((set) => ({
  isSuperAdmin: false,
  userStoreId: '',
  isLoading: false,
  userEmail: null,

  fetchUserRole: async (email: string) => {
    // Prevent redundant fetches
    const currentState = useAuthStore.getState();
    if (currentState.userEmail === email && !currentState.isLoading) {
      return;
    }

    set({ isLoading: true, userEmail: email });
    try {
      const userData = await getUserByEmail(email);
      set({
        isSuperAdmin: userData?.role === 'SUPERADMIN',
        userStoreId: userData?.storeId ?? '',
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch user role:', error);
      set({ isLoading: false });
    }
  },

  reset: () => set({ 
    isSuperAdmin: false, 
    userStoreId: '', 
    isLoading: false,
    userEmail: null 
  }),
}));
