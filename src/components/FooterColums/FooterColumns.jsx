import React from "react";
import styles from "./FooterColumns.module.css";
import FooterColumn from "../FooterColumn/FooterColumn";

function FooterColumns({ columns }) {
  return (
    <div className={styles.columns}>
      {columns.map((col, index) => (
        <FooterColumn key={index} title={col.title} items={col.items} />
      ))}
    </div>
  );
}

export default FooterColumns;
