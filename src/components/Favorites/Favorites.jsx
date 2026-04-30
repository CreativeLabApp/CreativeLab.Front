import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useFavoritesStore } from "../../stores/favoritesStore";
import { useAuthStore } from "../../stores/authStore";
import MasterClassesCard from "../MasterClassesCard/MasterClassesCard";
import ProductCard from "../ProductCard/ProductCard";
import styles from "./Favorites.module.css";
import { useState } from "react";
import {
  HeartIcon,
  VideoCameraIcon,
  ShoppingBagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

function Favorites() {
  const { user } = useAuthStore();
  const {
    masterclasses,
    products,
    loading,
    load,
    removeFromFavorites,
    removeFromFavoriteProducts,
    clearFavorites,
    getFavoritesCount,
    getFavoriteProductsCount,
    getAllFavoritesCount,
  } = useFavoritesStore();

  const [activeTab, setActiveTab] = useState("masterclasses");

  useEffect(() => {
    if (user?.id) load(user.id);
  }, [user?.id, load]);

  const favoritesCount = getAllFavoritesCount();
  const masterClassesCount = getFavoritesCount();
  const productsCount = getFavoriteProductsCount();

  if (loading) return null;

  if (favoritesCount === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Избранное</h1>
          <p className={styles.subtitle}>
            Вы пока ничего не добавили в избранное
          </p>
        </div>
        <div className={styles.emptyState}>
          <HeartIcon className={styles.emptyHeartIcon} />
          <h2 className={styles.emptyTitle}>Избранное пусто</h2>
          <p className={styles.emptyText}>
            Добавляйте мастер-классы и товары в избранное, чтобы вернуться к ним
            позже.
          </p>
          <div className={styles.emptyActions}>
            <Link to="/" className={styles.catalogButton}>
              <VideoCameraIcon className={styles.buttonIcon} />
              Смотреть мастер-классы
            </Link>
            <Link to="/marketplace" className={styles.exploreButton}>
              <ShoppingBagIcon className={styles.buttonIcon} />
              Перейти в магазин
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <div>
              <h1 className={styles.title}>Избранное</h1>
              <p className={styles.subtitle}>
                У вас {favoritesCount} избранных элементов
              </p>
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={() => clearFavorites(user.id)}
            className={styles.clearButton}
          >
            <XMarkIcon className={styles.clearIcon} />
            Очистить все
          </button>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "masterclasses" ? styles.active : ""}`}
          onClick={() => setActiveTab("masterclasses")}
        >
          <VideoCameraIcon className={styles.tabIcon} />
          Мастер-классы
          <span className={styles.tabCount}>{masterClassesCount}</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === "products" ? styles.active : ""}`}
          onClick={() => setActiveTab("products")}
        >
          <ShoppingBagIcon className={styles.tabIcon} />
          Товары
          <span className={styles.tabCount}>{productsCount}</span>
        </button>
      </div>

      {activeTab === "masterclasses" && (
        <div className={styles.contentSection}>
          {masterclasses.length > 0 ? (
            <div className={styles.grid}>
              {masterclasses.map((item) => (
                <div key={item.id} className={styles.cardWrapper}>
                  <MasterClassesCard item={item} />
                  <button
                    className={styles.removeButton}
                    onClick={() => removeFromFavorites(user.id, item.id)}
                    aria-label="Удалить из избранного"
                  >
                    <XMarkIcon className={styles.removeIcon} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyTab}>
              <VideoCameraIcon className={styles.emptyTabIcon} />
              <h3 className={styles.emptyTabTitle}>
                Нет избранных мастер-классов
              </h3>
              <Link to="/" className={styles.exploreButton}>
                Перейти к мастер-классам
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === "products" && (
        <div className={styles.contentSection}>
          {products.length > 0 ? (
            <div className={styles.grid}>
              {products.map((product) => (
                <div key={product.id} className={styles.cardWrapper}>
                  <ProductCard product={product} />
                  <button
                    className={styles.removeButton}
                    onClick={() =>
                      removeFromFavoriteProducts(user.id, product.id)
                    }
                    aria-label="Удалить из избранного"
                  >
                    <XMarkIcon className={styles.removeIcon} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyTab}>
              <ShoppingBagIcon className={styles.emptyTabIcon} />
              <h3 className={styles.emptyTabTitle}>Нет избранных товаров</h3>
              <Link to="/marketplace" className={styles.exploreButton}>
                Перейти в магазин
              </Link>
            </div>
          )}
        </div>
      )}

      <div className={styles.footerHint}>
        <div className={styles.footerLinks}>
          <Link to="/" className={styles.exploreLink}>
            Смотреть мастер-классы
          </Link>
          <Link to="/marketplace" className={styles.exploreLink}>
            Перейти в магазин
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Favorites;
