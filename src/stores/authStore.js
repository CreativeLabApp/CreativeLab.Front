import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authApi } from "../api/authApi";

const ADMIN_EMAILS = ["admin@creativelab.com"];

const mapUser = (data) => {
  const isAdmin = ADMIN_EMAILS.includes(data.email);
  return {
    id: data.id,
    name: data.name,
    surname: data.surname,
    email: data.email,
    role: isAdmin ? "admin" : "user",
    isAdmin,
  };
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setToken: (token) => set({ token }),

      register: async ({ name, surname, email, password }) => {
        const data = await authApi.register({ name, surname, email, password });
        set({ token: data.accessToken, user: mapUser(data) });
      },

      login: async ({ email, password }) => {
        const data = await authApi.login({ email, password });
        set({ token: data.accessToken, user: mapUser(data) });
      },

      logout: async () => {
        const { token } = get();
        await authApi.logout(token);
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
