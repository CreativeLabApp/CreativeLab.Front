import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  UserIcon,
  StarIcon,
  TagIcon,
  PhotoIcon,
  EyeIcon,
  ShareIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";
import styles from "./MasterClassDetails.module.css";
import Loader from "../common/Loader/Loader";
import { useFavoritesStore } from "../../stores/favoritesStore";
import { useMasterClassesStore } from "../../stores/masterClassesStore";
import Notification from "../common/Notification/Notification";

function MasterClassDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { getMasterClassById, incrementViews, masterClasses } =
    useMasterClassesStore();

  // Получаем мастер-класс из хранилища
  const masterClass = getMasterClassById(parseInt(id));

  // Проверяем, является ли текущий мастер-класс избранным
  const isItemFavorite = isFavorite(parseInt(id));

  const handleToggleFavorite = () => {
    toggleFavorite(parseInt(id));
  };

  useEffect(() => {
    // Увеличиваем счетчик просмотров при загрузке страницы
    incrementViews(parseInt(id));
  }, [id, incrementViews]);

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

  const renderRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className={styles.ratingStars}>
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
        <span className={styles.ratingValue}>{rating}</span>
      </div>
    );
  };

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

      <div className={styles.container}>
        {/* Хлебные крошки и навигация */}
        <nav className={styles.navigation}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            <ArrowLeftIcon className={styles.backIcon} />
            Назад
          </button>
          <div className={styles.breadcrumbs}>
            <span onClick={() => navigate("/")} className={styles.breadcrumb}>
              Главная
            </span>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbActive}>
              {masterClass.category}
            </span>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbActive}>{masterClass.title}</span>
          </div>
        </nav>

        <div className={styles.content}>
          {/* Левая колонка */}
          <div className={styles.leftColumn}>
            {/* Заголовок и метаданные */}
            <div className={styles.header}>
              <h1 className={styles.title}>{masterClass.title}</h1>
              <div className={styles.metaInfo}>
                <div className={styles.authorInfo}>
                  <UserIcon className={styles.authorIcon} />
                  <span className={styles.authorName}>
                    {masterClass.author}
                  </span>
                </div>
                <div className={styles.categoryInfo}>
                  <TagIcon className={styles.categoryIcon} />
                  <span className={styles.categoryName}>
                    {masterClass.category}
                  </span>
                </div>
                <div className={styles.viewsInfo}>
                  <EyeIcon className={styles.viewsIcon} />
                  <span className={styles.viewsCount}>
                    {masterClass.views} просмотров
                  </span>
                </div>
              </div>
            </div>

            {/* Изображение */}
            <div className={styles.imageSection}>
              {masterClass.image ? (
                <img
                  src={masterClass.image}
                  alt={masterClass.title}
                  className={styles.mainImage}
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <PhotoIcon className={styles.placeholderIcon} />
                  <span className={styles.placeholderText}>
                    {masterClass.category}
                  </span>
                </div>
              )}

              {/* Действия с изображением */}
              <div className={styles.imageActions}>
                <button
                  onClick={handleToggleFavorite}
                  className={`${styles.imageActionButton} ${
                    isItemFavorite ? styles.active : ""
                  }`}
                  aria-label={
                    isItemFavorite
                      ? "Удалить из избранного"
                      : "Добавить в избранное"
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
                  onClick={handleShare}
                  className={styles.imageActionButton}
                  aria-label="Поделиться"
                >
                  <ShareIcon className={styles.actionIcon} />
                  <span>Поделиться</span>
                </button>
              </div>
            </div>

            {/* Рейтинг */}
            <div className={styles.ratingSection}>
              <h3 className={styles.sectionTitle}>Рейтинг и отзывы</h3>
              <div className={styles.ratingContent}>
                <div className={styles.ratingOverview}>
                  <div className={styles.ratingScore}>
                    <span className={styles.ratingNumber}>
                      {masterClass.rating}
                    </span>
                  </div>
                  {renderRating(masterClass.rating)}
                </div>
              </div>
            </div>

            {/* Описание */}
            <div className={styles.descriptionSection}>
              <h3 className={styles.sectionTitle}>Описание мастер-класса</h3>
              <p className={styles.descriptionText}>
                {masterClass.description}
              </p>
            </div>
          </div>

          {/* Правая колонка */}
          <div className={styles.rightColumn}>
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>Информация</h3>

              {/* Теги */}
              <div className={styles.tagsSection}>
                <h4 className={styles.tagsTitle}>Теги</h4>
                <div className={styles.tagsList}>
                  {masterClass.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Дополнительные действия */}
              <div className={styles.relatedSection}>
                <h4 className={styles.relatedTitle}>Похожие мастер-классы</h4>
                {relatedClasses.length > 0 ? (
                  <div className={styles.relatedList}>
                    {relatedClasses.map((item) => (
                      <div
                        key={item.id}
                        className={styles.relatedItem}
                        onClick={() => navigate(`/master-class/${item.id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            navigate(`/master-class/${item.id}`);
                          }
                        }}
                      >
                        <div className={styles.relatedImage}>
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              loading="lazy"
                            />
                          ) : (
                            <PhotoIcon
                              className={styles.relatedPlaceholderIcon}
                            />
                          )}
                        </div>
                        <div className={styles.relatedInfo}>
                          <h5 className={styles.relatedItemTitle}>
                            {item.title}
                          </h5>
                          <div className={styles.relatedMeta}>
                            <span className={styles.relatedAuthor}>
                              {item.author}
                            </span>
                            <span className={styles.relatedRating}>
                              ★ {item.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noRelatedText}>
                    Нет похожих мастер-классов
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MasterClassDetails;
