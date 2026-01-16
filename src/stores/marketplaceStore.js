import { create } from "zustand";
import { persist } from "zustand/middleware";
import creatorsData from "../sources/creators";

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
          status: "available",
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
          title: "Цифровая иллюстрация 'Космическое путешествие'",
          description:
            "Созданная в Procreate иллюстрация в стиле научной фантастики, разрешение 3000x4000px",
          price: 2800,
          seller: "Артём Артюшевский",
          sellerId: 3,
          category: "Цифровое искусство",
          images: [],
          rating: 4.9,
          views: 156,
          createdAt: "2024-01-05",
          tags: ["цифровое", "иллюстрация", "sci-fi"],
          status: "available",
          materials: ["цифровой файл"],
          dimensions: "3000x4000px",
          weight: "цифровой",
        },
        {
          id: 4,
          title: "Керамическая кружка 'Уют'",
          description: "Ручная лепка, глазурь, подходит для напитков",
          price: 1800,
          seller: "Ольга Смирнова",
          sellerId: 4,
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
          id: 5,
          title: "Картина маслом 'Закат в горах'",
          description: "Масляная живопись на холсте, размер 50x70 см",
          price: 8500,
          seller: "Алексей Морозов",
          sellerId: 5,
          category: "Живопись",
          images: [],
          rating: 4.5,
          views: 203,
          createdAt: "2023-12-20",
          tags: ["масло", "пейзаж", "холст"],
          status: "available",
          materials: ["масляные краски", "холст"],
          dimensions: "50x70 см",
          weight: "2.0 кг",
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
          title: "Каллиграфический набор 'Восточная сказка'",
          description: "Набор для каллиграфии с чернилами, перьями и бумагой",
          price: 3200,
          seller: "Дмитрий Волков",
          sellerId: 7,
          category: "Канцелярия",
          images: [],
          rating: 4.7,
          views: 178,
          createdAt: "2024-01-12",
          tags: ["каллиграфия", "набор", "творчество"],
          status: "available",
          materials: ["перья", "чернила", "бумага"],
          dimensions: "25x35 см",
          weight: "0.8 кг",
        },
        {
          id: 8,
          title: "Шерстяной шарф 'Зимняя сказка'",
          description: "Ручное вязание из мериносовой шерсти, очень теплый",
          price: 2800,
          seller: "Татьяна Новикова",
          sellerId: 8,
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
          id: 9,
          title: "Фотография 'Городские огни'",
          description:
            "Профессиональная фотография ночного города, печать на холсте",
          price: 4500,
          seller: "Сергей Петров",
          sellerId: 9,
          category: "Фотография",
          images: [],
          rating: 4.4,
          views: 98,
          createdAt: "2024-01-03",
          tags: ["фотография", "город", "ночь"],
          status: "available",
          materials: ["холст", "чернила"],
          dimensions: "40x60 см",
          weight: "1.2 кг",
        },
        {
          id: 10,
          title: "Свечи ароматические 'Лавандовый рай'",
          description:
            "Набор из 3 свечей с натуральными маслами, ручная заливка",
          price: 950,
          seller: "Наталья Ковалёва",
          sellerId: 10,
          category: "Ароматерапия",
          images: [],
          rating: 4.9,
          views: 234,
          createdAt: "2024-01-18",
          tags: ["свечи", "ароматерапия", "натуральное"],
          status: "available",
          materials: ["соевый воск", "эфирные масла"],
          dimensions: "Ø6x8 см каждая",
          weight: "0.5 кг",
        },
        {
          id: 11,
          title: "Скетчбук с маркерами 'Уличный стиль'",
          description: "Набор из скетчбука и 12 алкогольных маркеров",
          price: 1800,
          seller: "Павел Григорьев",
          sellerId: 11,
          category: "Канцелярия",
          images: [],
          rating: 4.5,
          views: 112,
          createdAt: "2024-01-01",
          tags: ["скетчинг", "маркеры", "творчество"],
          status: "available",
          materials: ["бумага", "маркеры"],
          dimensions: "А5",
          weight: "0.6 кг",
        },
        {
          id: 12,
          title: "Цветочная композиция 'Весеннее настроение'",
          description: "Свежий букет из сезонных цветов, ручная сборка",
          price: 2500,
          seller: "Юлия Захарова",
          sellerId: 12,
          category: "Флористика",
          images: [],
          rating: 4.8,
          views: 145,
          createdAt: "2024-01-08",
          tags: ["цветы", "букет", "флористика"],
          status: "available",
          materials: ["свежие цветы"],
          dimensions: "Ø30x40 см",
          weight: "1.5 кг",
        },
        {
          id: 13,
          title: "Гончарный набор 'Начинающий гончар'",
          description:
            "Набор для работы с глиной: глина, инструменты, инструкция",
          price: 3800,
          seller: "Андрей Белов",
          sellerId: 13,
          category: "Керамика",
          images: [],
          rating: 4.9,
          views: 67,
          createdAt: "2023-12-25",
          tags: ["гончарное дело", "набор", "обучение"],
          status: "available",
          materials: ["глина", "инструменты"],
          dimensions: "30x40x10 см",
          weight: "3.0 кг",
        },
        {
          id: 14,
          title: "Мыло ручной работы 'Цитрусовый микс'",
          description: "Набор из 5 кусков с натуральными маслами и цедрой",
          price: 650,
          seller: "Ирина Фёдорова",
          sellerId: 14,
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
        {
          id: 15,
          title: "Укулеле 'Гавайские ритмы'",
          description:
            "Укулеле сопрано с чехлом и медиатором, идеально для начинающих",
          price: 4200,
          seller: "Михаил Соколов",
          sellerId: 15,
          category: "Музыка",
          images: [],
          rating: 4.4,
          views: 112,
          createdAt: "2024-01-01",
          tags: ["укулеле", "музыка", "инструмент"],
          status: "available",
          materials: ["дерево", "нейлоновые струны"],
          dimensions: "53x20x6 см",
          weight: "0.8 кг",
        },
      ],
      wishlist: [],

      // Методы для работы с продавцами
      getCreators: () => {
        return creatorsData;
      },

      getCreatorById: (id) => {
        return creatorsData.find((creator) => creator.id === id);
      },

      getCreatorProducts: (sellerId) => {
        return get().products.filter(
          (product) => product.sellerId === sellerId
        );
      },

      getCreatorStats: (sellerId) => {
        const products = get().getCreatorProducts(sellerId);
        const creator = get().getCreatorById(sellerId);

        return {
          totalProducts: products.length,
          totalViews: products.reduce((sum, product) => sum + product.views, 0),
          averageRating: creator?.rating || 0,
          totalSales: Math.floor(Math.random() * 50), // Примерная статистика продаж
          totalRevenue: products.reduce(
            (sum, product) => sum + product.price,
            0
          ),
        };
      },

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

      // Дополнительные методы
      getRelatedProducts: (currentProductId, limit = 4) => {
        const products = get().products;
        const currentProduct = products.find((p) => p.id === currentProductId);

        if (!currentProduct) return [];

        return products
          .filter(
            (p) =>
              p.id !== currentProductId &&
              (p.category === currentProduct.category ||
                p.sellerId === currentProduct.sellerId)
          )
          .slice(0, limit);
      },

      incrementViews: (productId) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === productId
              ? { ...product, views: product.views + 1 }
              : product
          ),
        }));
      },

      updateProductStatus: (productId, status) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === productId ? { ...product, status } : product
          ),
        }));
      },
    }),
    {
      name: "marketplace-storage",
    }
  )
);
