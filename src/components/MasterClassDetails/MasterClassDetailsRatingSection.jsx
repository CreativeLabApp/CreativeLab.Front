import React, { useState, useEffect } from "react";
import { PencilSquareIcon, StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import styles from "./MasterClassDetailsRatingSection.module.css";

function MasterClassDetailsRatingSection({
  masterClass,
  onRateClick,
  user,
  getUserRating,
}) {
  const [hasUserRated, setHasUserRated] = useState(false);

  // Проверяем, оценил ли пользователь уже этот мастер-класс
  useEffect(() => {
    if (user && masterClass) {
      const existingRating = getUserRating(masterClass.id, user.id);
      if (existingRating) {
        setHasUserRated(true);
      }
    }
  }, [user, masterClass, getUserRating]);

  const renderRatingStars = (rating, size = "small") => {
    const starSize =
      {
        small: "16px",
        medium: "20px",
        large: "24px",
        xlarge: "32px",
      }[size] || "20px";

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className={styles.ratingStars} style={{ "--star-size": starSize }}>
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
      </div>
    );
  };

  return (
    <div className={styles.ratingSection}>
      <div className={styles.ratingHeader}>
        <h3 className={styles.sectionTitle}>Рейтинг и отзывы</h3>
        <button onClick={onRateClick} className={styles.rateButton}>
          {hasUserRated ? (
            <>
              <PencilSquareIcon className={styles.rateIcon} />
              Изменить оценку
            </>
          ) : (
            "Оценить мастер-класс"
          )}
        </button>
      </div>

      <div className={styles.ratingContent}>
        <div className={styles.ratingOverview}>
          <div className={styles.ratingScore}>
            <span className={styles.ratingNumber}>
              {masterClass.rating.toFixed(1)}
            </span>
            <span className={styles.ratingOutOf}>/5</span>
          </div>
          <div className={styles.ratingDisplay}>
            {renderRatingStars(masterClass.rating)}
            <span className={styles.ratingValue}>
              {masterClass.rating.toFixed(1)}
            </span>
          </div>
          <div className={styles.ratingStats}>
            <span className={styles.ratingCount}>
              {masterClass.ratingCount || 0} оценок
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MasterClassDetailsRatingSection;
