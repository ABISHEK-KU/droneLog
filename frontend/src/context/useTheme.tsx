import type { Theme } from "@/model/theme";
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext<Theme | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState(() => {
    // Initialize theme from local storage or system preference
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("app-theme");
      if (savedTheme) return savedTheme;
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light"; // Default for SSR or initial render
  });

  useEffect(() => {
    // Update local storage and HTML class when theme changes
    if (typeof window !== "undefined") {
      localStorage.setItem("app-theme", theme);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
