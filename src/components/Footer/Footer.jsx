import React from "react";
import FooterColumns from "../FooterColums/FooterColumns";
import { footerColumns } from "../../sources/footerData";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <FooterColumns columns={footerColumns} />
    </footer>
  );
}
