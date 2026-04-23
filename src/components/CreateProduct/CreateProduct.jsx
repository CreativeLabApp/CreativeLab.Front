import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMarketplaceStore } from "../../stores/marketplaceStore";
import { useAuthStore } from "../../stores/authStore";
import styles from "./CreateProduct.module.css";
import {
  PhotoIcon,
  TagIcon,
  CurrencyDollarIcon,
  CubeIcon,
  PlusIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

function CreateProduct() {
  const navigate = useNavigate();
  const { addProduct } = useMarketplaceStore();
  const { user, isAuthenticated } = useAuthStore();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    sellerId: "",
    category: "",
    images: [],
    tags: [],
    status: "available",
    materials: [],
    dimensions: "",
    weight: "",
  });

  const [newTag, setNewTag] = useState("");
  const [newMaterial, setNewMaterial] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Если пользователь авторизован, устанавливаем его как продавца по умолчанию
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        sellerId: user.id || Date.now(),
      }));
    }
  }, [user]);

  // Проверяем авторизацию при загрузке компонента
  useEffect(() => {
    if (!isAuthenticated() || !user) {
      navigate("/login", { state: { from: "/create-product" } });
    }
  }, [isAuthenticated, user, navigate]);

  const categories = [
    "Живопись",
    "Игрушки",
    "Керамика",
    "Текстиль",
    "Ароматерапия",
    "Бижутерия",
    "Канцелярия",
    "Декор",
    "Обувь",
    "Косметика",
    "Музыка",
    "Фотография",
    "Флористика",
    "Цифровое искусство",
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

    if (imagePreviews.length + files.length > 5) {
      setErrors((prev) => ({
        ...prev,
        images: "Максимум 5 изображений",
      }));
      return;
    }

    const newPreviews = [];
    const validFiles = [];

    files.forEach((file, index) => {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          images: `Изображение ${index + 1} должно быть меньше 5MB`,
        }));
        return;
      }

      if (!file.type.match("image.*")) {
        setErrors((prev) => ({
          ...prev,
          images: `Файл ${index + 1} должен быть изображением`,
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setImagePreviews((prev) => [...prev, ...newPreviews]);
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...validFiles],
          }));
        }
      };
      reader.readAsDataURL(file);
      validFiles.push(file);
    });

    if (errors.images) {
      setErrors((prev) => ({
        ...prev,
        images: "",
      }));
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImagePreviews((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
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

  const handleAddMaterial = () => {
    if (
      newMaterial.trim() &&
      !formData.materials.includes(newMaterial.trim())
    ) {
      if (formData.materials.length >= 5) {
        setErrors((prev) => ({
          ...prev,
          materials: "Максимум 5 материалов",
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        materials: [...prev.materials, newMaterial.trim()],
      }));
      setNewMaterial("");

      if (errors.materials) {
        setErrors((prev) => ({
          ...prev,
          materials: "",
        }));
      }
    }
  };

  const handleRemoveMaterial = (materialToRemove) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter(
        (material) => material !== materialToRemove
      ),
    }));
  };

  const handleKeyPress = (e, type) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "tag") handleAddTag();
      if (type === "material") handleAddMaterial();
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

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Цена должна быть больше 0";
    }

    if (!formData.category) {
      newErrors.category = "Категория обязательна";
    }

    if (!formData.dimensions.trim()) {
      newErrors.dimensions = "Укажите размеры";
    }

    if (!formData.weight.trim()) {
      newErrors.weight = "Укажите вес";
    }

    if (formData.tags.length === 0) {
      newErrors.tags = "Добавьте хотя бы один тег";
    }

    if (formData.materials.length === 0) {
      newErrors.materials = "Добавьте хотя бы один материал";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated() || !user) {
      alert("Для создания товара необходимо авторизоваться");
      navigate("/login", { state: { from: "/create-product" } });
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
      const sellerId = user.id || newId;

      const newProduct = {
        id: newId,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        seller: user.name || "Анонимный продавец",
        sellerId: sellerId,
        category: formData.category,
        images: imagePreviews,
        rating: 4.5,
        views: 0,
        createdAt: new Date().toISOString().split("T")[0],
        tags: formData.tags,
        status: formData.status,
        materials: formData.materials,
        dimensions: formData.dimensions,
        weight: formData.weight,
        userEmail: user.email || null,
      };

      addProduct(newProduct);

      navigate(`/marketplace/product/${newId}`);
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Ошибка при создании товара");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      sellerId: user?.id || Date.now(),
      category: "",
      images: [],
      tags: [],
      status: "available",
      materials: [],
      dimensions: "",
      weight: "",
    });
    setImagePreviews([]);
    setNewTag("");
    setNewMaterial("");
    setErrors({});
  };

  if (!isAuthenticated() || !user) {
    return (
      <div className={styles.container}>
        <div className={styles.notAuthorized}>
          <ExclamationTriangleIcon className={styles.warningIcon} />
          <h2 className={styles.warningTitle}>Требуется авторизация</h2>
          <p className={styles.warningText}>
            Для создания товара необходимо войти в систему.
          </p>
          <button
            onClick={() =>
              navigate("/login", { state: { from: "/create-product" } })
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
          <div>
            <h1 className={styles.title}>Создание товара</h1>
            <p className={styles.subtitle}>Добавьте новый товар в магазин</p>
          </div>
        </div>
      </div>

      {/* Информация о продавце */}
      <div className={styles.authorInfo}>
        <div>
          <div className={styles.authorLabel}>Продавец:</div>
          <div className={styles.authorName}>
            {user.name || "Анонимный продавец"}
          </div>
          <div className={styles.authorEmail}>{user.email}</div>
          <div className={styles.authorHint}>
            Товар будет опубликован от вашего имени
          </div>
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
                Изображения товара (максимум 5)
              </h3>
              <div className={styles.imageUploadContainer}>
                {imagePreviews.length > 0 ? (
                  <div className={styles.imageGrid}>
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className={styles.imagePreviewWrapper}>
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className={styles.imagePreview}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className={styles.removeImageButton}
                          aria-label="Удалить изображение"
                        >
                          <XMarkIcon className={styles.removeIcon} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                {imagePreviews.length < 5 && (
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
                      {imagePreviews.length === 0
                        ? "Нажмите для загрузки изображений"
                        : "Добавить еще изображения"}
                    </span>
                    <span className={styles.uploadHint}>
                      Загружено: {imagePreviews.length}/5
                    </span>
                  </label>
                )}
                {errors.images && (
                  <div className={styles.error}>{errors.images}</div>
                )}
              </div>
            </div>

            {/* Основная информация */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <CheckCircleIcon className={styles.sectionIcon} />
                Основная информация
              </h3>

              <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.label}>
                  Название товара
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
                  placeholder="Название товара"
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
                  Описание товара
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`${styles.textarea} ${
                    errors.description ? styles.errorInput : ""
                  }`}
                  placeholder="Подробно опишите товар, его особенности и преимущества..."
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

              <div className={styles.formGroup}>
                <label htmlFor="price" className={styles.label}>
                  Цена (руб.)
                </label>
                <div className={styles.priceInputContainer}>
                  <CurrencyDollarIcon className={styles.priceIcon} />
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`${styles.input} ${styles.priceInput} ${
                      errors.price ? styles.errorInput : ""
                    }`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.price && (
                  <div className={styles.error}>{errors.price}</div>
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
                Классификация
              </h3>

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

            {/* Характеристики */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <CubeIcon className={styles.sectionIcon} />
                Характеристики товара
              </h3>

              <div className={styles.formGroup}>
                <label htmlFor="dimensions" className={styles.label}>
                  Размеры
                </label>
                <div className={styles.dimensionsInputContainer}>
                  <input
                    type="text"
                    id="dimensions"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleInputChange}
                    className={`${styles.input} ${
                      errors.dimensions ? styles.errorInput : ""
                    }`}
                    placeholder="Например: 53x20x6 см"
                  />
                </div>
                {errors.dimensions && (
                  <div className={styles.error}>{errors.dimensions}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="weight" className={styles.label}>
                  Вес
                </label>
                <div className={styles.weightInputContainer}>
                  <input
                    type="text"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className={`${styles.input} ${
                      errors.weight ? styles.errorInput : ""
                    }`}
                    placeholder="Например: 0.8 кг"
                  />
                </div>
                {errors.weight && (
                  <div className={styles.error}>{errors.weight}</div>
                )}
              </div>
            </div>

            {/* Материалы */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <TagIcon className={styles.sectionIcon} />
                Материалы *
              </h3>
              <div className={styles.formGroup}>
                <div className={styles.tagInputContainer}>
                  <input
                    type="text"
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, "material")}
                    className={`${styles.input} ${
                      errors.materials ? styles.errorInput : ""
                    }`}
                    placeholder="Добавьте материал и нажмите Enter"
                    maxLength={30}
                  />
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className={styles.addTagButton}
                    aria-label="Добавить материал"
                  >
                    <PlusIcon className={styles.addIcon} />
                  </button>
                </div>
                {errors.materials && (
                  <div className={styles.error}>{errors.materials}</div>
                )}

                <div className={styles.tagsContainer}>
                  {formData.materials.map((material, index) => (
                    <div key={index} className={styles.tagItem}>
                      <span className={styles.tagText}>{material}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(material)}
                        className={styles.removeTagButton}
                        aria-label={`Удалить материал ${material}`}
                      >
                        <XMarkIcon className={styles.removeTagIcon} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className={styles.tagHint}>
                  Добавьте до 5 материалов, из которых сделан товар
                </div>
              </div>
            </div>

            {/* Теги */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <TagIcon className={styles.sectionIcon} />
                Теги (ключевые слова) *
              </h3>
              <div className={styles.formGroup}>
                <div className={styles.tagInputContainer}>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, "tag")}
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
                  Добавьте до 5 тегов, описывающих ваш товар
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
                Создать товар
              </>
            )}
          </button>
        </div>
      </form>

      {/* Информационная панель */}
      <div className={styles.infoPanel}>
        <h4 className={styles.infoTitle}>Рекомендации по заполнению:</h4>
        <ul className={styles.infoList}>
          <li>Придумайте четкое и привлекательное название товара</li>
          <li>Добавьте качественные фотографии товара с разных ракурсов</li>
          <li>
            Укажите реалистичную цену, учитывая себестоимость и трудозатраты
          </li>
          <li>Подробно опишите товар, его преимущества и особенности</li>
          <li>Точно укажите размеры и вес для правильной доставки</li>
          <li>Перечислите все материалы, из которых изготовлен товар</li>
          <li>Выберите подходящую категорию для лучшего поиска</li>
          <li>Добавьте релевантные теги для повышения видимости</li>
          <li>
            Укажите актуальный статус товара (в наличии/забронирован/продан)
          </li>
          <li>
            Товар будет опубликован от вашего имени (
            {user?.name || "Анонимный продавец"})
          </li>
        </ul>
      </div>
    </div>
  );
}

export default CreateProduct;
