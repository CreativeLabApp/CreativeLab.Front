import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./MasterClassDetails.module.css";
import Loader from "../common/Loader/Loader";
import { useFavoritesStore } from "../../stores/favoritesStore";
import { useMasterClassesStore } from "../../stores/masterClassesStore";
import { useAuthStore } from "../../stores/authStore";
import Notification from "../common/Notification/Notification";
import MasterClassDetailsNavigation from "./MasterClassDetailsNavigation";
import MasterClassDetailsHeader from "./MasterClassDetailsHeader";
import MasterClassDetailsImageSection from "./MasterClassDetailsImageSection";
import MasterClassDetailsRatingSection from "./MasterClassDetailsRatingSection";
import MasterClassDetailsReviews from "./MasterClassDetailsReviews";
import MasterClassDetailsDescription from "./MasterClassDetailsDescription";
import MasterClassDetailsSidebar from "./MasterClassDetailsSidebar";
import MasterClassDetailsRatingModal from "./MasterClassDetailsRatingModal";

function MasterClassDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Добавляем ref для отслеживания уже инкрементированных просмотров
  const hasIncrementedViews = useRef(false);

  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const {
    getMasterClassById,
    incrementViews,
    masterClasses,
    rateMasterClass,
    getUserRating,
  } = useMasterClassesStore();
  const { user } = useAuthStore();

  // Получаем мастер-класс из хранилища
  const masterClass = getMasterClassById(parseInt(id));

  // Проверяем, является ли текущий мастер-класс избранным
  const isItemFavorite = isFavorite(parseInt(id));

  useEffect(() => {
    // Увеличиваем счетчик просмотров только один раз при загрузке страницы
    if (masterClass && !hasIncrementedViews.current) {
      incrementViews(parseInt(id));
      hasIncrementedViews.current = true;
    }
  }, [id, incrementViews, masterClass]);

  useEffect(() => {
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      if (!masterClass) {
        navigate("/");
      } else {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [id, masterClass, navigate]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowNotification(true);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  // Функция для получения похожих мастер-классов
  const getRelatedMasterClasses = () => {
    if (!masterClass) return [];

    return masterClasses
      .filter(
        (item) =>
          item.category === masterClass.category && item.id !== masterClass.id
      )
      .slice(0, 2);
  };

  if (loading) {
    return <Loader />;
  }

  if (!masterClass) {
    return (
      <div className={styles.notFoundContainer}>
        <h2>Мастер-класс не найден</h2>
        <p>Запрошенный мастер-класс не существует или был удален.</p>
        <button onClick={() => navigate("/")} className={styles.homeButton}>
          Вернуться на главную
        </button>
      </div>
    );
  }

  const relatedClasses = getRelatedMasterClasses();

  return (
    <>
      {/* Уведомление */}
      {showNotification && (
        <Notification>Ссылка сохранена в буфер обмена!</Notification>
      )}

      {/* Модальное окно оценки */}
      <MasterClassDetailsRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        masterClassId={parseInt(id)}
        user={user}
        rateMasterClass={rateMasterClass}
        getUserRating={getUserRating}
        setShowNotification={setShowNotification}
      />

      <div className={styles.container}>
        {/* Навигация */}
        <MasterClassDetailsNavigation
          masterClass={masterClass}
          navigate={navigate}
        />

        <div className={styles.content}>
          {/* Левая колонка */}
          <div className={styles.leftColumn}>
            {/* Заголовок и метаданные */}
            <MasterClassDetailsHeader masterClass={masterClass} />

            {/* Изображение и действия */}
            <MasterClassDetailsImageSection
              masterClass={masterClass}
              isItemFavorite={isItemFavorite}
              onToggleFavorite={() => toggleFavorite(parseInt(id))}
              onShare={handleShare}
            />
            {/* Описание */}
            <MasterClassDetailsDescription masterClass={masterClass} />

            {/* Рейтинг и отзывы */}
            <MasterClassDetailsRatingSection
              masterClass={masterClass}
              onRateClick={() => setShowRatingModal(true)}
              user={user}
              getUserRating={getUserRating}
            />

            {/* Отзывы пользователей */}
            <MasterClassDetailsReviews masterClass={masterClass} />
          </div>

          {/* Правая колонка */}
          <div className={styles.rightColumn}>
            <MasterClassDetailsSidebar
              masterClass={masterClass}
              relatedClasses={relatedClasses}
              navigate={navigate}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default MasterClassDetails;
