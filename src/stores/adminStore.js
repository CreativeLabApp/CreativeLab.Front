// stores/adminStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAdminStore = create(
  persist(
    (set, get) => ({
      moderationQueue: {
        comments: [], // Очередь комментариев на модерацию
        masterClasses: [], // Очередь мастер-классов на модерацию
        accounts: [], // Очередь аккаунтов на модерацию
      },

      // Журнал действий
      actionLog: [],

      // Статистика
      stats: {
        moderatedToday: 0,
        approvedCount: 0,
        rejectedCount: 0,
        pendingCount: 0,
      },

      // Методы для комментариев
      addCommentToQueue: (comment, userId, userName, source, sourceId) => {
        set((state) => ({
          moderationQueue: {
            ...state.moderationQueue,
            comments: [
              ...state.moderationQueue.comments,
              {
                id: Date.now(),
                comment,
                userId,
                userName,
                source, // 'masterclass' или 'product'
                sourceId,
                status: "pending",
                timestamp: new Date().toISOString(),
                reviewedBy: null,
                reviewDate: null,
              },
            ],
          },
          stats: {
            ...state.stats,
            pendingCount: state.stats.pendingCount + 1,
          },
        }));
      },

      moderateComment: (commentId, action, adminName, reason = "") => {
        set((state) => {
          const updatedComments = state.moderationQueue.comments.map(
            (comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    status: action,
                    reviewedBy: adminName,
                    reviewDate: new Date().toISOString(),
                    rejectionReason: action === "rejected" ? reason : null,
                  }
                : comment
          );

          return {
            moderationQueue: {
              ...state.moderationQueue,
              comments: updatedComments,
            },
            actionLog: [
              ...state.actionLog,
              {
                id: Date.now(),
                type: "comment_moderation",
                targetId: commentId,
                action,
                admin: adminName,
                timestamp: new Date().toISOString(),
                reason,
              },
            ],
            stats: {
              ...state.stats,
              moderatedToday: state.stats.moderatedToday + 1,
              [action === "approved" ? "approvedCount" : "rejectedCount"]:
                state.stats[
                  action === "approved" ? "approvedCount" : "rejectedCount"
                ] + 1,
              pendingCount: state.stats.pendingCount - 1,
            },
          };
        });
      },

      // Методы для мастер-классов
      addMasterClassToQueue: (masterClassId, title, authorId, authorName) => {
        set((state) => ({
          moderationQueue: {
            ...state.moderationQueue,
            masterClasses: [
              ...state.moderationQueue.masterClasses,
              {
                id: masterClassId,
                title,
                authorId,
                authorName,
                status: "pending",
                submittedAt: new Date().toISOString(),
                reviewedBy: null,
                reviewDate: null,
              },
            ],
          },
          stats: {
            ...state.stats,
            pendingCount: state.stats.pendingCount + 1,
          },
        }));
      },

      moderateMasterClass: (
        masterClassId,
        action,
        adminName,
        feedback = ""
      ) => {
        set((state) => {
          const updatedMasterClasses = state.moderationQueue.masterClasses.map(
            (item) =>
              item.id === masterClassId
                ? {
                    ...item,
                    status: action,
                    reviewedBy: adminName,
                    reviewDate: new Date().toISOString(),
                    feedback: action === "rejected" ? feedback : null,
                  }
                : item
          );

          return {
            moderationQueue: {
              ...state.moderationQueue,
              masterClasses: updatedMasterClasses,
            },
            actionLog: [
              ...state.actionLog,
              {
                id: Date.now(),
                type: "masterclass_moderation",
                targetId: masterClassId,
                action,
                admin: adminName,
                timestamp: new Date().toISOString(),
                feedback,
              },
            ],
            stats: {
              ...state.stats,
              moderatedToday: state.stats.moderatedToday + 1,
              [action === "approved" ? "approvedCount" : "rejectedCount"]:
                state.stats[
                  action === "approved" ? "approvedCount" : "rejectedCount"
                ] + 1,
              pendingCount: state.stats.pendingCount - 1,
            },
          };
        });
      },

      // Методы для аккаунтов
      reportAccount: (accountId, reason, reporterId, reporterName) => {
        set((state) => ({
          moderationQueue: {
            ...state.moderationQueue,
            accounts: [
              ...state.moderationQueue.accounts,
              {
                id: accountId,
                reason,
                reporterId,
                reporterName,
                status: "pending",
                reportedAt: new Date().toISOString(),
                reviewedBy: null,
                reviewDate: null,
                actions: [],
              },
            ],
          },
          stats: {
            ...state.stats,
            pendingCount: state.stats.pendingCount + 1,
          },
        }));
      },

      moderateAccount: (accountId, actions, adminName, notes = "") => {
        set((state) => {
          const updatedAccounts = state.moderationQueue.accounts.map(
            (account) =>
              account.id === accountId
                ? {
                    ...account,
                    status: "reviewed",
                    reviewedBy: adminName,
                    reviewDate: new Date().toISOString(),
                    actions,
                    notes,
                  }
                : account
          );

          return {
            moderationQueue: {
              ...state.moderationQueue,
              accounts: updatedAccounts,
            },
            actionLog: [
              ...state.actionLog,
              {
                id: Date.now(),
                type: "account_moderation",
                targetId: accountId,
                actions,
                admin: adminName,
                timestamp: new Date().toISOString(),
                notes,
              },
            ],
            stats: {
              ...state.stats,
              moderatedToday: state.stats.moderatedToday + 1,
              pendingCount: state.stats.pendingCount - 1,
            },
          };
        });
      },

      // Вспомогательные методы
      getPendingCount: () => {
        const queue = get().moderationQueue;
        return (
          queue.comments.filter((c) => c.status === "pending").length +
          queue.masterClasses.filter((m) => m.status === "pending").length +
          queue.accounts.filter((a) => a.status === "pending").length
        );
      },

      getRecentActions: (limit = 10) => {
        return get()
          .actionLog.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          )
          .slice(0, limit);
      },

      clearModerationQueue: (type) => {
        set((state) => ({
          moderationQueue: {
            ...state.moderationQueue,
            [type]: state.moderationQueue[type].filter(
              (item) => item.status !== "reviewed"
            ),
          },
        }));
      },

      resetDailyStats: () => {
        set({
          stats: {
            ...get().stats,
            moderatedToday: 0,
          },
        });
      },

      // Получить статистику по типам
      getStatsByType: () => {
        const queue = get().moderationQueue;
        return {
          comments: {
            pending: queue.comments.filter((c) => c.status === "pending")
              .length,
            approved: queue.comments.filter((c) => c.status === "approved")
              .length,
            rejected: queue.comments.filter((c) => c.status === "rejected")
              .length,
          },
          masterClasses: {
            pending: queue.masterClasses.filter((m) => m.status === "pending")
              .length,
            approved: queue.masterClasses.filter((m) => m.status === "approved")
              .length,
            rejected: queue.masterClasses.filter((m) => m.status === "rejected")
              .length,
          },
          accounts: {
            pending: queue.accounts.filter((a) => a.status === "pending")
              .length,
            reviewed: queue.accounts.filter((a) => a.status === "reviewed")
              .length,
          },
        };
      },
    }),
    {
      name: "admin-storage",
    }
  )
);
