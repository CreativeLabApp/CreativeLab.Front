import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { masterclassApi } from "../../api/masterclassApi";
import { categoryApi } from "../../api/categoryApi";
import styles from "./CreateMasterClass.module.css";
import {
  PhotoIcon,
  TagIcon,
  DocumentPlusIcon,
  PlusIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

function CreateMasterClass() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    categoryId: "",
    files: [], // File objects — отправляем на сервер
    previews: [], // base64 — показываем в UI
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!isAuthenticated() || !user) {
      navigate("/login", { state: { from: "/create-masterclass" } });
      return;
    }
    categoryApi
      .getAll()
      .then(setCategories)
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
      // Загружаем файлы на сервер, получаем URL-ы
      let imageUrls = [];
      if (formData.files.length > 0) {
        imageUrls = await masterclassApi.uploadImages(formData.files);
      }

      const dto = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription || null,
        categoryId: formData.categoryId,
        authorId: user.id,
        imageUrls,
        thumbnailUrl: imageUrls[0] || null,
        isPublished: true,
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
                  Название *
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
                <label htmlFor="description" className={styles.label}>
                  Полное описание *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`${styles.textarea} ${errors.description ? styles.errorInput : ""}`}
                  placeholder="Подробно опишите, чему научатся участники..."
                  rows={5}
                  maxLength={2000}
                />
                <div className={styles.characterCount}>
                  {formData.description.length}/2000
                </div>
                {errors.description && (
                  <div className={styles.error}>{errors.description}</div>
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
              <div className={styles.formGroup}>
                <label htmlFor="categoryId" className={styles.label}>
                  Выберите категорию *
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className={`${styles.select} ${errors.categoryId ? styles.errorInput : ""}`}
                >
                  <option value="">Выберите категорию...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <div className={styles.error}>{errors.categoryId}</div>
                )}
              </div>
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
