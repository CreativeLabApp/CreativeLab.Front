import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Navlink.module.css";

function Navlink({ to, label, isActive = false }) {
  const className = `${styles.navLink} ${isActive ? styles.activeLink : ""}`;

  return (
    <div className={styles.navItem}>
      <NavLink to={to} className={className} aria-label={label}>
        {label}
      </NavLink>
    </div>
  );
}

export default Navlink;
