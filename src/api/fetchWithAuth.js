import { useAuthStore } from "../stores/authStore";
import { authApi } from "./authApi";

// Флаг чтобы не запускать несколько refresh одновременно
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((cb) => (error ? cb.reject(error) : cb.resolve(token)));
  refreshQueue = [];
};

export async function fetchWithAuth(url, options = {}) {
  const { token, setToken, logout } = useAuthStore.getState();

  const makeRequest = (accessToken) =>
    fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...options.headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

  let res = await makeRequest(token);

  if (res.status !== 401) return res;

  // 401 — пробуем обновить токен
  if (isRefreshing) {
    // Ждём пока другой запрос обновит токен
    return new Promise((resolve, reject) => {
      refreshQueue.push({
        resolve: (newToken) => resolve(makeRequest(newToken)),
        reject,
      });
    });
  }

  isRefreshing = true;
  try {
    const data = await authApi.refresh();
    if (!data?.accessToken) {
      logout();
      processQueue(new Error("Session expired"));
      return res;
    }

    setToken(data.accessToken);
    processQueue(null, data.accessToken);
    return makeRequest(data.accessToken);
  } catch (err) {
    logout();
    processQueue(err);
    return res;
  } finally {
    isRefreshing = false;
  }
}
