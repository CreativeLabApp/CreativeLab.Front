import React from "react";
import { useNavigate } from "react-router-dom";
import { useMarketplaceStore } from "../../stores/marketplaceStore";
import {
  PhotoIcon,
  StarIcon,
  UserIcon,
  TagIcon,
  ShoppingCartIcon,
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
  const { addToCart, toggleWishlist, isInWishlist, cart } =
    useMarketplaceStore();

  const isInWish = isInWishlist(product.id);
  const cartItem = cart.find((item) => item.productId === product.id);
  const inCart = cartItem ? cartItem.quantity : 0;

  const handleDetailsClick = () => {
    navigate(`/marketplace/product/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product.id);
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product.id);
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
    return new Intl.NumberFormat("ru-RU").format(price) + "₽";
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
        <div className={`${styles.statusBadge} ${styles[product.status]}`}>
          {product.status === "available"
            ? "В наличии"
            : product.status === "sold"
            ? "Продано"
            : "Забронировано"}
        </div>

        {/* Кнопки действий */}
        <div className={styles.actionButtons}>
          <button
            className={styles.wishlistButton}
            onClick={handleToggleWishlist}
            aria-label={
              isInWish ? "Удалить из избранного" : "Добавить в избранное"
            }
          >
            {isInWish ? (
              <HeartIconSolid className={styles.actionIcon} />
            ) : (
              <HeartIcon className={styles.actionIcon} />
            )}
          </button>

          {product.status === "available" && (
            <button
              className={styles.cartButton}
              onClick={handleAddToCart}
              aria-label="Добавить в корзину"
            >
              <ShoppingCartIcon className={styles.actionIcon} />
              {inCart > 0 && <span className={styles.cartCount}>{inCart}</span>}
            </button>
          )}
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
            product.status !== "available" ? styles.disabled : ""
          }`}
          onClick={handleDetailsClick}
          disabled={product.status !== "available"}
        >
          {product.status === "available"
            ? "Подробнее"
            : product.status === "sold"
            ? "Продано"
            : "Забронировано"}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
