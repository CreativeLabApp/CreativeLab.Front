import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { productApi } from "../../api/productApi";
import styles from "./EditProductModal.module.css";
import {
  XMarkIcon,
  PencilSquareIcon,
  PhotoIcon,
  CurrencyDollarIcon,
  CubeIcon,
  ScaleIcon,
  TagIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

function EditProductModal({ product, onClose }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    price: "",
    discountPrice: "",
    stockQuantity: "",
    isAvailable: true,
    categoryId: "",
    dimensions: "",
    weight: "",
    materials: [],
    tags: [],
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        shortDescription: product.shortDescription || "",
        price: product.price || "",
        discountPrice: product.discountPrice || "",
        stockQuantity: product.stockQuantity || "",
        isAvailable: product.isAvailable ?? true,
        categoryId: product.categoryId || "",
        dimensions: product.dimensions || "",
        weight: product.weight || "",
        materials: product.materials || [],
        tags: product.tags || [],
      });
      setPreviewImages(product.images || []);
    }
  }, [product]);

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedImages((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviewImages((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let imageUrls = product?.images || [];

      if (selectedImages.length > 0) {
        imageUrls = await productApi.uploadImages(selectedImages, user.token);
      }

      const dto = {
        ...formData,
        price: Number(formData.price),
        discountPrice: formData.discountPrice
          ? Number(formData.discountPrice)
          : null,
        stockQuantity: Number(formData.stockQuantity),
        dimensions: formData.dimensions || null,
        weight: formData.weight ? Number(formData.weight) : null,
        materials: formData.materials.map((m) => ({ name: m })),
        tags: formData.tags.map((t) => ({ name: t })),
        imageUrls,
      };

      if (product) {
        dto.id = product.id;
        await productApi.update(dto, user.token);
      } else {
        await productApi.create(dto, user.token);
      }

      notify(product ? "Товар обновлен!" : "Товар создан!");
      onClose();
      if (product) {
        navigate(`/marketplace/product/${product.id}`);
      } else {
        navigate("/marketplace");
      }
    } catch (err) {
      setError(err.message || "Ошибка при сохранении");
    } finally {
      setLoading(false);
    }
  };

  if (!product && !user) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{product ? "Редактировать товар" : "Создать товар"}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <XMarkIcon className={styles.closeIcon} />
          </button>
        </div>

        {notification && (
          <div className={styles.notification}>{notification}</div>
        )}
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formSection}>
            <h3>Основная информация</h3>
            <div className={styles.formGroup}>
              <label>Название</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Название товара"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Краткое описание</label>
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                placeholder="Краткое описание (до 300 символов)"
                maxLength={300}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Полное описание</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Полное описание"
                rows={4}
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <h3>Цена и наличие</h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Цена</label>
                <div className={styles.inputWithIcon}>
                  <CurrencyDollarIcon className={styles.inputIcon} />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Скидочная цена (опционально)</label>
                <div className={styles.inputWithIcon}>
                  <CurrencyDollarIcon className={styles.inputIcon} />
                  <input
                    type="number"
                    name="discountPrice"
                    value={formData.discountPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Количество на складе</label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  required
                  min="1"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleInputChange}
                  />
                  В наличии
                </label>
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h3>Характеристики</h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Размеры</label>
                <div className={styles.inputWithIcon}>
                  <CubeIcon className={styles.inputIcon} />
                  <input
                    type="text"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleInputChange}
                    placeholder="Например: 10x20x30 см"
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Вес (кг)</label>
                <div className={styles.inputWithIcon}>
                  <ScaleIcon className={styles.inputIcon} />
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h3>Изображения</h3>
            <div className={styles.imageUpload}>
              <label className={styles.imageUploadLabel}>
                <PhotoIcon className={styles.uploadIcon} />
                <span>Загрузить изображения</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading}
                />
              </label>
              <div className={styles.imagePreviews}>
                {previewImages.map((preview, index) => (
                  <div key={index} className={styles.imagePreview}>
                    <img src={preview} alt={`Preview ${index}`} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className={styles.removeImage}
                    >
                      <XMarkIcon className={styles.removeIcon} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? "Сохранение..." : product ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProductModal;
