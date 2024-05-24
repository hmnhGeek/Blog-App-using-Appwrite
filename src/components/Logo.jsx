import React from "react";
import logo from "../logo.png";

function Logo({ width = "100px" }) {
  return <img src={logo} width={width} />;
}

export default Logo;
