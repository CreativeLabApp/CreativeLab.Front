import React, { useState } from "react";
import FormWrapper from "../common/FormWrapper/FormWrapper";
import { FormProvider, useForm } from "react-hook-form";
import Input from "../common/Input/Input";
import Button from "../common/Button/Button";
import styles from "./LoginForm.module.css";
import FormBottom from "../common/FormBottom/FormBottom";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";

function LoginForm() {
  const login = useAuthStore((store) => store.login);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const methods = useForm({
    defaultValues: {
      email: "",
      password: "",
      role: "user",
    },
  });

  const handleSubmit = async (data) => {
    console.log("Login data:", data);
    setError("");
    setIsLoading(true);

    try {
      // Генерируем или получаем реальный токен
      // В реальном приложении здесь должен быть запрос к API
      const mockToken = `token_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2)}`;

      // Вызываем login с правильными данными
      login(
        {
          email: data.email,
          role: data.role,
        },
        mockToken
      );

      // Даем время на обновление состояния
      setTimeout(() => {
        navigate("/");
      }, 100);
    } catch (error) {
      console.error("Login failed:", error);
      setError("Ошибка при входе. Проверьте данные.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <FormWrapper title="Вход">
        <form
          className={styles.form}
          onSubmit={methods.handleSubmit(handleSubmit)}
        >
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
            }}
          />

          {error && <div className={styles.error}>{error}</div>}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Вход..." : "Войти"}
          </Button>

          <FormBottom
            to="/register"
            toLabel="Зарегистрироваться"
            label="Нет аккаунта?"
          />
        </form>
      </FormWrapper>
    </FormProvider>
  );
}

export default LoginForm;
