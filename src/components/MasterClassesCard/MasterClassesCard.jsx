import React from "react";
import {
  PhotoIcon,
  StarIcon,
  UserIcon,
  TagIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";
import styles from "./MasterClassesCard.module.css";
import { useNavigate } from "react-router-dom";
import { useFavoritesStore } from "../../stores/favoritesStore";

function MasterClassesCard({ item }) {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavoritesStore();

  const isItemFavorite = isFavorite(item.id);

  const handleDetailsClick = () => {
    navigate(`/master-class/${item.id}`);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(item.id);
  };

  // Форматирование рейтинга
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

  return (
    <div className={styles.card} onClick={handleDetailsClick}>
      {/* Верхняя часть с изображением */}
      <div className={styles.imageContainer}>
        {item.image ? (
          <img src={item.image} alt={item.title} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <PhotoIcon className={styles.placeholderIcon} />
            <span className={styles.placeholderText}>{item.category}</span>
          </div>
        )}

        {/* Кнопка избранного */}
        <button
          className={styles.favoriteButton}
          onClick={handleFavoriteClick}
          aria-label={
            isItemFavorite ? "Удалить из избранного" : "Добавить в избранное"
          }
        >
          {isItemFavorite ? (
            <HeartIconSolid className={styles.favoriteIcon} />
          ) : (
            <HeartIcon className={styles.favoriteIcon} />
          )}
        </button>

        {/* Бейдж категории */}
        <div className={styles.categoryBadge}>
          <TagIcon className={styles.categoryIcon} />
          <span>{item.category}</span>
        </div>

        {/* Бейдж для популярных курсов */}
        {item.views > 300 && (
          <div className={styles.popularBadge}>Популярный</div>
        )}
      </div>

      {/* Основной контент */}
      <div className={styles.content}>
        <h3 className={styles.title}>{item.title}</h3>

        <p className={styles.description}>
          {item.description ||
            "Увлекательный мастер-класс по созданию уникальных работ"}
        </p>

        {/* Автор */}
        <div className={styles.metaItem}>
          <UserIcon className={styles.metaIcon} />
          <span className={styles.metaText}>{item.author}</span>
        </div>

        {/* Рейтинг */}
        <div className={styles.ratingContainer}>
          {renderRating(item.rating)}
        </div>

        {/* Теги */}
        {item.tags && item.tags.length > 0 && (
          <div className={styles.tags}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className={styles.moreTags}>+{item.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Нижняя часть с кнопкой */}
      <div className={styles.footer}>
        <button className={styles.actionButton} onClick={handleDetailsClick}>
          Подробнее
        </button>
      </div>
    </div>
  );
}

export default MasterClassesCard;
