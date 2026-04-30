import React from "react";
import { links } from "../../sources/links";
import Logo from "../Logo/Logo";
import HeaderContainer from "../HeaderContainer/HeaderContainer";
import Navbar from "../Navbar/Navbar";
import AuthButton from "../AuthButton/AuthButton";
import { useAuthStore } from "../../stores/authStore";

function Header() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const authenticated = isAuthenticated();
  const admin = isAdmin();

  const visibleLinks = links.filter(({ to }) => {
    if (to === "/favorite" || to === "/messages") {
      return authenticated && !admin;
    }
    return true;
  });

  return (
    <HeaderContainer>
      <Logo />
      <Navbar links={visibleLinks} />
      <AuthButton />
    </HeaderContainer>
  );
}

export default Header;
