import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMarketplaceStore } from "../../stores/marketplaceStore";
import { masterclassApi } from "../../api/masterclassApi";
import styles from "./Rating.module.css";
import {
  StarIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ShoppingBagIcon,
  VideoCameraIcon,
  UserIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

function Rating() {
  const { products, fetchProducts } = useMarketplaceStore();
  const [masterClasses, setMasterClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchProducts();
        const data = await masterclassApi.getAll();
        const mapped = data.masterclasses.map((m) => ({
          id: m.id,
          title: m.title,
          category: m.categoryName || m.categoryId,
          author: m.authorName || m.authorId,
          images: m.imageUrls?.length
            ? m.imageUrls
            : m.thumbnailUrl
              ? [m.thumbnailUrl]
              : [],
          rating: Number(m.rating) || 0,
          views: m.views || 0,
        }));
        setMasterClasses(mapped);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchProducts]);

  const [activeCategory, setActiveCategory] = useState("all");
  const [timePeriod, setTimePeriod] = useState("all");

  const categories = [
    { id: "all", name: "Все", icon: <TrophyIcon /> },
    { id: "products", name: "Товары", icon: <ShoppingBagIcon /> },
    { id: "masterclasses", name: "Мастер-классы", icon: <VideoCameraIcon /> },
  ];

  const timePeriods = [
    { id: "all", name: "За все время" },
    { id: "month", name: "За месяц" },
    { id: "week", name: "За неделю" },
  ];

  const formatNumber = (num) => {
    return new Intl.NumberFormat("ru-RU").format(num);
  };

  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className={styles.ratingStarsSmall}>
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <StarIconSolid key={i} className={styles.starIconSmall} />;
          } else if (i === fullStars && hasHalfStar) {
            return <StarIconSolid key={i} className={styles.halfStarSmall} />;
          } else {
            return <StarIcon key={i} className={styles.starIconSmall} />;
          }
        })}
      </div>
    );
  };

  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const salesA = a.sales || 0;
        const salesB = b.sales || 0;
        if (salesB !== salesA) return salesB - salesA;
        return b.rating - a.rating;
      })
      .slice(0, 10);
  }, [products]);

  const topMasterClasses = useMemo(() => {
    return [...masterClasses]
      .sort((a, b) => {
        const viewsA = a.views || 0;
        const viewsB = b.views || 0;
        if (viewsB !== viewsA) return viewsB - viewsA;
        return b.rating - a.rating;
      })
      .slice(0, 10);
  }, [masterClasses]);

  const getCurrentData = () => {
    switch (activeCategory) {
      case "products":
        return topProducts;
      case "masterclasses":
        return topMasterClasses;
      case "all":
      default:
        return {
          products: topProducts.slice(0, 5),
          masterClasses: topMasterClasses.slice(0, 5),
        };
    }
  };

  const renderProductCard = (product, index) => (
    <div key={product.id} className={styles.ratingCard}>
      <div className={styles.rankBadge}>
        <span className={styles.rankNumber}>{index + 1}</span>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardImage}>
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0]} alt={product.title} />
          ) : (
            <div className={styles.imagePlaceholder}>
              <ShoppingBagIcon className={styles.placeholderIcon} />
            </div>
          )}
        </div>
        <div className={styles.cardInfo}>
          <h3 className={styles.cardTitle}>{product.title}</h3>
          <div className={styles.cardMeta}>
            <div className={styles.cardRating}>
              {renderRatingStars(product.rating)}
              <span className={styles.ratingValue}>{product.rating}</span>
            </div>
            <div className={styles.cardStats}>
              <span className={styles.sales}>
                Продано: {formatNumber(product.sales || 0)}
              </span>
              <span className={styles.price}>
                {formatNumber(product.price)} Br
              </span>
            </div>
          </div>
          <div className={styles.cardFooter}>
            <Link
              to={`/marketplace/product/${product.id}`}
              className={styles.viewButton}
            >
              Подробнее
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMasterClassCard = (masterClass, index) => (
    <div key={masterClass.id} className={styles.ratingCard}>
      <div className={styles.rankBadge}>
        <span className={styles.rankNumber}>{index + 1}</span>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardImage}>
          {masterClass.images && masterClass.images.length > 0 ? (
            <img src={masterClass.images[0]} alt={masterClass.title} />
          ) : (
            <div className={styles.imagePlaceholder}>
              <VideoCameraIcon className={styles.placeholderIcon} />
            </div>
          )}
        </div>
        <div className={styles.cardInfo}>
          <h3 className={styles.cardTitle}>{masterClass.title}</h3>
          <div className={styles.cardMeta}>
            <div className={styles.cardAuthor}>
              <UserIcon className={styles.authorIcon} />
              <span>{masterClass.author}</span>
            </div>
            <div className={styles.cardRating}>
              {renderRatingStars(masterClass.rating)}
              <span className={styles.ratingValue}>{masterClass.rating}</span>
            </div>
          </div>
          <div className={styles.cardStats}>
            <div className={styles.statItem}>
              <EyeIcon className={styles.statIcon} />
              <span>{formatNumber(masterClass.views || 0)} просмотров</span>
            </div>
            <span className={styles.categoryTag}>{masterClass.category}</span>
          </div>
          <div className={styles.cardFooter}>
            <Link
              to={`/master-class/${masterClass.id}`}
              className={styles.viewButton}
            >
              Смотреть
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const currentData = getCurrentData();

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Рейтинг</h1>
          <p className={styles.subtitle}>Загрузка данных...</p>
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
              <h1 className={styles.title}>Рейтинг</h1>
              <p className={styles.subtitle}>
                Лучшие товары и мастер-классы платформы
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.filtersSection}>
        <div className={styles.categoriesFilter}>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`${styles.categoryButton} ${
                activeCategory === category.id ? styles.active : ""
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              <span className={styles.categoryIcon}>{category.icon}</span>
              <span className={styles.categoryName}>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        {activeCategory === "all" ? (
          <div className={styles.allCategories}>
            <div className={styles.categorySection}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>
                  <ShoppingBagIcon className={styles.sectionIcon} />
                  <h2>Топ товаров</h2>
                </div>
                <Link to="/marketplace" className={styles.seeAllLink}>
                  Все товары →
                </Link>
              </div>
              <div className={styles.ratingList}>
                {currentData.products.map((product, index) =>
                  renderProductCard(product, index),
                )}
              </div>
            </div>

            <div className={styles.categorySection}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>
                  <VideoCameraIcon className={styles.sectionIcon} />
                  <h2>Топ мастер-классов</h2>
                </div>
                <Link to="/" className={styles.seeAllLink}>
                  Все мастер-классы →
                </Link>
              </div>
              <div className={styles.ratingList}>
                {currentData.masterClasses.map((masterClass, index) =>
                  renderMasterClassCard(masterClass, index),
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.singleCategory}>
            <div className={styles.categoryHeader}>
              <h2 className={styles.categoryTitle}>
                {categories.find((c) => c.id === activeCategory)?.name}
              </h2>
              <div className={styles.categoryStats}>
                <span className={styles.itemsCount}>
                  Всего: {formatNumber(currentData.length)} позиций
                </span>
              </div>
            </div>
            <div className={styles.ratingList}>
              {activeCategory === "products" &&
                currentData.map((product, index) =>
                  renderProductCard(product, index),
                )}
              {activeCategory === "masterclasses" &&
                currentData.map((masterClass, index) =>
                  renderMasterClassCard(masterClass, index),
                )}
            </div>
          </div>
        )}
      </div>

      <div className={styles.infoSection}>
        <div className={styles.infoCard}>
          <FireIcon className={styles.infoIcon} />
          <div className={styles.infoContent}>
            <h3 className={styles.infoTitle}>Как считается рейтинг?</h3>
            <p className={styles.infoText}>
              Рейтинг формируется на основе множества факторов: количество
              продаж, отзывы пользователей, просмотры и другие показатели
              качества.
            </p>
          </div>
        </div>
        <div className={styles.infoCard}>
          <ArrowTrendingUpIcon className={styles.infoIcon} />
          <div className={styles.infoContent}>
            <h3 className={styles.infoTitle}>Почему это важно?</h3>
            <p className={styles.infoText}>
              Высокий рейтинг помогает пользователям находить лучшие материалы,
              а авторам получать больше просмотров и продаж своих работ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const EyeIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

const CalendarDaysIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
    />
  </svg>
);

export default Rating;
