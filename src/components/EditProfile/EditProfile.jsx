import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { userApi } from "../../api/userApi";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import styles from "./EditProfile.module.css";

function EditProfile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        surname: user.surname || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Имя обязательно";
    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    )
      errs.email = "Введите корректный email";
    if (formData.password && formData.password.length < 6)
      errs.password = "Пароль должен быть минимум 6 символов";
    if (formData.password && formData.password !== formData.confirmPassword)
      errs.confirmPassword = "Пароли не совпадают";
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
    setSaveSuccess(false);
    try {
      await userApi.update({
        id: user.id,
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        password: formData.password || null,
      });

      // Обновляем локальный store
      await updateProfile({
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
      });

      setSaveSuccess(true);
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (err) {
      setErrors({ submit: err.message || "Ошибка при сохранении" });
    } finally {
      setIsSubmitting(false);
    }
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
        <div className={styles.successMessage}>Профиль успешно сохранён!</div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Основная информация</h3>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                <UserIcon className={styles.labelIcon} />
                Имя *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.name ? styles.error : ""}`}
                placeholder="Ваше имя"
                maxLength={50}
              />
              {errors.name && (
                <span className={styles.errorMessage}>{errors.name}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="surname" className={styles.label}>
                <UserIcon className={styles.labelIcon} />
                Фамилия
              </label>
              <input
                type="text"
                id="surname"
                name="surname"
                value={formData.surname}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Ваша фамилия"
                maxLength={50}
              />
            </div>

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
                className={`${styles.input} ${errors.email ? styles.error : ""}`}
                placeholder="your@email.com"
              />
              {errors.email && (
                <span className={styles.errorMessage}>{errors.email}</span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Смена пароля</h3>
          <p className={styles.sectionHint}>
            Оставьте пустым, если не хотите менять пароль
          </p>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                <LockClosedIcon className={styles.labelIcon} />
                Новый пароль
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.password ? styles.error : ""}`}
                placeholder="Минимум 6 символов"
              />
              {errors.password && (
                <span className={styles.errorMessage}>{errors.password}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                <LockClosedIcon className={styles.labelIcon} />
                Подтверждение пароля
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.confirmPassword ? styles.error : ""}`}
                placeholder="Повторите пароль"
              />
              {errors.confirmPassword && (
                <span className={styles.errorMessage}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className={styles.submitError}>{errors.submit}</div>
        )}

        <div className={styles.formActions}>
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
            className={styles.saveButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfile;
