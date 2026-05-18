import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Messages.module.css";
import {
  EnvelopeIcon,
  UserIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  CheckIcon as CheckIconSolid,
  CheckBadgeIcon as CheckBadgeIconSolid,
} from "@heroicons/react/24/solid";
import { chatApi, messageApi, userApi } from "../../api/chatApi";

function Messages() {
  const { user, token } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [userChats, setUserChats] = useState([]);
  const [error, setError] = useState("");

  const searchParams = new URLSearchParams(location.search);
  const creatorIdFromUrl = searchParams.get("creatorId");
  const chatIdFromUrl = searchParams.get("chatId");

  // Загрузка чатов пользователя
  const loadUserChats = useCallback(async () => {
    if (!user?.id || !token) return;

    try {
      setIsLoading(true);
      const chats = await chatApi.getUserChats(user.id, token);

      // Загружаем чат с поддержкой
      const adminChat = await chatApi.getOrCreateAdminChat(user.id, token);

      // Проверяем, есть ли уже чат с поддержкой в списке
      const hasAdminChat = chats.some(
        (c) => c.participantId === adminChat.participantId,
      );
      if (!hasAdminChat) {
        chats.unshift(adminChat);
      }

      setUserChats(chats);
    } catch (err) {
      setError("Не удалось загрузить чаты");
    } finally {
      setIsLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    loadUserChats();
  }, [loadUserChats]);

  // Загрузка сообщений для выбранного чата
  const loadMessages = useCallback(async () => {
    if (!selectedChat?.id || !user?.id || !token) return;

    try {
      setIsLoadingMessages(true);
      const msgs = await messageApi.getChatMessages(
        selectedChat.id,
        user.id,
        token,
      );
      setMessages(msgs);
    } catch (err) {
      setError("Не удалось загрузить сообщения");
    } finally {
      setIsLoadingMessages(false);
    }
  }, [selectedChat, user, token]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Загрузка пользователей для нового чата
  useEffect(() => {
    if (showNewChatModal && token) {
      userApi
        .getUsers(newChatSearch, token)
        .then(setAvailableUsers)
        .catch(() => setError("Не удалось загрузить пользователей"));
    }
  }, [showNewChatModal, newChatSearch, token]);

  // Открытие чата из URL
  useEffect(() => {
    if (!user || userChats.length === 0) return;

    // Открытие чата по chatId
    if (chatIdFromUrl) {
      const existingChat = userChats.find((c) => c.id === chatIdFromUrl);
      if (existingChat) {
        setSelectedChat(existingChat);
        navigate("/messages", { replace: true });
      }
    }

    // Открытие чата по creatorId (для обратной совместимости)
    if (creatorIdFromUrl) {
      const existingChat = userChats.find(
        (c) => c.participantId === creatorIdFromUrl,
      );
      if (existingChat) {
        setSelectedChat(existingChat);
        navigate("/messages", { replace: true });
      }
    }
  }, [creatorIdFromUrl, chatIdFromUrl, user, userChats, navigate]);

  // Фильтрация чатов
  const filteredChats = userChats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Отправка сообщения
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    try {
      setIsLoading(true);

      // Determine receiver: if participantId exists and is valid, use it
      let receiverId = selectedChat.participantId;

      // If participantId is not available, try to find from participants array
      if (!receiverId && selectedChat.participants) {
        const otherParticipant = selectedChat.participants.find(
          (p) => p.userId !== user.id,
        );
        receiverId = otherParticipant?.userId;
      }

      // If still no receiver, we can't send the message
      if (!receiverId) {
        setError("Не удалось определить получателя сообщения");
        setIsLoading(false);
        return;
      }

      const dto = {
        ChatId: selectedChat.id,
        SenderId: user.id,
        ReceiverId: receiverId,
        Content: newMessage.trim(),
      };

      await messageApi.createMessage(dto, token);

      setNewMessage("");
      await loadMessages();
    } catch (err) {
      setError("Не удалось отправить сообщение");
    } finally {
      setIsLoading(false);
    }
  };

  // Создание нового чата
  const handleCreateChat = async (otherUserId) => {
    // Проверяем, существует ли уже чат с этим пользователем
    const existingChat = userChats.find((c) => c.participantId === otherUserId);
    if (existingChat) {
      setSelectedChat(existingChat);
      setShowNewChatModal(false);
      setNewChatSearch("");
      return;
    }

    try {
      setIsLoading(true);
      const chat = await chatApi.createChat([user.id, otherUserId], token);
      await loadUserChats();
      setSelectedChat(
        userChats.find((c) => c.id === chat.id) || {
          id: chat.id,
          participantId: otherUserId,
          name: "Новый чат",
        },
      );
      setShowNewChatModal(false);
      setNewChatSearch("");
    } catch (err) {
      setError("Не удалось создать чат");
    } finally {
      setIsLoading(false);
    }
  };

  // Выбор чата
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  // Форматирование времени
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Форматирование даты
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Сегодня";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Вчера";
    } else {
      return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
      });
    }
  };

  // Обработка Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Сообщения</h1>
            <p className={styles.subtitle}>
              Общайтесь с другими пользователями
            </p>
          </div>
        </div>
      </div>

      <div className={styles.messengerContainer}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.searchBar}>
              <MagnifyingGlassIcon className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Поиск чатов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button
              className={styles.newChatButton}
              onClick={() => setShowNewChatModal(true)}
            >
              <PlusIcon className={styles.newChatIcon} />
            </button>
          </div>

          <div className={styles.creatorsList}>
            <div className={styles.creatorsHeader}>
              <h3 className={styles.creatorsTitle}>Мои чаты</h3>
              <span className={styles.chatCount}>{filteredChats.length}</span>
            </div>

            {isLoading ? (
              <div className={styles.loading}>Загрузка...</div>
            ) : filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`${styles.creatorItem} ${
                    selectedChat?.id === chat.id ? styles.selected : ""
                  }`}
                  onClick={() => handleSelectChat(chat)}
                >
                  <div className={styles.creatorAvatar}>
                    {chat.avatarUrl ? (
                      <img src={chat.avatarUrl} alt={chat.name} />
                    ) : (
                      <UserIcon className={styles.avatarIcon} />
                    )}
                  </div>
                  <div className={styles.creatorInfo}>
                    <div className={styles.creatorHeader}>
                      <h4 className={styles.creatorName}>{chat.name}</h4>
                      <span className={styles.messageTime}>
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div>
                    <div className={styles.lastMessage}>
                      {chat.lastMessage || "Нет сообщений"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noChats}>
                <ChatBubbleLeftRightIcon className={styles.noChatsIcon} />
                <p>У вас пока нет чатов</p>
                <button
                  className={styles.startChatButton}
                  onClick={() => setShowNewChatModal(true)}
                >
                  Начать общение
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.chatArea}>
          {selectedChat ? (
            <>
              <div className={styles.chatHeader}>
                <div className={styles.chatCreatorInfo}>
                  <div className={styles.chatCreatorAvatar}>
                    {selectedChat.avatarUrl ? (
                      <img
                        src={selectedChat.avatarUrl}
                        alt={selectedChat.name}
                      />
                    ) : (
                      <UserIcon className={styles.avatarIcon} />
                    )}
                  </div>
                  <div className={styles.chatCreatorDetails}>
                    <h2 className={styles.chatCreatorName}>
                      {selectedChat.name}
                    </h2>
                  </div>
                </div>
              </div>

              <div className={styles.messagesContainer}>
                {isLoadingMessages ? (
                  <div className={styles.loading}>Загрузка сообщений...</div>
                ) : messages.length === 0 ? (
                  <div className={styles.emptyChat}>
                    <EnvelopeIcon className={styles.emptyChatIcon} />
                    <h3>Начните диалог</h3>
                    <p>Напишите первое сообщение</p>
                  </div>
                ) : (
                  <div className={styles.messagesList}>
                    {(() => {
                      let currentDate = null;

                      return messages.map((message) => {
                        const messageDate = formatDate(message.createdAt);
                        const isMyMessage = message.senderId === user?.id;
                        const showDate = currentDate !== messageDate;

                        if (showDate) {
                          currentDate = messageDate;
                        }

                        return (
                          <React.Fragment key={message.id}>
                            {showDate && (
                              <div className={styles.dateDivider}>
                                <span>{messageDate}</span>
                              </div>
                            )}

                            <div
                              className={`${styles.message} ${
                                isMyMessage
                                  ? styles.myMessage
                                  : styles.theirMessage
                              }`}
                            >
                              <div className={styles.messageContent}>
                                <div className={styles.messageText}>
                                  {message.content}
                                </div>
                                <div className={styles.messageMeta}>
                                  <span className={styles.messageTime}>
                                    {formatTime(message.createdAt)}
                                  </span>
                                  {isMyMessage && (
                                    <div className={styles.messageStatus}>
                                      {message.isRead ? (
                                        <CheckBadgeIconSolid
                                          className={styles.readIcon}
                                        />
                                      ) : (
                                        <CheckIconSolid
                                          className={styles.sentIcon}
                                        />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      });
                    })()}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className={styles.inputContainer}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Напишите сообщение..."
                  className={styles.messageInput}
                  rows={1}
                />

                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isLoading}
                  className={styles.sendButton}
                >
                  {isLoading ? (
                    <div className={styles.loadingSpinner} />
                  ) : (
                    <PaperAirplaneIcon className={styles.sendIcon} />
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className={styles.noChatSelected}>
              <ChatBubbleLeftRightIcon className={styles.noChatIcon} />
              <h2>Выберите чат для общения</h2>
              <p>Выберите существующий чат или создайте новый</p>
              {userChats.length === 0 && (
                <button
                  className={styles.createFirstChatButton}
                  onClick={() => setShowNewChatModal(true)}
                >
                  Создать первый чат
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showNewChatModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.newChatModal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Новый чат</h3>
              <button
                className={styles.modalCloseButton}
                onClick={() => {
                  setShowNewChatModal(false);
                  setNewChatSearch("");
                }}
              >
                <XMarkIcon className={styles.closeIcon} />
              </button>
            </div>

            <div className={styles.modalSearch}>
              <MagnifyingGlassIcon className={styles.modalSearchIcon} />
              <input
                type="text"
                placeholder="Поиск пользователей..."
                value={newChatSearch}
                onChange={(e) => setNewChatSearch(e.target.value)}
                className={styles.modalSearchInput}
              />
            </div>

            <div className={styles.availableCreatorsList}>
              {availableUsers.length > 0 ? (
                availableUsers.map((u) => (
                  <div
                    key={u.id}
                    className={styles.availableCreatorItem}
                    onClick={() => handleCreateChat(u.id)}
                  >
                    <div className={styles.availableCreatorAvatar}>
                      <UserIcon className={styles.availableAvatarIcon} />
                    </div>
                    <div className={styles.availableCreatorInfo}>
                      <h4 className={styles.availableCreatorName}>
                        {u.name} {u.surname}
                      </h4>
                      <p className={styles.availableCreatorBio}>{u.email}</p>
                    </div>
                    <PlusIcon className={styles.addChatIcon} />
                  </div>
                ))
              ) : (
                <div className={styles.noAvailableCreators}>
                  <p>Нет доступных пользователей</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;
