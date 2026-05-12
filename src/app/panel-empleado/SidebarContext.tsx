"use client";

import React, { useState, createContext, useContext } from "react";

const SidebarContext = createContext({
  isOpen: false,
  setIsOpen: (val: boolean) => {}
});

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};
