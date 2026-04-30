import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFavoritesStore } from "../../stores/favoritesStore";
import { useAuthStore } from "../../stores/authStore";
import {
  ArrowLeftIcon,
  UserIcon,
  TagIcon,
  PhotoIcon,
  HeartIcon,
  ShareIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  CubeIcon,
  ScaleIcon,
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  TrashIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid,
} from "@heroicons/react/24/solid";
import styles from "./ProductDetail.module.css";
import Loader from "../common/Loader/Loader";
import ProductGallery from "../ProductGallery/ProductGallery";
import ProductCard from "../ProductCard/ProductCard";
import Notification from "../common/Notification/Notification";
import { productApi } from "../../api/productApi";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleFavoriteProduct, isFavoriteProduct } = useFavoritesStore();
  const { user } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [notification, setNotification] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userScore, setUserScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [isRating, setIsRating] = useState(false);

  const isOwner = user && product && user.id === product.sellerId;
  const isInWish = isFavoriteProduct(id);

  useEffect(() => {
    setLoading(true);
    productApi
      .getById(id)
      .then((product) => {
        setProduct(product);
        setLoading(false);
        return productApi.getBySeller(product.sellerId);
      })
      .then((related) => {
        setRelatedProducts(related.filter((p) => p.id !== id).slice(0, 4));
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleToggleFavorite = () => {
    if (!user) {
      navigate("/login", { state: { from: `/marketplace/product/${id}` } });
      return;
    }
    toggleFavoriteProduct(user.id, product);
    if (!isInWish) notify("Товар добавлен в избранное");
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    notify("Ссылка скопирована в буфер обмена");
  };

  const handleRate = async (score) => {
    if (!user) {
      navigate("/login", { state: { from: `/marketplace/product/${id}` } });
      return;
    }
    setIsRating(true);
    try {
      const { rating } = await productApi.rate(id, score);
      setProduct((prev) => ({
        ...prev,
        rating,
        ratingsCount: (prev.ratingsCount || 0) + 1,
      }));
      setUserScore(score);
      notify("Оценка сохранена!");
    } catch {
      notify("Ошибка при сохранении оценки");
    } finally {
      setIsRating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await productApi.delete(id);
      navigate("/marketplace");
    } catch (err) {
      notify("Ошибка при удалении товара");
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("be-BY").format(price) + " Br";

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (loading) return <Loader />;

  if (error || !product) {
    return (
      <div className={styles.notFoundContainer}>
        <h2>Товар не найден</h2>
        <p>{error || "Запрошенный товар не существует или был удалён."}</p>
        <button
          onClick={() => navigate("/marketplace")}
          className={styles.homeButton}
        >
          Вернуться в магазин
        </button>
      </div>
    );
  }

  return (
    <>
      {notification && <Notification>{notification}</Notification>}

      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteConfirmModal}>
            <h3>Удалить товар?</h3>
            <p>Вы уверены, что хотите удалить «{product.title}»?</p>
            <p>Это действие нельзя отменить.</p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Отмена
              </button>
              <button className={styles.deleteButton} onClick={handleDelete}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.container}>
        {/* Навигация */}
        <nav className={styles.navigation}>
          <div className={styles.navigationLeft}>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
              <ArrowLeftIcon className={styles.backIcon} />
              Назад
            </button>
            <div className={styles.breadcrumbs}>
              <span onClick={() => navigate("/")} className={styles.breadcrumb}>
                Главная
              </span>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span
                onClick={() => navigate("/marketplace")}
                className={styles.breadcrumb}
              >
                Магазин
              </span>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbActive}>{product.title}</span>
            </div>
          </div>
          {isOwner && (
            <div className={styles.ownerActions}>
              <button
                className={styles.deleteProductButton}
                onClick={() => setShowDeleteConfirm(true)}
              >
                <TrashIcon className={styles.deleteIcon} />
                Удалить
              </button>
            </div>
          )}
        </nav>

        <div className={styles.content}>
          {/* Левая колонка — галерея */}
          <div className={styles.leftColumn}>
            {product.images.length > 0 ? (
              <ProductGallery
                images={product.images}
                selectedIndex={selectedImageIndex}
                onSelect={setSelectedImageIndex}
              />
            ) : (
              <div className={styles.mainImagePlaceholder}>
                <PhotoIcon className={styles.placeholderIcon} />
                <span className={styles.placeholderText}>
                  {product.category}
                </span>
              </div>
            )}
          </div>

          {/* Центральная колонка — детали */}
          <div className={styles.centerColumn}>
            <div className={styles.productInfo}>
              <h1 className={styles.title}>{product.title}</h1>

              {product.shortDescription && (
                <p className={styles.shortDesc}>{product.shortDescription}</p>
              )}

              <div className={styles.priceSection}>
                <div className={styles.currentPrice}>
                  {formatPrice(product.price)}
                </div>
                {product.discountPrice && (
                  <div className={styles.originalPrice}>
                    {formatPrice(product.discountPrice)}
                  </div>
                )}
              </div>

              <div className={styles.description}>
                <h3>Описание</h3>
                <p>{product.description}</p>
              </div>

              {/* Продавец */}
              <div className={styles.sellerInfo}>
                <h3>Продавец</h3>
                <div className={styles.sellerDetails}>
                  <UserIcon className={styles.sellerIcon} />
                  <div className={styles.sellerName}>{product.seller}</div>
                  <button
                    className={styles.contactSellerButton}
                    onClick={() => navigate(`/creator/${product.sellerId}`)}
                  >
                    Страница продавца
                  </button>
                </div>
              </div>

              {/* Характеристики */}
              <div className={styles.specifications}>
                <h3>Характеристики</h3>
                <div className={styles.specGrid}>
                  {product.dimensions && (
                    <div className={styles.specItem}>
                      <CubeIcon className={styles.specIcon} />
                      <div>
                        <div className={styles.specLabel}>Размеры</div>
                        <div className={styles.specValue}>
                          {product.dimensions}
                        </div>
                      </div>
                    </div>
                  )}
                  {product.weight && (
                    <div className={styles.specItem}>
                      <ScaleIcon className={styles.specIcon} />
                      <div>
                        <div className={styles.specLabel}>Вес</div>
                        <div className={styles.specValue}>
                          {product.weight} кг
                        </div>
                      </div>
                    </div>
                  )}
                  <div className={styles.specItem}>
                    <TagIcon className={styles.specIcon} />
                    <div>
                      <div className={styles.specLabel}>Категория</div>
                      <div className={styles.specValue}>{product.category}</div>
                    </div>
                  </div>
                  <div className={styles.specItem}>
                    <CalendarDaysIcon className={styles.specIcon} />
                    <div>
                      <div className={styles.specLabel}>Добавлено</div>
                      <div className={styles.specValue}>
                        {formatDate(product.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Рейтинг */}
              <div className={styles.ratingSection}>
                <h3>Рейтинг</h3>
                <div className={styles.ratingOverview}>
                  <span className={styles.ratingScore}>
                    {(product.rating || 0).toFixed(1)}
                  </span>
                  <div className={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map((s) =>
                      s <= Math.round(product.rating || 0) ? (
                        <StarIconSolid key={s} className={styles.starFilled} />
                      ) : (
                        <StarIcon key={s} className={styles.starEmpty} />
                      ),
                    )}
                  </div>
                  <span className={styles.ratingCount}>
                    {product.ratingsCount || 0} оценок
                  </span>
                </div>
                {!isOwner && (
                  <div className={styles.rateRow}>
                    <span className={styles.rateLabel}>Ваша оценка:</span>
                    <div className={styles.ratingStars}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          className={styles.starButton}
                          onMouseEnter={() => setHoverScore(s)}
                          onMouseLeave={() => setHoverScore(0)}
                          onClick={() => handleRate(s)}
                          disabled={isRating}
                          aria-label={`Оценить на ${s}`}
                        >
                          {s <= (hoverScore || userScore) ? (
                            <StarIconSolid className={styles.starFilled} />
                          ) : (
                            <StarIcon className={styles.starEmpty} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {product.materials.length > 0 && (
                <div className={styles.tagsSection}>
                  <h3>Материалы</h3>
                  <div className={styles.tagsList}>
                    {product.materials.map((m, i) => (
                      <span key={i} className={styles.tag}>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка — покупка */}
          <div className={styles.rightColumn}>
            <div className={styles.purchaseCard}>
              <div className={styles.purchaseHeader}>
                <CurrencyDollarIcon className={styles.purchaseIcon} />
                <h3>Купить товар</h3>
              </div>
              <div className={styles.priceDisplay}>
                <div className={styles.displayPrice}>
                  {formatPrice(product.price)}
                </div>
              </div>
              <div className={styles.stockInfo}>
                <div className={styles.stockLabel}>
                  {product.isAvailable
                    ? `В наличии: ${product.stockQuantity} шт.`
                    : "Нет в наличии"}
                </div>
              </div>

              <div className={styles.actionButtons}>
                {!isOwner && product.isAvailable && (
                  <button
                    className={styles.buyButton}
                    onClick={() =>
                      navigate(`/messages?creatorId=${product.sellerId}`)
                    }
                  >
                    <ChatBubbleLeftRightIcon className={styles.buyIcon} />
                    Написать продавцу
                  </button>
                )}
                {!isOwner && !product.isAvailable && (
                  <button className={styles.soldButton} disabled>
                    Нет в наличии
                  </button>
                )}
                {isOwner && (
                  <button
                    className={styles.editButton}
                    onClick={() => navigate(`/marketplace/edit-product/${id}`)}
                  >
                    <PencilSquareIcon className={styles.editIcon} />
                    Редактировать
                  </button>
                )}
              </div>

              <div className={styles.secondaryActions}>
                <button
                  className={`${styles.wishlistButton} ${isInWish ? styles.active : ""}`}
                  onClick={handleToggleFavorite}
                >
                  {isInWish ? (
                    <HeartIconSolid className={styles.wishlistIcon} />
                  ) : (
                    <HeartIcon className={styles.wishlistIcon} />
                  )}
                  {isInWish ? "В избранном" : "В избранное"}
                </button>
                <button className={styles.shareButton} onClick={handleShare}>
                  <ShareIcon className={styles.shareIcon} />
                  Поделиться
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Похожие товары */}
        {relatedProducts.length > 0 && (
          <div className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>
              Другие товары от {product.seller}
            </h2>
            <div className={styles.relatedGrid}>
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ProductDetail;
