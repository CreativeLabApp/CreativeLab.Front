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

      updateProfile: async (updatedData) => {
        console.log("Update profile called with:", updatedData);

        const { user } = get();
        if (!user) {
          throw new Error("Пользователь не авторизован");
        }

        const updatedUser = {
          ...user,
          ...updatedData,
          name: updatedData.name || user.name,
          username: updatedData.username || user.username,
          email: updatedData.email || user.email,
          bio: updatedData.bio || user.bio,
          location: updatedData.location || user.location,
          id: user.id,
          createdAt: user.createdAt,
        };

        set({ user: updatedUser });

        return Promise.resolve(updatedUser);
      },

      updateAvatar: async (avatarUrl) => {
        const { user } = get();
        if (!user) {
          throw new Error("Пользователь не авторизован");
        }

        const updatedUser = {
          ...user,
          avatar: avatarUrl,
        };

        set({ user: updatedUser });
        return Promise.resolve(updatedUser);
      },

      updateSocialLinks: async (socialLinks) => {
        const { user } = get();
        if (!user) {
          throw new Error("Пользователь не авторизован");
        }

        const updatedUser = {
          ...user,
          socialLinks: {
            ...user.socialLinks,
            ...socialLinks,
          },
        };

        set({ user: updatedUser });
        return Promise.resolve(updatedUser);
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
