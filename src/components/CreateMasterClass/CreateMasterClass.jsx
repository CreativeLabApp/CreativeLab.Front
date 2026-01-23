import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMasterClassesStore } from "../../stores/masterClassesStore";
import { useAuthStore } from "../../stores/authStore";
import styles from "./CreateMasterClass.module.css";
import {
  PhotoIcon,
  TagIcon,
  DocumentPlusIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

function CreateMasterClass() {
  const navigate = useNavigate();
  const { addMasterClass } = useMasterClassesStore();
  const { user, isAuthenticated } = useAuthStore();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: [],
    images: [], // Теперь это массив
    views: 0,
    rating: 0,
  });

  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Проверяем авторизацию при загрузке компонента
  useEffect(() => {
    if (!isAuthenticated() || !user) {
      navigate("/login", { state: { from: "/create-masterclass" } });
    }
  }, [isAuthenticated, user, navigate]);

  const currentAuthor = user?.name || "Аноним";

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
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Проверка общего количества изображений
    if (formData.images.length + files.length > 10) {
      setErrors((prev) => ({
        ...prev,
        images: "Максимум 10 изображений",
      }));
      return;
    }

    const validFiles = [];
    const invalidFiles = [];

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(`${file.name} - слишком большой размер (макс. 5MB)`);
      } else if (!file.type.match("image.*")) {
        invalidFiles.push(`${file.name} - не является изображением`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      setErrors((prev) => ({
        ...prev,
        images: invalidFiles.join(", "),
      }));
    }

    if (validFiles.length > 0) {
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

        // Устанавливаем индекс на первое добавленное изображение
        if (formData.images.length === 0) {
          setCurrentImageIndex(0);
        }

        if (errors.images) {
          setErrors((prev) => ({
            ...prev,
            images: "",
          }));
        }
      });
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

    // Корректируем текущий индекс
    if (currentImageIndex >= index && currentImageIndex > 0) {
      setCurrentImageIndex((prev) => Math.max(0, prev - 1));
    }

    if (errors.images) {
      setErrors((prev) => ({
        ...prev,
        images: "",
      }));
    }
  };

  const handleMoveImage = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    const newImages = [...formData.images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);

    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));

    // Обновляем текущий индекс если перемещаемое изображение было текущим
    if (currentImageIndex === fromIndex) {
      setCurrentImageIndex(toIndex);
    } else if (currentImageIndex > fromIndex && currentImageIndex <= toIndex) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else if (currentImageIndex < fromIndex && currentImageIndex >= toIndex) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? formData.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === formData.images.length - 1 ? 0 : prev + 1
    );
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
        setErrors((prev) => ({
          ...prev,
          tags: "",
        }));
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
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

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated() || !user) {
      alert("Для создания мастер-класса необходимо авторизоваться");
      navigate("/login", { state: { from: "/create-masterclass" } });
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const newId = Date.now();

      const newMasterClass = {
        id: newId,
        title: formData.title,
        author: currentAuthor,
        rating: formData.rating || 4.5,
        images: formData.images, // Теперь это массив
        category: formData.category,
        description: formData.description,
        tags: formData.tags,
        views: formData.views || 0,
        createdAt: new Date().toISOString(),
        userId: user.id || null,
        userEmail: user.email || null,
      };

      addMasterClass(newMasterClass);
      navigate(`/master-class/${newId}`);
    } catch (error) {
      console.error("Error creating master class:", error);
      alert("Ошибка при создании мастер-класса");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      tags: [],
      images: [],
      views: 0,
      rating: 4.5,
    });
    setNewTag("");
    setErrors({});
    setCurrentImageIndex(0);
  };

  if (!isAuthenticated() || !user) {
    return (
      <button
        onClick={() =>
          navigate("/login", { state: { from: "/create-masterclass" } })
        }
        className={styles.loginButton}
      >
        Войти в систему
      </button>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Создание мастер-класса</h1>
            <p className={styles.subtitle}>
              Поделитесь своим опытом и знаниями с другими
            </p>
          </div>
        </div>
      </div>

      {/* Информация об авторе */}
      <div className={styles.authorInfo}>
        <div>
          <div className={styles.authorLabel}>Автор:</div>
          <div className={styles.authorName}>{currentAuthor}</div>
          <div className={styles.authorEmail}>{user.email}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          {/* Левая колонка - основные данные */}
          <div className={styles.mainColumn}>
            {/* Изображения */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <PhotoIcon className={styles.sectionIcon} />
                Изображения мастер-класса
              </h3>

              {/* Галерея изображений */}
              {formData.images.length > 0 && (
                <div className={styles.imageGallery}>
                  {/* Основное изображение с навигацией */}
                  <div className={styles.mainImageContainer}>
                    <img
                      src={formData.images[currentImageIndex]}
                      alt={`Изображение ${currentImageIndex + 1}`}
                      className={styles.mainImage}
                    />

                    {/* Кнопки навигации */}
                    {formData.images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevImage}
                          className={styles.navButton}
                          aria-label="Предыдущее изображение"
                        >
                          <ChevronLeftIcon className={styles.navIcon} />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextImage}
                          className={`${styles.navButton} ${styles.nextButton}`}
                          aria-label="Следующее изображение"
                        >
                          <ChevronRightIcon className={styles.navIcon} />
                        </button>
                      </>
                    )}

                    {/* Счетчик изображений */}
                    <div className={styles.imageCounter}>
                      {currentImageIndex + 1} / {formData.images.length}
                    </div>
                  </div>

                  {/* Миниатюры */}
                  <div className={styles.thumbnails}>
                    {formData.images.map((image, index) => (
                      <div key={index} className={styles.thumbnailWrapper}>
                        <button
                          type="button"
                          onClick={() => setCurrentImageIndex(index)}
                          className={`${styles.thumbnailButton} ${
                            currentImageIndex === index ? styles.active : ""
                          }`}
                          aria-label={`Выбрать изображение ${index + 1}`}
                        >
                          <img
                            src={image}
                            alt={`Миниатюра ${index + 1}`}
                            className={styles.thumbnailImage}
                          />
                        </button>
                        <div className={styles.thumbnailActions}>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className={styles.deleteThumbnailButton}
                            aria-label={`Удалить изображение ${index + 1}`}
                          >
                            <TrashIcon className={styles.deleteIcon} />
                          </button>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImage(index, index - 1)}
                              className={styles.moveButton}
                              aria-label="Переместить влево"
                            >
                              ←
                            </button>
                          )}
                          {index < formData.images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImage(index, index + 1)}
                              className={styles.moveButton}
                              aria-label="Переместить вправо"
                            >
                              →
                            </button>
                          )}
                        </div>
                        <div className={styles.imageNumber}>{index + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Загрузка изображений */}
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
                      ? "Нажмите для загрузки изображений"
                      : `Добавить еще изображения (${formData.images.length}/10)`}
                  </span>
                  <span className={styles.uploadHint}>
                    Можно загрузить до 10 изображений. Первое будет главным
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
                <DocumentPlusIcon className={styles.sectionIcon} />
                Основная информация
              </h3>

              <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.label}>
                  Название мастер-класса *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`${styles.input} ${
                    errors.title ? styles.errorInput : ""
                  }`}
                  placeholder="Например: Акварельный пейзаж для начинающих"
                  maxLength={100}
                />
                <div className={styles.characterCount}>
                  {formData.title.length}/100 символов
                </div>
                {errors.title && (
                  <div className={styles.error}>{errors.title}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description" className={styles.label}>
                  Описание мастер-класса *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`${styles.textarea} ${
                    errors.description ? styles.errorInput : ""
                  }`}
                  placeholder="Подробно опишите, чему научатся участники мастер-класса..."
                  rows={4}
                  maxLength={500}
                />
                <div className={styles.characterCount}>
                  {formData.description.length}/500 символов
                </div>
                {errors.description && (
                  <div className={styles.error}>{errors.description}</div>
                )}
              </div>
            </div>
          </div>

          {/* Правая колонка - дополнительные данные */}
          <div className={styles.sideColumn}>
            {/* Категория */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <TagIcon className={styles.sectionIcon} />
                Категория
              </h3>
              <div className={styles.formGroup}>
                <label htmlFor="category" className={styles.label}>
                  Выберите категорию *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`${styles.select} ${
                    errors.category ? styles.errorInput : ""
                  }`}
                >
                  <option value="">Выберите категорию...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <div className={styles.error}>{errors.category}</div>
                )}
              </div>
            </div>

            {/* Теги */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <TagIcon className={styles.sectionIcon} />
                Теги (ключевые слова)
              </h3>
              <div className={styles.formGroup}>
                <div className={styles.tagInputContainer}>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={`${styles.input} ${
                      errors.tags ? styles.errorInput : ""
                    }`}
                    placeholder="Добавьте тег и нажмите Enter"
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className={styles.addTagButton}
                    aria-label="Добавить тег"
                  >
                    <PlusIcon className={styles.addIcon} />
                  </button>
                </div>
                {errors.tags && (
                  <div className={styles.error}>{errors.tags}</div>
                )}

                <div className={styles.tagsContainer}>
                  {formData.tags.map((tag, index) => (
                    <div key={index} className={styles.tagItem}>
                      <span className={styles.tagText}>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className={styles.removeTagButton}
                        aria-label={`Удалить тег ${tag}`}
                      >
                        <XMarkIcon className={styles.removeTagIcon} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className={styles.tagHint}>
                  Добавьте до 5 тегов, описывающих ваш мастер-класс
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className={styles.actionButtons}>
          <button
            type="button"
            onClick={handleReset}
            className={styles.secondaryButton}
            disabled={isSubmitting}
          >
            Очистить форму
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className={styles.cancelButton}
            disabled={isSubmitting}
          >
            Отмена
          </button>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>Создание...</>
            ) : (
              <>
                <PlusIcon className={styles.submitIcon} />
                Создать мастер-класс
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateMasterClass;
