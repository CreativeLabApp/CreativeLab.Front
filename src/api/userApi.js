const BASE_URL = process.env.REACT_APP_API_URL || "https://localhost:7111/api";

export const userApi = {
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/user/getall`);
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json(); // [{ id, name, surname, email, createdAt, masterclassesCount, productsCount }]
  },

  getById: async (id) => {
    const res = await fetch(`${BASE_URL}/user/get?userId=${id}`);
    if (!res.ok) throw new Error("User not found");
    return res.json();
  },

  update: async ({ id, name, surname, email, password }) => {
    const res = await fetch(`${BASE_URL}/user/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        name,
        surname,
        email,
        password: password || null,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.title || "Ошибка при сохранении");
    }
  },

  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/user/delete?id=${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete user");
  },

  toggleActive: async (id) => {
    const res = await fetch(`${BASE_URL}/user/toggleactive?id=${id}`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error("Failed to toggle user status");
    return res.json(); // { isActive: bool }
  },
};
