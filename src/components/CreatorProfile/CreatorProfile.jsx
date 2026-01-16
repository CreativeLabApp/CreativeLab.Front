// pages/CreatorProfilePage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useMarketplaceStore } from "../../stores/marketplaceStore";
import { useMasterClassesStore } from "../../stores/masterClassesStore";
import {
  UserIcon,
  StarIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  PencilIcon,
  ShareIcon,
  ShoppingBagIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import MasterClassesCard from "../MasterClassesCard/MasterClassesCard";
import ProductCard from "../ProductCard/ProductCard";
import Loader from "../common/Loader/Loader";
import Notification from "../common/Notification/Notification";
import styles from "./CreatorProfile.module.css";
import creatorsData from "../../sources/creators";

function CreatorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { getProductsBySeller } = useMarketplaceStore();
  const { masterClasses } = useMasterClassesStore();

  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("masterclasses");
  const [showNotification, setShowNotification] = useState(false);

  const creatorId = parseInt(id);
  const isOwnProfile = currentUser && currentUser.id === creatorId;

  // Получаем мастер-классы этого креатора из хранилища
  const creatorMasterClasses = useMemo(() => {
    if (!creator?.name) return [];
    return masterClasses.filter((item) => {
      // Сравниваем без учета регистра и с возможными вариациями
      const creatorName = creator.name.toLowerCase().trim();
      const itemAuthor = item.author?.toLowerCase().trim();
      return itemAuthor === creatorName;
    });
  }, [masterClasses, creator]);

  // Получаем товары этого креатора
  const creatorProducts = getProductsBySeller(creatorId);

  useEffect(() => {
    const timer = setTimeout(() => {
      const foundCreator = creatorsData.find((c) => c.id === creatorId);

      if (foundCreator) {
        setCreator(foundCreator);
      } else if (isOwnProfile && currentUser) {
        // Если это профиль текущего пользователя, создаем объект из его данных
        setCreator({
          id: currentUser.id,
          name:
            currentUser.name ||
            currentUser.username ||
            currentUser.email.split("@")[0],
          email: currentUser.email,
          bio: currentUser.bio || "Расскажите о себе в настройках профиля",
          avatar: currentUser.avatar,
          rating: 4.5,
          followers: 0,
          following: 0,
          location: currentUser.location || "Не указано",
          website: "",
          joined: new Date().toISOString().split("T")[0],
          specialization: [],
          social: {},
          stats: {
            masterClasses: 0,
            products: 0,
            students: 0,
            sales: 0,
          },
          isVerified: false,
        });
      }

      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [id, isOwnProfile, currentUser, creatorId]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setShowNotification(true);
  };

  const handleContact = () => {
    // В реальном приложении здесь будет открытие формы сообщения
    alert(`Связь с ${creator?.name}`);
  };

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

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("ru-RU", options);
  };

  if (loading) {
    return <Loader />;
  }

  if (!creator) {
    return (
      <div className={styles.notFoundContainer}>
        <h2>Профиль не найден</h2>
        <p>Запрошенный профиль не существует или был удален.</p>
        <button onClick={() => navigate("/")} className={styles.homeButton}>
          Вернуться на главную
        </button>
      </div>
    );
  }

  return (
    <>
      {showNotification && (
        <Notification>Ссылка сохранена в буфер обмена!</Notification>
      )}

      <div className={styles.wrapper}>
        <div className={styles.container}>
          {/* Шапка профиля */}
          <div className={styles.profileHeader}>
            <div className={styles.profileInfo}>
              {isOwnProfile ? (
                <Link to="/profile/edit" className={styles.editProfileButton}>
                  <PencilIcon className={styles.editIcon} />
                  Редактировать
                </Link>
              ) : (
                <div className={styles.profileActions}>
                  <button
                    className={styles.messageButton}
                    onClick={handleContact}
                  >
                    <EnvelopeIcon className={styles.messageIcon} />
                    Написать
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.profileDetails}>
            <div className={styles.nameSection}>
              <h1 className={styles.name}>{creator.name}</h1>
            </div>

            <div className={styles.ratingSection}>
              {renderRating(creator.rating)}
              <span className={styles.ratingText}>
                Рейтинг на основе отзывов учеников
              </span>
            </div>

            <p className={styles.bio}>{creator.bio}</p>

            <div className={styles.metaInfo}>
              <div className={styles.metaItem}>
                <CalendarDaysIcon className={styles.metaIcon} />
                <span>На сайте с {formatDate(creator.joined)}</span>
              </div>
            </div>

            {/* Кнопка поделиться */}
            <button className={styles.shareProfileButton} onClick={handleShare}>
              <ShareIcon className={styles.shareIcon} />
              Поделиться профилем
            </button>
          </div>
        </div>

        {/* Навигация по контенту */}
        <div className={styles.contentNavigation}>
          <button
            className={`${styles.navButton} ${
              activeTab === "masterclasses" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("masterclasses")}
          >
            <VideoCameraIcon className={styles.navIcon} />
            Мастер-классы
            <span className={styles.navCount}>
              {creatorMasterClasses.length}
            </span>
          </button>
          <button
            className={`${styles.navButton} ${
              activeTab === "products" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("products")}
          >
            <ShoppingBagIcon className={styles.navIcon} />
            Товары
            <span className={styles.navCount}>{creatorProducts.length}</span>
          </button>
        </div>

        {/* Контент */}
        <div className={styles.contentSection}>
          {activeTab === "masterclasses" ? (
            creatorMasterClasses.length > 0 ? (
              <div className={styles.masterClassesGrid}>
                {creatorMasterClasses.map((item) => (
                  <MasterClassesCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <VideoCameraIcon className={styles.emptyIcon} />
                <h3>Пока нет мастер-классов</h3>
                <p>
                  {isOwnProfile
                    ? "Создайте свой первый мастер-класс и поделитесь знаниями!"
                    : `${creator.name} пока не создал мастер-классы`}
                </p>
                {isOwnProfile && (
                  <Link
                    to="/create-masterclass"
                    className={styles.createButton}
                  >
                    Создать мастер-класс
                  </Link>
                )}
              </div>
            )
          ) : creatorProducts.length > 0 ? (
            <div className={styles.productsGrid}>
              {creatorProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <ShoppingBagIcon className={styles.emptyIcon} />
              <h3>Пока нет товаров</h3>
              <p>
                {isOwnProfile
                  ? "Добавьте свои товары для продажи в маркетплейсе!"
                  : `${creator.name} пока не добавил товары`}
              </p>
              {isOwnProfile && (
                <Link
                  to="/marketplace/add-product"
                  className={styles.createButton}
                >
                  Добавить товар
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Если это не ваш профиль, показываем похожих креаторов */}
        {!isOwnProfile && creatorsData.length > 1 && (
          <div className={styles.similarCreators}>
            <h3 className={styles.similarTitle}>Похожие авторы</h3>
            <div className={styles.creatorsList}>
              {creatorsData
                .filter(
                  (c) =>
                    c.id !== creator.id &&
                    c.specialization?.some((skill) =>
                      creator.specialization?.includes(skill)
                    )
                )
                .slice(0, 3)
                .map((similarCreator) => {
                  // Получаем реальное количество мастер-классов для похожего автора
                  const similarMasterClasses = masterClasses.filter((item) => {
                    const creatorName = similarCreator.name
                      .toLowerCase()
                      .trim();
                    const itemAuthor = item.author?.toLowerCase().trim();
                    return itemAuthor === creatorName;
                  });

                  return (
                    <div
                      key={similarCreator.id}
                      className={styles.creatorCard}
                      onClick={() => navigate(`/creator/${similarCreator.id}`)}
                    >
                      <div className={styles.creatorAvatar}>
                        {similarCreator.avatar ? (
                          <img
                            src={similarCreator.avatar}
                            alt={similarCreator.name}
                          />
                        ) : (
                          <UserIcon className={styles.creatorAvatarIcon} />
                        )}
                      </div>
                      <div className={styles.creatorInfo}>
                        <h4 className={styles.creatorName}>
                          {similarCreator.name}
                        </h4>
                        {similarCreator.specialization && (
                          <div className={styles.creatorSpecialization}>
                            {similarCreator.specialization
                              .slice(0, 2)
                              .map((skill) => (
                                <span
                                  key={skill}
                                  className={styles.creatorSkill}
                                >
                                  {skill}
                                </span>
                              ))}
                          </div>
                        )}
                        <div className={styles.creatorStats}>
                          <span>
                            {similarMasterClasses.length} мастер-классов
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CreatorProfile;
