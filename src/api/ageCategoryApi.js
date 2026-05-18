const BASE_URL = process.env.REACT_APP_API_URL || "https://localhost:7111/api";

export const ageCategoryApi = {
  getAll: async () => {
    const res = await fetch(
      `${BASE_URL}/masterclass/getagecategories/agecategories`,
    );
    if (!res.ok) throw new Error("Failed to fetch age categories");
    return res.json();
  },
};
