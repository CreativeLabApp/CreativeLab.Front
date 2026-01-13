import React from "react";
import styles from "./FormBottom.module.css";
import { Link } from "react-router-dom";

function FormBottom({ to, toLabel, label }) {
  return (
    <div className={styles.formBottom}>
      {label}{" "}
      <Link to={to} className={styles.registerLink}>
        {toLabel}
      </Link>
    </div>
  );
}

export default FormBottom;
