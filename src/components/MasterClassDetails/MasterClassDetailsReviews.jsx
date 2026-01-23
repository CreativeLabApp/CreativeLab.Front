import React from "react";
import { UserIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import styles from "./MasterClassDetailsReviews.module.css";

function MasterClassDetailsReviews({ masterClass }) {
  const reviews = masterClass.reviews || [];

  if (reviews.length === 0) {
    return null;
  }

  const renderRatingStars = (rating) => {
    return (
      <div className={styles.reviewRatingStars}>
        {[...Array(5)].map((_, i) => {
          if (i < rating) {
            return <StarIconSolid key={i} className={styles.reviewStarIcon} />;
          } else {
            return (
              <StarIconSolid
                key={i}
                className={`${styles.reviewStarIcon} ${styles.empty}`}
              />
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className={styles.reviewsSection}>
      <h3 className={styles.sectionTitle}>Отзывы пользователей</h3>
      <div className={styles.reviewsList}>
        {reviews.map((review, index) => (
          <div key={index} className={styles.reviewItem}>
            <div className={styles.reviewHeader}>
              <div className={styles.reviewAuthor}>
                <UserIcon className={styles.reviewAuthorIcon} />
                <div>
                  <div className={styles.reviewAuthorName}>
                    {review.userName}
                  </div>
                  <div className={styles.reviewDate}>{review.date}</div>
                </div>
              </div>
              <div className={styles.reviewRating}>
                {renderRatingStars(review.rating)}
              </div>
            </div>
            {review.comment && (
              <div className={styles.reviewComment}>{review.comment}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MasterClassDetailsReviews;
