import { useState } from "react";
import FormWrapper from "../common/FormWrapper/FormWrapper";
import { FormProvider, useForm } from "react-hook-form";
import Input from "../common/Input/Input";
import Button from "../common/Button/Button";
import styles from "./RegisterForm.module.css";
import FormBottom from "../common/FormBottom/FormBottom";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

function RegisterForm() {
  const register = useAuthStore((store) => store.register);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const methods = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      agreeToTerms: false,
    },
  });

  const watchPassword = methods.watch("password");

  const handleSubmit = async (data) => {
    setError("");
    setIsLoading(true);
    try {
      await register({
        name: data.firstName,
        surname: data.lastName || "",
        email: data.email,
        password: data.password,
      });
      navigate("/");
    } catch (err) {
      setError(err.message || "Ошибка при регистрации. Попробуйте снова.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <FormWrapper title="Регистрация">
        <form
          className={styles.form}
          onSubmit={methods.handleSubmit(handleSubmit)}
        >
          <div className={styles.nameFields}>
            <Input
              name="firstName"
              label="Имя"
              placeholder="Введите ваше имя"
              type="text"
              required
              rules={{
                required: "Имя обязательно",
                minLength: { value: 2, message: "Минимум 2 символа" },
              }}
            />
            <Input
              name="lastName"
              label="Фамилия"
              placeholder="Введите вашу фамилию"
              type="text"
              rules={{
                minLength: { value: 2, message: "Минимум 2 символа" },
              }}
            />
          </div>

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
              minLength: { value: 6, message: "Минимум 6 символов" },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: "Должен содержать заглавные, строчные буквы и цифры",
              },
            }}
          />

          <Input
            name="confirmPassword"
            label="Подтверждение пароля"
            placeholder="Повторите пароль"
            type="password"
            required
            rules={{
              required: "Подтверждение обязательно",
              validate: (value) =>
                value === watchPassword || "Пароли не совпадают",
            }}
          />

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

          {error && <div className={styles.error}>{error}</div>}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Регистрация..." : "Зарегистрироваться"}
          </Button>

          <FormBottom to="/login" toLabel="Войти" label="Уже есть аккаунт?" />
        </form>
      </FormWrapper>
    </FormProvider>
  );
}

export default RegisterForm;
