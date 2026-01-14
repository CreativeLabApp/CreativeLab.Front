import React from "react";
import styles from "./AuthButton.module.css";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

function AuthButton() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const logout = useAuthStore((store) => store.logout);
  const navigate = useNavigate();

  const handleClick = () => {
    if (isAuthenticated && user) {
      logout();
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
    <button className={styles.login} onClick={handleClick}>
      {buttonText}
    </button>
  );
}

export default AuthButton;
