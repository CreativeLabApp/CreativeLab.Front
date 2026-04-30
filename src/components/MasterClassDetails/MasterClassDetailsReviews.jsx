import React from "react";
import { UserIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { StarIcon } from "@heroicons/react/24/outline";
import styles from "./MasterClassDetailsReviews.module.css";

function MasterClassDetailsReviews({ ratings = [] }) {
  if (ratings.length === 0) return null;

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className={styles.reviewsSection}>
      <h3 className={styles.sectionTitle}>
        Отзывы пользователей ({ratings.length})
      </h3>
      <div className={styles.reviewsList}>
        {ratings.map((r) => (
          <div key={r.userId} className={styles.reviewItem}>
            <div className={styles.reviewHeader}>
              <div className={styles.reviewAuthor}>
                <UserIcon className={styles.reviewAuthorIcon} />
                <div>
                  <div className={styles.reviewAuthorName}>{r.userName}</div>
                  <div className={styles.reviewDate}>
                    {formatDate(r.updatedAt ?? r.createdAt)}
                  </div>
                </div>
              </div>
              <div className={styles.reviewRating}>
                <div className={styles.reviewRatingStars}>
                  {[1, 2, 3, 4, 5].map((s) =>
                    s <= r.score ? (
                      <StarIconSolid
                        key={s}
                        className={styles.reviewStarIcon}
                      />
                    ) : (
                      <StarIcon
                        key={s}
                        className={`${styles.reviewStarIcon} ${styles.empty}`}
                      />
                    ),
                  )}
                </div>
                <span className={styles.reviewScore}>{r.score}/5</span>
              </div>
            </div>
            {r.comment && (
              <div className={styles.reviewComment}>{r.comment}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MasterClassDetailsReviews;
