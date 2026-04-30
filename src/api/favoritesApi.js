const BASE_URL = process.env.REACT_APP_API_URL || "https://localhost:7111/api";

export const favoritesApi = {
  getAll: async (userId) => {
    const res = await fetch(`${BASE_URL}/userfavorite/getall?userId=${userId}`);
    if (!res.ok) throw new Error("Failed to fetch favorites");
    return res.json(); // { masterclasses: [...], products: [...] }
  },

  addMasterclass: async (userId, masterclassId) => {
    const res = await fetch(`${BASE_URL}/userfavorite/addmasterclass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, masterclassId }),
    });
    if (!res.ok) throw new Error("Failed to add masterclass to favorites");
  },

  removeMasterclass: async (userId, masterclassId) => {
    const res = await fetch(`${BASE_URL}/userfavorite/removemasterclass`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, masterclassId }),
    });
    if (!res.ok) throw new Error("Failed to remove masterclass from favorites");
  },

  addProduct: async (userId, productId) => {
    const res = await fetch(`${BASE_URL}/userfavorite/addproduct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId }),
    });
    if (!res.ok) throw new Error("Failed to add product to favorites");
  },

  removeProduct: async (userId, productId) => {
    const res = await fetch(`${BASE_URL}/userfavorite/removeproduct`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId }),
    });
    if (!res.ok) throw new Error("Failed to remove product from favorites");
  },

  clearAll: async (userId) => {
    const res = await fetch(
      `${BASE_URL}/userfavorite/clearall?userId=${userId}`,
      {
        method: "DELETE",
      },
    );
    if (!res.ok) throw new Error("Failed to clear favorites");
  },
};
