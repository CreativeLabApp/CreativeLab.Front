import React, { useState } from "react";
import FormWrapper from "../common/FormWrapper/FormWrapper";
import { FormProvider, useForm } from "react-hook-form";
import Input from "../common/Input/Input";
import Button from "../common/Button/Button";
import styles from "./RegisterForm.module.css"; // Создайте отдельный файл стилей
import FormBottom from "../common/FormBottom/FormBottom";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";

function RegisterForm() {
  const login = useAuthStore((store) => store.login); // После регистрации логиним пользователя
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const methods = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      role: "user",
      agreeToTerms: false,
    },
  });

  const handleSubmit = async (data) => {
    console.log("Register data:", data);
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Валидация паролей
      if (data.password !== data.confirmPassword) {
        throw new Error("Пароли не совпадают");
      }

      // Проверка согласия с условиями
      if (!data.agreeToTerms) {
        throw new Error("Необходимо согласие с условиями использования");
      }

      // В реальном приложении здесь будет запрос к API для регистрации
      // const response = await api.post('/register', {
      //   email: data.email,
      //   password: data.password,
      //   firstName: data.firstName,
      //   lastName: data.lastName,
      // });

      // Генерируем моковый токен (в реальном приложении он придет с сервера)
      const mockToken = `token_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2)}`;

      // Автоматически логиним пользователя после регистрации
      login(
        {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          fullName: `${data.firstName} ${data.lastName}`,
        },
        mockToken
      );

      setSuccess("Регистрация успешно завершена! Вы будете перенаправлены...");

      // Перенаправляем на главную страницу
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Registration failed:", error);
      setError(error.message || "Ошибка при регистрации. Попробуйте снова.");
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для отслеживания паролей
  const watchPassword = methods.watch("password");

  return (
    <FormProvider {...methods}>
      <FormWrapper title="Регистрация">
        <form
          className={styles.form}
          onSubmit={methods.handleSubmit(handleSubmit)}
        >
          {/* Личные данные */}
          <div className={styles.nameFields}>
            <Input
              name="firstName"
              label="Имя"
              placeholder="Введите ваше имя"
              type="text"
              required
              rules={{
                required: "Имя обязательно",
                minLength: {
                  value: 2,
                  message: "Имя должно содержать минимум 2 символа",
                },
              }}
            />
            <Input
              name="lastName"
              label="Фамилия"
              placeholder="Введите вашу фамилию"
              type="text"
              rules={{
                minLength: {
                  value: 2,
                  message: "Фамилия должна содержать минимум 2 символа",
                },
              }}
            />
          </div>

          {/* Email */}
          <Input
            name="email"
            label="Email"
            placeholder="Введите email"
            type="email"
            required
            rules={{
              required: "Email обязателен",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Неверный формат email",
              },
            }}
          />

          {/* Пароль */}
          <Input
            name="password"
            label="Пароль"
            placeholder="Введите пароль"
            type="password"
            required
            rules={{
              required: "Пароль обязателен",
              minLength: {
                value: 6,
                message: "Пароль должен быть минимум 6 символов",
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message:
                  "Пароль должен содержать заглавные, строчные буквы и цифры",
              },
            }}
          />

          {/* Подтверждение пароля */}
          <Input
            name="confirmPassword"
            label="Подтверждение пароля"
            placeholder="Повторите пароль"
            type="password"
            required
            rules={{
              required: "Подтверждение пароля обязательно",
              validate: (value) =>
                value === watchPassword || "Пароли не совпадают",
            }}
          />

          {/* Согласие с условиями */}
          <div className={styles.checkboxWrapper}>
            <input
              type="checkbox"
              id="agreeToTerms"
              {...methods.register("agreeToTerms", {
                required: "Необходимо согласие с условиями",
              })}
              className={styles.checkbox}
            />
            <label htmlFor="agreeToTerms" className={styles.checkboxLabel}>
              Я согласен с условиями использования и политикой
              конфиденциальности
            </label>
            {methods.formState.errors.agreeToTerms && (
              <span className={styles.errorMessage}>
                {methods.formState.errors.agreeToTerms.message}
              </span>
            )}
          </div>

          {/* Сообщения об ошибке/успехе */}
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          {/* Кнопка отправки */}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Регистрация..." : "Зарегистрироваться"}
          </Button>

          {/* Ссылка на логин */}
          <FormBottom to="/login" toLabel="Войти" label="Уже есть аккаунт?" />
        </form>
      </FormWrapper>
    </FormProvider>
  );
}

export default RegisterForm;
