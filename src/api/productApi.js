const BASE_URL = process.env.REACT_APP_API_URL || "https://localhost:7111/api";
const SERVER_URL = process.env.REACT_APP_SERVER_URL || "https://localhost:7111";

const getAuthHeaders = (token) => {
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

const mapProduct = (p) => ({
  id: p.id,
  title: p.title,
  description: p.shortDescription || p.description || "",
  fullDescription: p.description || "",
  seller: p.sellerName || p.sellerId,
  sellerId: p.sellerId,
  category: p.categoryName || p.categoryId,
  categoryId: p.categoryId,
  price: Number(p.price) || 0,
  discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
  images: p.imageUrls?.length
    ? p.imageUrls
    : p.thumbnailUrl
      ? [p.thumbnailUrl]
      : [],
  isAvailable: p.isAvailable,
  stockQuantity: p.stockQuantity || 0,
  dimensions: p.dimensions || "",
  weight: p.weight || null,
  materials: p.materials || [],
  createdAt: p.createdAt,
  rating: Number(p.rating) || 0,
  ratingsCount: p.ratingsCount || 0,
  views: p.views || 0,
  tags: p.tags || [],
  status: p.isAvailable ? "available" : "unavailable",
});

export const productApi = {
  getAll: async (onlyAvailable = true) => {
    const res = await fetch(
      `${BASE_URL}/product/getall?onlyAvailable=${onlyAvailable}`,
    );
    if (!res.ok) throw new Error("Failed to fetch products");
    const data = await res.json();
    return data.products.map(mapProduct);
  },

  getBySeller: async (sellerId, onlyAvailable = true) => {
    const res = await fetch(
      `${BASE_URL}/product/getbyseller?sellerId=${sellerId}&onlyAvailable=${onlyAvailable}`,
    );
    if (!res.ok) throw new Error("Failed to fetch products");
    const data = await res.json();
    return data.products.map(mapProduct);
  },

  getById: async (id) => {
    const res = await fetch(`${BASE_URL}/product/get?id=${id}`);
    if (!res.ok) throw new Error("Product not found");
    const data = await res.json();
    return {
      id: data.id,
      title: data.title,
      description: data.description || "",
      shortDescription: data.shortDescription || "",
      seller: data.sellerName || data.sellerId,
      sellerId: data.sellerId,
      category: data.categoryName || data.categoryId,
      categoryId: data.categoryId,
      price: Number(data.price) || 0,
      discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
      images: data.imageUrls?.length
        ? data.imageUrls
        : data.thumbnailUrl
          ? [data.thumbnailUrl]
          : [],
      isAvailable: data.isAvailable,
      stockQuantity: data.stockQuantity || 0,
      dimensions: data.dimensions || "",
      weight: data.weight || null,
      materials: data.materials || [],
      createdAt: data.createdAt,
      rating: Number(data.rating) || 0,
      ratingsCount: data.ratingsCount || 0,
      views: data.views || 0,
      tags: data.tags || [],
      status: data.isAvailable ? "available" : "unavailable",
    };
  },

  create: async (dto) => {
    const res = await fetch(`${BASE_URL}/product/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error("Failed to create product");
    return res.json();
  },

  update: async (dto, token) => {
    const res = await fetch(`${BASE_URL}/product/update`, {
      method: "PUT",
      headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error("Failed to update product");
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/product/delete?id=${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete product");
  },

  rate: async (id, score, token) => {
    const res = await fetch(
      `${BASE_URL}/product/rate?id=${id}&score=${score}`,
      {
        method: "PATCH",
        headers: getAuthHeaders(token),
      },
    );
    if (!res.ok) throw new Error("Failed to rate product");
    return res.json(); // { rating: decimal }
  },

  getUserRating: async (productId, userId, token) => {
    const res = await fetch(
      `${BASE_URL}/product/getuserrating?productId=${productId}&userId=${userId}`,
      {
        headers: getAuthHeaders(token),
      },
    );
    if (!res.ok) throw new Error("Failed to get user rating");
    return res.json(); // { score: number }
  },

  uploadImages: async (files, token) => {
    const formData = new FormData();
    for (const file of files) formData.append("files", file);
    const res = await fetch(`${BASE_URL}/upload/images`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload images");
    const data = await res.json();
    return data.urls.map((url) => `${SERVER_URL}${url}`);
  },
};
