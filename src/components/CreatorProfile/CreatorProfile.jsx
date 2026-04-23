import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useMarketplaceStore } from "../../stores/marketplaceStore";
import { masterclassApi } from "../../api/masterclassApi";
import { userApi } from "../../api/userApi";
import {
  EnvelopeIcon,
  CalendarDaysIcon,
  PencilIcon,
  ShareIcon,
  ShoppingBagIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import MasterClassesCard from "../MasterClassesCard/MasterClassesCard";
import ProductCard from "../ProductCard/ProductCard";
import Loader from "../common/Loader/Loader";
import Notification from "../common/Notification/Notification";
import styles from "./CreatorProfile.module.css";

function CreatorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { getProductsBySeller } = useMarketplaceStore();

  const [creator, setCreator] = useState(null);
  const [allMasterClasses, setAllMasterClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("masterclasses");
  const [showNotification, setShowNotification] = useState(false);

  const isOwnProfile = currentUser && currentUser.id === id;

  // Загружаем пользователя с сервера
  useEffect(() => {
    setLoading(true);
    setError(null);
    userApi
      .getById(id)
      .then((data) => {
        setCreator(data);
        setLoading(false);
      })
      .catch((err) => {
        // Если это собственный профиль и сервер не нашёл — показываем данные из store
        if (isOwnProfile && currentUser) {
          setCreator({
            id: currentUser.id,
            name: currentUser.name || currentUser.email.split("@")[0],
            surname: currentUser.surname || "",
            email: currentUser.email,
            createdAt: new Date().toISOString(),
            masterclassesCount: 0,
          });
          setLoading(false);
        } else {
          setError(err.message);
          setLoading(false);
        }
      });
  }, [id, isOwnProfile, currentUser]);

  // Загружаем мастер-классы автора (все — для своего профиля, только опубликованные — для чужого)
  useEffect(() => {
    if (!id) return;
    const onlyPublished = !isOwnProfile;
    masterclassApi
      .getByAuthor(id, onlyPublished)
      .then((data) => {
        const mapped = data.masterclasses.map((m) => ({
          id: m.id,
          title: m.title,
          description: m.shortDescription || m.description || "",
          category: m.categoryName || m.categoryId,
          author: m.authorName || m.authorId,
          authorId: m.authorId,
          images: m.imageUrls?.length
            ? m.imageUrls
            : m.thumbnailUrl
              ? [m.thumbnailUrl]
              : [],
          rating: Number(m.rating) || 0,
          views: m.views || 0,
          materials: m.materials || [],
          isPublished: m.isPublished,
        }));
        setAllMasterClasses(mapped);
      })
      .catch(() => {});
  }, [id, isOwnProfile]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => setShowNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  // Мастер-классы уже отфильтрованы по автору на сервере
  const creatorMasterClasses = allMasterClasses;

  const creatorProducts = getProductsBySeller(id);

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setShowNotification(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) return <Loader />;

  if (error || !creator) {
    return (
      <div className={styles.notFoundContainer}>
        <h2>Профиль не найден</h2>
        <p>{error || "Запрошенный профиль не существует или был удален."}</p>
        <button onClick={() => navigate("/")} className={styles.homeButton}>
          Вернуться на главную
        </button>
      </div>
    );
  }

  const fullName = `${creator.name} ${creator.surname || ""}`.trim();

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
                    onClick={() => alert(`Связь с ${fullName}`)}
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
              <h1 className={styles.name}>{fullName}</h1>
            </div>

            <div className={styles.metaInfo}>
              <div className={styles.metaItem}>
                <EnvelopeIcon className={styles.metaIcon} />
                <span>{creator.email}</span>
              </div>
              <div className={styles.metaItem}>
                <CalendarDaysIcon className={styles.metaIcon} />
                <span>На сайте с {formatDate(creator.createdAt)}</span>
              </div>
              <div className={styles.metaItem}>
                <VideoCameraIcon className={styles.metaIcon} />
                <span>
                  {creator.masterclassesCount ?? creatorMasterClasses.length}{" "}
                  мастер-классов
                </span>
              </div>
            </div>

            <button className={styles.shareProfileButton} onClick={handleShare}>
              <ShareIcon className={styles.shareIcon} />
              Поделиться профилем
            </button>
          </div>
        </div>

        {/* Навигация по контенту */}
        <div className={styles.contentNavigation}>
          <button
            className={`${styles.navButton} ${activeTab === "masterclasses" ? styles.active : ""}`}
            onClick={() => setActiveTab("masterclasses")}
          >
            <VideoCameraIcon className={styles.navIcon} />
            Мастер-классы
            <span className={styles.navCount}>
              {creatorMasterClasses.length}
            </span>
          </button>
          <button
            className={`${styles.navButton} ${activeTab === "products" ? styles.active : ""}`}
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
                  <div key={item.id} className={styles.cardWrapper}>
                    {isOwnProfile && !item.isPublished && (
                      <div className={styles.unpublishedBadge}>
                        Не опубликован
                      </div>
                    )}
                    <MasterClassesCard item={item} />
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <VideoCameraIcon className={styles.emptyIcon} />
                <h3>Пока нет мастер-классов</h3>
                <p>
                  {isOwnProfile
                    ? "Создайте свой первый мастер-класс и поделитесь знаниями!"
                    : `${fullName} пока не создал мастер-классы`}
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
                  : `${fullName} пока не добавил товары`}
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
      </div>
    </>
  );
}

export default CreatorProfile;
