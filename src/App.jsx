import { useEffect } from "react";
import HomePage from "./pages/HomePage/HomePage";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import "./styles/variables.css";
import "./styles/global.css";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import MasterClassDetailPage from "./pages/MasterClassDetailsPage/MasterClassDetailsPage";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import FavoritesPage from "./pages/FavoritesPage/FavoritesPage";
import MarketplacePage from "./pages/MarketplacePage/MarketplacePage";
import ProductDetailPage from "./pages/ProductDetailPage/ProductDetailPage";
import CreatorProfilePage from "./pages/CreatorProfilePage/CreatorProfilePage";
import CreateMasterClassPage from "./pages/CreateMasterClassPage/CreateMasterClassPage";
import RatingPage from "./pages/RatingPage/RatingPage";
import MessagesPage from "./pages/MessagesPage/MessagesPage";
import CreateProduct from "./components/CreateProduct/CreateProduct";
import EditProfilePage from "./pages/EditProfilePage/EditProfilePage";
import AdminPanel from "./components/AdminPanel/AdminPanel";
import AdminEditUser from "./components/AdminEditUser/AdminEditUser";
import { useAuthStore } from "./stores/authStore";
import { authApi } from "./api/authApi";
import { useFavoritesStore } from "./stores/favoritesStore";

function App() {
  const { token, logout, login, user } = useAuthStore();
  const { load } = useFavoritesStore();

  // При старте проверяем валидность токена
  useEffect(() => {
    if (!token) return;
    authApi.me(token).then((u) => {
      if (!u) {
        logout();
      }
    });
  }, [logout, login, token]);

  // Загружаем избранное при наличии авторизованного пользователя
  useEffect(() => {
    if (user?.id) load(user.id);
  }, [user?.id]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
      </Route>

      <Route path="/master-class/:id" element={<Layout />}>
        <Route index element={<MasterClassDetailPage />} />
      </Route>

      <Route path="/favorite" element={<Layout />}>
        <Route index element={<FavoritesPage />} />
      </Route>

      <Route path="/marketplace" element={<Layout />}>
        <Route index element={<MarketplacePage />} />
      </Route>

      <Route path="marketplace/product/:id" element={<Layout />}>
        <Route index element={<ProductDetailPage />} />
      </Route>

      <Route path="marketplace/add-product" element={<Layout />}>
        <Route index element={<CreateProduct />} />
      </Route>

      <Route path="creator/:id" element={<Layout />}>
        <Route index element={<CreatorProfilePage />} />
      </Route>

      <Route path="profile/edit" element={<Layout />}>
        <Route index element={<EditProfilePage />} />
      </Route>

      <Route path="/create-masterclass" element={<Layout />}>
        <Route index element={<CreateMasterClassPage />} />
      </Route>

      <Route path="/rating" element={<Layout />}>
        <Route index element={<RatingPage />} />
      </Route>

      <Route path="/messages" element={<Layout />}>
        <Route index element={<MessagesPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />

      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/admin/edit-user/:id" element={<AdminEditUser />} />
    </Routes>
  );
}

export default App;
