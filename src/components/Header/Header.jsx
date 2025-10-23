import React from "react";
import { links } from "../../sources/links";
import Logo from "../Logo/Logo";
import HeaderContainer from "../HeaderContainer/HeaderContainer";
import Navbar from "../Navbar/Navbar";
import SearchBar from "../SearchBar/SearchBar";
import AuthButton from "../AuthButton/AuthButton";

function Header() {
  return (
    <HeaderContainer>
      <Logo />
      <Navbar links={links} />
      <SearchBar placeholder="Поиск" />
      <AuthButton />
    </HeaderContainer>
  );
}

export default Header;
