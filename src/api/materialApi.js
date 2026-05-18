const BASE_URL = process.env.REACT_APP_API_URL || "https://localhost:7111/api";

const getAuthHeaders = (token) => {
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

export const materialApi = {
  getAll: async (token) => {
    const res = await fetch(`${BASE_URL}/masterclass/getmaterials/materials`, {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch materials");
    return res.json();
  },
};
