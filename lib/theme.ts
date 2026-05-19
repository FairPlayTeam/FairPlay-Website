import { z } from "zod";
import { parse, formatHex, wcagContrast, wcagLuminance, interpolate, samples } from "culori";

const CSSColor = z.string().min(1);

export const ThemeColorsSchema = z.object({
  primary: CSSColor,
  primary100: CSSColor,
  primary200: CSSColor,
  primary300: CSSColor,
  primary400: CSSColor,
  primary500: CSSColor,
  background: CSSColor,
  foreground: CSSColor,
  card: CSSColor,
  cardForeground: CSSColor,
  muted: CSSColor,
  mutedForeground: CSSColor,
  accent: CSSColor,
  accentForeground: CSSColor,
  destructive: CSSColor,
  border: CSSColor,
  input: CSSColor,
  ring: CSSColor,
});

export type ThemeColors = z.infer<typeof ThemeColorsSchema>;

export const defaultColors: ThemeColors = {
  primary: "#4564c0",
  primary100: "#6f86d8",
  primary200: "#5c77d0",
  primary300: "#4564c0",
  primary400: "#364f9a",
  primary500: "#2a3d77",
  background: "#ffffff",
  foreground: "#252525",
  card: "#ffffff",
  cardForeground: "#252525",
  muted: "#f4f4f5",
  mutedForeground: "#71717a",
  accent: "#f4f4f5",
  accentForeground: "#18181b",
  destructive: "#ef4444",
  border: "#e4e4e7",
  input: "#e4e4e7",
  ring: "#4564c0",
};

export const darkColors: ThemeColors = {
  primary: "#4564c0",
  primary100: "#6f86d8",
  primary200: "#5c77d0",
  primary300: "#4564c0",
  primary400: "#364f9a",
  primary500: "#2a3d77",
  background: "#0f0f0f",
  foreground: "#dfdfdf",
  card: "#18181b",
  cardForeground: "#dfdfdf",
  muted: "#27272a",
  mutedForeground: "#a1a1aa",
  accent: "#27272a",
  accentForeground: "#ffffff",
  destructive: "#ef4444",
  border: "#27272a",
  input: "#27272a",
  ring: "#4564c0",
};

export function getDefaultTheme(): ThemeColors {
  return { ...defaultColors };
}

export function themeColorsToCSSVars(colors: ThemeColors): string {
  return `
    --primary: ${colors.primary};
    --primary-100: ${colors.primary100};
    --primary-200: ${colors.primary200};
    --primary-300: ${colors.primary300};
    --primary-400: ${colors.primary400};
    --primary-500: ${colors.primary500};
    --background: ${colors.background};
    --foreground: ${colors.foreground};
    --card: ${colors.card};
    --card-foreground: ${colors.cardForeground};
    --muted: ${colors.muted};
    --muted-foreground: ${colors.mutedForeground};
    --accent: ${colors.accent};
    --accent-foreground: ${colors.accentForeground};
    --destructive: ${colors.destructive};
    --border: ${colors.border};
    --input: ${colors.input};
    --ring: ${colors.ring};
    --secondary: ${colors.muted};
    --secondary-foreground: ${colors.mutedForeground};
    --popover: ${colors.card};
    --popover-foreground: ${colors.cardForeground};
    --sidebar-primary: ${colors.primary};
    --sidebar-primary-foreground: ${colors.primary};
    --sidebar-ring: ${colors.primary};
  `.trim();
}

export function toHex(cssColor: string): string {
  const color = parse(cssColor);
  return color ? (formatHex(color) as string) : cssColor;
}

export function getContrastRatio(a: string, b: string): number {
  const colorA = parse(a);
  const colorB = parse(b);

  if (!colorA || !colorB) return 1;
  return wcagContrast(colorA, colorB);
}

export function getRelativeLuminance(cssColor: string): number {
  const color = parse(cssColor);
  return color ? wcagLuminance(color) : 1;
}

export function generateShades(baseColor: string): Partial<ThemeColors> {
  const color = parse(baseColor);
  if (!color) return {};

  const shades = samples(5).map(interpolate([baseColor, "#ffffff"]));
  const darkShades = samples(3).map(interpolate([baseColor, "#000000"]));

  return {
    primary100: formatHex(shades[4]) as string,
    primary200: formatHex(shades[3]) as string,
    primary300: formatHex(shades[2]) as string,
    primary400: formatHex(darkShades[1]) as string,
    primary500: formatHex(darkShades[2]) as string,
  };
}

export function resetTheme() {
  document.cookie = "theme=; path=/; max-age=0";
  const styleTag = document.getElementById("theme-style-tag");

  if (styleTag) {
    styleTag.remove();
  }
}

export function applyThemeClient(colors: ThemeColors) {
  const cssText = `:root { ${themeColorsToCSSVars(colors)} }`;
  let styleTag = document.getElementById("theme-style-tag");

  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "theme-style-tag";
    document.head.appendChild(styleTag);
  }

  styleTag.innerHTML = cssText;
  document.cookie = `theme=${encodeURIComponent(JSON.stringify(colors))}; path=/; max-age=31536000`;
}
