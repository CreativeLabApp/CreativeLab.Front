import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authApi } from "../api/authApi";

const ADMIN_EMAILS = ["artem.artusevskij01@gmail.com"];

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      register: async ({ name, surname, email, password }) => {
        const data = await authApi.register({ name, surname, email, password });
        const isAdmin = ADMIN_EMAILS.includes(data.email);
        set({
          token: data.token,
          user: {
            id: data.id,
            name: data.name,
            surname: data.surname,
            email: data.email,
            role: isAdmin ? "admin" : "user",
            isAdmin,
          },
        });
      },

      login: async ({ email, password }) => {
        const data = await authApi.login({ email, password });
        const isAdmin = ADMIN_EMAILS.includes(data.email);
        set({
          token: data.token,
          user: {
            id: data.id,
            name: data.name,
            surname: data.surname,
            email: data.email,
            role: isAdmin ? "admin" : "user",
            isAdmin,
          },
        });
      },

      logout: () => {
        set({ user: null, token: null });
      },

      isAuthenticated: () => !!get().token,

      isAdmin: () => {
        const { user } = get();
        return user?.role === "admin" || user?.isAdmin === true;
      },

      updateProfile: async (updatedData) => {
        const { user } = get();
        if (!user) throw new Error("Пользователь не авторизован");
        const updatedUser = { ...user, ...updatedData };
        set({ user: updatedUser });
        return updatedUser;
      },

      getUsers: () => get().users || [],

      updateUserRole: (userId, newRole) => {
        set((state) => ({
          users:
            state.users?.map((u) =>
              u.id === userId ? { ...u, role: newRole } : u,
            ) || [],
        }));
      },

      deleteUser: (userId) => {
        set((state) => ({
          users: state.users?.filter((u) => u.id !== userId) || [],
        }));
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
