import React from "react";
import { useNavigate } from "react-router-dom";
import { useFavoritesStore } from "../../stores/favoritesStore";
import { useAuthStore } from "../../stores/authStore";
import {
  PhotoIcon,
  StarIcon,
  UserIcon,
  TagIcon,
  HeartIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";
import styles from "./ProductCard.module.css";

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { toggleFavoriteProduct, isFavoriteProduct } = useFavoritesStore();
  const { user } = useAuthStore();

  const isInFavorites = isFavoriteProduct(product.id);

  const handleDetailsClick = () => {
    navigate(`/marketplace/product/${product.id}`);
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    if (user?.id) toggleFavoriteProduct(user.id, product);
  };

  const renderRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className={styles.ratingStars}>
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <StarIconSolid key={i} className={styles.starIcon} />;
          } else if (i === fullStars && hasHalfStar) {
            return (
              <StarIconSolid
                key={i}
                className={`${styles.starIcon} ${styles.halfStar}`}
              />
            );
          } else {
            return <StarIcon key={i} className={styles.starIcon} />;
          }
        })}
        <span className={styles.ratingValue}>{rating}</span>
      </div>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("be-BY").format(price) + " Br";
  };

  return (
    <div className={styles.card} onClick={handleDetailsClick}>
      {/* Верхняя часть с изображением */}
      <div className={styles.imageContainer}>
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className={styles.image}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <PhotoIcon className={styles.placeholderIcon} />
            <span className={styles.placeholderText}>{product.category}</span>
          </div>
        )}

        {/* Бейдж статуса */}
        {!product.isAvailable && (
          <div className={`${styles.statusBadge} ${styles.unavailable}`}>
            Нет в наличии
          </div>
        )}

        {/* Кнопки действий */}
        <div className={styles.actionButtons}>
          <button
            className={`${styles.favoriteButton} ${
              isInFavorites ? styles.active : ""
            }`}
            onClick={handleToggleFavorite}
            aria-label={
              isInFavorites ? "Удалить из избранного" : "Добавить в избранное"
            }
          >
            {isInFavorites ? (
              <HeartIconSolid className={styles.actionIcon} />
            ) : (
              <HeartIcon className={styles.actionIcon} />
            )}
          </button>
        </div>
      </div>

      {/* Основной контент */}
      <div className={styles.content}>
        <h3 className={styles.title}>{product.title}</h3>

        <p className={styles.description}>
          {product.description.length > 80
            ? product.description.substring(0, 80) + "..."
            : product.description}
        </p>

        {/* Продавец */}
        <div className={styles.sellerInfo}>
          <UserIcon className={styles.sellerIcon} />
          <span className={styles.sellerName}>{product.seller}</span>
        </div>

        {/* Категория и просмотры */}
        <div className={styles.metaInfo}>
          <div className={styles.categoryTag}>
            <TagIcon className={styles.categoryIcon} />
            <span>{product.category}</span>
          </div>
          <div className={styles.views}>
            <EyeIcon className={styles.viewsIcon} />
            <span>{product.views}</span>
          </div>
        </div>

        {/* Рейтинг */}
        <div className={styles.ratingContainer}>
          {renderRating(product.rating)}
        </div>

        {/* Теги */}
        {product.tags && product.tags.length > 0 && (
          <div className={styles.tags}>
            {product.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Нижняя часть с ценой и кнопкой */}
      <div className={styles.footer}>
        <div className={styles.priceSection}>
          <div className={styles.price}>{formatPrice(product.price)}</div>
          {product.dimensions && (
            <div className={styles.dimensions}>{product.dimensions}</div>
          )}
        </div>

        <button
          className={`${styles.actionButton} ${
            !product.isAvailable ? styles.disabled : ""
          }`}
          onClick={handleDetailsClick}
          disabled={!product.isAvailable}
        >
          {product.isAvailable ? "Подробнее" : "Нет в наличии"}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
