"use client";

import * as React from "react";
import { useServerInsertedHTML } from "next/navigation";

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: "class" | `data-${string}`;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
};

type ThemeContextValue = {
  theme?: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  resolvedTheme?: "light" | "dark";
  themes: string[];
};

const ThemeContext = React.createContext<ThemeContextValue>({
  setTheme: () => {},
  themes: ["light", "dark"],
});

const THEME_CHANGE = "theme-change";

function buildThemeInitScript(
  storageKey: string,
  defaultTheme: string,
  enableSystem: boolean,
): string {
  return `(function(){try{var d=document.documentElement;var s=localStorage.getItem(${JSON.stringify(storageKey)})||${JSON.stringify(defaultTheme)};var t=s;if(t==="system"&&${enableSystem}){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}if(t==="dark")d.classList.add("dark");else d.classList.remove("dark");}catch(e){}})();`;
}

function resolveTheme(
  theme: string,
  enableSystem: boolean,
  systemDark: boolean,
): "light" | "dark" {
  if (theme === "system" && enableSystem) {
    return systemDark ? "dark" : "light";
  }
  return theme === "dark" ? "dark" : "light";
}

function applyThemeClass(resolved: "light" | "dark") {
  const root = document.documentElement;
  if (resolved === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

function subscribeTheme(onStoreChange: () => void) {
  window.addEventListener(THEME_CHANGE, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(THEME_CHANGE, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function subscribeSystemTheme(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
  storageKey = "theme",
}: ThemeProviderProps) {
  useServerInsertedHTML(() => {
    if (attribute !== "class") return null;
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: buildThemeInitScript(storageKey, defaultTheme, enableSystem),
        }}
      />
    );
  });

  const theme = React.useSyncExternalStore(
    subscribeTheme,
    () => localStorage.getItem(storageKey) ?? defaultTheme,
    () => defaultTheme,
  );

  const systemDark = React.useSyncExternalStore(
    subscribeSystemTheme,
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    () => false,
  );

  const resolvedTheme = React.useMemo(
    () => resolveTheme(theme, enableSystem, systemDark),
    [enableSystem, systemDark, theme],
  );

  React.useLayoutEffect(() => {
    if (attribute !== "class") return;

    if (disableTransitionOnChange) {
      const style = document.createElement("style");
      style.appendChild(
        document.createTextNode(
          "*,*::before,*::after{transition:none!important}",
        ),
      );
      document.head.appendChild(style);
      applyThemeClass(resolvedTheme);
      window.getComputedStyle(document.body);
      setTimeout(() => document.head.removeChild(style), 0);
      return;
    }

    applyThemeClass(resolvedTheme);
  }, [attribute, disableTransitionOnChange, resolvedTheme]);

  const setTheme = React.useCallback(
    (value: React.SetStateAction<string>) => {
      const prev = localStorage.getItem(storageKey) ?? defaultTheme;
      const next = typeof value === "function" ? value(prev) : value;
      localStorage.setItem(storageKey, next);
      window.dispatchEvent(new Event(THEME_CHANGE));
    },
    [defaultTheme, storageKey],
  );

  const themes = React.useMemo(
    () => (enableSystem ? ["light", "dark", "system"] : ["light", "dark"]),
    [enableSystem],
  );

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      themes,
    }),
    [resolvedTheme, setTheme, theme, themes],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return React.useContext(ThemeContext);
}
