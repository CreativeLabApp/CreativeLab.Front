import React, { useState } from "react";
import {
  PhotoIcon,
  ShareIcon,
  HeartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import styles from "./MasterClassDetailsImageSection.module.css";

function MasterClassDetailsImageSection({
  masterClass,
  isItemFavorite,
  onToggleFavorite,
  onShare,
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const images = masterClass.images || [];

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const selectImage = (index) => {
    setSelectedImageIndex(index);
  };

  // Если нет изображений, показываем заглушку
  if (images.length === 0) {
    return (
      <div className={styles.imageSection}>
        <div className={styles.imagePlaceholder}>
          <PhotoIcon className={styles.placeholderIcon} />
          <span className={styles.placeholderText}>{masterClass.category}</span>
        </div>

        {/* Действия с изображением */}
        <div className={styles.imageActions}>
          <button
            onClick={onToggleFavorite}
            className={`${styles.imageActionButton} ${
              isItemFavorite ? styles.active : ""
            }`}
            aria-label={
              isItemFavorite ? "Удалить из избранного" : "Добавить в избранное"
            }
          >
            {isItemFavorite ? (
              <HeartIconSolid className={styles.actionIcon} />
            ) : (
              <HeartIcon className={styles.actionIcon} />
            )}
            <span>{isItemFavorite ? "В избранном" : "В избранное"}</span>
          </button>

          <button
            onClick={onShare}
            className={styles.imageActionButton}
            aria-label="Поделиться"
          >
            <ShareIcon className={styles.actionIcon} />
            <span>Поделиться</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.imageSection}>
      {/* Основное изображение с навигацией */}
      <div className={styles.mainImageContainer}>
        <img
          src={images[selectedImageIndex]}
          alt={`${masterClass.title} - изображение ${selectedImageIndex + 1}`}
          className={styles.mainImage}
        />

        {/* Кнопки навигации */}
        {images.length > 1 && (
          <>
            <button
              className={styles.navButton}
              onClick={handlePrevImage}
              aria-label="Предыдущее изображение"
            >
              <ChevronLeftIcon className={styles.navIcon} />
            </button>
            <button
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={handleNextImage}
              aria-label="Следующее изображение"
            >
              <ChevronRightIcon className={styles.navIcon} />
            </button>
          </>
        )}

        {/* Счетчик изображений */}
        {images.length > 1 && (
          <div className={styles.imageCounter}>
            {selectedImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Миниатюры */}
      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((image, index) => (
            <button
              key={index}
              className={`${styles.thumbnail} ${
                selectedImageIndex === index ? styles.active : ""
              }`}
              onClick={() => selectImage(index)}
              aria-label={`Показать изображение ${index + 1}`}
            >
              <img
                src={image}
                alt={`Миниатюра ${index + 1}`}
                className={styles.thumbnailImage}
              />
            </button>
          ))}
        </div>
      )}

      {/* Действия с изображением */}
      <div className={styles.imageActions}>
        <button
          onClick={onToggleFavorite}
          className={`${styles.imageActionButton} ${
            isItemFavorite ? styles.active : ""
          }`}
          aria-label={
            isItemFavorite ? "Удалить из избранного" : "Добавить в избранное"
          }
        >
          {isItemFavorite ? (
            <HeartIconSolid className={styles.actionIcon} />
          ) : (
            <HeartIcon className={styles.actionIcon} />
          )}
          <span>{isItemFavorite ? "В избранном" : "В избранное"}</span>
        </button>

        <button
          onClick={onShare}
          className={styles.imageActionButton}
          aria-label="Поделиться"
        >
          <ShareIcon className={styles.actionIcon} />
          <span>Поделиться</span>
        </button>
      </div>
    </div>
  );
}

export default MasterClassDetailsImageSection;
