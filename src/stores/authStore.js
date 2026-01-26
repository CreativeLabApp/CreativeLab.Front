import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      login: (userData, userToken) => {
        // Проверяем, является ли пользователь администратором
        const adminEmails = ["artem.artusevskij01@gmail.com"]; // Список администраторов
        const isAdmin = adminEmails.includes(userData.email);

        set({
          user: {
            ...userData,
            role: isAdmin ? "admin" : "user",
            isAdmin,
          },
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

      isAdmin: () => {
        const { user } = get();
        return user?.role === "admin" || user?.isAdmin === true;
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
          username: updatedData.username || user.username,
        };

        set({ user: updatedUser });
        return Promise.resolve(updatedUser);
      },

      getUsers: () => {
        const state = get();
        return state.users || [];
      },

      updateUserRole: (userId, newRole) => {
        set((state) => ({
          users:
            state.users?.map((user) =>
              user.id === userId ? { ...user, role: newRole } : user
            ) || [],
        }));
      },

      deleteUser: (userId) => {
        set((state) => ({
          users: state.users?.filter((user) => user.id !== userId) || [],
        }));
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
