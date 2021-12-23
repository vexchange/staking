import React, { useState } from "react";

import AccountStatus from "../AccountStatus";

import Logo from "../Logo";

import {
  HeaderContainer,
  LogoContainer,
} from "./styled";
import { VECHAIN_NODE } from "../../constants";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <HeaderContainer
      isMenuOpen={isMenuOpen}
      className="d-flex align-items-center"
    >
      <LogoContainer>
        <a href="/">
          <Logo />
        </a>
      </LogoContainer>

      {VECHAIN_NODE === "testnet" ? (
        <div style={{ color: "red" }}>TESTNET</div>
      ) : null}

      <AccountStatus variant="desktop" />
    </HeaderContainer>
  );
}

export default Header;
