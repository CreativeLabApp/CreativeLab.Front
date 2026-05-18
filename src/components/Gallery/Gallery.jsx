import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
import { userPhotoApi } from "../../api/userPhotoApi";
import {
  PhotoIcon,
  PlusIcon,
  XMarkIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import styles from "./Gallery.module.css";

const API_URL = process.env.REACT_APP_API_URL || "https://localhost:7111";

function Gallery({ userId, isOwnProfile }) {
  const { token } = useAuthStore();
  const fileInputRef = useRef(null);

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Загружаем фотографии при монтировании
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        setLoading(true);
        const data = await userPhotoApi.getUserPhotos(userId, token);
        console.log("Photos data:", data);
        setPhotos(data);
      } catch (err) {
        console.error("Error loading photos:", err);
        setError("Не удалось загрузить фотографии");
      } finally {
        setLoading(false);
      }
    };

    loadPhotos();
  }, [userId, token]);

  // Обработчик загрузки фото
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const newPhoto = await userPhotoApi.upload(file, token);
      setPhotos((prev) => [newPhoto, ...prev]);
    } catch (err) {
      setError("Не удалось загрузить фото");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Обработчик удаления фото
  const handleDelete = async () => {
    if (!photoToDelete) return;

    try {
      setDeleting(true);
      await userPhotoApi.delete(photoToDelete.id, token);
      setPhotos((prev) => prev.filter((p) => p.id !== photoToDelete.id));
      setPhotoToDelete(null);
    } catch (err) {
      setPhotos((prev) => prev.filter((p) => p.id !== photoToDelete.id));
      setPhotoToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  // Открыть модалку подтверждения удаления
  const openDeleteModal = (photo) => {
    setPhotoToDelete(photo);
  };

  // Закрыть модалку удаления
  const closeDeleteModal = () => {
    setPhotoToDelete(null);
  };

  // Форматирование размера файла
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Загрузка фотографий...</p>
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={() => setError("")} className={styles.closeError}>
            <XMarkIcon className={styles.closeIcon} />
          </button>
        </div>
      )}

      {/* Кнопка загрузки фото (только для своего профиля) */}
      {isOwnProfile && (
        <div className={styles.uploadSection}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className={styles.fileInput}
            id="photo-upload"
          />
          <label htmlFor="photo-upload" className={styles.uploadButton}>
            <PlusIcon className={styles.uploadIcon} />
            Добавить фото
          </label>
          {uploading && <span className={styles.uploading}>Загрузка...</span>}
        </div>
      )}

      {/* Сетка фотографий */}
      {photos.length > 0 ? (
        <div className={styles.photosGrid}>
          {photos.map((photo) => (
            <div key={photo.id} className={styles.photoItem}>
              <img
                src={`${API_URL}${photo.filePath}`}
                alt={photo.originalFileName}
                className={styles.photo}
                onClick={() => setSelectedPhoto(photo)}
              />
              {isOwnProfile && (
                <button
                  className={styles.deleteButton}
                  onClick={() => openDeleteModal(photo)}
                  title="Удалить фото"
                >
                  <TrashIcon className={styles.deleteIcon} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <PhotoIcon className={styles.emptyIcon} />
          <h3>Нет фотографий</h3>
          <p>
            {isOwnProfile
              ? "Добавьте фотографии в свою галерею"
              : "Пользователь пока не добавил фотографии"}
          </p>
          {isOwnProfile && (
            <label htmlFor="photo-upload" className={styles.uploadLabel}>
              <PlusIcon className={styles.uploadIcon} />
              Добавить первую фотографию
            </label>
          )}
        </div>
      )}

      {/* Модальное окно просмотра фото */}
      {selectedPhoto && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className={styles.modalClose}
            onClick={() => setSelectedPhoto(null)}
          >
            <XMarkIcon className={styles.modalCloseIcon} />
          </button>
          <img
            src={`${API_URL}${selectedPhoto.filePath}`}
            alt={selectedPhoto.originalFileName}
            className={styles.modalImage}
          />
          <div className={styles.modalInfo}>
            <p className={styles.modalFileName}>
              {selectedPhoto.originalFileName}
            </p>
            <p className={styles.modalFileSize}>
              {formatFileSize(selectedPhoto.fileSize)}
            </p>
          </div>
        </div>
      )}

      {/* Модалка подтверждения удаления */}
      {photoToDelete && (
        <div className={styles.confirmModalOverlay}>
          <div className={styles.confirmModal}>
            <div className={styles.confirmIcon}>
              <TrashIcon className={styles.confirmTrashIcon} />
            </div>
            <h3 className={styles.confirmTitle}>Удалить фото?</h3>
            <p className={styles.confirmText}>
              Вы уверены, что хотите удалить "{photoToDelete.originalFileName}"?
              Это действие нельзя отменить.
            </p>
            <div className={styles.confirmButtons}>
              <button
                className={styles.confirmCancelButton}
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                <XCircleIcon className={styles.confirmButtonIcon} />
                Отмена
              </button>
              <button
                className={styles.confirmDeleteButton}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <div className={styles.smallSpinner} />
                ) : (
                  <TrashIcon className={styles.confirmButtonIcon} />
                )}
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
