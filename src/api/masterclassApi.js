const BASE_URL = process.env.REACT_APP_API_URL || "https://localhost:7111/api";
const SERVER_URL = process.env.REACT_APP_SERVER_URL || "https://localhost:7111";

export const masterclassApi = {
  getAll: async (onlyPublished = true) => {
    const res = await fetch(
      `${BASE_URL}/masterclass/getall?onlyPublished=${onlyPublished}`,
    );
    if (!res.ok) throw new Error("Failed to fetch masterclasses");
    return res.json();
  },

  getByAuthor: async (authorId, onlyPublished = true) => {
    const res = await fetch(
      `${BASE_URL}/masterclass/getbyauthor?authorId=${authorId}&onlyPublished=${onlyPublished}`,
    );
    if (!res.ok) throw new Error("Failed to fetch masterclasses");
    return res.json();
  },

  getById: async (id) => {
    const res = await fetch(`${BASE_URL}/masterclass/get?id=${id}`);
    if (!res.ok) throw new Error("Masterclass not found");
    return res.json();
  },

  uploadImages: async (files) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }
    const res = await fetch(`${BASE_URL}/upload/images`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.title || "Failed to upload images");
    }
    const data = await res.json(); // { urls: ["/uploads/..."] }
    // Возвращаем абсолютные URL
    return data.urls.map((url) => `${SERVER_URL}${url}`);
  },

  update: async (dto) => {
    const res = await fetch(`${BASE_URL}/masterclass/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error("Failed to update masterclass");
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/masterclass/delete?id=${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete masterclass");
  },

  rate: async (id, userId, score, comment = null) => {
    const params = new URLSearchParams({ id, userId, score });
    if (comment) params.append("comment", comment);
    const res = await fetch(`${BASE_URL}/masterclass/rate?${params}`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error("Failed to rate masterclass");
    return res.json(); // { rating, ratingsCount, userScore }
  },

  getUserRating: async (id, userId) => {
    const res = await fetch(
      `${BASE_URL}/masterclass/getuserrating?id=${id}&userId=${userId}`,
    );
    if (!res.ok) throw new Error("Failed to get user rating");
    return res.json(); // { score: int | null }
  },

  getRatings: async (id) => {
    const res = await fetch(`${BASE_URL}/masterclass/getratings?id=${id}`);
    if (!res.ok) throw new Error("Failed to get ratings");
    return res.json(); // [{ userId, userName, score, createdAt, updatedAt }]
  },

  create: async (dto) => {
    const res = await fetch(`${BASE_URL}/masterclass/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error("Failed to create masterclass");
    return res.json();
  },
};
