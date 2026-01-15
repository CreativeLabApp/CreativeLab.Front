// pages/CreatorProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useMarketplaceStore } from "../../stores/marketplaceStore";
import popularClasses from "../../sources/popularClasses";
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
import styles from "./CreatorProfile.module.css";

// Моковые данные для креаторов
const creatorsData = [
  {
    id: 1,
    name: "Мария Левченко",
    email: "maria@example.com",
    bio: "Профессиональный художник-акварелист с 10-летним опытом. Провожу мастер-классы по живописи для всех уровней.",
    avatar: null,
    rating: 4.8,
    followers: 1245,
    following: 342,
    location: "Москва, Россия",
    website: "maria-art.ru",
    joined: "2020-03-15",
    specialization: ["Акварель", "Живопись", "Иллюстрация"],
    social: {
      instagram: "@maria_art",
      vk: "maria_levchenko",
      youtube: "Maria Art Studio",
    },
    stats: {
      masterClasses: 12,
      products: 8,
      students: 2341,
      sales: 156,
    },
    isVerified: true,
  },
  {
    id: 2,
    name: "Иван Козлов",
    email: "ivan@example.com",
    bio: "Мастер по дереву, создаю уникальные игрушки и предметы интерьера. Учу работать с деревом с нуля.",
    avatar: null,
    rating: 4.6,
    followers: 892,
    following: 156,
    location: "Санкт-Петербург, Россия",
    website: "woodcraft-ivan.ru",
    joined: "2021-08-22",
    specialization: ["Деревообработка", "Игрушки", "Столярное дело"],
    social: {
      instagram: "@ivan_wood",
      vk: "ivan_kozlov",
    },
    stats: {
      masterClasses: 8,
      products: 15,
      students: 1567,
      sales: 89,
    },
    isVerified: false,
  },
  {
    id: 3,
    name: "Артём Артюшевский",
    email: "ivan@example.com",
    bio: "Мастер по дереву, создаю уникальные игрушки и предметы интерьера. Учу работать с деревом с нуля.",
    avatar: null,
    rating: 4.6,
    followers: 892,
    following: 156,
    location: "Санкт-Петербург, Россия",
    website: "woodcraft-ivan.ru",
    joined: "2021-08-22",
    specialization: ["Деревообработка", "Игрушки", "Столярное дело"],
    social: {
      instagram: "@ivan_wood",
      vk: "ivan_kozlov",
    },
    stats: {
      masterClasses: 8,
      products: 15,
      sales: 89,
    },
    isVerified: false,
  },
];

function CreatorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { getProductsBySeller } = useMarketplaceStore();

  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("masterclasses");
  const [isFollowing, setIsFollowing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const isOwnProfile = currentUser && currentUser.id === parseInt(id);
  const creatorId = parseInt(id);

  useEffect(() => {
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      const foundCreator = creatorsData.find((c) => c.id === creatorId);

      if (foundCreator) {
        setCreator(foundCreator);
      } else if (isOwnProfile && currentUser) {
        setCreator({
          id: currentUser.id,
          name: currentUser.name || currentUser.email.split("@")[0],
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
  }, [id, navigate, isOwnProfile, currentUser, creatorId]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  // Получаем мастер-классы этого креатора
  const creatorMasterClasses = popularClasses.filter(
    (item) => item.author === creator?.name
  );

  // Получаем товары этого креатора
  const creatorProducts = getProductsBySeller(creatorId);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setShowNotification(true);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Профиль ${creator?.name}`,
          text: creator?.bio,
          url: window.location.href,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setShowNotification(true);
      }
    } catch (error) {
      console.error("Ошибка при попытке поделиться:", error);
    }
  };

  const handleContact = () => {};

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
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {/* Шапка профиля */}
        <div className={styles.profileHeader}>
          <div className={styles.profileInfo}>
            {isOwnProfile ? (
              <Link to="/profile/edit" className={styles.editProfileButton}>
                <PencilIcon className={styles.editIcon} />
                Редактировать профиль
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

          <div className={styles.profileDetails}>
            <div className={styles.nameSection}>
              <h1 className={styles.name}>{creator.name}</h1>
              {creator.isVerified && (
                <span className={styles.verifiedText}>Проверенный автор</span>
              )}
            </div>

            <div className={styles.ratingSection}>
              {renderRating(creator.rating)}
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
          <span className={styles.navCount}>{creatorMasterClasses.length}</span>
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
                <Link to="/create-masterclass" className={styles.createButton}>
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
                  c.specialization.some((skill) =>
                    creator.specialization.includes(skill)
                  )
              )
              .slice(0, 3)
              .map((similarCreator) => (
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
                    <div className={styles.creatorSpecialization}>
                      {similarCreator.specialization
                        .slice(0, 2)
                        .map((skill) => (
                          <span key={skill} className={styles.creatorSkill}>
                            {skill}
                          </span>
                        ))}
                    </div>
                    <div className={creator.stats}>
                      <span>
                        {similarCreator.stats.masterClasses} мастер-классов
                      </span>
                      <span>·</span>
                      <span>{similarCreator.stats.products} товаров</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CreatorProfile;
