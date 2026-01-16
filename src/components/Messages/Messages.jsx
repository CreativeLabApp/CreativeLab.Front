import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../stores/authStore";
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
import creatorsData from "../../sources/creators";

// Расширяем данные креаторов для мессенджера
const enhancedCreatorsData = creatorsData.map((creator) => ({
  ...creator,
  // Добавляем поля, необходимые для мессенджера
  avatar: creator.avatar || null,
  isOnline: Math.random() > 0.5, // Случайный статус онлайн
  lastSeen: "недавно",
  unreadMessages: Math.floor(Math.random() * 3), // Случайное количество непрочитанных
  // Добавляем поля для статуса и времени последнего посещения
  lastActive: new Date(
    Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
  ).toISOString(),
}));

function Messages() {
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);

  const [selectedCreator, setSelectedCreator] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState("");
  const [availableCreators, setAvailableCreators] = useState([]);

  // Инициализация сообщений
  useEffect(() => {
    const savedMessages =
      JSON.parse(localStorage.getItem("creator-messages")) || {};
    setMessages(savedMessages);
  }, []);

  // Получение всех креаторов, с которыми есть диалоги у текущего пользователя
  const getChatsWithCurrentUser = () => {
    if (!user) return [];

    const creatorIds = new Set();

    // Собираем всех креаторов, с которыми есть диалоги
    Object.keys(messages).forEach((key) => {
      const [userId1, userId2] = key.split("-").map(Number);

      // Проверяем, участвует ли текущий пользователь в диалоге
      if (userId1 === user.id) {
        creatorIds.add(userId2);
      } else if (userId2 === user.id) {
        creatorIds.add(userId1);
      }
    });

    // Получаем полные данные креаторов
    return enhancedCreatorsData.filter(
      (creator) => creator.id !== user.id && creatorIds.has(creator.id)
    );
  };

  // Получаем чаты текущего пользователя
  const userChats = getChatsWithCurrentUser();

  // Фильтрация чатов по поиску
  const filteredChats = userChats.filter(
    (creator) =>
      creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Фильтрация доступных для нового чата креаторов
  useEffect(() => {
    if (!user) return;

    const available = enhancedCreatorsData.filter(
      (creator) =>
        creator.id !== user.id &&
        creator.name.toLowerCase().includes(newChatSearch.toLowerCase())
    );

    setAvailableCreators(available);
  }, [newChatSearch, user]);

  // Получение диалога с выбранным креатором
  const getCurrentDialog = () => {
    if (!selectedCreator || !user) return [];

    const dialogKey = `${user.id}-${selectedCreator.id}`;
    const reversedKey = `${selectedCreator.id}-${user.id}`;

    return messages[dialogKey] || messages[reversedKey] || [];
  };

  // Отправка сообщения
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedCreator || !user) return;

    setIsLoading(true);

    const newMsg = {
      id: Date.now(),
      text: newMessage.trim(),
      senderId: user.id,
      receiverId: selectedCreator.id,
      timestamp: new Date().toISOString(),
      isRead: false,
      attachments: [],
    };

    const dialogKey = `${user.id}-${selectedCreator.id}`;
    const updatedMessages = {
      ...messages,
      [dialogKey]: [...(messages[dialogKey] || []), newMsg],
    };

    setMessages(updatedMessages);
    localStorage.setItem("creator-messages", JSON.stringify(updatedMessages));

    // Имитация ответа от креатора
    setTimeout(() => {
      const autoReply = {
        id: Date.now() + 1,
        text: "Спасибо за сообщение! Я отвечу вам как можно скорее.",
        senderId: selectedCreator.id,
        receiverId: user.id,
        timestamp: new Date().toISOString(),
        isRead: true,
        attachments: [],
      };

      const updatedWithReply = {
        ...updatedMessages,
        [dialogKey]: [...updatedMessages[dialogKey], autoReply],
      };

      setMessages(updatedWithReply);
      localStorage.setItem(
        "creator-messages",
        JSON.stringify(updatedWithReply)
      );
      setIsLoading(false);
    }, 1000);

    setNewMessage("");
  };

  // Начать новый диалог с выбранным креатором
  const handleStartNewDialog = (creator) => {
    setSelectedCreator(creator);
    setSearchQuery("");
    setShowNewChatModal(false);
    setNewChatSearch("");
  };

  // Создать новый чат с креатором
  const handleCreateNewChat = (creator) => {
    handleStartNewDialog(creator);
  };

  // Форматирование времени
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Форматирование даты
  const formatDate = (timestamp) => {
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

  // Получение последнего сообщения для превью
  const getLastMessagePreview = (creatorId) => {
    const dialogKey = `${user?.id}-${creatorId}`;
    const reversedKey = `${creatorId}-${user?.id}`;
    const dialog = messages[dialogKey] || messages[reversedKey];

    if (!dialog || dialog.length === 0) return "Начните диалог";

    const lastMsg = dialog[dialog.length - 1];
    const isFromMe = lastMsg.senderId === user?.id;
    const prefix = isFromMe ? "Вы: " : "";
    return (
      prefix +
      (lastMsg.text.length > 30
        ? lastMsg.text.substring(0, 30) + "..."
        : lastMsg.text)
    );
  };

  // Получение времени последнего сообщения
  const getLastMessageTime = (creatorId) => {
    const dialogKey = `${user?.id}-${creatorId}`;
    const reversedKey = `${creatorId}-${user?.id}`;
    const dialog = messages[dialogKey] || messages[reversedKey];

    if (!dialog || dialog.length === 0) return "";

    const lastMsg = dialog[dialog.length - 1];
    return formatTime(lastMsg.timestamp);
  };

  // Обработка нажатия Enter для отправки
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={styles.container}>
      {/* Заголовок */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Сообщения</h1>
            <p className={styles.subtitle}>
              Общайтесь с другими креаторами, обсуждайте сотрудничество и
              делитесь опытом
            </p>
          </div>
        </div>
      </div>

      <div className={styles.messengerContainer}>
        {/* Боковая панель с чатами */}
        <div className={styles.sidebar}>
          {/* Панель поиска и создания нового чата */}
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

          {/* Список чатов */}
          <div className={styles.creatorsList}>
            <div className={styles.creatorsHeader}>
              <h3 className={styles.creatorsTitle}>Мои чаты</h3>
              <span className={styles.chatCount}>{filteredChats.length}</span>
            </div>

            {filteredChats.length > 0 ? (
              filteredChats.map((creator) => (
                <div
                  key={creator.id}
                  className={`${styles.creatorItem} ${
                    selectedCreator?.id === creator.id ? styles.selected : ""
                  }`}
                  onClick={() => handleStartNewDialog(creator)}
                >
                  <div className={styles.creatorInfo}>
                    <div className={styles.creatorHeader}>
                      <h4 className={styles.creatorName}>{creator.name}</h4>
                      <span className={styles.messageTime}>
                        {getLastMessageTime(creator.id)}
                      </span>
                    </div>
                    <div className={styles.lastMessage}>
                      {getLastMessagePreview(creator.id)}
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

        {/* Основная область чата */}
        <div className={styles.chatArea}>
          {selectedCreator ? (
            <>
              {/* Заголовок чата */}
              <div className={styles.chatHeader}>
                <div className={styles.chatCreatorInfo}>
                  <div className={styles.chatCreatorDetails}>
                    <div className={styles.chatCreatorNameRow}>
                      <h2 className={styles.chatCreatorName}>
                        {selectedCreator.name}
                      </h2>
                    </div>
                  </div>
                </div>
              </div>

              {/* Область сообщений */}
              <div className={styles.messagesContainer}>
                {getCurrentDialog().length === 0 ? (
                  <div className={styles.emptyChat}>
                    <EnvelopeIcon className={styles.emptyChatIcon} />
                    <h3>Начните диалог с {selectedCreator.name}</h3>
                    <p>
                      Обсудите сотрудничество, поделитесь опытом или задайте
                      вопросы
                    </p>
                  </div>
                ) : (
                  <div className={styles.messagesList}>
                    {(() => {
                      const dialog = getCurrentDialog();
                      let currentDate = null;

                      return dialog.map((message, index) => {
                        const messageDate = formatDate(message.timestamp);
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
                                  {message.text}
                                </div>
                                <div className={styles.messageMeta}>
                                  <span className={styles.messageTime}>
                                    {formatTime(message.timestamp)}
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

              {/* Панель ввода сообщения */}
              <div className={styles.inputContainer}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
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
            /* Состояние без выбранного креатора */
            <div className={styles.noChatSelected}>
              <ChatBubbleLeftRightIcon className={styles.noChatIcon} />
              <h2>Выберите чат для общения</h2>
              <p>
                Выберите существующий чат или создайте новый, чтобы обсудить
                сотрудничество, поделиться опытом или задать вопросы
              </p>
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

      {/* Модальное окно создания нового чата */}
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
                placeholder="Поиск креаторов..."
                value={newChatSearch}
                onChange={(e) => setNewChatSearch(e.target.value)}
                className={styles.modalSearchInput}
              />
            </div>

            <div className={styles.availableCreatorsList}>
              {availableCreators.length > 0 ? (
                availableCreators.map((creator) => (
                  <div
                    key={creator.id}
                    className={styles.availableCreatorItem}
                    onClick={() => handleCreateNewChat(creator)}
                  >
                    <div className={styles.availableCreatorAvatar}>
                      {creator.avatar ? (
                        <img src={creator.avatar} alt={creator.name} />
                      ) : (
                        <UserIcon className={styles.availableAvatarIcon} />
                      )}
                    </div>
                    <div className={styles.availableCreatorInfo}>
                      <h4 className={styles.availableCreatorName}>
                        {creator.name}
                      </h4>
                      <p className={styles.availableCreatorBio}>
                        {creator.bio.length > 50
                          ? creator.bio.substring(0, 50) + "..."
                          : creator.bio}
                      </p>
                    </div>
                    <PlusIcon className={styles.addChatIcon} />
                  </div>
                ))
              ) : (
                <div className={styles.noAvailableCreators}>
                  <UserIcon className={styles.noAvailableIcon} />
                  <p>
                    {newChatSearch
                      ? "Креаторы не найдены"
                      : "Нет доступных креаторов для нового чата"}
                  </p>
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
