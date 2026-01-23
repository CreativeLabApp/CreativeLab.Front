import React from "react";
import styles from "./MasterClassDetailsDescription.module.css";

function MasterClassDetailsDescription({ masterClass }) {
  return (
    <div className={styles.descriptionSection}>
      <h3 className={styles.sectionTitle}>Описание мастер-класса</h3>
      <p className={styles.descriptionText}>{masterClass.description}</p>
    </div>
  );
}

export default MasterClassDetailsDescription;
