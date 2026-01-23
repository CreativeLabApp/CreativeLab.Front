// pages/EditProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import {
  UserIcon,
  EnvelopeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import styles from "./EditProfile.module.css";

function EditProfile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Инициализация формы данными пользователя
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || user.username || user.email.split("@")[0],
        email: user.email || "",
        bio: user.bio || "",
        location: user.location || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Имя обязательно";
    } else if (formData.name.length > 50) {
      newErrors.name = "Имя не должно превышать 50 символов";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email обязателен";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Введите корректный email";
    }

    if (formData.bio.length > 500) {
      newErrors.bio = "Биография не должна превышать 500 символов";
    }

    if (formData.location.length > 100) {
      newErrors.location = "Местоположение не должно превышать 100 символов";
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
      const updatedData = {
        ...formData,
        username: formData.name,
      };

      await updateProfile(updatedData);
      setSaveSuccess(true);
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      setErrors({ submit: "Ошибка при сохранении. Попробуйте еще раз." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.authRequired}>
          <h2>Требуется авторизация</h2>
          <p>Пожалуйста, войдите в систему для редактирования профиля</p>
          <button
            onClick={() => navigate("/login")}
            className={styles.loginButton}
          >
            Войти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Редактирование профиля</h1>
      </div>

      {saveSuccess && (
        <div className={styles.successMessage}>Профиль успешно сохранен!</div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Основная информация */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Основная информация</h3>

          <div className={styles.formGrid}>
            {/* Имя */}
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                <UserIcon className={styles.labelIcon} />
                Имя и фамилия *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.name ? styles.error : ""}`}
                placeholder="Ваше имя и фамилия"
                maxLength={50}
              />
              {errors.name && (
                <span className={styles.errorMessage}>{errors.name}</span>
              )}
              <div className={styles.charCount}>{formData.name.length}/50</div>
            </div>

            {/* Email */}
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                <EnvelopeIcon className={styles.labelIcon} />
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`${styles.input} ${
                  errors.email ? styles.error : ""
                }`}
                placeholder="your@email.com"
              />
              {errors.email && (
                <span className={styles.errorMessage}>{errors.email}</span>
              )}
            </div>

            {/* Местоположение */}
            <div className={styles.formGroup}>
              <label htmlFor="location" className={styles.label}>
                <MapPinIcon className={styles.labelIcon} />
                Местоположение
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`${styles.input} ${
                  errors.location ? styles.error : ""
                }`}
                placeholder="Город, страна"
                maxLength={100}
              />
              {errors.location && (
                <span className={styles.errorMessage}>{errors.location}</span>
              )}
              <div className={styles.charCount}>
                {formData.location.length}/100
              </div>
            </div>
          </div>

          {/* Биография */}
          <div className={styles.formGroup}>
            <label htmlFor="bio" className={styles.label}>
              О себе
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className={`${styles.textarea} ${errors.bio ? styles.error : ""}`}
              placeholder="Расскажите о себе, своих увлечениях и опыте..."
              rows={5}
              maxLength={500}
            />
            {errors.bio && (
              <span className={styles.errorMessage}>{errors.bio}</span>
            )}
            <div className={styles.charCount}>{formData.bio.length}/500</div>
          </div>
        </div>

        {/* Кнопки */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={handleCancel}
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
  );
}

export default EditProfile;
