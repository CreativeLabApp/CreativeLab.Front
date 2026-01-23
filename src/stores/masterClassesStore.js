import { create } from "zustand";
import { persist } from "zustand/middleware";
import popularClasses from "../sources/popularClasses";

export const useMasterClassesStore = create(
  persist(
    (set, get) => ({
      masterClasses: popularClasses,

      // Хранилище пользовательских оценок
      userRatings: {},

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

      // Методы для работы с пользовательскими оценками

      // Получить оценку пользователя для конкретного мастер-класса
      getUserRating: (masterClassId, userId) => {
        const ratings = get().userRatings;
        const key = `${masterClassId}_${userId}`;
        return ratings[key] || null;
      },

      // Оценить мастер-класс
      rateMasterClass: (
        masterClassId,
        rating,
        comment = "",
        userId,
        userName = "Аноним"
      ) => {
        set((state) => {
          // Обновляем оценку пользователя
          const ratings = { ...state.userRatings };
          const key = `${masterClassId}_${userId}`;

          // Проверяем, есть ли уже оценка от этого пользователя
          const existingRating = ratings[key];

          // Обновляем или создаем новую оценку
          ratings[key] = {
            rating,
            comment,
            userId,
            userName,
            date: new Date().toISOString().split("T")[0],
            timestamp: Date.now(),
          };

          // Находим все оценки для этого мастер-класса
          const allRatingsForMasterClass = Object.entries(ratings)
            .filter(([ratingKey, ratingData]) => {
              // Извлекаем masterClassId из ключа
              const [id] = ratingKey.split("_");
              return parseInt(id) === masterClassId;
            })
            .map(([_, ratingData]) => ratingData.rating);

          // Находим мастер-класс
          const masterClass = state.masterClasses.find(
            (item) => item.id === masterClassId
          );
          if (!masterClass) return { userRatings: ratings };

          // Пересчитываем средний рейтинг
          let newRating = 0;
          const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

          if (allRatingsForMasterClass.length > 0) {
            const sum = allRatingsForMasterClass.reduce((a, b) => a + b, 0);
            newRating = sum / allRatingsForMasterClass.length;

            // Обновляем распределение оценок
            allRatingsForMasterClass.forEach((r) => {
              const rounded = Math.round(r);
              ratingDistribution[rounded] =
                (ratingDistribution[rounded] || 0) + 1;
            });

            // Конвертируем в проценты
            Object.keys(ratingDistribution).forEach((key) => {
              ratingDistribution[key] = Math.round(
                (ratingDistribution[key] / allRatingsForMasterClass.length) *
                  100
              );
            });
          }

          // Подготавливаем обновленный список отзывов
          let updatedReviews = [...(masterClass.reviews || [])];

          if (existingRating) {
            // Удаляем старый отзыв пользователя
            updatedReviews = updatedReviews.filter(
              (review) => !(review.userId === userId)
            );
          }

          // Добавляем новый/обновленный отзыв
          const newReview = {
            id: Date.now(),
            userId,
            userName,
            rating,
            comment,
            date: new Date().toISOString().split("T")[0],
          };

          updatedReviews.push(newReview);

          // Оставляем только последние 10 отзывов
          const finalReviews = updatedReviews.slice(-10);

          return {
            userRatings: ratings,
            masterClasses: state.masterClasses.map((item) =>
              item.id === masterClassId
                ? {
                    ...item,
                    rating: parseFloat(newRating.toFixed(1)),
                    ratingCount: allRatingsForMasterClass.length,
                    ratingDistribution:
                      allRatingsForMasterClass.length > 0
                        ? ratingDistribution
                        : null,
                    reviews: finalReviews,
                  }
                : item
            ),
          };
        });
      },

      // Удалить оценку пользователя
      removeUserRating: (masterClassId, userId) => {
        set((state) => {
          const ratings = { ...state.userRatings };
          const key = `${masterClassId}_${userId}`;

          if (ratings[key]) {
            delete ratings[key];
          }

          // Пересчитываем общий рейтинг
          const masterClass = state.masterClasses.find(
            (item) => item.id === masterClassId
          );
          if (!masterClass) return { userRatings: ratings };

          // Находим все оставшиеся оценки для этого мастер-класса
          const allRatingsForMasterClass = Object.values(ratings)
            .filter((r) => {
              const [id] =
                Object.keys(state.userRatings)
                  .find((k) => k === `${masterClassId}_${userId}`)
                  ?.split("_") || [];
              return parseInt(id) === masterClassId;
            })
            .map((r) => r.rating);

          let newRating = 0;
          let ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

          if (allRatingsForMasterClass.length > 0) {
            const sum = allRatingsForMasterClass.reduce((a, b) => a + b, 0);
            newRating = sum / allRatingsForMasterClass.length;

            // Обновляем распределение оценок
            allRatingsForMasterClass.forEach((r) => {
              const rounded = Math.round(r);
              ratingDistribution[rounded] =
                (ratingDistribution[rounded] || 0) + 1;
            });

            // Конвертируем в проценты
            Object.keys(ratingDistribution).forEach((key) => {
              ratingDistribution[key] = Math.round(
                (ratingDistribution[key] / allRatingsForMasterClass.length) *
                  100
              );
            });
          }

          // Удаляем отзыв пользователя из списка отзывов
          const updatedMasterClasses = state.masterClasses.map((item) =>
            item.id === masterClassId
              ? {
                  ...item,
                  rating: parseFloat(newRating.toFixed(1)),
                  ratingCount: allRatingsForMasterClass.length,
                  ratingDistribution:
                    allRatingsForMasterClass.length > 0
                      ? ratingDistribution
                      : null,
                  reviews: (item.reviews || []).filter(
                    (review) => review.userId !== userId
                  ),
                }
              : item
          );

          return {
            userRatings: ratings,
            masterClasses: updatedMasterClasses,
          };
        });
      },

      // Получить все оценки пользователя
      getUserRatings: (userId) => {
        const ratings = get().userRatings;
        return Object.entries(ratings)
          .filter(([key, value]) => value.userId === userId)
          .map(([key, rating]) => {
            const [masterClassId] = key.split("_");
            return {
              masterClassId: parseInt(masterClassId),
              ...rating,
            };
          });
      },

      // Получить количество оценок пользователя
      getUserRatingsCount: (userId) => {
        const ratings = get().userRatings;
        return Object.values(ratings).filter((r) => r.userId === userId).length;
      },

      // Проверить, оценил ли пользователь мастер-класс
      hasUserRated: (masterClassId, userId) => {
        const ratings = get().userRatings;
        const key = `${masterClassId}_${userId}`;
        return !!ratings[key];
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

      // Получить мастер-классы с фильтрацией по рейтингу
      getMasterClassesByRating: (minRating = 0, maxRating = 5) => {
        return get().masterClasses.filter(
          (item) => item.rating >= minRating && item.rating <= maxRating
        );
      },

      // Получить топ мастер-классов по рейтингу
      getTopRatedMasterClasses: (limit = 10) => {
        return get()
          .masterClasses.sort((a, b) => b.rating - a.rating)
          .slice(0, limit);
      },

      // Получить статистику по оценкам
      getRatingStats: () => {
        const classes = get().masterClasses;
        const totalClasses = classes.length;
        const totalRatings = classes.reduce(
          (sum, item) => sum + (item.ratingCount || 0),
          0
        );
        const averageRating =
          classes.reduce((sum, item) => sum + item.rating, 0) / totalClasses;

        return {
          totalClasses,
          totalRatings,
          averageRating: parseFloat(averageRating.toFixed(1)),
          ratingDistribution: classes.reduce(
            (dist, item) => {
              const rounded = Math.round(item.rating);
              dist[rounded] = (dist[rounded] || 0) + 1;
              return dist;
            },
            { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
          ),
        };
      },

      // Получить недавние отзывы
      getRecentReviews: (limit = 10) => {
        const allReviews = get().masterClasses.flatMap((item) =>
          (item.reviews || []).map((review) => ({
            ...review,
            masterClassId: item.id,
            masterClassTitle: item.title,
            masterClassImage: item.image,
          }))
        );

        return allReviews
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, limit);
      },

      // Сбросить все оценки (для отладки)
      clearAllRatings: () => {
        set({ userRatings: {} });
      },
    }),
    {
      name: "masterclasses-storage",
      // Можно настроить миграцию для сохранения обратной совместимости
      migrate: (persistedState, version) => {
        if (!persistedState.userRatings) {
          persistedState.userRatings = {};
        }
        return persistedState;
      },
    }
  )
);
