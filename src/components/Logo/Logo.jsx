import React from "react";
import styles from "./Logo.module.css";
import { ReactComponent as LogoIcon } from "../../assets/logo.svg";
import { useNavigate } from "react-router-dom";

function Logo() {
  const navigate = useNavigate();
  return (
    <div
      className={styles.logo}
      onClick={() => navigate("/")}
      style={{ cursor: "pointer" }}
    >
      <LogoIcon />
    </div>
  );
}

export default Logo;
