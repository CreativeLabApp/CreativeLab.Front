const BASE_URL = process.env.REACT_APP_API_URL || "https://localhost:7111/api";

export const authApi = {
  register: async ({ name, surname, email, password }) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, surname, email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.title || "Ошибка при регистрации");
    }
    return res.json(); // { token, id, name, surname, email }
  },

  login: async ({ email, password }) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.title || "Неверный email или пароль");
    }
    return res.json(); // { token, id, name, surname, email }
  },
};
