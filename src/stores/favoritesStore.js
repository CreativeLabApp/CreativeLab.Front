// stores/favoritesStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      favorites: [],

      addToFavorites: (id) => {
        set((state) => {
          if (!state.favorites.includes(id)) {
            return { favorites: [...state.favorites, id] };
          }
          return state;
        });
      },

      removeFromFavorites: (id) => {
        set((state) => ({
          favorites: state.favorites.filter((favId) => favId !== id),
        }));
      },

      toggleFavorite: (id) => {
        const { favorites } = get();
        if (favorites.includes(id)) {
          get().removeFromFavorites(id);
        } else {
          get().addToFavorites(id);
        }
      },

      isFavorite: (id) => {
        return get().favorites.includes(id);
      },

      clearFavorites: () => {
        set({ favorites: [] });
      },

      getFavoritesCount: () => {
        return get().favorites.length;
      },
    }),
    {
      name: "favorites-storage",
      getStorage: () => localStorage,
    }
  )
);
