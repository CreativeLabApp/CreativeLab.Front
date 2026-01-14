// stores/marketplaceStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useMarketplaceStore = create(
  persist(
    (set, get) => ({
      products: [
        {
          id: 1,
          title: "Акварельная картина 'Осенний лес'",
          description:
            "Ручная работа акварелью на хлопковой бумаге, размер 30x40 см",
          price: 3500,
          seller: "Мария Левченко",
          sellerId: 1,
          category: "Живопись",
          images: [],
          rating: 4.8,
          views: 124,
          createdAt: "2024-01-15",
          tags: ["акварель", "пейзаж", "ручная работа"],
          status: "available", // available, sold, reserved
          materials: ["акварель", "бумага"],
          dimensions: "30x40 см",
          weight: "0.3 кг",
        },
        {
          id: 2,
          title: "Деревянная игрушка 'Ёжик'",
          description:
            "Экологичная игрушка из натурального дерева, ручная роспись",
          price: 1200,
          seller: "Иван Козлов",
          sellerId: 2,
          category: "Игрушки",
          images: [],
          rating: 4.6,
          views: 89,
          createdAt: "2024-01-10",
          tags: ["дерево", "игрушки", "handmade"],
          status: "available",
          materials: ["липа", "акриловые краски"],
          dimensions: "15x10x8 см",
          weight: "0.2 кг",
        },
        {
          id: 3,
          title: "Керамическая кружка 'Уют'",
          description: "Ручная лепка, глазурь, подходит для напитков",
          price: 1800,
          seller: "Ольга Смирнова",
          sellerId: 3,
          category: "Керамика",
          images: [],
          rating: 4.9,
          views: 156,
          createdAt: "2024-01-05",
          tags: ["керамика", "посуда", "ручная работа"],
          status: "available",
          materials: ["глина", "глазурь"],
          dimensions: "Ø10x12 см",
          weight: "0.4 кг",
        },
        {
          id: 4,
          title: "Шерстяной шарф 'Зимняя сказка'",
          description: "Ручное вязание из мериносовой шерсти, очень теплый",
          price: 2800,
          seller: "Татьяна Новикова",
          sellerId: 4,
          category: "Текстиль",
          images: [],
          rating: 4.7,
          views: 203,
          createdAt: "2023-12-20",
          tags: ["вязание", "шерсть", "аксессуар"],
          status: "available",
          materials: ["мериносовая шерсть"],
          dimensions: "180x30 см",
          weight: "0.3 кг",
        },
        {
          id: 5,
          title: "Свечи ароматические 'Лавандовый рай'",
          description:
            "Набор из 3 свечей с натуральными маслами, ручная заливка",
          price: 950,
          seller: "Наталья Ковалева",
          sellerId: 5,
          category: "Ароматерапия",
          images: [],
          rating: 4.5,
          views: 178,
          createdAt: "2024-01-12",
          tags: ["свечи", "ароматерапия", "натуральное"],
          status: "available",
          materials: ["соевый воск", "эфирные масла"],
          dimensions: "Ø6x8 см каждая",
          weight: "0.5 кг",
        },
        {
          id: 6,
          title: "Украшение из полимерной глины 'Весенние цветы'",
          description: "Комплект: серьги и колье, ручная лепка и роспись",
          price: 2200,
          seller: "Екатерина Сидорова",
          sellerId: 6,
          category: "Бижутерия",
          images: [],
          rating: 4.8,
          views: 145,
          createdAt: "2024-01-08",
          tags: ["полимерная глина", "украшения", "handmade"],
          status: "available",
          materials: ["полимерная глина", "фурнитура"],
          dimensions: "Разные",
          weight: "0.1 кг",
        },
        {
          id: 7,
          title: "Кожаный блокнот 'Винтаж'",
          description: "Ручная выделка кожи, 120 листов, замковое крепление",
          price: 1600,
          seller: "Алина Яковлева",
          sellerId: 7,
          category: "Канцелярия",
          images: [],
          rating: 4.4,
          views: 98,
          createdAt: "2024-01-03",
          tags: ["кожа", "блокнот", "винтаж"],
          status: "available",
          materials: ["натуральная кожа", "бумага"],
          dimensions: "15x21 см",
          weight: "0.25 кг",
        },
        {
          id: 8,
          title: "Мозаичное панно 'Морская волна'",
          description: "Ручная сборка из смальты, готово к размещению на стене",
          price: 7500,
          seller: "Марина Семенова",
          sellerId: 8,
          category: "Декор",
          images: [],
          rating: 4.9,
          views: 67,
          createdAt: "2023-12-25",
          tags: ["мозаика", "панно", "интерьер"],
          status: "available",
          materials: ["смальта", "клей", "основа"],
          dimensions: "40x60 см",
          weight: "2.5 кг",
        },
        {
          id: 9,
          title: "Войлочные тапочки 'Домашний уют'",
          description: "Ручное валяние из овечьей шерсти, очень теплые",
          price: 1900,
          seller: "Лариса Дмитриева",
          sellerId: 9,
          category: "Обувь",
          images: [],
          rating: 4.6,
          views: 112,
          createdAt: "2024-01-01",
          tags: ["войлок", "тапочки", "handmade"],
          status: "available",
          materials: ["овечья шерсть"],
          dimensions: "Размеры 36-42",
          weight: "0.4 кг",
        },
        {
          id: 10,
          title: "Мыло ручной работы 'Цитрусовый микс'",
          description: "Набор из 5 кусков с натуральными маслами и цедрой",
          price: 650,
          seller: "Ирина Федорова",
          sellerId: 10,
          category: "Косметика",
          images: [],
          rating: 4.7,
          views: 234,
          createdAt: "2024-01-18",
          tags: ["мыло", "натуральное", "косметика"],
          status: "available",
          materials: ["масла", "щелочь", "эфирные масла"],
          dimensions: "7x5x3 см каждый",
          weight: "0.6 кг",
        },
      ],

      cart: [],
      wishlist: [],

      // Методы для товаров
      addProduct: (product) => {
        set((state) => ({
          products: [...state.products, product],
        }));
      },

      updateProduct: (id, updatedProduct) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id ? { ...product, ...updatedProduct } : product
          ),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
        }));
      },

      // Методы для корзины
      addToCart: (productId) => {
        set((state) => {
          const existingItem = state.cart.find(
            (item) => item.productId === productId
          );
          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.productId === productId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          } else {
            return {
              cart: [...state.cart, { productId, quantity: 1 }],
            };
          }
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.productId !== productId),
        }));
      },

      updateCartQuantity: (productId, quantity) => {
        set((state) => ({
          cart: state.cart.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ cart: [] });
      },

      // Методы для вишлиста
      toggleWishlist: (productId) => {
        set((state) => {
          if (state.wishlist.includes(productId)) {
            return {
              wishlist: state.wishlist.filter((id) => id !== productId),
            };
          } else {
            return {
              wishlist: [...state.wishlist, productId],
            };
          }
        });
      },

      isInWishlist: (productId) => {
        return get().wishlist.includes(productId);
      },

      // Поиск и фильтрация
      searchProducts: (query) => {
        const products = get().products;
        return products.filter(
          (product) =>
            product.title.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase()) ||
            product.tags.some((tag) =>
              tag.toLowerCase().includes(query.toLowerCase())
            )
        );
      },

      filterProducts: (filters) => {
        const products = get().products;
        return products.filter((product) => {
          let matches = true;

          if (filters.category && product.category !== filters.category) {
            matches = false;
          }

          if (filters.minPrice && product.price < filters.minPrice) {
            matches = false;
          }

          if (filters.maxPrice && product.price > filters.maxPrice) {
            matches = false;
          }

          if (filters.status && product.status !== filters.status) {
            matches = false;
          }

          if (filters.sellerId && product.sellerId !== filters.sellerId) {
            matches = false;
          }

          return matches;
        });
      },

      // Получение статистики
      getCartTotal: () => {
        const { cart, products } = get();
        return cart.reduce((total, cartItem) => {
          const product = products.find((p) => p.id === cartItem.productId);
          return total + (product?.price || 0) * cartItem.quantity;
        }, 0);
      },

      getCartCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },

      getProductsBySeller: (sellerId) => {
        return get().products.filter(
          (product) => product.sellerId === sellerId
        );
      },

      getPopularProducts: (limit = 6) => {
        return [...get().products]
          .sort((a, b) => b.views - a.views)
          .slice(0, limit);
      },

      getNewProducts: (limit = 6) => {
        return [...get().products]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, limit);
      },
    }),
    {
      name: "marketplace-storage",
    }
  )
);
