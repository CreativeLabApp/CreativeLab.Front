import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useMarketplaceStore } from "../../stores/marketplaceStore";
import { useMasterClassesStore } from "../../stores/masterClassesStore";
import styles from "./Rating.module.css";
import {
  StarIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ShoppingBagIcon,
  VideoCameraIcon,
  UserIcon,
  FireIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import creatorsData from "../../sources/creators";

function Rating() {
  const { products } = useMarketplaceStore();
  const { masterClasses } = useMasterClassesStore();

  const [activeCategory, setActiveCategory] = useState("all");
  const [timePeriod, setTimePeriod] = useState("all");

  // Категории для фильтрации
  const categories = [
    { id: "all", name: "Все", icon: <TrophyIcon /> },
    { id: "products", name: "Товары", icon: <ShoppingBagIcon /> },
    { id: "masterclasses", name: "Мастер-классы", icon: <VideoCameraIcon /> },
    { id: "creators", name: "Творцы", icon: <UserIcon /> },
  ];

  // Периоды времени
  const timePeriods = [
    { id: "all", name: "За все время" },
    { id: "month", name: "За месяц" },
    { id: "week", name: "За неделю" },
  ];

  // Форматирование чисел
  const formatNumber = (num) => {
    return new Intl.NumberFormat("ru-RU").format(num);
  };

  // Рендер рейтинга звездами
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

  // Топ товаров по продажам и рейтингу
  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        // Сначала по продажам, потом по рейтингу
        const salesA = a.sales || 0;
        const salesB = b.sales || 0;
        if (salesB !== salesA) return salesB - salesA;
        return b.rating - a.rating;
      })
      .slice(0, 10);
  }, [products]);

  // Топ мастер-классов по просмотрам и рейтингу
  const topMasterClasses = useMemo(() => {
    return [...masterClasses]
      .sort((a, b) => {
        // Сначала по просмотрам, потом по рейтингу
        const viewsA = a.views || 0;
        const viewsB = b.views || 0;
        if (viewsB !== viewsA) return viewsB - viewsA;
        return b.rating - a.rating;
      })
      .slice(0, 10);
  }, [masterClasses]);

  // Топ креаторов по рейтингу и продажам
  const topCreators = useMemo(() => {
    return [...creatorsData]
      .sort((a, b) => {
        // Сначала по рейтингу, потом по продажам
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.totalSales - a.totalSales;
      })
      .slice(0, 10);
  }, []);

  // Получение данных для текущей категории
  const getCurrentData = () => {
    switch (activeCategory) {
      case "products":
        return topProducts;
      case "masterclasses":
        return topMasterClasses;
      case "creators":
        return topCreators;
      case "all":
      default:
        return {
          products: topProducts.slice(0, 5),
          masterClasses: topMasterClasses.slice(0, 5),
          creators: topCreators.slice(0, 5),
        };
    }
  };

  // Рендер карточки продукта
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
                {formatNumber(product.price)}₽
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

  // Рендер карточки мастер-класса
  const renderMasterClassCard = (masterClass, index) => (
    <div key={masterClass.id} className={styles.ratingCard}>
      <div className={styles.rankBadge}>
        <span className={styles.rankNumber}>{index + 1}</span>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardImage}>
          {masterClass.image ? (
            <img src={masterClass.image} alt={masterClass.title} />
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

  // Рендер карточки креатора
  const renderCreatorCard = (creator, index) => (
    <div key={creator.id} className={styles.ratingCard}>
      <div className={styles.rankBadge}>
        <span className={styles.rankNumber}>{index + 1}</span>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardImage}>
          {creator.avatar ? (
            <img src={creator.avatar} alt={creator.name} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <UserIcon className={styles.avatarIcon} />
            </div>
          )}
        </div>
        <div className={styles.cardInfo}>
          <h3 className={styles.cardTitle}>{creator.name}</h3>
          <div className={styles.cardMeta}>
            <div className={styles.cardRating}>
              {renderRatingStars(creator.rating)}
              <span className={styles.ratingValue}>{creator.rating}</span>
            </div>
            <div className={styles.creatorCategory}>
              <SparklesIcon className={styles.categoryIcon} />
              <span>{creator.category}</span>
            </div>
          </div>
          <div className={styles.cardStats}>
            <div className={styles.statItem}>
              <VideoCameraIcon className={styles.statIcon} />
              <span>{creator.masterClassesCount} мастер-классов</span>
            </div>
            <div className={styles.statItem}>
              <ArrowTrendingUpIcon className={styles.statIcon} />
              <span>{formatNumber(creator.totalSales)} продаж</span>
            </div>
            <div className={styles.statItem}>
              <UserGroupIcon className={styles.statIcon} />
              <span>{formatNumber(creator.followers)} подписчиков</span>
            </div>
          </div>
          <div className={styles.cardFooter}>
            <Link to={`/creator/${creator.id}`} className={styles.viewButton}>
              Профиль
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const currentData = getCurrentData();

  return (
    <div className={styles.container}>
      {/* Шапка страницы */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <div>
              <h1 className={styles.title}>Рейтинг</h1>
              <p className={styles.subtitle}>
                Лучшие товары, мастер-классы и авторы платформы
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры */}
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

        <div className={styles.timeFilter}>
          <div className={styles.timeFilterLabel}>
            <CalendarDaysIcon className={styles.timeIcon} />
            <span>Период:</span>
          </div>
          <div className={styles.timeButtons}>
            {timePeriods.map((period) => (
              <button
                key={period.id}
                className={`${styles.timeButton} ${
                  timePeriod === period.id ? styles.active : ""
                }`}
                onClick={() => setTimePeriod(period.id)}
              >
                {period.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className={styles.content}>
        {activeCategory === "all" ? (
          // Показываем все категории
          <div className={styles.allCategories}>
            {/* Топ товаров */}
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
                  renderProductCard(product, index)
                )}
              </div>
            </div>

            {/* Топ мастер-классов */}
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
                  renderMasterClassCard(masterClass, index)
                )}
              </div>
            </div>

            {/* Топ креаторов */}
            <div className={styles.categorySection}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>
                  <UserIcon className={styles.sectionIcon} />
                  <h2>Топ авторов</h2>
                </div>
                <Link to="/creators" className={styles.seeAllLink}>
                  Все авторы →
                </Link>
              </div>
              <div className={styles.ratingList}>
                {currentData.creators.map((creator, index) =>
                  renderCreatorCard(creator, index)
                )}
              </div>
            </div>
          </div>
        ) : (
          // Показываем выбранную категорию
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
                  renderProductCard(product, index)
                )}
              {activeCategory === "masterclasses" &&
                currentData.map((masterClass, index) =>
                  renderMasterClassCard(masterClass, index)
                )}
              {activeCategory === "creators" &&
                currentData.map((creator, index) =>
                  renderCreatorCard(creator, index)
                )}
            </div>
          </div>
        )}
      </div>

      {/* Информация о рейтинге */}
      <div className={styles.infoSection}>
        <div className={styles.infoCard}>
          <FireIcon className={styles.infoIcon} />
          <div className={styles.infoContent}>
            <h3 className={styles.infoTitle}>Как считается рейтинг?</h3>
            <p className={styles.infoText}>
              Рейтинг формируется на основе множества факторов: количество
              продаж, отзывы пользователей, просмотры, активность авторов и
              другие показатели качества.
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

const UserGroupIcon = ({ className }) => (
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
      d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.25 0 2.25 2.25 0 0 1 4.25 0Zm-13.5 0a2.25 2.25 0 1 1-4.25 0 2.25 2.25 0 0 1 4.25 0Z"
    />
  </svg>
);

export default Rating;
