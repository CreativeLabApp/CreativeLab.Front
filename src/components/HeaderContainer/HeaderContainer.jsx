import React from "react";
import styles from "./HeaderContainer.module.css";

function HeaderContainer({ children }) {
  return <div className={styles.container}>{children}</div>;
}

export default HeaderContainer;
