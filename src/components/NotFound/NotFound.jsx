import React from "react";
import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

function NotFound() {
  return (
    <div className={styles.content}>
      <div className={styles.errorCode}>404</div>
      <h1 className={styles.title}>Страница не найдена</h1>
      <p className={styles.description}>
        К сожалению, запрашиваемая страница не существует или была перемещена.
      </p>
      <div className={styles.actions}>
        <Link to="/" className={styles.homeButton}>
          Вернуться на главную
        </Link>
        <button
          onClick={() => window.history.back()}
          className={styles.backButton}
        >
          Назад
        </button>
      </div>
    </div>
  );
}

export default NotFound;
