import React from "react";
import styles from "./AuthButton.module.css";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

function AuthButton() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleClick = () => {
    if (isAuthenticated && user) {
      navigate("/creator/" + user.id);
    } else {
      navigate("/login");
    }
  };

  const buttonText =
    isAuthenticated && user
      ? user.email
        ? `${user.email.slice(0, 7)}...`
        : "Профиль"
      : "Войти";

  return (
    <div className={styles.buttons}>
      <button className={styles.login} onClick={handleClick}>
        {buttonText}
      </button>
      <button className={styles.login} onClick={() => logout()}>
        Выйти
      </button>
    </div>
  );
}

export default AuthButton;
