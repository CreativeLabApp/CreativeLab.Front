import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { masterclassApi } from "../../api/masterclassApi";
import { categoryApi } from "../../api/categoryApi";
import { materialApi } from "../../api/materialApi";
import { ageCategoryApi } from "../../api/ageCategoryApi";
import TipTapEditor from "./TipTapEditor";
import styles from "./CreateMasterClass.module.css";
import {
  PhotoIcon,
  TagIcon,
  DocumentPlusIcon,
  PlusIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BeakerIcon,
  VideoCameraIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

function CreateMasterClass() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

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
    files: [], // File objects — отправляем на сервер
    previews: [], // base64 — показываем в UI
    materials: [], // Материалы мастер-класса
  });
  const [materialInputValue, setMaterialInputValue] = useState("");
  const [materialDropdownOpen, setMaterialDropdownOpen] = useState(false);
  const [categoryInputValue, setCategoryInputValue] = useState("");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const materialInputRef = useRef(null);
  const categoryInputRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated() || !user) {
      navigate("/login", { state: { from: "/create-masterclass" } });
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
    ageCategoryApi
      .getAll()
      .then(setAgeCategories)
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

    if (formData.files.length + newFiles.length > 10) {
      setErrors((prev) => ({ ...prev, images: "Максимум 10 изображений" }));
      return;
    }

    const invalid = newFiles.filter(
      (f) => f.size > 5 * 1024 * 1024 || !f.type.match("image.*"),
    );
    if (invalid.length) {
      setErrors((prev) => ({
        ...prev,
        images: "Некоторые файлы недопустимы (макс. 5MB, только изображения)",
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
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...newFiles],
        previews: [...prev.previews, ...newPreviews],
      }));
      setErrors((prev) => ({ ...prev, images: "" }));
    });
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
      previews: prev.previews.filter((_, i) => i !== index),
    }));
    if (currentImageIndex >= index && currentImageIndex > 0) {
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

  const handleMoveImage = (from, to) => {
    const move = (arr) => {
      const copy = [...arr];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    };
    setFormData((prev) => ({
      ...prev,
      files: move(prev.files),
      previews: move(prev.previews),
    }));
    if (currentImageIndex === from) setCurrentImageIndex(to);
  };

  // Добавление материала
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
      // Если это новый материал (не из списка), добавляем в существующие
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
    const plainText = formData.description.replace(/<[^>]*>/g, "").trim();
    if (!formData.title.trim() || formData.title.length < 3)
      errs.title = "Название должно быть не менее 3 символов";
    if (!plainText || plainText.length < 20)
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

      // Загружаем видео если есть
      let videoUrl = null;
      if (formData.videoFile) {
        videoUrl = await masterclassApi.uploadVideo(formData.videoFile);
      }

      // Загружаем файлы на сервер, получаем URL-ы
      let imageUrls = [];
      if (formData.files.length > 0) {
        imageUrls = await masterclassApi.uploadImages(formData.files);
      }

      const dto = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription || null,
        categoryId: categoryId,
        ageCategoryId: formData.ageCategoryId,
        authorId: user.id,
        imageUrls,
        thumbnailUrl: imageUrls[0] || null,
        videoUrl: videoUrl,
        isPublished: true,
        materials: formData.materials,
      };
      const created = await masterclassApi.create(dto);
      navigate(`/master-class/${created.id}`);
    } catch (err) {
      setErrors({ submit: err.message || "Ошибка при создании мастер-класса" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated() || !user) return null;

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

      <div className={styles.authorInfo}>
        <div className={styles.authorLabel}>Автор:</div>
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
                Изображения мастер-класса
              </h3>

              {formData.previews.length > 0 && (
                <div className={styles.imageGallery}>
                  <div className={styles.mainImageContainer}>
                    <img
                      src={formData.previews[currentImageIndex]}
                      alt={`Изображение ${currentImageIndex + 1}`}
                      className={styles.mainImage}
                    />
                    {formData.previews.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentImageIndex((p) =>
                              p === 0 ? formData.previews.length - 1 : p - 1,
                            )
                          }
                          className={styles.navButton}
                          aria-label="Предыдущее изображение"
                        >
                          <ChevronLeftIcon className={styles.navIcon} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentImageIndex((p) =>
                              p === formData.previews.length - 1 ? 0 : p + 1,
                            )
                          }
                          className={`${styles.navButton} ${styles.nextButton}`}
                          aria-label="Следующее изображение"
                        >
                          <ChevronRightIcon className={styles.navIcon} />
                        </button>
                      </>
                    )}
                    <div className={styles.imageCounter}>
                      {currentImageIndex + 1} / {formData.previews.length}
                    </div>
                  </div>

                  <div className={styles.thumbnails}>
                    {formData.previews.map((preview, i) => (
                      <div key={i} className={styles.thumbnailWrapper}>
                        <button
                          type="button"
                          onClick={() => setCurrentImageIndex(i)}
                          className={`${styles.thumbnailButton} ${currentImageIndex === i ? styles.active : ""}`}
                          aria-label={`Выбрать изображение ${i + 1}`}
                        >
                          <img
                            src={preview}
                            alt={`Миниатюра ${i + 1}`}
                            className={styles.thumbnailImage}
                          />
                        </button>
                        <div className={styles.thumbnailActions}>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(i)}
                            className={styles.deleteThumbnailButton}
                            aria-label="Удалить изображение"
                          >
                            <TrashIcon className={styles.deleteIcon} />
                          </button>
                          {i > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImage(i, i - 1)}
                              className={styles.moveButton}
                            >
                              ←
                            </button>
                          )}
                          {i < formData.previews.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImage(i, i + 1)}
                              className={styles.moveButton}
                            >
                              →
                            </button>
                          )}
                        </div>
                        <div className={styles.imageNumber}>{i + 1}</div>
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
                    {formData.files.length === 0
                      ? "Нажмите для загрузки изображений"
                      : `Добавить ещё (${formData.files.length}/10)`}
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
                <DocumentPlusIcon className={styles.sectionIcon} />
                Основная информация
              </h3>

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
                  placeholder="Например: Акварельный пейзаж для начинающих"
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
                <label className={styles.label}>Полное описание</label>
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
                <label htmlFor="video" className={styles.label}>
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
          </div>

          {/* Правая колонка */}
          <div className={styles.sideColumn}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <TagIcon className={styles.sectionIcon} />
                Категория
              </h3>
              <div className={styles.formGroup} ref={categoryInputRef}>
                <label htmlFor="category" className={styles.label}>
                  Выберите или создайте категорию
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
                  <div className={styles.error}>{errors.categoryId}</div>
                )}
                {errors.category && (
                  <div className={styles.error}>{errors.category}</div>
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
                  <option value="">Выберите возрастную категорию...</option>
                  {ageCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.minAge}-{cat.maxAge} лет)
                    </option>
                  ))}
                </select>
                {errors.ageCategoryId && (
                  <div className={styles.error}>{errors.ageCategoryId}</div>
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
