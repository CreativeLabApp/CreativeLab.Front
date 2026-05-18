const BASE_URL = process.env.REACT_APP_API_URL || "https://localhost:7111/api";

const getAuthHeaders = (token) => {
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

export const userPhotoApi = {
  // Загрузить фото пользователя
  upload: async (file, token) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/userphoto/upload`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to upload photo");
    }

    return res.json();
  },

  // Получить все фото пользователя
  getUserPhotos: async (userId, token) => {
    const res = await fetch(`${BASE_URL}/userphoto/user/${userId}`, {
      headers: getAuthHeaders(token),
    });

    if (!res.ok) throw new Error("Failed to fetch user photos");
    return res.json();
  },

  // Получить мои фото
  getMyPhotos: async (token) => {
    const res = await fetch(`${BASE_URL}/userphoto/my`, {
      headers: getAuthHeaders(token),
    });

    if (!res.ok) throw new Error("Failed to fetch photos");
    return res.json();
  },

  // Удалить фото (мягкое удаление)
  delete: async (photoId, token) => {
    const res = await fetch(`${BASE_URL}/userphoto/${photoId}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });

    if (!res.ok) throw new Error("Failed to delete photo");
    return res.json();
  },

  // Удалить фото физически
  deletePermanently: async (photoId, token) => {
    const res = await fetch(`${BASE_URL}/userphoto/${photoId}/permanent`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });

    if (!res.ok) throw new Error("Failed to delete photo permanently");
    return res.json();
  },
};
