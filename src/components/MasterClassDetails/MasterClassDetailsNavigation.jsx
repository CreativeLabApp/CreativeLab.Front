import React from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import styles from "./MasterClassDetailsNavigation.module.css";

function MasterClassDetailsNavigation({ masterClass, navigate }) {
  return (
    <nav className={styles.navigation}>
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        <ArrowLeftIcon className={styles.backIcon} />
        Назад
      </button>
      <div className={styles.breadcrumbs}>
        <span onClick={() => navigate("/")} className={styles.breadcrumb}>
          Главная
        </span>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbActive}>{masterClass.category}</span>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbActive}>{masterClass.title}</span>
      </div>
    </nav>
  );
}

export default MasterClassDetailsNavigation;
