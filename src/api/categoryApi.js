const BASE_URL = process.env.REACT_APP_API_URL || "https://localhost:7111/api";

export const categoryApi = {
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/category/getall`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json(); // [{ id, name, order }]
  },
};
