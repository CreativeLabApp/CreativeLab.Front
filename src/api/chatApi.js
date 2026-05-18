const BASE_URL = process.env.REACT_APP_API_URL || "https://localhost:7111/api";

const getAuthHeaders = (token) => {
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

export const chatApi = {
  getUserChats: async (userId, token) => {
    const res = await fetch(
      `${BASE_URL}/chat/getuserchats/user?userId=${userId}`,
      {
        headers: getAuthHeaders(token),
      },
    );
    if (!res.ok) throw new Error("Failed to fetch chats");
    return res.json();
  },

  getOrCreateAdminChat: async (userId, token) => {
    const res = await fetch(
      `${BASE_URL}/chat/getorcreateadminchat/admin?userId=${userId}`,
      {
        headers: getAuthHeaders(token),
      },
    );
    if (!res.ok) throw new Error("Failed to get admin chat");
    return res.json();
  },

  getChatDetails: async (id, token) => {
    const res = await fetch(`${BASE_URL}/chat/get?id=${id}`, {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch chat details");
    return res.json();
  },

  createChat: async (participantIds, token) => {
    const res = await fetch(`${BASE_URL}/chat/create`, {
      method: "POST",
      headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ ParticipantUserIds: participantIds }),
    });
    if (!res.ok) throw new Error("Failed to create chat");
    return res.json();
  },

  deleteChat: async (id, token) => {
    const res = await fetch(`${BASE_URL}/chat/delete?id=${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to delete chat");
  },

  addParticipant: async (chatId, userId, token) => {
    const res = await fetch(`${BASE_URL}/chat/addparticipant`, {
      method: "POST",
      headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, userId }),
    });
    if (!res.ok) throw new Error("Failed to add participant");
    return res.json();
  },

  removeParticipant: async (chatId, userId, token) => {
    const res = await fetch(`${BASE_URL}/chat/removeparticipant`, {
      method: "DELETE",
      headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, userId }),
    });
    if (!res.ok) throw new Error("Failed to remove participant");
  },
};

export const userApi = {
  getUsers: async (search, token) => {
    const url = search
      ? `${BASE_URL}/user/getall?search=${encodeURIComponent(search)}`
      : `${BASE_URL}/user/getall`;
    const res = await fetch(url, {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
  },
};

export const messageApi = {
  getChatMessages: async (chatId, userId, token) => {
    const res = await fetch(
      `${BASE_URL}/message/getchatmessages/chat?chatId=${chatId}&userId=${userId}`,
      {
        headers: getAuthHeaders(token),
      },
    );
    if (!res.ok) throw new Error("Failed to fetch messages");
    return res.json();
  },

  getMessageDetails: async (id, token) => {
    const res = await fetch(`${BASE_URL}/message/get?id=${id}`, {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch message details");
    return res.json();
  },

  createMessage: async (dto, token) => {
    const res = await fetch(`${BASE_URL}/message/create`, {
      method: "POST",
      headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error("Failed to create message");
    return res.json();
  },

  deleteMessage: async (id, token) => {
    const res = await fetch(`${BASE_URL}/message/delete?id=${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to delete message");
  },
};
