"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { themeColorsToCSSVars, ThemeColorsSchema, type ThemeColors } from "@/lib/theme";
import { api } from "@/lib/api";

function setCookieTheme(colors: ThemeColors) {
  try {
    document.cookie = `theme=${encodeURIComponent(JSON.stringify(colors))}; path=/; max-age=31536000`;
  } catch (e) {
    console.error("Failed to set theme cookie", e);
  }
}

function injectCSSVars(colors: ThemeColors) {
  try {
    const cssText = `:root { ${themeColorsToCSSVars(colors)} }`;
    let styleTag = document.getElementById("theme-style-tag");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "theme-style-tag";
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = cssText;
  } catch {}
}

export function ThemeSync() {
  const { user, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) return;

    if (user) {
      const hasThemeCookie = document.cookie.includes("theme=");
      if (!hasThemeCookie) {
        api.get<{ theme: unknown }>("/user-theme").then((res) => {
          if (res.data?.theme) {
            const parsedTheme = ThemeColorsSchema.safeParse(res.data.theme);
            if (parsedTheme.success) {
              setCookieTheme(parsedTheme.data);
              injectCSSVars(parsedTheme.data);
            }
          }
        });
      }
    }
  }, [user, isReady]);

  return null;
}
