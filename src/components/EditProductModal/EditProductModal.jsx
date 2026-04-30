import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  PhotoIcon,
  TagIcon,
  CurrencyDollarIcon,
  CubeIcon,
  InformationCircleIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import styles from "./EditProductModal.module.css";

function EditProductModal({ product, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    dimensions: "",
    weight: "",
    status: "available",
    tags: [],
    images: [],
  });

  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Инициализация формы данными продукта
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        price: product.price || "",
        originalPrice: product.originalPrice || "",
        category: product.category || "",
        dimensions: product.dimensions || "",
        weight: product.weight || "",
        status: product.status || "available",
        tags: Array.isArray(product.tags) ? [...product.tags] : [],
        images: Array.isArray(product.images) ? [...product.images] : [],
      });
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Загрузка изображений через файлы
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (formData.images.length + files.length > 10) {
      setErrors((prev) => ({
        ...prev,
        images: "Максимум 10 изображений",
      }));
      return;
    }

    const validFiles = files.filter(
      (file) => file.size <= 5 * 1024 * 1024 && file.type.match("image.*")
    );

    const readers = validFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((images) => {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...images],
      }));

      if (errors.images) {
        setErrors((prev) => ({
          ...prev,
          images: "",
        }));
      }
    });
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

    if (currentImageIndex >= index && currentImageIndex > 0) {
      setCurrentImageIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleMoveImage = (fromIndex, toIndex) => {
    const newImages = [...formData.images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);

    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      if (formData.tags.length >= 5) {
        setErrors((prev) => ({
          ...prev,
          tags: "Максимум 5 тегов",
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");

      if (errors.tags) {
        setErrors((prev) => ({ ...prev, tags: "" }));
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e, action) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Название обязательно";
    } else if (formData.title.length > 100) {
      newErrors.title = "Название не должно превышать 100 символов";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Описание обязательно";
    } else if (formData.description.length < 10) {
      newErrors.description = "Описание должно быть не менее 10 символов";
    }

    if (
      !formData.price ||
      isNaN(formData.price) ||
      parseFloat(formData.price) <= 0
    ) {
      newErrors.price = "Укажите корректную цену";
    }

    if (
      formData.originalPrice &&
      (isNaN(formData.originalPrice) || parseFloat(formData.originalPrice) <= 0)
    ) {
      newErrors.originalPrice = "Укажите корректную цену";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Категория обязательна";
    }

    if (formData.tags.length === 0) {
      newErrors.tags = "Добавьте хотя бы один тег";
    }

    if (formData.images.length === 0) {
      newErrors.images = "Добавьте хотя бы одно изображение";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Форматируем данные для отправки
      const updatedProduct = {
        ...product,
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : null,
        updatedAt: new Date().toISOString().split("T")[0],
      };

      await onSave(updatedProduct);
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      setErrors({ submit: "Ошибка при сохранении. Попробуйте еще раз." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Заголовок модалки */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <PencilIcon className={styles.modalTitleIcon} />
            Редактирование товара
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <XMarkIcon className={styles.closeIcon} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Изображения */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <PhotoIcon className={styles.sectionIcon} />
              Изображения
            </h3>

            {/* Галерея */}
            {formData.images.length > 0 && (
              <div className={styles.imageGallery}>
                <div className={styles.mainImageContainer}>
                  <img
                    src={formData.images[currentImageIndex]}
                    alt={`Изображение ${currentImageIndex + 1}`}
                    className={styles.mainImage}
                  />

                  {formData.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentImageIndex((prev) =>
                            prev === 0 ? formData.images.length - 1 : prev - 1
                          )
                        }
                        className={styles.navButton}
                      >
                        <ChevronLeftIcon className={styles.navIcon} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentImageIndex((prev) =>
                            prev === formData.images.length - 1 ? 0 : prev + 1
                          )
                        }
                        className={`${styles.navButton} ${styles.nextButton}`}
                      >
                        <ChevronRightIcon className={styles.navIcon} />
                      </button>

                      <div className={styles.imageCounter}>
                        {currentImageIndex + 1} / {formData.images.length}
                      </div>
                    </>
                  )}
                </div>

                <div className={styles.thumbnails}>
                  {formData.images.map((image, index) => (
                    <div key={index} className={styles.thumbnailWrapper}>
                      <button
                        type="button"
                        onClick={() => setCurrentImageIndex(index)}
                        className={`${styles.thumbnailButton} ${
                          currentImageIndex === index ? styles.active : ""
                        }`}
                      >
                        <img
                          src={image}
                          alt=""
                          className={styles.thumbnailImage}
                        />
                      </button>
                      <div className={styles.thumbnailActions}>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className={styles.deleteImageButton}
                        >
                          <TrashIcon className={styles.deleteIcon} />
                        </button>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMoveImage(index, index - 1)}
                            className={styles.moveButton}
                          >
                            ↑
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.imageUploadContainer}>
              <label className={styles.imageUploadArea}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.imageInput}
                  multiple
                />
                <PhotoIcon className={styles.uploadIcon} />
                <span className={styles.uploadText}>
                  {formData.images.length === 0
                    ? "Добавить изображения"
                    : "Добавить еще изображения"}
                </span>
                <span className={styles.uploadHint}>
                  До 10 изображений, первое будет главным
                </span>
              </label>
              {errors.images && (
                <div className={styles.error}>{errors.images}</div>
              )}
            </div>
          </div>

          {/* Основная информация */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <InformationCircleIcon className={styles.sectionIcon} />
              Основная информация
            </h3>

            <div className={styles.formGrid}>
              {/* Название */}
              <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.label}>
                  Название товара *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`${styles.input} ${
                    errors.title ? styles.error : ""
                  }`}
                  placeholder="Введите название товара"
                  maxLength={100}
                />
                {errors.title && (
                  <span className={styles.errorMessage}>{errors.title}</span>
                )}
                <div className={styles.charCount}>
                  {formData.title.length}/100
                </div>
              </div>

              {/* Описание */}
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label htmlFor="description" className={styles.label}>
                  Описание *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`${styles.textarea} ${
                    errors.description ? styles.error : ""
                  }`}
                  placeholder="Опишите ваш товар подробно..."
                  rows={4}
                  maxLength={1000}
                />
                {errors.description && (
                  <span className={styles.errorMessage}>
                    {errors.description}
                  </span>
                )}
                <div className={styles.charCount}>
                  {formData.description.length}/1000
                </div>
              </div>

              {/* Категория */}
              <div className={styles.formGroup}>
                <label htmlFor="category" className={styles.label}>
                  Категория *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`${styles.select} ${
                    errors.category ? styles.error : ""
                  }`}
                >
                  <option value="">Выберите категорию</option>
                  <option value="Электроника">Электроника</option>
                  <option value="Одежда">Одежда</option>
                  <option value="Книги">Книги</option>
                  <option value="Спорт">Спорт</option>
                  <option value="Дом и сад">Дом и сад</option>
                  <option value="Авто">Авто</option>
                  <option value="Красота">Красота</option>
                  <option value="Другое">Другое</option>
                </select>
                {errors.category && (
                  <span className={styles.errorMessage}>{errors.category}</span>
                )}
              </div>

              {/* Статус */}
              <div className={styles.formGroup}>
                <label htmlFor="status" className={styles.label}>
                  Статус
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="available">В наличии</option>
                  <option value="reserved">Забронировано</option>
                  <option value="sold">Продано</option>
                </select>
              </div>
            </div>
          </div>

          {/* Цены */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <CurrencyDollarIcon className={styles.sectionIcon} />
              Цены
            </h3>

            <div className={styles.formGrid}>
              {/* Текущая цена */}
              <div className={styles.formGroup}>
                <label htmlFor="price" className={styles.label}>
                  Цена *
                </label>
                <div className={styles.priceInputContainer}>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`${styles.input} ${
                      errors.price ? styles.error : ""
                    }`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  <span className={styles.currency}>руб.</span>
                </div>
                {errors.price && (
                  <span className={styles.errorMessage}>{errors.price}</span>
                )}
              </div>

              {/* Старая цена */}
              <div className={styles.formGroup}>
                <label htmlFor="originalPrice" className={styles.label}>
                  Старая цена (скидка)
                </label>
                <div className={styles.priceInputContainer}>
                  <input
                    type="number"
                    id="originalPrice"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    className={`${styles.input} ${
                      errors.originalPrice ? styles.error : ""
                    }`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  <span className={styles.currency}>руб.</span>
                </div>
                {errors.originalPrice && (
                  <span className={styles.errorMessage}>
                    {errors.originalPrice}
                  </span>
                )}
                {formData.originalPrice && formData.price && (
                  <div className={styles.discountInfo}>
                    Скидка:{" "}
                    {Math.round(
                      (1 -
                        parseFloat(formData.price) /
                          parseFloat(formData.originalPrice)) *
                        100
                    )}
                    %
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Характеристики */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <CubeIcon className={styles.sectionIcon} />
              Характеристики
            </h3>

            <div className={styles.formGrid}>
              {/* Размеры */}
              <div className={styles.formGroup}>
                <label htmlFor="dimensions" className={styles.label}>
                  Размеры
                </label>
                <input
                  type="text"
                  id="dimensions"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Например: 20x30x40 см"
                />
              </div>

              {/* Вес */}
              <div className={styles.formGroup}>
                <label htmlFor="weight" className={styles.label}>
                  Вес
                </label>
                <div className={styles.weightInputContainer}>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                  <span className={styles.unit}>кг</span>
                </div>
              </div>
            </div>
          </div>

          {/* Теги */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <TagIcon className={styles.sectionIcon} />
              Теги
            </h3>

            <div className={styles.formGroup}>
              <div className={styles.tagInputContainer}>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleAddTag)}
                  className={styles.tagInput}
                  placeholder="Добавить тег"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className={styles.addTagButton}
                  disabled={!newTag.trim()}
                >
                  <PlusIcon className={styles.addIcon} />
                </button>
              </div>

              <div className={styles.tagsList}>
                {formData.tags.map((tag, index) => (
                  <div key={index} className={styles.tagItem}>
                    <span className={styles.tagText}>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className={styles.removeTagButton}
                    >
                      <TrashIcon className={styles.removeIcon} />
                    </button>
                  </div>
                ))}
              </div>

              {errors.tags && (
                <span className={styles.errorMessage}>{errors.tags}</span>
              )}
            </div>
          </div>

          {/* Кнопки */}
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Отмена
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
            </button>
          </div>

          {errors.submit && (
            <div className={styles.submitError}>{errors.submit}</div>
          )}
        </form>
      </div>
    </div>
  );
}

export default EditProductModal;

