import React from "react";
import FormWrapper from "../FormWrapper/FormWrapper";
import { FormProvider, useForm } from "react-hook-form";
import Input from "../Input/Input";
import styles from "./LoginForm.module.css";

function LoginForm() {
  const methods = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = (data) => {
    console.log("Login data: " + data);
  };

  return (
    <FormProvider {...methods}>
      <FormWrapper title="Вход">
        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            name="email"
            label="Email"
            placeholder="Введите email"
            type="email"
          />
          <Input
            name="password"
            label="Пароль"
            placeholder="Введите пароль"
            type="password"
          />
          <button className={styles.submit} type="submit">
            Войти
          </button>
        </form>
      </FormWrapper>
      ;
    </FormProvider>
  );
}

export default LoginForm;
