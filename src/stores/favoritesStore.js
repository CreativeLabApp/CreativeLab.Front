import { create } from "zustand";
import { favoritesApi } from "../api/favoritesApi";

export const useFavoritesStore = create((set, get) => ({
  masterclasses: [],
  products: [],
  loading: false,

  load: async (userId) => {
    if (!userId) return;
    set({ loading: true });
    try {
      const data = await favoritesApi.getAll(userId);
      const masterclasses = data.masterclasses.map((m) => ({
        ...m,
        images: m.imageUrls?.length
          ? m.imageUrls
          : m.thumbnailUrl
            ? [m.thumbnailUrl]
            : [],
        author: m.authorName,
        category: m.categoryName,
        description: m.shortDescription || m.description || "",
      }));
      const products = data.products.map((p) => ({
        ...p,
        images: p.imageUrls?.length
          ? p.imageUrls
          : p.thumbnailUrl
            ? [p.thumbnailUrl]
            : [],
        seller: p.sellerName,
        category: p.categoryName,
        description: p.shortDescription || p.description || "",
        status: p.isAvailable ? "available" : "unavailable",
      }));
      set({ masterclasses, products });
    } catch {
      // ignore
    } finally {
      set({ loading: false });
    }
  },

  // Мастер-классы
  isFavorite: (id) => get().masterclasses.some((m) => m.id === id),

  toggleFavorite: async (userId, masterclass) => {
    const { masterclasses } = get();
    const exists = masterclasses.some((m) => m.id === masterclass.id);
    if (exists) {
      set({
        masterclasses: masterclasses.filter((m) => m.id !== masterclass.id),
      });
      await favoritesApi.removeMasterclass(userId, masterclass.id).catch(() => {
        set({ masterclasses }); // rollback
      });
    } else {
      set({ masterclasses: [masterclass, ...masterclasses] });
      await favoritesApi.addMasterclass(userId, masterclass.id).catch(() => {
        set({ masterclasses }); // rollback
      });
    }
  },

  removeFromFavorites: async (userId, id) => {
    const prev = get().masterclasses;
    set({ masterclasses: prev.filter((m) => m.id !== id) });
    await favoritesApi.removeMasterclass(userId, id).catch(() => {
      set({ masterclasses: prev }); // rollback
    });
  },

  // Товары
  isFavoriteProduct: (id) => get().products.some((p) => p.id === id),

  toggleFavoriteProduct: async (userId, product) => {
    const { products } = get();
    const exists = products.some((p) => p.id === product.id);
    if (exists) {
      set({ products: products.filter((p) => p.id !== product.id) });
      await favoritesApi.removeProduct(userId, product.id).catch(() => {
        set({ products }); // rollback
      });
    } else {
      set({ products: [product, ...products] });
      await favoritesApi.addProduct(userId, product.id).catch(() => {
        set({ products }); // rollback
      });
    }
  },

  removeFromFavoriteProducts: async (userId, id) => {
    const prev = get().products;
    set({ products: prev.filter((p) => p.id !== id) });
    await favoritesApi.removeProduct(userId, id).catch(() => {
      set({ products: prev }); // rollback
    });
  },

  clearFavorites: async (userId) => {
    const prev = {
      masterclasses: get().masterclasses,
      products: get().products,
    };
    set({ masterclasses: [], products: [] });
    await favoritesApi.clearAll(userId).catch(() => {
      set(prev); // rollback
    });
  },

  getFavoritesCount: () => get().masterclasses.length,
  getFavoriteProductsCount: () => get().products.length,
  getAllFavoritesCount: () =>
    get().masterclasses.length + get().products.length,
}));
