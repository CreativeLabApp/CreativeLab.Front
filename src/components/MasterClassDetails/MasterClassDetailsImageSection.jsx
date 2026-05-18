import React, { useState } from "react";
import {
  PhotoIcon,
  ShareIcon,
  HeartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
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
  const videoUrl = masterClass.videoUrl;

  // Если есть видео, показываем его первым
  const mediaItems = videoUrl
    ? [
        { type: "video", url: videoUrl },
        ...images.map((url) => ({ type: "image", url })),
      ]
    : images.map((url) => ({ type: "image", url }));

  const currentItem = mediaItems[selectedImageIndex];

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? mediaItems.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === mediaItems.length - 1 ? 0 : prev + 1,
    );
  };

  const selectImage = (index) => {
    setSelectedImageIndex(index);
  };

  // Если нет изображений и видео, показываем заглушку
  if (mediaItems.length === 0) {
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
      {/* Основное изображение/видео с навигацией */}
      <div className={styles.mainImageContainer}>
        {currentItem.type === "video" ? (
          <video
            src={currentItem.url}
            className={styles.mainImage}
            controls
            autoPlay={selectedImageIndex === 0}
          />
        ) : (
          <img
            src={currentItem.url}
            alt={`${masterClass.title} - ${currentItem.type === "video" ? "видео" : "изображение"} ${selectedImageIndex + 1}`}
            className={styles.mainImage}
          />
        )}

        {/* Кнопки навигации */}
        {mediaItems.length > 1 && (
          <>
            <button
              className={styles.navButton}
              onClick={handlePrevImage}
              aria-label="Предыдущее"
            >
              <ChevronLeftIcon className={styles.navIcon} />
            </button>
            <button
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={handleNextImage}
              aria-label="Следующее"
            >
              <ChevronRightIcon className={styles.navIcon} />
            </button>
          </>
        )}

        {/* Счетчик */}
        {mediaItems.length > 1 && (
          <div className={styles.imageCounter}>
            {selectedImageIndex + 1} / {mediaItems.length}
          </div>
        )}

        {/* Индикатор видео */}
        {currentItem.type === "video" && (
          <div className={styles.videoIndicator}>
            <PlayIcon className={styles.videoIcon} />
            <span>Видео</span>
          </div>
        )}
      </div>

      {/* Миниатюры */}
      {mediaItems.length > 1 && (
        <div className={styles.thumbnails}>
          {mediaItems.map((item, index) => (
            <button
              key={index}
              className={`${styles.thumbnail} ${
                selectedImageIndex === index ? styles.active : ""
              }`}
              onClick={() => selectImage(index)}
              aria-label={`Показать ${item.type === "video" ? "видео" : "изображение"} ${index + 1}`}
            >
              {item.type === "video" ? (
                <div className={styles.thumbnailVideo}>
                  <PlayIcon className={styles.thumbnailVideoIcon} />
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={`Миниатюра ${index + 1}`}
                  className={styles.thumbnailImage}
                />
              )}
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
