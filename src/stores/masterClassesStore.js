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

          // Обновляем или создаем новую оценку
          ratings[key] = {
            rating,
            comment,
            userId,
            userName,
            date: new Date().toISOString().split("T")[0],
            timestamp: Date.now(),
            status: "pending", // По умолчанию комментарий на модерации
            reported: false,
            reportReason: "",
          };

          // Находим мастер-класс
          const masterClass = state.masterClasses.find(
            (item) => item.id === masterClassId
          );
          if (!masterClass) return { userRatings: ratings };

          // Пересчитываем средний рейтинг только по одобренным комментариям
          const approvedRatings = Object.entries(ratings)
            .filter(([ratingKey, ratingData]) => {
              const [id] = ratingKey.split("_");
              return (
                parseInt(id) === masterClassId &&
                ratingData.status === "approved"
              );
            })
            .map(([_, ratingData]) => ratingData.rating);

          let newRating = 0;
          const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

          if (approvedRatings.length > 0) {
            const sum = approvedRatings.reduce((a, b) => a + b, 0);
            newRating = sum / approvedRatings.length;

            // Обновляем распределение оценок
            approvedRatings.forEach((r) => {
              const rounded = Math.round(r);
              ratingDistribution[rounded] =
                (ratingDistribution[rounded] || 0) + 1;
            });

            // Конвертируем в проценты
            Object.keys(ratingDistribution).forEach((key) => {
              ratingDistribution[key] = Math.round(
                (ratingDistribution[key] / approvedRatings.length) * 100
              );
            });
          }

          // Подготавливаем обновленный список отзывов (только одобренные)
          let updatedReviews = [...(masterClass.reviews || [])];

          // Удаляем старый отзыв пользователя, если есть
          updatedReviews = updatedReviews.filter(
            (review) => !(review.userId === userId)
          );

          // Добавляем новый отзыв только если он одобрен
          if (ratings[key].status === "approved") {
            const newReview = {
              id: Date.now(),
              userId,
              userName,
              rating,
              comment,
              date: new Date().toISOString().split("T")[0],
            };

            updatedReviews.push(newReview);
          }

          // Оставляем только последние 10 отзывов
          const finalReviews = updatedReviews.slice(-10);

          return {
            userRatings: ratings,
            masterClasses: state.masterClasses.map((item) =>
              item.id === masterClassId
                ? {
                    ...item,
                    rating: parseFloat(newRating.toFixed(1)),
                    ratingCount: approvedRatings.length,
                    ratingDistribution:
                      approvedRatings.length > 0 ? ratingDistribution : null,
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

          // Пересчитываем общий рейтинг по одобренным комментариям
          const approvedRatings = Object.entries(ratings)
            .filter(([ratingKey, ratingData]) => {
              const [id] = ratingKey.split("_");
              return (
                parseInt(id) === masterClassId &&
                ratingData.status === "approved"
              );
            })
            .map(([_, ratingData]) => ratingData.rating);

          let newRating = 0;
          let ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

          if (approvedRatings.length > 0) {
            const sum = approvedRatings.reduce((a, b) => a + b, 0);
            newRating = sum / approvedRatings.length;

            // Обновляем распределение оценок
            approvedRatings.forEach((r) => {
              const rounded = Math.round(r);
              ratingDistribution[rounded] =
                (ratingDistribution[rounded] || 0) + 1;
            });

            // Конвертируем в проценты
            Object.keys(ratingDistribution).forEach((key) => {
              ratingDistribution[key] = Math.round(
                (ratingDistribution[key] / approvedRatings.length) * 100
              );
            });
          }

          // Удаляем отзыв пользователя из списка отзывов
          const updatedMasterClasses = state.masterClasses.map((item) =>
            item.id === masterClassId
              ? {
                  ...item,
                  rating: parseFloat(newRating.toFixed(1)),
                  ratingCount: approvedRatings.length,
                  ratingDistribution:
                    approvedRatings.length > 0 ? ratingDistribution : null,
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

      // Методы для модерации комментариев

      // Получить все комментарии
      getAllComments: () => {
        const ratings = get().userRatings;
        const comments = [];

        Object.entries(ratings).forEach(([key, rating]) => {
          const [masterClassId] = key.split("_");

          if (rating.comment) {
            const masterClass = get().masterClasses.find(
              (item) => item.id === parseInt(masterClassId)
            );

            comments.push({
              id: key,
              masterClassId: parseInt(masterClassId),
              masterClassTitle:
                masterClass?.title || "Неизвестный мастер-класс",
              masterClassAuthor: masterClass?.author || "Неизвестный автор",
              userId: rating.userId,
              userName: rating.userName,
              rating: rating.rating,
              comment: rating.comment,
              date:
                rating.date ||
                new Date(rating.timestamp).toISOString().split("T")[0],
              timestamp: rating.timestamp,
              status: rating.status || "pending",
              reported: rating.reported || false,
              reportReason: rating.reportReason || "",
            });
          }
        });

        return comments;
      },

      // Удалить комментарий
      deleteComment: (commentId) => {
        set((state) => {
          const newUserRatings = { ...state.userRatings };

          if (newUserRatings[commentId]) {
            const [masterClassId, userId] = commentId.split("_");

            // Удаляем комментарий из хранилища
            delete newUserRatings[commentId];

            // Обновляем список отзывов в мастер-классе
            const updatedMasterClasses = state.masterClasses.map((item) => {
              if (item.id === parseInt(masterClassId)) {
                // Удаляем отзыв из списка reviews
                const updatedReviews = (item.reviews || []).filter(
                  (review) => review.userId !== parseInt(userId)
                );

                // Пересчитываем рейтинг
                const approvedRatings = Object.entries(newUserRatings)
                  .filter(([key, rating]) => {
                    const [id] = key.split("_");
                    return (
                      parseInt(id) === item.id && rating.status === "approved"
                    );
                  })
                  .map(([_, rating]) => rating.rating);

                let newRating = 0;
                const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

                if (approvedRatings.length > 0) {
                  const sum = approvedRatings.reduce((a, b) => a + b, 0);
                  newRating = sum / approvedRatings.length;

                  // Обновляем распределение оценок
                  approvedRatings.forEach((r) => {
                    const rounded = Math.round(r);
                    ratingDistribution[rounded] =
                      (ratingDistribution[rounded] || 0) + 1;
                  });

                  // Конвертируем в проценты
                  Object.keys(ratingDistribution).forEach((key) => {
                    ratingDistribution[key] = Math.round(
                      (ratingDistribution[key] / approvedRatings.length) * 100
                    );
                  });
                }

                return {
                  ...item,
                  rating: parseFloat(newRating.toFixed(1)),
                  ratingCount: approvedRatings.length,
                  ratingDistribution:
                    approvedRatings.length > 0 ? ratingDistribution : null,
                  reviews: updatedReviews,
                };
              }
              return item;
            });

            return {
              userRatings: newUserRatings,
              masterClasses: updatedMasterClasses,
            };
          }

          return state;
        });
      },

      // Обновить статус комментария
      updateCommentStatus: (commentId, status) => {
        set((state) => {
          const ratings = { ...state.userRatings };

          if (ratings[commentId]) {
            const [masterClassId, userId] = commentId.split("_");

            // Обновляем статус комментария
            ratings[commentId] = {
              ...ratings[commentId],
              status: status,
            };

            // Обновляем список отзывов в мастер-классе
            const updatedMasterClasses = state.masterClasses.map((item) => {
              if (item.id === parseInt(masterClassId)) {
                // Создаем/обновляем отзыв в списке reviews если статус одобрен
                let updatedReviews = [...(item.reviews || [])];

                // Удаляем старый отзыв пользователя, если есть
                updatedReviews = updatedReviews.filter(
                  (review) => !(review.userId === parseInt(userId))
                );

                // Если комментарий одобрен, добавляем его в отзывы
                if (status === "approved") {
                  const newReview = {
                    id: Date.now(),
                    userId: parseInt(userId),
                    userName: ratings[commentId].userName,
                    rating: ratings[commentId].rating,
                    comment: ratings[commentId].comment,
                    date: ratings[commentId].date,
                  };
                  updatedReviews.push(newReview);
                }

                // Пересчитываем рейтинг по одобренным комментариям
                const approvedRatings = Object.entries(ratings)
                  .filter(([key, rating]) => {
                    const [id] = key.split("_");
                    return (
                      parseInt(id) === item.id && rating.status === "approved"
                    );
                  })
                  .map(([_, rating]) => rating.rating);

                let newRating = 0;
                const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

                if (approvedRatings.length > 0) {
                  const sum = approvedRatings.reduce((a, b) => a + b, 0);
                  newRating = sum / approvedRatings.length;

                  // Обновляем распределение оценок
                  approvedRatings.forEach((r) => {
                    const rounded = Math.round(r);
                    ratingDistribution[rounded] =
                      (ratingDistribution[rounded] || 0) + 1;
                  });

                  // Конвертируем в проценты
                  Object.keys(ratingDistribution).forEach((key) => {
                    ratingDistribution[key] = Math.round(
                      (ratingDistribution[key] / approvedRatings.length) * 100
                    );
                  });
                }

                return {
                  ...item,
                  rating: parseFloat(newRating.toFixed(1)),
                  ratingCount: approvedRatings.length,
                  ratingDistribution:
                    approvedRatings.length > 0 ? ratingDistribution : null,
                  reviews: updatedReviews.slice(-10), // Ограничиваем 10 отзывами
                };
              }
              return item;
            });

            return {
              userRatings: ratings,
              masterClasses: updatedMasterClasses,
            };
          }

          return state;
        });
      },

      // Пожаловаться на комментарий
      reportComment: (commentId, reason) => {
        set((state) => ({
          userRatings: {
            ...state.userRatings,
            [commentId]: {
              ...state.userRatings[commentId],
              reported: true,
              reportReason: reason,
            },
          },
        }));
      },

      // Получить статистику по комментариям
      getCommentsStats: () => {
        const allComments = get().getAllComments();

        return {
          total: allComments.length,
          pending: allComments.filter((c) => c.status === "pending").length,
          approved: allComments.filter((c) => c.status === "approved").length,
          rejected: allComments.filter((c) => c.status === "rejected").length,
          reported: allComments.filter((c) => c.reported).length,
        };
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

        // Миграция: добавляем статусы к существующим комментариям
        if (persistedState.userRatings) {
          Object.keys(persistedState.userRatings).forEach((key) => {
            if (!persistedState.userRatings[key].status) {
              persistedState.userRatings[key].status = "approved"; // Старые комментарии считаем одобренными
            }
            if (persistedState.userRatings[key].reported === undefined) {
              persistedState.userRatings[key].reported = false;
            }
            if (persistedState.userRatings[key].reportReason === undefined) {
              persistedState.userRatings[key].reportReason = "";
            }
          });
        }

        return persistedState;
      },
    }
  )
);
