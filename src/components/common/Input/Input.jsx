import React from "react";
import { useFormContext } from "react-hook-form";
import styles from "./Input.module.css";

function Input({
  label,
  placeholder,
  type = "text",
  name,
  rules = {},
  ...props
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        className={`${styles.input} ${error ? styles.error : ""}`}
        {...register(name, rules)}
        {...props}
      />
      {error && (
        <span className={styles.errorMessage}>{error.message || "Ошибка"}</span>
      )}
    </div>
  );
}

export default Input;
