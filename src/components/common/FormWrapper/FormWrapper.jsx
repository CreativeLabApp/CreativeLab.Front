import React from "react";
import styles from "./FormWrapper.module.css";

function FormWrapper({ title, children }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>{title}</div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

export default FormWrapper;
