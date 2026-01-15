// components/Marketplace/ProductGallery.jsx
import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import styles from "./ProductGallery.module.css";

function ProductGallery({ images, selectedIndex, onSelect }) {
  const handlePrev = () => {
    onSelect(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
  };

  const handleNext = () => {
    onSelect(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className={styles.gallery}>
      {/* Основное изображение */}
      <div className={styles.mainImageContainer}>
        <img
          src={images[selectedIndex]}
          alt={`Товар ${selectedIndex + 1}`}
          className={styles.mainImage}
        />

        {images.length > 1 && (
          <>
            <button
              className={styles.navButton}
              onClick={handlePrev}
              aria-label="Предыдущее изображение"
            >
              <ChevronLeftIcon className={styles.navIcon} />
            </button>
            <button
              className={`${styles.navButton} ${styles.next}`}
              onClick={handleNext}
              aria-label="Следующее изображение"
            >
              <ChevronRightIcon className={styles.navIcon} />
            </button>
          </>
        )}

        <div className={styles.imageCounter}>
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* Миниатюры */}
      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((image, index) => (
            <button
              key={index}
              className={`${styles.thumbnail} ${
                selectedIndex === index ? styles.active : ""
              }`}
              onClick={() => onSelect(index)}
              aria-label={`Изображение ${index + 1}`}
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
    </div>
  );
}

export default ProductGallery;
