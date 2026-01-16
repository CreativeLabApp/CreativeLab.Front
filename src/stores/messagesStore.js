// stores/messagesStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useMessagesStore = create(
  persist(
    (set, get) => ({
      // Хранилище всех диалогов
      dialogs: {},

      // Текущий активный диалог
      activeDialog: null,

      // Получение диалога между двумя пользователями
      getDialog: (userId1, userId2) => {
        const dialogs = get().dialogs;
        const key1 = `${userId1}-${userId2}`;
        const key2 = `${userId2}-${userId1}`;

        return dialogs[key1] || dialogs[key2] || [];
      },

      // Добавление сообщения в диалог
      addMessage: (senderId, receiverId, text, attachments = []) => {
        const dialogKey = `${senderId}-${receiverId}`;
        const newMessage = {
          id: Date.now(),
          text,
          senderId,
          receiverId,
          timestamp: new Date().toISOString(),
          isRead: false,
          attachments,
        };

        set((state) => ({
          dialogs: {
            ...state.dialogs,
            [dialogKey]: [...(state.dialogs[dialogKey] || []), newMessage],
          },
        }));

        return newMessage;
      },

      // Отметка сообщений как прочитанных
      markAsRead: (userId, senderId) => {
        const dialogKey = `${senderId}-${userId}`;
        const reversedKey = `${userId}-${senderId}`;

        set((state) => {
          const key = state.dialogs[dialogKey] ? dialogKey : reversedKey;
          if (!state.dialogs[key]) return state;

          return {
            dialogs: {
              ...state.dialogs,
              [key]: state.dialogs[key].map((msg) => ({
                ...msg,
                isRead: msg.senderId === senderId ? true : msg.isRead,
              })),
            },
          };
        });
      },

      // Установка активного диалога
      setActiveDialog: (creatorId) => {
        set({ activeDialog: creatorId });
      },

      // Получение непрочитанных сообщений для пользователя
      getUnreadCount: (userId) => {
        const dialogs = get().dialogs;
        let count = 0;

        Object.keys(dialogs).forEach((key) => {
          const [_, receiverId] = key.split("-").map(Number);
          if (receiverId === userId) {
            count += dialogs[key].filter(
              (msg) => !msg.isRead && msg.senderId !== userId
            ).length;
          }
        });

        return count;
      },

      // Поиск диалогов по имени креатора
      searchDialogs: (userId, searchQuery) => {
        const dialogs = get().dialogs;
        const results = [];

        // В реальном приложении здесь будет поиск по имени креатора
        // Для демо возвращаем все диалоги пользователя

        Object.keys(dialogs).forEach((key) => {
          const [dialogUserId1, dialogUserId2] = key.split("-").map(Number);
          if (dialogUserId1 === userId || dialogUserId2 === userId) {
            results.push({
              creatorId:
                dialogUserId1 === userId ? dialogUserId2 : dialogUserId1,
              lastMessage: dialogs[key][dialogs[key].length - 1],
              unreadCount: dialogs[key].filter(
                (msg) => !msg.isRead && msg.senderId !== userId
              ).length,
            });
          }
        });

        return results;
      },

      // Очистка диалога
      clearDialog: (userId1, userId2) => {
        const dialogKey = `${userId1}-${userId2}`;
        const reversedKey = `${userId2}-${userId1}`;

        set((state) => {
          const newDialogs = { ...state.dialogs };
          delete newDialogs[dialogKey];
          delete newDialogs[reversedKey];
          return { dialogs: newDialogs };
        });
      },
    }),
    {
      name: "messages-storage",
    }
  )
);
