import React from "react";
import { links } from "../../sources/links";
import Logo from "../Logo/Logo";
import HeaderContainer from "../HeaderContainer/HeaderContainer";
import Navbar from "../Navbar/Navbar";
import SearchBar from "../SearchBar/SearchBar";

function Header() {
  return (
    <HeaderContainer>
      <Logo />
      <Navbar links={links} />
      <SearchBar placeholder="Поиск" />
    </HeaderContainer>
  );
}

export default Header;
