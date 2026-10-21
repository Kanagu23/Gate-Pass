
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "gatepass:theme";

const getStoredTheme = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return ["light", "dark", "system"].includes(value)
      ? value
      : "system";
  } catch {
    return "system";
  }
};

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const resolved =
        theme === "system"
          ? (media.matches ? "dark" : "light")
          : theme;

      document.documentElement.dataset.theme = resolved;
      document.documentElement.style.colorScheme = resolved;
    };

    applyTheme();
    media.addEventListener("change", applyTheme);

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage may be unavailable.
    }

    return () => {
      media.removeEventListener("change", applyTheme);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
};

export { ThemeProvider, useTheme };
