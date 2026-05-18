import React from "react";
import styles from "./MasterClassDetailsDescription.module.css";

function MasterClassDetailsDescription({ masterClass }) {
  return (
    <div className={styles.descriptionSection}>
      <h3 className={styles.sectionTitle}>Описание мастер-класса</h3>
      <div
        className={styles.descriptionContent}
        dangerouslySetInnerHTML={{ __html: masterClass.description }}
      />
    </div>
  );
}

export default MasterClassDetailsDescription;
