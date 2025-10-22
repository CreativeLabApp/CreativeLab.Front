import React from "react";
import styles from "./AuthButtons.module.css";

function AuthButtons() {
  return (
    <div className={styles.authButtons}>
      <button className={styles.login}>Войти</button>
      <button className={styles.register}>Регистрация</button>
    </div>
  );
}

export default AuthButtons;
