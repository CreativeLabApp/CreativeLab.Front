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
import ProductDetailPage from "./pages/ProductDetailPage/ProductDetailPage";
import CreatorProfilePage from "./pages/CreatorProfilePage/CreatorProfilePage";

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

      <Route path="/marketplace" element={<Layout />}>
        <Route index element={<MarketplacePage />} />
      </Route>

      <Route path="marketplace/product/:id" element={<Layout />}>
        <Route index element={<ProductDetailPage />} />
      </Route>
      {/*<Route path="marketplace/add-product" element={<AddProductPage />} />*/}

      <Route path="creator/:id" element={<Layout />}>
        <Route index element={<CreatorProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
