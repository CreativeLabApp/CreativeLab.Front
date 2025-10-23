import React from "react";
import styles from "./MasterClassesCard.module.css";

function MasterClassesCard({ item }) {
  return (
    <div className={styles.card}>
      <img src={item.image} alt={item.title} className={styles.image} />
      <div className={styles.content}>
        <h3 className={styles.name}>{item.title}</h3>
        <p className={styles.author}>Автор: {item.author}</p>
        <p className={styles.rating}>★ {item.rating}</p>
      </div>
    </div>
  );
}

export default MasterClassesCard;
