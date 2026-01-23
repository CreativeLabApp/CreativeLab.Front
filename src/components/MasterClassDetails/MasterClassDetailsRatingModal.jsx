import React, { useState, useEffect, useCallback } from "react";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { StarIcon } from "@heroicons/react/24/outline";
import styles from "./MasterClassDetailsRatingModal.module.css";

function MasterClassDetailsRatingModal({
  isOpen,
  onClose,
  masterClassId,
  user,
  rateMasterClass,
  getUserRating,
  setShowNotification,
}) {
  const [userRating, setUserRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [hasUserRated, setHasUserRated] = useState(false);

  // Проверяем существующую оценку при открытии модалки
  useEffect(() => {
    if (isOpen && user) {
      const existingRating = getUserRating(masterClassId, user.id);
      if (existingRating) {
        setHasUserRated(true);
        setUserRating(existingRating.rating);
        setRatingComment(existingRating.comment || "");
      } else {
        setUserRating(0);
        setRatingComment("");
        setHasUserRated(false);
      }
    }
  }, [isOpen, user, masterClassId, getUserRating]);

  const handleSubmitRating = async () => {
    if (!user || userRating === 0) return;

    setIsSubmittingRating(true);
    try {
      await rateMasterClass(
        masterClassId,
        userRating,
        ratingComment,
        user.id,
        user.name || user.email
      );

      setShowNotification(true);
      onClose();
    } catch (error) {
      console.error("Ошибка при отправке оценки:", error);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const renderRatingStars = (interactive = true) => {
    return (
      <div className={styles.ratingStars}>
        {[...Array(5)].map((_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= userRating;

          return (
            <button
              key={i}
              className={`${styles.starButton} ${
                interactive ? styles.interactive : ""
              }`}
              onClick={() => interactive && setUserRating(starValue)}
              disabled={!interactive}
              aria-label={`Оценить на ${starValue} звезд`}
            >
              {isFilled ? (
                <StarIconSolid className={styles.starIcon} />
              ) : (
                <StarIcon className={styles.starIcon} />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  // Добавляем обработчик клавиш при монтировании
  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  if (!isOpen) return null;

  return (
    <div className={styles.ratingModalOverlay} onClick={onClose}>
      <div className={styles.ratingModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.ratingModalHeader}>
          <h3>{hasUserRated ? "Изменить оценку" : "Оценить мастер-класс"}</h3>
          <button onClick={onClose} className={styles.closeModalButton}>
            ×
          </button>
        </div>

        <div className={styles.ratingModalContent}>
          <div className={styles.ratingInputSection}>
            <label>Ваша оценка</label>
            <div className={styles.ratingInputStars}>
              {renderRatingStars()}
              <div className={styles.ratingValueDisplay}>
                {userRating > 0 ? `${userRating} из 5` : "Выберите оценку"}
              </div>
            </div>
          </div>

          <div className={styles.ratingCommentSection}>
            <label htmlFor="ratingComment">Комментарий (необязательно)</label>
            <textarea
              id="ratingComment"
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Поделитесь вашими впечатлениями о мастер-классе..."
              rows={4}
              className={styles.ratingCommentInput}
            />
          </div>

          <div className={styles.ratingModalActions}>
            <button
              onClick={onClose}
              className={styles.cancelRatingButton}
              disabled={isSubmittingRating}
            >
              Отмена
            </button>
            <button
              onClick={handleSubmitRating}
              className={styles.submitRatingButton}
              disabled={userRating === 0 || isSubmittingRating}
            >
              {isSubmittingRating ? (
                "Отправка..."
              ) : hasUserRated ? (
                <>Обновить оценку</>
              ) : (
                "Отправить оценку"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MasterClassDetailsRatingModal;
