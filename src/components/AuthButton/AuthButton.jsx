import React from "react";
import styles from "./AuthButton.module.css";
import { useNavigate } from "react-router-dom";

function AuthButton() {
  const navigate = useNavigate(null);

  return (
    <button className={styles.login} onClick={() => navigate("/login")}>
      Войти
    </button>
  );
}

export default AuthButton;
