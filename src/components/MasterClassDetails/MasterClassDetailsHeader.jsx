import React from "react";
import { UserIcon, TagIcon, EyeIcon } from "@heroicons/react/24/outline";
import styles from "./MasterClassDetailsHeader.module.css";

function MasterClassDetailsHeader({ masterClass }) {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{masterClass.title}</h1>
      <div className={styles.metaInfo}>
        <div className={styles.authorInfo}>
          <UserIcon className={styles.authorIcon} />
          <span className={styles.authorName}>{masterClass.author}</span>
        </div>
        <div className={styles.categoryInfo}>
          <TagIcon className={styles.categoryIcon} />
          <span className={styles.categoryName}>{masterClass.category}</span>
        </div>
        <div className={styles.viewsInfo}>
          <EyeIcon className={styles.viewsIcon} />
          <span className={styles.viewsCount}>
            {masterClass.views} просмотров
          </span>
        </div>
      </div>
    </div>
  );
}

export default MasterClassDetailsHeader;
