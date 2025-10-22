import React from "react";
import Navlink from "../NavLink/Navlink";
import styles from "./Navbar.module.css";

function Navbar({ links }) {
  return (
    <div className={styles.navbar}>
      {links.map((link) => (
        <Navlink key={link.to} to={link.to} label={link.label} />
      ))}
    </div>
  );
}

export default Navbar;
