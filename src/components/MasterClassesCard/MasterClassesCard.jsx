import React, { useState } from "react";
import {
  PhotoIcon,
  StarIcon,
  UserIcon,
  HeartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";
import styles from "./MasterClassesCard.module.css";
import { useNavigate } from "react-router-dom";
import { useFavoritesStore } from "../../stores/favoritesStore";
import { useAuthStore } from "../../stores/authStore";

function MasterClassesCard({ item }) {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { user } = useAuthStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isItemFavorite = isFavorite(item.id);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (user?.id) toggleFavorite(user.id, item);
  };

  const images = item.images || [];
  const hasMultipleImages = images.length > 1;

  const handleDetailsClick = () => {
    navigate(`/master-class/${item.id}`);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const selectImage = (index, e) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
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

  // Получаем текущее изображение или заглушку
  const getCurrentImage = () => {
    if (images.length > 0) {
      return images[currentImageIndex];
    }
    return null;
  };

  const currentImage = getCurrentImage();

  return (
    <div className={styles.card} onClick={handleDetailsClick}>
      {/* Верхняя часть с изображением */}
      <div className={styles.imageContainer}>
        {currentImage ? (
          <>
            <img
              src={currentImage}
              alt={`${item.title} - изображение ${currentImageIndex + 1}`}
              className={styles.image}
            />

            {/* Кнопки навигации для галереи */}
            {hasMultipleImages && (
              <>
                <button
                  className={styles.prevImageButton}
                  onClick={handlePrevImage}
                  aria-label="Предыдущее изображение"
                >
                  <ChevronLeftIcon className={styles.navIcon} />
                </button>
                <button
                  className={styles.nextImageButton}
                  onClick={handleNextImage}
                  aria-label="Следующее изображение"
                >
                  <ChevronRightIcon className={styles.navIcon} />
                </button>

                {/* Счетчик изображений */}
                <div className={styles.imageCounter}>
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}

            {/* Миниатюры для быстрого переключения */}
            {hasMultipleImages && (
              <div className={styles.cardThumbnails}>
                {images.slice(0, 3).map((image, index) => (
                  <button
                    key={index}
                    className={`${styles.cardThumbnail} ${
                      currentImageIndex === index ? styles.active : ""
                    }`}
                    onClick={(e) => selectImage(index, e)}
                    aria-label={`Показать изображение ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`Миниатюра ${index + 1}`}
                      className={styles.thumbnailImage}
                    />
                  </button>
                ))}
                {images.length > 3 && (
                  <div className={styles.moreImagesBadge}>
                    +{images.length - 3}
                  </div>
                )}
              </div>
            )}
          </>
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
