import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      login: (userData, userToken) => {
        console.log("Login called with:", { userData, userToken });
        set({
          user: userData,
          token: userToken,
        });
      },

      logout: () => {
        console.log("Logout called");
        set({ user: null, token: null });
      },

      isAuthenticated: () => {
        const state = get();
        return !!state.token;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
