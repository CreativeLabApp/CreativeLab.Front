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
import MasterClassDetailsEditModal from "./MasterClassDetailsEditModal";

function MasterClassDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const hasIncrementedViews = useRef(false);

  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const {
    getMasterClassById,
    incrementViews,
    masterClasses,
    rateMasterClass,
    getUserRating,
    updateMasterClass,
    deleteMasterClass,
  } = useMasterClassesStore();
  const { user } = useAuthStore();

  // Получаем мастер-класс из хранилища
  const masterClass = getMasterClassById(parseInt(id));

  // Проверяем, является ли текущий мастер-класс избранным
  const isItemFavorite = isFavorite(parseInt(id));

  // Проверяем, является ли текущий пользователь владельцем мастер-класса
  const isOwner = user && masterClass && user.id === masterClass.userId;

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
    if (showNotification && notificationMessage) {
      const timer = setTimeout(() => {
        setShowNotification(false);
        setNotificationMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification, notificationMessage]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setNotificationMessage("Ссылка скопирована в буфер обмена!");
      setShowNotification(true);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleEditMasterClass = () => {
    setShowEditModal(true);
  };

  const handleSaveMasterClass = async (updatedData) => {
    try {
      await updateMasterClass(parseInt(id), updatedData);
      setNotificationMessage("Мастер-класс успешно обновлен!");
      setShowNotification(true);
      setShowEditModal(false);
    } catch (error) {
      console.error("Ошибка при обновлении мастер-класса:", error);
      setNotificationMessage("Ошибка при обновлении мастер-класса");
      setShowNotification(true);
    }
  };

  const handleDeleteMasterClass = async () => {
    try {
      await deleteMasterClass(parseInt(id));
      setNotificationMessage("Мастер-класс успешно удален!");
      setShowNotification(true);
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("Ошибка при удалении мастер-класса:", error);
      setNotificationMessage("Ошибка при удалении мастер-класса");
      setShowNotification(true);
    }
  };

  const handleUpdateRating = async (
    masterClassId,
    rating,
    comment,
    userId,
    userName
  ) => {
    try {
      await rateMasterClass(masterClassId, rating, comment, userId, userName);
      setNotificationMessage("Оценка успешно сохранена!");
      setShowNotification(true);
      return true;
    } catch (error) {
      console.error("Ошибка при отправке оценки:", error);
      setNotificationMessage("Ошибка при сохранении оценки");
      setShowNotification(true);
      return false;
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
      {showNotification && <Notification>{notificationMessage}</Notification>}

      {/* Модальное окно оценки */}
      <MasterClassDetailsRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        masterClassId={parseInt(id)}
        user={user}
        rateMasterClass={handleUpdateRating}
        getUserRating={getUserRating}
      />

      {/* Модальное окно редактирования */}
      {showEditModal && (
        <MasterClassDetailsEditModal
          masterClass={masterClass}
          onSave={handleSaveMasterClass}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Подтверждение удаления */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteConfirmModal}>
            <h3>Удалить мастер-класс?</h3>
            <p>
              Вы уверены, что хотите удалить мастер-класс "{masterClass.title}"?
            </p>
            <p>Это действие нельзя отменить.</p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Отмена
              </button>
              <button
                className={styles.deleteButton}
                onClick={handleDeleteMasterClass}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.container}>
        {/* Навигация с кнопками владельца */}
        <MasterClassDetailsNavigation
          masterClass={masterClass}
          navigate={navigate}
          isOwner={isOwner}
          onEdit={handleEditMasterClass}
          onDelete={() => setShowDeleteConfirm(true)}
        />

        <div className={styles.content}>
          {/* Левая колонка */}
          <div className={styles.leftColumn}>
            {/* Заголовок и метаданные с возможностью редактирования */}
            <MasterClassDetailsHeader
              masterClass={masterClass}
              isOwner={isOwner}
              onEdit={handleEditMasterClass}
            />

            {/* Изображение и действия */}
            <MasterClassDetailsImageSection
              masterClass={masterClass}
              isItemFavorite={isItemFavorite}
              onToggleFavorite={() => toggleFavorite(parseInt(id))}
              onShare={handleShare}
            />

            {/* Описание с возможностью редактирования */}
            <MasterClassDetailsDescription
              masterClass={masterClass}
              isOwner={isOwner}
              onEdit={handleEditMasterClass}
            />

            {/* Рейтинг и отзывы */}
            <MasterClassDetailsRatingSection
              masterClass={masterClass}
              onRateClick={() => setShowRatingModal(true)}
              user={user}
              getUserRating={getUserRating}
              isOwner={isOwner}
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
              user={user}
              getUserRating={getUserRating}
              onEditRating={() => setShowRatingModal(true)}
              isOwner={isOwner}
              onEditMasterClass={handleEditMasterClass}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default MasterClassDetails;
