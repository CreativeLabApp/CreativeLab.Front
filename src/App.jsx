import React from "react";
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

function App() {
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

      <Route path="/shop" element={<Layout />}>
        <Route index element={<MarketplacePage />} />
      </Route>

      {/* <Route path="shop/product/:id" element={<ProductDetailPage />} />
      <Route path="shop/cart" element={<CartPage />} />
      <Route path="shop/add-product" element={<AddProductPage />} />
      <Route path="shop/seller/:id" element={<SellerDashboardPage />} /> */}

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
