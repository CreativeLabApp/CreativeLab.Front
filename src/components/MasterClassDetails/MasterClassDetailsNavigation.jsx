import React from "react";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import styles from "./MasterClassDetailsNavigation.module.css";

function MasterClassDetailsNavigation({
  masterClass,
  navigate,
  isOwner,
  onEdit,
  onDelete,
}) {
  return (
    <nav className={styles.navigation}>
      <div className={styles.navigationLeft}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <ArrowLeftIcon className={styles.backIcon} />
          Назад
        </button>
        <div className={styles.breadcrumbs}>
          <span onClick={() => navigate("/")} className={styles.breadcrumb}>
            Главная
          </span>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span
            onClick={() => navigate("/master-classes")}
            className={styles.breadcrumb}
          >
            Мастер-классы
          </span>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbActive}>
            {masterClass.category}
          </span>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbActive}>{masterClass.title}</span>
        </div>
      </div>

      {isOwner && (
        <div className={styles.ownerActions}>
          <button onClick={onEdit} className={styles.editButton}>
            <PencilSquareIcon className={styles.editIcon} />
            Редактировать
          </button>
          <button onClick={onDelete} className={styles.deleteButton}>
            <TrashIcon className={styles.deleteIcon} />
            Удалить
          </button>
        </div>
      )}
    </nav>
  );
}

export default MasterClassDetailsNavigation;
