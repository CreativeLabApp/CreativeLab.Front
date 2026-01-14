import React from "react";
import styles from "./Notification.module.css";

function Notification({ children }) {
  return <div className={styles.notification}>{children}</div>;
}

export default Notification;
