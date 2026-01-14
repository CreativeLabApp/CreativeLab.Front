import React from "react";
import { links } from "../../sources/links";
import Logo from "../Logo/Logo";
import HeaderContainer from "../HeaderContainer/HeaderContainer";
import Navbar from "../Navbar/Navbar";
import AuthButton from "../AuthButton/AuthButton";

function Header() {
  return (
    <HeaderContainer>
      <Logo />
      <Navbar links={links} />
      <AuthButton />
    </HeaderContainer>
  );
}

export default Header;
