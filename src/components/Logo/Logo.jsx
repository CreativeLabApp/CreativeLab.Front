import React from "react";
import styles from "./Logo.module.css";
import { ReactComponent as LogoIcon } from "../../assets/logo.svg";

function Logo() {
  return (
    <div className={styles.logo}>
      <LogoIcon />
    </div>
  );
}

export default Logo;
