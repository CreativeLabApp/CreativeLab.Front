import { useState, useEffect } from "react";
import {
  XMarkIcon,
  PhotoIcon,
  TagIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import styles from "./MasterClassDetailsEditModal.module.css";
import { categoryApi } from "../../api/categoryApi";
import { masterclassApi } from "../../api/masterclassApi";

function MasterClassDetailsEditModal({ masterClass, onSave, onClose }) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    categoryId: "",
    // Существующие URL-ы с сервера
    existingUrls: [],
    // Новые файлы для загрузки
    newFiles: [],
    newPreviews: [],
    isPublished: true,
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Загружаем категории
  useEffect(() => {
    categoryApi
      .getAll()
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Инициализируем форму данными мастер-класса
  useEffect(() => {
    if (!masterClass) return;
    setFormData({
      title: masterClass.title || "",
      description: masterClass.description || "",
      shortDescription: masterClass.shortDescription || "",
      categoryId: masterClass.categoryId || "",
      existingUrls: Array.isArray(masterClass.images)
        ? [...masterClass.images]
        : [],
      newFiles: [],
      newPreviews: [],
      isPublished: masterClass.isPublished ?? true,
    });
  }, [masterClass]);

  // Когда категории загрузились — находим categoryId по названию если он не задан
  useEffect(() => {
    if (!categories.length || !masterClass || formData.categoryId) return;
    if (masterClass.category) {
      const found = categories.find(
        (c) => c.name.toLowerCase() === masterClass.category.toLowerCase(),
      );
      if (found) {
        setFormData((prev) => ({ ...prev, categoryId: found.id }));
      }
    }
  }, [categories, masterClass, formData.categoryId]);

  const allPreviews = [...formData.existingUrls, ...formData.newPreviews];
  const totalImages = formData.existingUrls.length + formData.newFiles.length;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (totalImages + files.length > 10) {
      setErrors((prev) => ({ ...prev, images: "Максимум 10 изображений" }));
      return;
    }

    const invalid = files.filter(
      (f) => f.size > 5 * 1024 * 1024 || !f.type.match("image.*"),
    );
    if (invalid.length) {
      setErrors((prev) => ({
        ...prev,
        images: "Некоторые файлы недопустимы (макс. 5MB)",
      }));
      return;
    }

    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          }),
      ),
    ).then((previews) => {
      setFormData((prev) => ({
        ...prev,
        newFiles: [...prev.newFiles, ...files],
        newPreviews: [...prev.newPreviews, ...previews],
      }));
      setErrors((prev) => ({ ...prev, images: "" }));
    });
  };

  const handleRemoveImage = (index) => {
    const existingCount = formData.existingUrls.length;
    if (index < existingCount) {
      // Удаляем существующий URL
      setFormData((prev) => ({
        ...prev,
        existingUrls: prev.existingUrls.filter((_, i) => i !== index),
      }));
    } else {
      // Удаляем новый файл
      const newIndex = index - existingCount;
      setFormData((prev) => ({
        ...prev,
        newFiles: prev.newFiles.filter((_, i) => i !== newIndex),
        newPreviews: prev.newPreviews.filter((_, i) => i !== newIndex),
      }));
    }
    if (currentImageIndex >= allPreviews.length - 1 && currentImageIndex > 0) {
      setCurrentImageIndex((p) => p - 1);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim() || formData.title.length < 3)
      errs.title = "Название должно быть не менее 3 символов";
    if (!formData.description.trim() || formData.description.length < 20)
      errs.description = "Описание должно быть не менее 20 символов";
    if (!formData.categoryId) errs.categoryId = "Категория обязательна";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      // Загружаем новые файлы если есть
      let uploadedUrls = [];
      if (formData.newFiles.length > 0) {
        uploadedUrls = await masterclassApi.uploadImages(formData.newFiles);
      }

      const allUrls = [...formData.existingUrls, ...uploadedUrls];

      await onSave({
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription || null,
        categoryId: formData.categoryId,
        imageUrls: allUrls,
        thumbnailUrl: allUrls[0] || null,
        isPublished: formData.isPublished,
      });
    } catch (err) {
      setErrors({ submit: err.message || "Ошибка при сохранении" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!masterClass) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <PencilIcon className={styles.modalTitleIcon} />
            Редактирование мастер-класса
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Закрыть"
          >
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

            {allPreviews.length > 0 && (
              <div className={styles.imageGallery}>
                <div className={styles.mainImageContainer}>
                  <img
                    src={allPreviews[currentImageIndex]}
                    alt={`Изображение ${currentImageIndex + 1}`}
                    className={styles.mainImage}
                  />
                  {allPreviews.length > 1 && (
                    <>
                      <button
                        type="button"
                        className={styles.navButton}
                        onClick={() =>
                          setCurrentImageIndex((p) =>
                            p === 0 ? allPreviews.length - 1 : p - 1,
                          )
                        }
                      >
                        <ChevronLeftIcon className={styles.navIcon} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.navButton} ${styles.nextButton}`}
                        onClick={() =>
                          setCurrentImageIndex((p) =>
                            p === allPreviews.length - 1 ? 0 : p + 1,
                          )
                        }
                      >
                        <ChevronRightIcon className={styles.navIcon} />
                      </button>
                      <div className={styles.imageCounter}>
                        {currentImageIndex + 1} / {allPreviews.length}
                      </div>
                    </>
                  )}
                </div>

                <div className={styles.thumbnails}>
                  {allPreviews.map((src, i) => (
                    <div key={i} className={styles.thumbnailWrapper}>
                      <button
                        type="button"
                        onClick={() => setCurrentImageIndex(i)}
                        className={`${styles.thumbnailButton} ${currentImageIndex === i ? styles.active : ""}`}
                      >
                        <img
                          src={src}
                          alt=""
                          className={styles.thumbnailImage}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className={styles.deleteImageButton}
                        aria-label="Удалить"
                      >
                        <TrashIcon className={styles.deleteIcon} />
                      </button>
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
                  multiple
                  onChange={handleImageChange}
                  className={styles.imageInput}
                />
                <PhotoIcon className={styles.uploadIcon} />
                <span className={styles.uploadText}>
                  {totalImages === 0
                    ? "Добавить изображения"
                    : `Добавить ещё (${totalImages}/10)`}
                </span>
                <span className={styles.uploadHint}>
                  До 10 изображений, макс. 5MB каждое
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
              <DocumentTextIcon className={styles.sectionIcon} />
              Основная информация
            </h3>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.label}>
                  Название *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.title ? styles.errorInput : ""}`}
                  placeholder="Название мастер-класса"
                  maxLength={100}
                />
                <div className={styles.charCount}>
                  {formData.title.length}/100
                </div>
                {errors.title && (
                  <span className={styles.errorMessage}>{errors.title}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="categoryId" className={styles.label}>
                  Категория *
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className={`${styles.select} ${errors.categoryId ? styles.errorInput : ""}`}
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <span className={styles.errorMessage}>
                    {errors.categoryId}
                  </span>
                )}
              </div>
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label htmlFor="shortDescription" className={styles.label}>
                Краткое описание
              </label>
              <input
                type="text"
                id="shortDescription"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Одна строка для превью"
                maxLength={200}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label htmlFor="description" className={styles.label}>
                Полное описание *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`${styles.textarea} ${errors.description ? styles.errorInput : ""}`}
                placeholder="Подробное описание мастер-класса..."
                rows={5}
                maxLength={2000}
              />
              <div className={styles.charCount}>
                {formData.description.length}/2000
              </div>
              {errors.description && (
                <span className={styles.errorMessage}>
                  {errors.description}
                </span>
              )}
            </div>
          </div>

          {/* Публикация */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <TagIcon className={styles.sectionIcon} />
              Настройки
            </h3>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isPublished: e.target.checked,
                  }))
                }
                className={styles.checkbox}
              />
              Опубликован
            </label>
          </div>

          {errors.submit && (
            <div className={styles.submitError}>{errors.submit}</div>
          )}

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
        </form>
      </div>
    </div>
  );
}

export default MasterClassDetailsEditModal;
