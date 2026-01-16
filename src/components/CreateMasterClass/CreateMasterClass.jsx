import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMasterClassesStore } from "../../stores/masterClassesStore";
import { useAuthStore } from "../../stores/authStore";
import styles from "./CreateMasterClass.module.css";
import {
  PhotoIcon,
  TagIcon,
  VideoCameraIcon,
  DocumentPlusIcon,
  XMarkIcon,
  PlusIcon,
  ExclamationTriangleIcon,
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
    views: 0,
    rating: 4.5, // Дефолтное значение
  });

  const [newTag, setNewTag] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Проверяем авторизацию при загрузке компонента
  useEffect(() => {
    if (!isAuthenticated() || !user) {
      // Если пользователь не авторизован, перенаправляем на страницу входа
      navigate("/login", { state: { from: "/create-masterclass" } });
    }
  }, [isAuthenticated, user, navigate]);

  // Получаем имя пользователя
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

    // Очищаем ошибку при изменении
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setErrors((prev) => ({
          ...prev,
          image: "Изображение должно быть меньше 5MB",
        }));
        return;
      }

      if (!file.type.match("image.*")) {
        setErrors((prev) => ({
          ...prev,
          image: "Файл должен быть изображением",
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Очищаем ошибку
      if (errors.image) {
        setErrors((prev) => ({
          ...prev,
          image: "",
        }));
      }
    }
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

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Проверяем авторизацию перед отправкой
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
      const imageUrl = imagePreview || null;
      const newId = Date.now();

      const newMasterClass = {
        id: newId,
        title: formData.title,
        author: currentAuthor,
        rating: formData.rating || 4.5,
        image: imageUrl,
        category: formData.category,
        description: formData.description,
        tags: formData.tags,
        views: formData.views || 0,
        createdAt: new Date().toISOString(),
        userId: user.id || null,
        userEmail: user.email || null,
      };

      addMasterClass(newMasterClass);

      // Показываем сообщение об успехе
      alert("Мастер-класс успешно создан!");

      // Перенаправляем на страницу созданного мастер-класса
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
      views: 0,
      rating: 4.5,
    });
    setImagePreview(null);
    setNewTag("");
    setErrors({});
  };

  // Если пользователь не авторизован, показываем сообщение
  if (!isAuthenticated() || !user) {
    return (
      <div className={styles.container}>
        <div className={styles.notAuthorized}>
          <ExclamationTriangleIcon className={styles.warningIcon} />
          <h2 className={styles.warningTitle}>Требуется авторизация</h2>
          <p className={styles.warningText}>
            Для создания мастер-класса необходимо войти в систему.
          </p>
          <button
            onClick={() =>
              navigate("/login", { state: { from: "/create-masterclass" } })
            }
            className={styles.loginButton}
          >
            Войти в систему
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <VideoCameraIcon className={styles.headerIcon} />
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
            {/* Изображение */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <PhotoIcon className={styles.sectionIcon} />
                Изображение мастер-класса
              </h3>
              <div className={styles.imageUploadContainer}>
                {imagePreview ? (
                  <div className={styles.imagePreviewWrapper}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className={styles.imagePreview}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                      }}
                      className={styles.removeImageButton}
                      aria-label="Удалить изображение"
                    >
                      <XMarkIcon className={styles.removeIcon} />
                    </button>
                  </div>
                ) : (
                  <label className={styles.imageUploadArea}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className={styles.imageInput}
                    />
                    <PhotoIcon className={styles.uploadIcon} />
                    <span className={styles.uploadText}>
                      Нажмите для загрузки изображения
                    </span>
                    <span className={styles.uploadHint}>
                      Рекомендуемый размер: 1200×800px
                    </span>
                  </label>
                )}
                {errors.image && (
                  <div className={styles.error}>{errors.image}</div>
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

            {/* Рейтинг (опционально) */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <TagIcon className={styles.sectionIcon} />
                Начальный рейтинг
              </h3>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Стартовый рейтинг: {formData.rating} ⭐
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rating: parseFloat(e.target.value),
                    }))
                  }
                  className={styles.ratingSlider}
                />
                <div className={styles.hint}>
                  Можно установить начальный рейтинг для нового мастер-класса
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

      {/* Информационная панель */}
      <div className={styles.infoPanel}>
        <h4 className={styles.infoTitle}>Советы по созданию:</h4>
        <ul className={styles.infoList}>
          <li>Придумайте четкое и понятное название</li>
          <li>Добавьте качественное изображение для привлечения внимания</li>
          <li>Подробно опишите, чему научатся участники</li>
          <li>Выберите подходящую категорию для лучшего поиска</li>
          <li>Добавьте релевантные теги</li>
          <li>
            Мастер-класс будет опубликован от вашего имени ({currentAuthor})
          </li>
        </ul>
      </div>
    </div>
  );
}

export default CreateMasterClass;
