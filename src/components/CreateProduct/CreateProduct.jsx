import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { productApi } from "../../api/productApi";
import { categoryApi } from "../../api/categoryApi";
import { materialApi } from "../../api/materialApi";
import TipTapEditor from "../CreateMasterClass/TipTapEditor";
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
  BeakerIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

function CreateProduct() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [categories, setCategories] = useState([]);
  const [existingMaterials, setExistingMaterials] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    price: "",
    categoryId: "",
    categoryName: "", // для ручного ввода
    dimensions: "",
    weight: "",
    stockQuantity: "1",
    isAvailable: true,
    materials: [],
  });
  const [materialInputValue, setMaterialInputValue] = useState("");
  const [materialDropdownOpen, setMaterialDropdownOpen] = useState(false);
  const [files, setFiles] = useState([]); // File objects
  const [previews, setPreviews] = useState([]); // base64 previews
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const materialInputRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated() || !user) {
      navigate("/login", { state: { from: "/marketplace/add-product" } });
      return;
    }
    categoryApi
      .getAll()
      .then(setCategories)
      .catch(() => {});
    materialApi
      .getAll()
      .then(setExistingMaterials)
      .catch(() => {});
  }, [isAuthenticated, navigate, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (!newFiles.length) return;

    if (files.length + newFiles.length > 5) {
      setErrors((prev) => ({ ...prev, images: "Максимум 5 изображений" }));
      return;
    }

    const invalid = newFiles.filter(
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
      newFiles.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          }),
      ),
    ).then((newPreviews) => {
      setFiles((prev) => [...prev, ...newFiles]);
      setPreviews((prev) => [...prev, ...newPreviews]);
      setErrors((prev) => ({ ...prev, images: "" }));
    });
  };

  const handleRemoveImage = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Фильтрация материалов для выпадающего списка
  const filteredMaterials = existingMaterials.filter(
    (m) =>
      m.toLowerCase().includes(materialInputValue.toLowerCase()) &&
      !formData.materials.includes(m),
  );

  // Добавление материала из выпадающего списка
  const handleSelectMaterial = (material) => {
    if (!formData.materials.includes(material)) {
      setFormData((prev) => ({
        ...prev,
        materials: [...prev.materials, material],
      }));
    }
    setMaterialInputValue("");
    setMaterialDropdownOpen(false);
  };

  // Добавление нового материала
  const handleAddNewMaterial = (e) => {
    e.preventDefault();
    const material = materialInputValue.trim();
    if (material && !formData.materials.includes(material)) {
      setFormData((prev) => ({
        ...prev,
        materials: [...prev.materials, material],
      }));
      if (!existingMaterials.includes(material)) {
        setExistingMaterials((prev) => [...prev, material].sort());
      }
    }
    setMaterialInputValue("");
    setMaterialDropdownOpen(false);
  };

  // Удаление материала
  const handleRemoveMaterial = (index) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  // Обработка ввода в поле материала
  const handleMaterialInputChange = (e) => {
    setMaterialInputValue(e.target.value);
    setMaterialDropdownOpen(true);
  };

  // Обработка фокуса на поле материала
  const handleMaterialInputFocus = () => {
    if (materialInputValue.trim()) {
      setMaterialDropdownOpen(true);
    }
  };

  // Закрытие выпадающего списка при клике вне его
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        materialInputRef.current &&
        !materialInputRef.current.contains(e.target)
      ) {
        setMaterialDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim() || formData.title.length < 3)
      errs.title = "Название должно быть не менее 3 символов";
    const descriptionText = formData.description.replace(/<[^>]*>/g, "");
    if (!descriptionText.trim() || descriptionText.length < 20)
      errs.description = "Описание должно быть не менее 20 символов";
    if (!formData.price || parseFloat(formData.price) <= 0)
      errs.price = "Цена должна быть больше 0";
    if (!formData.categoryId && !formData.categoryName.trim())
      errs.categoryId = "Выберите или введите категорию";
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
      let imageUrls = [];
      if (files.length > 0) {
        imageUrls = await productApi.uploadImages(files);
      }

      const dto = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription || null,
        sellerId: user.id,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId || null,
        categoryName: !formData.categoryId
          ? formData.categoryName || null
          : null,
        imageUrls,
        thumbnailUrl: imageUrls[0] || null,
        dimensions: formData.dimensions || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        stockQuantity: parseInt(formData.stockQuantity) || 1,
        isAvailable: formData.isAvailable,
        materials: formData.materials,
      };

      const created = await productApi.create(dto);
      navigate(`/marketplace/product/${created.id}`);
    } catch (err) {
      setErrors({ submit: err.message || "Ошибка при создании товара" });
    } finally {
      setIsSubmitting(false);
    }
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
            onClick={() => navigate("/login")}
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

      <div className={styles.authorInfo}>
        <div className={styles.authorLabel}>Продавец:</div>
        <div className={styles.authorName}>
          {user.name} {user.surname}
        </div>
        <div className={styles.authorEmail}>{user.email}</div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          {/* Левая колонка */}
          <div className={styles.mainColumn}>
            {/* Изображения */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <PhotoIcon className={styles.sectionIcon} />
                Изображения товара (максимум 5)
              </h3>
              <div className={styles.imageUploadContainer}>
                {previews.length > 0 && (
                  <div className={styles.imageGrid}>
                    {previews.map((preview, index) => (
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
                )}
                {previews.length < 5 && (
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
                      {previews.length === 0
                        ? "Нажмите для загрузки изображений"
                        : "Добавить ещё"}
                    </span>
                    <span className={styles.uploadHint}>
                      Загружено: {previews.length}/5
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
                  Название товара *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.title ? styles.errorInput : ""}`}
                  placeholder="Название товара"
                  maxLength={100}
                />
                <div className={styles.characterCount}>
                  {formData.title.length}/100
                </div>
                {errors.title && (
                  <div className={styles.error}>{errors.title}</div>
                )}
              </div>

              <div className={styles.formGroup}>
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

              <div className={styles.formGroup}>
                <label htmlFor="description" className={styles.label}>
                  Описание товара *
                </label>
                <TipTapEditor
                  content={formData.description}
                  onChange={(html) =>
                    setFormData((prev) => ({ ...prev, description: html }))
                  }
                  error={!!errors.description}
                />
                <div className={styles.characterCount}>
                  {formData.description.replace(/<[^>]*>/g, "").length}/2000
                </div>
                {errors.description && (
                  <div className={styles.error}>{errors.description}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="price" className={styles.label}>
                  Цена (Br) *
                </label>
                <div className={styles.priceInputContainer}>
                  <CurrencyDollarIcon className={styles.priceIcon} />
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`${styles.input} ${styles.priceInput} ${errors.price ? styles.errorInput : ""}`}
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

          {/* Правая колонка */}
          <div className={styles.sideColumn}>
            {/* Категория */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <TagIcon className={styles.sectionIcon} />
                Классификация
              </h3>
              <div className={styles.formGroup}>
                <label htmlFor="categoryId" className={styles.label}>
                  Категория *
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={(e) => {
                    handleInputChange(e);
                    if (e.target.value)
                      setFormData((prev) => ({ ...prev, categoryName: "" }));
                  }}
                  className={`${styles.select} ${errors.categoryId ? styles.errorInput : ""}`}
                >
                  <option value="">Выберите из списка...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className={styles.categoryDivider}>
                  или введите вручную
                </div>
                <input
                  type="text"
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={(e) => {
                    handleInputChange(e);
                    if (e.target.value)
                      setFormData((prev) => ({ ...prev, categoryId: "" }));
                  }}
                  className={`${styles.input} ${errors.categoryId ? styles.errorInput : ""}`}
                  placeholder="Например: Вышивка"
                  maxLength={50}
                />
                {errors.categoryId && (
                  <div className={styles.error}>{errors.categoryId}</div>
                )}
              </div>
            </div>

            {/* Статус */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <CheckCircleIcon className={styles.sectionIcon} />
                Статус товара
              </h3>
              <div className={styles.statusButtons}>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, isAvailable: true }))
                  }
                  className={`${styles.statusBtn} ${formData.isAvailable ? styles.statusBtnActive : ""}`}
                >
                  В наличии
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, isAvailable: false }))
                  }
                  className={`${styles.statusBtn} ${!formData.isAvailable ? styles.statusBtnUnavailable : ""}`}
                >
                  Нет в наличии
                </button>
              </div>
            </div>

            {/* Характеристики */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <CubeIcon className={styles.sectionIcon} />
                Характеристики
              </h3>

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
                  placeholder="Например: 30×40 см"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="weight" className={styles.label}>
                  Вес (кг)
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="0.5"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="stockQuantity" className={styles.label}>
                  Количество в наличии
                </label>
                <input
                  type="number"
                  id="stockQuantity"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  className={styles.input}
                  min="0"
                  step="1"
                />
              </div>
            </div>

            {/* Материалы */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <BeakerIcon className={styles.sectionIcon} />
                Материалы
              </h3>
              <div className={styles.formGroup} ref={materialInputRef}>
                <label htmlFor="material" className={styles.label}>
                  Добавить материал
                </label>
                <div className={styles.materialInputRow}>
                  <div className={styles.materialAutocomplete}>
                    <input
                      type="text"
                      id="material"
                      value={materialInputValue}
                      onChange={handleMaterialInputChange}
                      onFocus={handleMaterialInputFocus}
                      className={styles.input}
                      placeholder="Начните вводить..."
                      autoComplete="off"
                    />
                    {materialDropdownOpen && filteredMaterials.length > 0 && (
                      <div className={styles.materialDropdown}>
                        {filteredMaterials.map((material, index) => (
                          <button
                            key={index}
                            type="button"
                            className={styles.materialDropdownItem}
                            onClick={() => handleSelectMaterial(material)}
                          >
                            {material}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddNewMaterial}
                    className={styles.addMaterialButton}
                    disabled={!materialInputValue.trim()}
                  >
                    <PlusIcon className={styles.addMaterialIcon} />
                  </button>
                </div>
                <span className={styles.inputHint}>
                  Выберите из списка или добавьте новый
                </span>
              </div>

              {formData.materials.length > 0 && (
                <div className={styles.materialsList}>
                  {formData.materials.map((material, index) => (
                    <div key={index} className={styles.materialItem}>
                      <span className={styles.materialName}>{material}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(index)}
                        className={styles.removeMaterialButton}
                        aria-label="Удалить материал"
                      >
                        <TrashIcon className={styles.removeMaterialIcon} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {errors.submit && <div className={styles.error}>{errors.submit}</div>}

        <div className={styles.actionButtons}>
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
              "Загрузка и создание..."
            ) : (
              <>
                <PlusIcon className={styles.submitIcon} />
                Создать товар
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateProduct;
