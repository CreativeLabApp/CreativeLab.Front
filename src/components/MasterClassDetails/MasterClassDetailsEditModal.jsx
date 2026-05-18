import { useState, useEffect, useRef } from "react";
import {
  XMarkIcon,
  PhotoIcon,
  TagIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BeakerIcon,
  PlusIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import styles from "./MasterClassDetailsEditModal.module.css";
import { categoryApi } from "../../api/categoryApi";
import { materialApi } from "../../api/materialApi";
import { ageCategoryApi } from "../../api/ageCategoryApi";
import { masterclassApi } from "../../api/masterclassApi";
import TipTapEditor from "../CreateMasterClass/TipTapEditor";

function MasterClassDetailsEditModal({ masterClass, onSave, onClose }) {
  const [categories, setCategories] = useState([]);
  const [ageCategories, setAgeCategories] = useState([]);
  const [existingMaterials, setExistingMaterials] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    categoryId: "",
    categoryName: "",
    ageCategoryId: "",
    videoFile: null,
    videoPreview: null,
    existingVideoUrl: "",
    // Существующие URL-ы с сервера
    existingUrls: [],
    // Новые файлы для загрузки
    newFiles: [],
    newPreviews: [],
    isPublished: true,
    materials: [],
  });
  const [materialInputValue, setMaterialInputValue] = useState("");
  const [materialDropdownOpen, setMaterialDropdownOpen] = useState(false);
  const [categoryInputValue, setCategoryInputValue] = useState("");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const materialInputRef = useRef(null);
  const categoryInputRef = useRef(null);

  // Загружаем категории, возрастные категории и материалы
  useEffect(() => {
    categoryApi
      .getAll()
      .then(setCategories)
      .catch(() => {});
    materialApi
      .getAll()
      .then(setExistingMaterials)
      .catch(() => {});
    ageCategoryApi
      .getAll()
      .then(setAgeCategories)
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
      categoryName: masterClass.category || "",
      ageCategoryId: masterClass.ageCategoryId || "",
      videoFile: null,
      videoPreview: null,
      existingVideoUrl: masterClass.videoUrl || "",
      existingUrls: Array.isArray(masterClass.images)
        ? [...masterClass.images]
        : [],
      newFiles: [],
      newPreviews: [],
      isPublished: masterClass.isPublished ?? true,
      materials: Array.isArray(masterClass.materials)
        ? [...masterClass.materials]
        : [],
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

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        video: "Видео не должно превышать 100MB",
      }));
      return;
    }

    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
    ];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        video: "Недопустимый формат видео. Разрешены: mp4, webm, mov, avi",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        videoFile: file,
        videoPreview: reader.result,
      }));
      setErrors((prev) => ({ ...prev, video: "" }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveVideo = () => {
    setFormData((prev) => ({
      ...prev,
      videoFile: null,
      videoPreview: null,
    }));
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

  // Категория - фильтрация для выпадающего списка
  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(categoryInputValue.toLowerCase()) &&
      (formData.categoryId ? cat.id !== formData.categoryId : true),
  );

  // Категория - выбор из списка
  const handleSelectCategory = (category) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: category.id,
      categoryName: category.name,
    }));
    setCategoryInputValue("");
    setCategoryDropdownOpen(false);
    if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: "" }));
  };

  // Категория - добавление новой
  const handleAddNewCategory = async (e) => {
    e.preventDefault();
    const name = categoryInputValue.trim();
    if (!name) return;

    try {
      const newCategory = await categoryApi.create(name);
      setCategories((prev) =>
        [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setFormData((prev) => ({
        ...prev,
        categoryId: newCategory.id,
        categoryName: newCategory.name,
      }));
      setCategoryInputValue("");
      setCategoryDropdownOpen(false);
      if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: "" }));
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        category: err.message || "Ошибка при создании категории",
      }));
    }
  };

  // Категория - удаление выбора
  const handleClearCategory = () => {
    setFormData((prev) => ({
      ...prev,
      categoryId: "",
      categoryName: "",
    }));
    setCategoryInputValue("");
  };

  // Категория - обработка ввода
  const handleCategoryInputChange = (e) => {
    setCategoryInputValue(e.target.value);
    setCategoryDropdownOpen(true);
    if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
  };

  // Категория - обработка фокуса
  const handleCategoryInputFocus = () => {
    if (categoryInputValue.trim()) {
      setCategoryDropdownOpen(true);
    }
  };

  // Закрытие выпадающего списка категорий при клике вне его
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        categoryInputRef.current &&
        !categoryInputRef.current.contains(e.target)
      ) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validate = () => {
    const errs = {};
    const descriptionText = formData.description.replace(/<[^>]*>/g, "");
    if (!formData.title.trim() || formData.title.length < 3)
      errs.title = "Название должно быть не менее 3 символов";
    if (!descriptionText.trim() || descriptionText.length < 20)
      errs.description = "Описание должно быть не менее 20 символов";
    if (!formData.categoryId) errs.categoryId = "Категория обязательна";
    if (!formData.ageCategoryId)
      errs.ageCategoryId = "Возрастная категория обязательна";
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
      // Если категория не выбрана, но введено название - создаем новую
      let categoryId = formData.categoryId;
      if (!categoryId && categoryInputValue.trim()) {
        const newCategory = await categoryApi.create(categoryInputValue.trim());
        categoryId = newCategory.id;
        setCategories((prev) =>
          [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)),
        );
      }

      // Загружаем видео если есть новый файл
      let videoUrl = formData.existingVideoUrl;
      if (formData.videoFile) {
        videoUrl = await masterclassApi.uploadVideo(formData.videoFile);
      }

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
        categoryId: categoryId,
        ageCategoryId: formData.ageCategoryId,
        videoUrl: videoUrl,
        imageUrls: allUrls,
        thumbnailUrl: allUrls[0] || null,
        isPublished: formData.isPublished,
        materials: formData.materials,
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
                      <div className={styles.thumbnailActions}>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className={styles.deleteImageButton}
                          aria-label="Удалить"
                        >
                          <TrashIcon className={styles.deleteIcon} />
                        </button>
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
                  Название
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

              <div className={styles.formGroup} ref={categoryInputRef}>
                <label htmlFor="category" className={styles.label}>
                  Категория
                </label>
                <div className={styles.materialInputRow}>
                  <div className={styles.materialAutocomplete}>
                    <input
                      type="text"
                      id="category"
                      value={
                        formData.categoryId
                          ? formData.categoryName
                          : categoryInputValue
                      }
                      onChange={handleCategoryInputChange}
                      onFocus={handleCategoryInputFocus}
                      className={`${styles.input} ${errors.categoryId ? styles.errorInput : ""}`}
                      placeholder={
                        formData.categoryId
                          ? formData.categoryName
                          : "Начните вводить..."
                      }
                      autoComplete="off"
                      disabled={!!formData.categoryId}
                    />
                    {categoryDropdownOpen && filteredCategories.length > 0 && (
                      <div className={styles.materialDropdown}>
                        {filteredCategories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            className={styles.materialDropdownItem}
                            onClick={() => handleSelectCategory(cat)}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {formData.categoryId ? (
                    <button
                      type="button"
                      onClick={handleClearCategory}
                      className={styles.addMaterialButton}
                      title="Очистить выбор"
                    >
                      ×
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddNewCategory}
                      className={styles.addMaterialButton}
                      disabled={!categoryInputValue.trim()}
                    >
                      <PlusIcon className={styles.addMaterialIcon} />
                    </button>
                  )}
                </div>
                <span className={styles.inputHint}>
                  Выберите из списка или добавьте новую
                </span>
                {errors.categoryId && (
                  <span className={styles.errorMessage}>
                    {errors.categoryId}
                  </span>
                )}
                {errors.category && (
                  <span className={styles.errorMessage}>{errors.category}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="ageCategoryId" className={styles.label}>
                  Возрастная категория
                </label>
                <select
                  id="ageCategoryId"
                  name="ageCategoryId"
                  value={formData.ageCategoryId}
                  onChange={handleInputChange}
                  className={`${styles.select} ${errors.ageCategoryId ? styles.errorInput : ""}`}
                >
                  <option value="">Выберите возрастную категорию</option>
                  {ageCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.minAge}-{cat.maxAge} лет)
                    </option>
                  ))}
                </select>
                {errors.ageCategoryId && (
                  <span className={styles.errorMessage}>
                    {errors.ageCategoryId}
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
                Полное описание
              </label>
              <TipTapEditor
                content={formData.description}
                onChange={(html) =>
                  setFormData((prev) => ({ ...prev, description: html }))
                }
                error={!!errors.description}
              />
              <div className={styles.charCount}>
                {formData.description.replace(/<[^>]*>/g, "").length}/2000
              </div>
              {errors.description && (
                <span className={styles.errorMessage}>
                  {errors.description}
                </span>
              )}
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label htmlFor="video" className={styles.label}>
                <VideoCameraIcon
                  className={styles.sectionIcon}
                  style={{ width: 20, height: 20 }}
                />
                Видео мастер-класса
              </label>
              {formData.videoPreview ? (
                <div className={styles.videoPreviewContainer}>
                  <video
                    src={formData.videoPreview}
                    className={styles.videoPreview}
                    controls
                  />
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className={styles.removeVideoButton}
                    aria-label="Удалить видео"
                  >
                    <TrashIcon className={styles.removeVideoIcon} />
                  </button>
                </div>
              ) : formData.existingVideoUrl ? (
                <div className={styles.videoPreviewContainer}>
                  <video
                    src={formData.existingVideoUrl}
                    className={styles.videoPreview}
                    controls
                  />
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className={styles.removeVideoButton}
                    aria-label="Удалить видео"
                  >
                    <TrashIcon className={styles.removeVideoIcon} />
                  </button>
                </div>
              ) : (
                <label className={styles.videoUploadArea}>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className={styles.videoInput}
                  />
                  <VideoCameraIcon className={styles.videoUploadIcon} />
                  <span className={styles.videoUploadText}>
                    Нажмите для загрузки видео
                  </span>
                  <span className={styles.videoUploadHint}>
                    Макс. 100MB, форматы: mp4, webm, mov, avi
                  </span>
                </label>
              )}
              {errors.video && (
                <div className={styles.error}>{errors.video}</div>
              )}
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
