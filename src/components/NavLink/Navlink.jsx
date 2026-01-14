import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Navlink.module.css";

function Navlink({ to, label }) {
  return (
    <div className={styles.navItem}>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `${styles.navLink} ${isActive ? styles.activeLink : ""}`
        }
        aria-label={label}
      >
        {label}
      </NavLink>
    </div>
  );
}

export default Navlink;
