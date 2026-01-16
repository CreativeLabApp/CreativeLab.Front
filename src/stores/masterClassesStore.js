import { create } from "zustand";
import { persist } from "zustand/middleware";
import popularClasses from "../sources/popularClasses";

export const useMasterClassesStore = create(
  persist(
    (set, get) => ({
      masterClasses: popularClasses,

      addMasterClass: (newMasterClass) => {
        set((state) => ({
          masterClasses: [newMasterClass, ...state.masterClasses],
        }));
      },

      updateMasterClass: (id, updatedData) => {
        set((state) => ({
          masterClasses: state.masterClasses.map((item) =>
            item.id === id ? { ...item, ...updatedData } : item
          ),
        }));
      },

      deleteMasterClass: (id) => {
        set((state) => ({
          masterClasses: state.masterClasses.filter((item) => item.id !== id),
        }));
      },

      getMasterClassById: (id) => {
        return get().masterClasses.find((item) => item.id === id);
      },

      incrementViews: (id) => {
        set((state) => ({
          masterClasses: state.masterClasses.map((item) =>
            item.id === id ? { ...item, views: (item.views || 0) + 1 } : item
          ),
        }));
      },

      updateRating: (id, newRating) => {
        set((state) => ({
          masterClasses: state.masterClasses.map((item) =>
            item.id === id ? { ...item, rating: newRating } : item
          ),
        }));
      },

      // Новые методы для удобства
      getMasterClassesByCategory: (category) => {
        return get().masterClasses.filter((item) => item.category === category);
      },

      getPopularMasterClasses: (limit = 10) => {
        return get()
          .masterClasses.sort((a, b) => b.views - a.views)
          .slice(0, limit);
      },

      searchMasterClasses: (query) => {
        const searchTerm = query.toLowerCase();
        return get().masterClasses.filter(
          (item) =>
            item.title.toLowerCase().includes(searchTerm) ||
            item.author.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            item.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
        );
      },

      getMasterClassesCount: () => {
        return get().masterClasses.length;
      },
    }),
    {
      name: "masterclasses-storage",
    }
  )
);
