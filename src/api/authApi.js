const BASE_URL = process.env.REACT_APP_API_URL || "https://localhost:7111/api";

export const authApi = {
  register: async ({ name, surname, email, password }) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // нужно для httpOnly cookie
      body: JSON.stringify({ name, surname, email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.title || "Ошибка при регистрации");
    }
    return res.json(); // { accessToken, id, name, surname, email }
  },

  login: async ({ email, password }) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.title || "Неверный email или пароль");
    }
    return res.json(); // { accessToken, id, name, surname, email }
  },

  refresh: async () => {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // refresh token из cookie
    });
    if (!res.ok) return null;
    return res.json(); // { accessToken }
  },

  logout: async (token) => {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).catch(() => {});
  },

  me: async (token) => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  },
};
