import React from "react";
import styles from "./Header.module.css";
import { links } from "../../sources/links";
import Logo from "../Logo/Logo";
import HeaderContainer from "../HeaderContainer/HeaderContainer";
import Navbar from "../Navbar/Navbar";

function Header() {
  return (
    <HeaderContainer>
      <Logo />
      <Navbar links={links} />
    </HeaderContainer>
  );
}

export default Header;
