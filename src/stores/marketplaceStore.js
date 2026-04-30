import { create } from "zustand";
import { productApi } from "../api/productApi";

export const useMarketplaceStore = create((set, get) => ({
  products: [],
  isLoading: false,
  fetchError: null,

  fetchProducts: async () => {
    set({ isLoading: true, fetchError: null });
    try {
      const products = await productApi.getAll();
      set({ products, isLoading: false });
    } catch (err) {
      set({ fetchError: err.message, isLoading: false });
    }
  },

  getProductById: (id) => get().products.find((p) => p.id === id) || null,

  getProductsBySeller: (sellerId) =>
    get().products.filter((p) => p.sellerId === sellerId),

  addProduct: (product) =>
    set((state) => ({ products: [product, ...state.products] })),

  updateProduct: (id, updated) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updated } : p,
      ),
    })),

  deleteProduct: (id) =>
    set((state) => ({ products: state.products.filter((p) => p.id !== id) })),

  updateProductStatus: (id, status) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, status, isAvailable: status === "available" } : p,
      ),
    })),

  getPopularProducts: (limit = 6) =>
    [...get().products]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit),

  getNewProducts: (limit = 6) =>
    [...get().products]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit),

  searchProducts: (query) => {
    const q = query.toLowerCase();
    return get().products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q)),
    );
  },

  incrementViews: (id) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, views: (p.views || 0) + 1 } : p,
      ),
    })),
}));
