import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useFavoritesStore } from "../../stores/favoritesStore";
import { useMarketplaceStore } from "../../stores/marketplaceStore";
import { useMasterClassesStore } from "../../stores/masterClassesStore"; // Добавляем импорт
import MasterClassesCard from "../MasterClassesCard/MasterClassesCard";
import ProductCard from "../ProductCard/ProductCard";
import styles from "./Favorites.module.css";
import {
  HeartIcon,
  VideoCameraIcon,
  ShoppingBagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

function Favorites() {
  const {
    favorites, // Это массив ID мастер-классов
    favoriteProducts, // Это массив ID товаров
    removeFromFavorites,
    toggleFavoriteProduct,
    clearFavorites,
    getFavoritesCount,
    getFavoriteProductsCount,
    getAllFavoritesCount,
  } = useFavoritesStore();

  const { products, getProductById } = useMarketplaceStore();
  const { getMasterClassById } = useMasterClassesStore(); // Добавляем

  const [activeTab, setActiveTab] = useState("masterclasses");

  // Получаем полные объекты мастер-классов по их ID
  const favoriteMasterClasses = favorites
    .map((id) => {
      const item = getMasterClassById(id);
      return item ? { ...item, id } : null;
    })
    .filter((item) => item !== null);

  // Получаем полные объекты товаров по их ID
  const favoriteProductsData = favoriteProducts
    .map((id) => {
      const product = getProductById
        ? getProductById(id)
        : products.find((p) => p.id === id);
      return product ? { ...product, id } : null;
    })
    .filter((product) => product !== null);

  const favoritesCount = getAllFavoritesCount();
  const masterClassesCount = getFavoritesCount();
  const productsCount = getFavoriteProductsCount();

  // Обработчики удаления
  const handleRemoveMasterClass = (id) => {
    removeFromFavorites(id);
  };

  const handleRemoveProduct = (id) => {
    toggleFavoriteProduct(id);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <div>
              <h1 className={styles.title}>Избранное</h1>
              <p className={styles.subtitle}>
                {favoritesCount > 0
                  ? `У вас ${favoritesCount} избранных элементов`
                  : "Вы пока ничего не добавили в избранное"}
              </p>
            </div>
          </div>
        </div>

        {favoritesCount > 0 && (
          <div className={styles.headerActions}>
            <button onClick={clearFavorites} className={styles.clearButton}>
              <XMarkIcon className={styles.clearIcon} />
              Очистить все
            </button>
          </div>
        )}
      </div>

      {/* Навигация между табами */}
      {favoritesCount > 0 && (
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "masterclasses" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("masterclasses")}
          >
            <VideoCameraIcon className={styles.tabIcon} />
            Мастер-классы
            <span className={styles.tabCount}>{masterClassesCount}</span>
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "products" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("products")}
          >
            <ShoppingBagIcon className={styles.tabIcon} />
            Товары
            <span className={styles.tabCount}>{productsCount}</span>
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "all" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("all")}
          >
            <HeartIconSolid className={styles.tabIcon} />
            Всё избранное
            <span className={styles.tabCount}>{favoritesCount}</span>
          </button>
        </div>
      )}

      {favoritesCount > 0 ? (
        <>
          {/* Контент для мастер-классов */}
          {activeTab === "masterclasses" && masterClassesCount > 0 && (
            <div className={styles.contentSection}>
              <h2 className={styles.sectionTitle}>Избранные мастер-классы</h2>
              <div className={styles.grid}>
                {favoriteMasterClasses.map((item) => (
                  <div key={item.id} className={styles.cardWrapper}>
                    <MasterClassesCard item={item} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Контент для товаров */}
          {activeTab === "products" && productsCount > 0 && (
            <div className={styles.contentSection}>
              <h2 className={styles.sectionTitle}>Избранные товары</h2>
              <div className={styles.grid}>
                {favoriteProductsData.map((product) => (
                  <div key={product.id} className={styles.cardWrapper}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Контент для всего избранного */}
          {activeTab === "all" && (
            <div className={styles.allContent}>
              {masterClassesCount > 0 && (
                <div className={styles.contentSection}>
                  <h2 className={styles.sectionTitle}>
                    <VideoCameraIcon className={styles.sectionIcon} />
                    Мастер-классы ({masterClassesCount})
                  </h2>
                  <div className={styles.grid}>
                    {favoriteMasterClasses.map((item) => (
                      <div key={item.id} className={styles.cardWrapper}>
                        <MasterClassesCard item={item} />
                        <button
                          className={styles.removeButton}
                          onClick={() => handleRemoveMasterClass(item.id)}
                          aria-label="Удалить из избранного"
                        >
                          <XMarkIcon className={styles.removeIcon} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {productsCount > 0 && (
                <div className={styles.contentSection}>
                  <h2 className={styles.sectionTitle}>
                    <ShoppingBagIcon className={styles.sectionIcon} />
                    Товары ({productsCount})
                  </h2>
                  <div className={styles.grid}>
                    {favoriteProductsData.map((product) => (
                      <div key={product.id} className={styles.cardWrapper}>
                        <ProductCard product={product} />
                        <button
                          className={styles.removeButton}
                          onClick={() => handleRemoveProduct(product.id)}
                          aria-label="Удалить из избранного"
                        >
                          <XMarkIcon className={styles.removeIcon} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Пустой таб */}
          {(activeTab === "masterclasses" && masterClassesCount === 0) ||
          (activeTab === "products" && productsCount === 0) ? (
            <div className={styles.emptyTab}>
              <div className={styles.emptyIcon}>
                {activeTab === "masterclasses" ? (
                  <VideoCameraIcon className={styles.emptyTabIcon} />
                ) : (
                  <ShoppingBagIcon className={styles.emptyTabIcon} />
                )}
              </div>
              <h3 className={styles.emptyTabTitle}>
                {activeTab === "masterclasses"
                  ? "Нет избранных мастер-классов"
                  : "Нет избранных товаров"}
              </h3>
              <p className={styles.emptyTabText}>
                {activeTab === "masterclasses"
                  ? "Добавляйте понравившиеся мастер-классы в избранное"
                  : "Добавляйте понравившиеся товары в избранное"}
              </p>
              <Link
                to={activeTab === "masterclasses" ? "/" : "/marketplace"}
                className={styles.exploreButton}
              >
                {activeTab === "masterclasses"
                  ? "Перейти к мастер-классам"
                  : "Перейти к товарам"}
              </Link>
            </div>
          ) : null}

          {/* Футер с подсказками */}
          <div className={styles.footerHint}>
            <p>Добавляйте в избранное всё, что понравилось!</p>
            <div className={styles.footerLinks}>
              <Link to="/" className={styles.exploreLink}>
                Смотреть мастер-классы
              </Link>
              <Link to="/marketplace" className={styles.exploreLink}>
                Перейти в магазин
              </Link>
            </div>
          </div>
        </>
      ) : (
        /* Состояние пустого избранного */
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <HeartIcon className={styles.emptyHeartIcon} />
          </div>
          <h2 className={styles.emptyTitle}>Избранное пусто</h2>
          <p className={styles.emptyText}>
            Добавляйте мастер-классы и товары в избранное, чтобы вернуться к ним
            позже. Это поможет вам не потерять понравившиеся курсы и покупки.
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
      )}
    </div>
  );
}

export default Favorites;
