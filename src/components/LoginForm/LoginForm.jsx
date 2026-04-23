import { useState } from "react";
import FormWrapper from "../common/FormWrapper/FormWrapper";
import { FormProvider, useForm } from "react-hook-form";
import Input from "../common/Input/Input";
import Button from "../common/Button/Button";
import styles from "./LoginForm.module.css";
import FormBottom from "../common/FormBottom/FormBottom";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

function LoginForm() {
  const login = useAuthStore((store) => store.login);
  const isAdmin = useAuthStore((store) => store.isAdmin);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from || "/";

  const methods = useForm({
    defaultValues: { email: "", password: "" },
  });

  const handleSubmit = async (data) => {
    setError("");
    setIsLoading(true);
    try {
      await login({ email: data.email, password: data.password });
      navigate(isAdmin() ? "/admin" : from, { replace: true });
    } catch (err) {
      setError(err.message || "Ошибка при входе. Проверьте данные.");
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
