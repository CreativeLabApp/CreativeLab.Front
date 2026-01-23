import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMarketplaceStore } from "../../stores/marketplaceStore";
import { useFavoritesStore } from "../../stores/favoritesStore";
import { useAuthStore } from "../../stores/authStore";
import {
  ArrowLeftIcon,
  UserIcon,
  StarIcon,
  TagIcon,
  PhotoIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  CubeIcon,
  ScaleIcon,
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";
import styles from "./ProductDetail.module.css";
import Loader from "../common/Loader/Loader";
import ProductGallery from "../ProductGallery/ProductGallery";
import ProductCard from "../ProductCard/ProductCard";
import Notification from "../common/Notification/Notification";
import EditProductModal from "../EditProductModal/EditProductModal";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, getProductsBySeller, getPopularProducts, deleteProduct } =
    useMarketplaceStore();
  const { toggleFavoriteProduct, isFavoriteProduct } = useFavoritesStore();
  const { user } = useAuthStore(); // Получаем текущего пользователя

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showNotification1, setShowNotification1] = useState(false);
  const [showNotification2, setShowNotification2] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // Состояние модалки редактирования
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Подтверждение удаления

  // Проверяем, является ли текущий пользователь владельцем товара
  const isOwner = user && product && user.id === product.sellerId;

  // Проверяем, находится ли товар в избранном
  const isInWish = isFavoriteProduct(parseInt(id));

  useEffect(() => {
    const timer = setTimeout(() => {
      const foundProduct = products.find((item) => item.id === parseInt(id));

      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        navigate("/marketplace");
      }

      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [id, navigate, products]);

  useEffect(() => {
    if (showNotification1) {
      const timer = setTimeout(() => {
        setShowNotification1(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification1]);

  useEffect(() => {
    if (showNotification2) {
      const timer = setTimeout(() => {
        setShowNotification2(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification2]);

  const handleToggleWishlist = () => {
    toggleFavoriteProduct(parseInt(id));
    if (!isInWish) setShowNotification1(true);
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setShowNotification2(true);
  };

  // Функция для редактирования товара
  const handleEditProduct = () => {
    setShowEditModal(true);
  };

  // Функция для сохранения изменений
  const handleSaveProduct = (updatedProduct) => {
    // Здесь нужно обновить продукт в сторе
    // Например: updateProduct(updatedProduct);
    setProduct(updatedProduct);
    setShowEditModal(false);
  };

  // Функция для удаления товара
  const handleDeleteProduct = () => {
    if (product) {
      deleteProduct(product.id);
      navigate("/marketplace");
    }
  };

  const handleMessageSeller = () => {
    if (product?.sellerId) {
      navigate(`/messages?creatorId=${product.sellerId}`);
    } else {
      navigate("/messages");
    }
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat("by-BY").format(price) + " руб.";
  };

  if (loading) {
    return <Loader />;
  }

  if (!product) {
    return (
      <div className={styles.notFoundContainer}>
        <h2>Товар не найден</h2>
        <p>Запрошенный товар не существует или был удален.</p>
        <button
          onClick={() => navigate("/marketplace")}
          className={styles.homeButton}
        >
          Вернуться в магазин
        </button>
      </div>
    );
  }

  const sellerProducts = getProductsBySeller(product.sellerId).filter(
    (p) => p.id !== product.id
  );
  const popularProducts = getPopularProducts(4).filter(
    (p) => p.id !== product.id
  );

  return (
    <>
      {showNotification1 && (
        <Notification>Товар добавлен в избранное</Notification>
      )}
      {showNotification2 && (
        <Notification>Ссылка скопирована в буфер обмена</Notification>
      )}

      {/* Модалка редактирования товара */}
      {showEditModal && (
        <EditProductModal
          product={product}
          onSave={handleSaveProduct}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Подтверждение удаления */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteConfirmModal}>
            <h3>Удалить товар?</h3>
            <p>Вы уверены, что хотите удалить товар "{product.title}"?</p>
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
                onClick={handleDeleteProduct}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.container}>
        {/* Навигация с кнопками владельца */}
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
              <span className={styles.breadcrumbActive}>
                {product.category}
              </span>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbActive}>{product.title}</span>
            </div>
          </div>

          {/* Кнопки управления для владельца */}
          {isOwner && (
            <div className={styles.ownerActions}>
              <button className={styles.editButton} onClick={handleEditProduct}>
                <PencilSquareIcon className={styles.editIcon} />
                Редактировать
              </button>
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
          {/* Левая колонка - изображения */}
          <div className={styles.leftColumn}>
            <div className={styles.imageSection}>
              {product.images && product.images.length > 0 ? (
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

              {/* Статус товара с возможностью изменения для владельца */}
              <div className={styles.statusContainer}>
                <div
                  className={`${styles.statusBadge} ${styles[product.status]}`}
                >
                  {product.status === "available"
                    ? "В наличии"
                    : product.status === "sold"
                    ? "Продано"
                    : "Забронировано"}
                </div>
              </div>
            </div>
          </div>

          {/* Центральная колонка - информация о товаре */}
          <div className={styles.centerColumn}>
            <div className={styles.productInfo}>
              <div className={styles.titleSection}>
                <h1 className={styles.title}>{product.title}</h1>
              </div>

              <div className={styles.ratingSection}>
                {renderRating(product.rating)}
              </div>

              <div className={styles.priceSection}>
                <div className={styles.currentPrice}>
                  {formatPrice(product.price)}
                </div>
                {product.originalPrice && (
                  <div className={styles.originalPrice}>
                    {formatPrice(product.originalPrice)}
                  </div>
                )}
              </div>

              <div className={styles.description}>
                <div className={styles.descriptionHeader}>
                  <h3>Описание</h3>
                </div>
                <p>{product.description}</p>
              </div>

              <div className={styles.sellerInfo}>
                <h3>Продавец</h3>
                <div className={styles.sellerDetails}>
                  <UserIcon className={styles.sellerIcon} />
                  <div>
                    <div className={styles.sellerName}>{product.seller}</div>
                    <div className={styles.sellerRating}>
                      <StarIconSolid className={styles.sellerStarIcon} />
                      <span>4.9</span>
                      <span className={styles.sellerReviews}>
                        ({Math.floor(Math.random() * 50)} продаж)
                      </span>
                    </div>
                  </div>
                  <button
                    className={styles.contactSellerButton}
                    onClick={() => navigate(`/creator/${product.sellerId}`)}
                  >
                    Страница продавца
                  </button>
                </div>
              </div>

              <div className={styles.specifications}>
                <div className={styles.specificationsHeader}>
                  <h3>Характеристики</h3>
                </div>
                <div className={styles.specGrid}>
                  <div className={styles.specItem}>
                    <CubeIcon className={styles.specIcon} />
                    <div>
                      <div className={styles.specLabel}>Размеры</div>
                      <div className={styles.specValue}>
                        {product.dimensions}
                      </div>
                    </div>
                  </div>
                  <div className={styles.specItem}>
                    <ScaleIcon className={styles.specIcon} />
                    <div>
                      <div className={styles.specLabel}>Вес</div>
                      <div className={styles.specValue}>{product.weight}</div>
                    </div>
                  </div>
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
                        {product.createdAt}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Теги */}
              {product.tags && product.tags.length > 0 && (
                <div className={styles.tagsSection}>
                  <div className={styles.tagsHeader}>
                    <h3>Теги</h3>
                  </div>
                  <div className={styles.tagsList}>
                    {product.tags.map((tag, index) => (
                      <span key={index} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка */}
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
                  {product.status === "available"
                    ? "В наличии"
                    : product.status === "sold"
                    ? "Нет в наличии"
                    : "Забронировано"}
                </div>
                <div className={styles.views}>
                  <EyeIcon className={styles.viewsIcon} />
                  <span>{product.views} просмотров</span>
                </div>
              </div>
              {/* Кнопки действий */}
              <div className={styles.actionButtons}>
                {isOwner ? (
                  <div className={styles.ownerActionButtons}>
                    {product.status === "available" && (
                      <>
                        <button className={styles.markSoldButton}>
                          Отметить как проданный
                        </button>
                        <button className={styles.markReservedButton}>
                          Забронировать
                        </button>
                      </>
                    )}
                    {product.status === "sold" && (
                      <button className={styles.makeAvailableButton}>
                        Вернуть в продажу
                      </button>
                    )}
                    {product.status === "reserved" && (
                      <button className={styles.cancelReservationButton}>
                        Снять бронь
                      </button>
                    )}
                  </div>
                ) : product.status === "available" ? (
                  <button
                    className={styles.buyButton}
                    onClick={handleMessageSeller}
                  >
                    <ChatBubbleLeftRightIcon className={styles.buyIcon} />
                    Написать продавцу
                  </button>
                ) : (
                  <button className={styles.soldButton} disabled>
                    {product.status === "sold"
                      ? "Товар продан"
                      : "Товар забронирован"}
                  </button>
                )}
              </div>
              {/* Дополнительные действия */}
              <div className={styles.secondaryActions}>
                <button
                  className={`${styles.wishlistButton} ${
                    isInWish ? styles.active : ""
                  }`}
                  onClick={handleToggleWishlist}
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
        {(sellerProducts.length > 0 || popularProducts.length > 0) && (
          <div className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>Вам может понравиться</h2>

            {sellerProducts.length > 0 && (
              <div className={styles.relatedSubsection}>
                <h3 className={styles.relatedSubtitle}>
                  Другие товары от {product.seller}
                </h3>
                <div className={styles.relatedGrid}>
                  {sellerProducts.slice(0, 4).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {popularProducts.length > 0 && (
              <div className={styles.relatedSubsection}>
                <h3 className={styles.relatedSubtitle}>Популярные товары</h3>
                <div className={styles.relatedGrid}>
                  {popularProducts.slice(0, 4).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default ProductDetail;
