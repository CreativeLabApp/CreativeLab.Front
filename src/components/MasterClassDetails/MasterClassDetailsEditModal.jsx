import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  PhotoIcon,
  TagIcon,
  DocumentTextIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import styles from "./MasterClassDetailsEditModal.module.css";

function MasterClassDetailsEditModal({ masterClass, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: [],
    images: [],
  });

  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Инициализация формы данными мастер-класса
  useEffect(() => {
    if (masterClass) {
      setFormData({
        title: masterClass.title || "",
        description: masterClass.description || "",
        category: masterClass.category || "",
        tags: Array.isArray(masterClass.tags) ? [...masterClass.tags] : [],
        images: Array.isArray(masterClass.images)
          ? [...masterClass.images]
          : [],
      });
    }
  }, [masterClass]);

  const categories = [
    "Живопись",
    "Столярное дело",
    "Цифровое искусство",
    "Керамика",
    "Вязание",
    "Каллиграфия",
    "Фотография",
    "Бижутерия",
    "Декоративно-прикладное искусство",
    "Рисование",
    "Косметика",
    "Дизайн",
    "Лепка",
    "Музыка",
    "Декорирование",
    "Интерьер",
    "Рукоделие",
    "Анимация",
    "Флористика",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

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
    } else if (formData.title.length < 3) {
      newErrors.title = "Название должно быть не менее 3 символов";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Описание обязательно";
    } else if (formData.description.length < 20) {
      newErrors.description = "Описание должно быть не менее 20 символов";
    }

    if (!formData.category) {
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
      const updatedMasterClass = {
        ...masterClass,
        ...formData,
        updatedAt: new Date().toISOString().split("T")[0],
      };

      await onSave(updatedMasterClass);
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      setErrors({ submit: "Ошибка при сохранении. Попробуйте еще раз." });
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
                  className={`${styles.input} ${
                    errors.title ? styles.error : ""
                  }`}
                  placeholder="Введите название мастер-класса"
                  maxLength={100}
                />
                {errors.title && (
                  <span className={styles.errorMessage}>{errors.title}</span>
                )}
                <div className={styles.charCount}>
                  {formData.title.length}/100
                </div>
              </div>

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
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span className={styles.errorMessage}>{errors.category}</span>
                )}
              </div>
            </div>

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
                placeholder="Подробное описание мастер-класса..."
                rows={4}
                maxLength={500}
              />
              {errors.description && (
                <span className={styles.errorMessage}>
                  {errors.description}
                </span>
              )}
              <div className={styles.charCount}>
                {formData.description.length}/500
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

export default MasterClassDetailsEditModal;
