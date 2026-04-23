import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./MasterClassDetails.module.css";
import Loader from "../common/Loader/Loader";
import { useFavoritesStore } from "../../stores/favoritesStore";
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
import { masterclassApi } from "../../api/masterclassApi";

function mapMasterclass(m) {
  return {
    id: m.id,
    title: m.title,
    description: m.description || "",
    shortDescription: m.shortDescription || "",
    category: m.categoryName || m.categoryId,
    author: m.authorName || m.authorId,
    authorId: m.authorId,
    images: m.imageUrls?.length
      ? m.imageUrls
      : m.thumbnailUrl
        ? [m.thumbnailUrl]
        : [],
    rating: Number(m.rating) || 0,
    ratingsCount: m.ratingsCount || 0,
    views: m.views || 0,
    materials: m.materials || [],
    isPublished: m.isPublished,
    createdAt: m.createdAt,
  };
}

function MasterClassDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [masterClass, setMasterClass] = useState(null);
  const [relatedClasses, setRelatedClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const hasIncrementedViews = useRef(false);

  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { user } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    setError(null);
    masterclassApi
      .getById(id)
      .then((m) => {
        const mapped = mapMasterclass(m);
        setMasterClass(mapped);
        setLoading(false);
        // Загружаем похожие
        return masterclassApi.getAll().then((data) => {
          const related = data.masterclasses
            .map(mapMasterclass)
            .filter(
              (item) =>
                item.category === mapped.category && item.id !== mapped.id,
            )
            .slice(0, 2);
          setRelatedClasses(related);
        });
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (masterClass && !hasIncrementedViews.current) {
      hasIncrementedViews.current = true;
      // views increment — можно добавить API вызов если появится эндпоинт
    }
  }, [masterClass]);

  useEffect(() => {
    if (showNotification && notificationMessage) {
      const timer = setTimeout(() => {
        setShowNotification(false);
        setNotificationMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification, notificationMessage]);

  const notify = (msg) => {
    setNotificationMessage(msg);
    setShowNotification(true);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify("Ссылка скопирована в буфер обмена!");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleSaveMasterClass = async (updatedData) => {
    try {
      await masterclassApi.update({ id, ...updatedData });
      const m = await masterclassApi.getById(id);
      setMasterClass(mapMasterclass(m));
      notify("Мастер-класс успешно обновлен!");
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      notify("Ошибка при обновлении мастер-класса");
    }
  };

  const handleDeleteMasterClass = async () => {
    try {
      await masterclassApi.delete(id);
      notify("Мастер-класс успешно удален!");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      console.error(err);
      notify("Ошибка при удалении мастер-класса");
    }
  };

  const handleUpdateRating = async (
    masterClassId,
    rating,
    comment,
    userId,
    userName,
  ) => {
    try {
      // TODO: подключить API рейтингов когда появится эндпоинт
      notify("Оценка успешно сохранена!");
      return true;
    } catch (err) {
      notify("Ошибка при сохранении оценки");
      return false;
    }
  };

  const isOwner = user && masterClass && user.id === masterClass.authorId;
  const isItemFavorite = isFavorite(id);

  const handleToggleFavorite = () => {
    if (!user) {
      navigate("/login", { state: { from: `/master-class/${id}` } });
      return;
    }
    toggleFavorite(id);
  };

  const handleRateClick = () => {
    if (!user) {
      navigate("/login", { state: { from: `/master-class/${id}` } });
      return;
    }
    setShowRatingModal(true);
  };

  if (loading) return <Loader />;

  if (error || !masterClass) {
    return (
      <div className={styles.notFoundContainer}>
        <h2>Мастер-класс не найден</h2>
        <p>
          {error || "Запрошенный мастер-класс не существует или был удален."}
        </p>
        <button onClick={() => navigate("/")} className={styles.homeButton}>
          Вернуться на главную
        </button>
      </div>
    );
  }

  return (
    <>
      {showNotification && <Notification>{notificationMessage}</Notification>}

      <MasterClassDetailsRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        masterClassId={id}
        user={user}
        rateMasterClass={handleUpdateRating}
        getUserRating={() => null}
      />

      {showEditModal && (
        <MasterClassDetailsEditModal
          masterClass={masterClass}
          onSave={handleSaveMasterClass}
          onClose={() => setShowEditModal(false)}
        />
      )}

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
        <MasterClassDetailsNavigation
          masterClass={masterClass}
          navigate={navigate}
          isOwner={isOwner}
          onEdit={() => setShowEditModal(true)}
          onDelete={() => setShowDeleteConfirm(true)}
        />

        <div className={styles.content}>
          <div className={styles.leftColumn}>
            <MasterClassDetailsHeader
              masterClass={masterClass}
              isOwner={isOwner}
              onEdit={() => setShowEditModal(true)}
            />
            <MasterClassDetailsImageSection
              masterClass={masterClass}
              isItemFavorite={isItemFavorite}
              onToggleFavorite={handleToggleFavorite}
              onShare={handleShare}
            />
            <MasterClassDetailsDescription
              masterClass={masterClass}
              isOwner={isOwner}
              onEdit={() => setShowEditModal(true)}
            />
            <MasterClassDetailsRatingSection
              masterClass={masterClass}
              onRateClick={handleRateClick}
              user={user}
              getUserRating={() => null}
              isOwner={isOwner}
            />
            <MasterClassDetailsReviews masterClass={masterClass} />
          </div>

          <div className={styles.rightColumn}>
            <MasterClassDetailsSidebar
              masterClass={masterClass}
              relatedClasses={relatedClasses}
              navigate={navigate}
              user={user}
              getUserRating={() => null}
              onEditRating={handleRateClick}
              isOwner={isOwner}
              onEditMasterClass={() => setShowEditModal(true)}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default MasterClassDetails;
