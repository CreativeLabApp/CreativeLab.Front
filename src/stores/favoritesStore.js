import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      favorites: [], // Для мастер-классов
      favoriteProducts: [], // Отдельный список для товаров

      // Для мастер-классов
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
          set((state) => ({
            favorites: state.favorites.filter((favId) => favId !== id),
          }));
        } else {
          set((state) => ({
            favorites: [...state.favorites, id],
          }));
        }
      },

      // Для товаров
      addToFavoriteProducts: (id) => {
        set((state) => {
          if (!state.favoriteProducts.includes(id)) {
            return { favoriteProducts: [...state.favoriteProducts, id] };
          }
          return state;
        });
      },

      removeFromFavoriteProducts: (id) => {
        set((state) => ({
          favoriteProducts: state.favoriteProducts.filter(
            (favId) => favId !== id
          ),
        }));
      },

      toggleFavoriteProduct: (id) => {
        const { favoriteProducts } = get();
        if (favoriteProducts.includes(id)) {
          set((state) => ({
            favoriteProducts: state.favoriteProducts.filter(
              (favId) => favId !== id
            ),
          }));
        } else {
          set((state) => ({
            favoriteProducts: [...state.favoriteProducts, id],
          }));
        }
      },

      // Проверки
      isFavorite: (id) => {
        return get().favorites.includes(id);
      },

      isFavoriteProduct: (id) => {
        return get().favoriteProducts.includes(id);
      },

      // Очистка
      clearFavorites: () => {
        set({ favorites: [], favoriteProducts: [] });
      },

      // Счетчики
      getFavoritesCount: () => {
        return get().favorites.length;
      },

      getFavoriteProductsCount: () => {
        return get().favoriteProducts.length;
      },

      getAllFavoritesCount: () => {
        const state = get();
        return state.favorites.length + state.favoriteProducts.length;
      },
    }),
    {
      name: "favorites-storage",
    }
  )
);
