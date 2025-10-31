import React from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import styles from "./MasterClassesCard.module.css";

function MasterClassesCard({ item }) {
  return (
    <div className={styles.card}>
      {Boolean(item.image) ? (
        <img src={item.image} alt={item.title} className={styles.image} />
      ) : (
        <PhotoIcon className={styles.placeholder} />
      )}
      <div className={styles.content}>
        <h3 className={styles.name}>{item.title}</h3>
        <p className={styles.author}>Автор: {item.author}</p>
        <p className={styles.rating}>★ {item.rating}</p>
      </div>
    </div>
  );
}

export default MasterClassesCard;
