import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

export interface ThemeSettings {
  light: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    background: string;
    foreground: string;
    accent: string;
    accentForeground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    fontFamily: string;
    headingFont: string;
  };
  dark: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    background: string;
    foreground: string;
    accent: string;
    accentForeground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    fontFamily: string;
    headingFont: string;
  };
}

const DEFAULT_THEME: ThemeSettings = {
  light: {
    primary: "oklch(0.25 0.04 260)",
    primaryForeground: "oklch(0.97 0.01 85)",
    secondary: "oklch(0.93 0.015 85)",
    secondaryForeground: "oklch(0.25 0.04 260)",
    background: "oklch(0.97 0.01 85)",
    foreground: "oklch(0.15 0.02 260)",
    accent: "oklch(0.55 0.15 25)",
    accentForeground: "oklch(0.98 0.005 85)",
    muted: "oklch(0.94 0.01 85)",
    mutedForeground: "oklch(0.5 0.02 260)",
    border: "oklch(0.88 0.015 85)",
    fontFamily: "Georgia, 'Palatino Linotype', 'Times New Roman', serif",
    headingFont: "Georgia, 'Palatino Linotype', serif",
  },
  dark: {
    primary: "oklch(0.85 0.03 85)",
    primaryForeground: "oklch(0.18 0.02 260)",
    secondary: "oklch(0.25 0.02 260)",
    secondaryForeground: "oklch(0.9 0.01 85)",
    background: "oklch(0.18 0.02 260)",
    foreground: "oklch(0.9 0.01 85)",
    accent: "oklch(0.6 0.18 25)",
    accentForeground: "oklch(0.98 0.005 85)",
    muted: "oklch(0.24 0.02 260)",
    mutedForeground: "oklch(0.6 0.01 85)",
    border: "oklch(0.3 0.02 260)",
    fontFamily: "Georgia, 'Palatino Linotype', 'Times New Roman', serif",
    headingFont: "Georgia, 'Palatino Linotype', serif",
  },
};

const FONT_OPTIONS = [
  { label: "Georgia (Notebook)", value: "Georgia, 'Palatino Linotype', 'Times New Roman', serif" },
  { label: "Inter (Modern)", value: "'Inter', system-ui, -apple-system, sans-serif" },
  { label: "System UI", value: "system-ui, -apple-system, sans-serif" },
  { label: "Serif (Classic)", value: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
  { label: "Monospace (Typewriter)", value: "'Courier New', Courier, monospace" },
  { label: "Playfair Display", value: "'Playfair Display', Georgia, serif" },
  { label: "Space Grotesk", value: "'Space Grotesk', system-ui, sans-serif" },
];

const HEADING_FONT_OPTIONS = [
  { label: "Georgia (Notebook)", value: "Georgia, 'Palatino Linotype', serif" },
  { label: "Inter (Modern)", value: "'Inter', system-ui, -apple-system, sans-serif" },
  { label: "System UI", value: "system-ui, -apple-system, sans-serif" },
  { label: "Playfair Display", value: "'Playfair Display', Georgia, serif" },
  { label: "Space Grotesk", value: "'Space Grotesk', system-ui, sans-serif" },
  { label: "Same as Body", value: "" },
];

function getInitialTheme(): Theme {
  try {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("clockocus-theme") as Theme | null;
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

function getStoredSettings(): ThemeSettings {
  try {
    const stored = localStorage.getItem("clockocus-theme-settings");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return DEFAULT_THEME;
}

function applyThemeToDom(theme: Theme, settings: ThemeSettings, customCss: string) {
  try {
    const root = document.documentElement;

    // Apply dark/light class
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    const s = settings;

    // Apply light mode variables
    root.style.setProperty("--background", s.light.background);
    root.style.setProperty("--foreground", s.light.foreground);
    root.style.setProperty("--primary", s.light.primary);
    root.style.setProperty("--primary-foreground", s.light.primaryForeground);
    root.style.setProperty("--secondary", s.light.secondary);
    root.style.setProperty("--secondary-foreground", s.light.secondaryForeground);
    root.style.setProperty("--accent", s.light.accent);
    root.style.setProperty("--accent-foreground", s.light.accentForeground);
    root.style.setProperty("--muted", s.light.muted);
    root.style.setProperty("--muted-foreground", s.light.mutedForeground);
    root.style.setProperty("--border", s.light.border);
    root.style.setProperty("--card", s.light.background);
    root.style.setProperty("--card-foreground", s.light.foreground);
    root.style.setProperty("--popover", s.light.background);
    root.style.setProperty("--popover-foreground", s.light.foreground);
    root.style.setProperty("--input", s.light.border);
    root.style.setProperty("--ring", s.light.primary);

    // Apply dark mode variables via style element
    let darkStyles = document.getElementById("clockocus-dark-styles");
    if (!darkStyles) {
      darkStyles = document.createElement("style");
      darkStyles.id = "clockocus-dark-styles";
      document.head.appendChild(darkStyles);
    }
    if (darkStyles) {
      darkStyles.textContent = `.dark {\n` +
        `  --background: ${s.dark.background};\n` +
        `  --foreground: ${s.dark.foreground};\n` +
        `  --primary: ${s.dark.primary};\n` +
        `  --primary-foreground: ${s.dark.primaryForeground};\n` +
        `  --secondary: ${s.dark.secondary};\n` +
        `  --secondary-foreground: ${s.dark.secondaryForeground};\n` +
        `  --accent: ${s.dark.accent};\n` +
        `  --accent-foreground: ${s.dark.accentForeground};\n` +
        `  --muted: ${s.dark.muted};\n` +
        `  --muted-foreground: ${s.dark.mutedForeground};\n` +
        `  --border: ${s.dark.border};\n` +
        `  --card: ${s.dark.background};\n` +
        `  --card-foreground: ${s.dark.foreground};\n` +
        `  --popover: ${s.dark.background};\n` +
        `  --popover-foreground: ${s.dark.foreground};\n` +
        `  --input: ${s.dark.border};\n` +
        `  --ring: ${s.dark.primary};\n` +
        `}\n`;
    }

    // Apply fonts
    let fontStyles = document.getElementById("clockocus-font-styles");
    if (!fontStyles) {
      fontStyles = document.createElement("style");
      fontStyles.id = "clockocus-font-styles";
      document.head.appendChild(fontStyles);
    }
    if (fontStyles) {
      const bodyFont = s.light.fontFamily;
      const headingFont = s.light.headingFont || bodyFont;
      fontStyles.textContent = `
        body, .font-body { font-family: ${bodyFont}; }
        h1, h2, h3, h4, h5, h6, .font-serif, .font-heading { font-family: ${headingFont}; }
        .handwriting { font-family: ${bodyFont}; font-style: italic; }
      `;
    }

    // Custom CSS
    let customStyle = document.getElementById("clockocus-custom-css");
    if (!customStyle) {
      customStyle = document.createElement("style");
      customStyle.id = "clockocus-custom-css";
      document.head.appendChild(customStyle);
    }
    if (customStyle) {
      customStyle.textContent = customCss;
    }

    // Save to localStorage
    try {
      localStorage.setItem("clockocus-theme", theme);
      localStorage.setItem("clockocus-theme-settings", JSON.stringify(settings));
    } catch (e) {
      console.warn("Could not save theme to localStorage:", e);
    }
  } catch (e) {
    console.warn("Could not apply theme to DOM:", e);
  }
}

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  settings: ThemeSettings;
  updateSetting: (mode: "light" | "dark", key: keyof ThemeSettings["light"], value: string) => void;
  resetSettings: () => void;
  setCustomCss: (css: string) => void;
  fontOptions: typeof FONT_OPTIONS;
  headingFontOptions: typeof HEADING_FONT_OPTIONS;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [settings, setSettings] = useState<ThemeSettings>(getStoredSettings);
  const [customCss, setCustomCssState] = useState("");

  // Apply theme changes to DOM whenever they change
  useEffect(() => {
    applyThemeToDom(theme, settings, customCss);
  }, [theme, settings, customCss]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  const updateSetting = (mode: "light" | "dark", key: keyof ThemeSettings["light"], value: string) => {
    setSettings((prev) => ({
      ...prev,
      [mode]: { ...prev[mode], [key]: value },
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_THEME);
    localStorage.removeItem("clockocus-theme-settings");
    setCustomCssState("");
    document.getElementById("clockocus-custom-css")?.remove();
  };

  const value: ThemeContextValue = {
    theme,
    toggleTheme,
    setTheme,
    settings,
    updateSetting,
    resetSettings,
    setCustomCss: setCustomCssState,
    fontOptions: FONT_OPTIONS,
    headingFontOptions: HEADING_FONT_OPTIONS,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a <ThemeProvider>");
  }
  return ctx;
}

export { getInitialTheme };
