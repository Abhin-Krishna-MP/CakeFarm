import React, { useState } from "react";
import context from "./context.js";

export default function ContextProvider({ children }) {
  const [isToggleCart, setIsToggleCart] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const ProviderValue = {
    isToggleCart,
    setIsToggleCart,
    navSearch,
    setNavSearch,
  };

  return <context.Provider value={ProviderValue}>{children}</context.Provider>;
}
