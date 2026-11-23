/** Studio theme choice, stored in this browser. The lime studio stays the
    default so a visitor with nothing saved sees the look this repo shipped. */

export const THEME_STORAGE_KEY = "ohf-theme";
/** Last Falcon appearance, so returning from Studio restores Light, Dark, or System. */
export const FALCON_SCHEME_KEY = "ohf-falcon-scheme";

export type FalconScheme = "falcon-system" | "falcon-light" | "falcon-dark";
export type ThemeId = "studio" | FalconScheme;

export const DEFAULT_THEME: ThemeId = "studio";

export function isThemeId(value: string | null): value is ThemeId {
  return value === "studio" || value === "falcon-system" || value === "falcon-light" || value === "falcon-dark";
}

export function isFalconScheme(value: string | null): value is FalconScheme {
  return value === "falcon-system" || value === "falcon-light" || value === "falcon-dark";
}

export function readTheme(): ThemeId {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeId(raw) ? raw : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function readFalconScheme(): FalconScheme {
  try {
    const raw = localStorage.getItem(FALCON_SCHEME_KEY);
    return isFalconScheme(raw) ? raw : "falcon-system";
  } catch {
    return "falcon-system";
  }
}

/** Hangar, Bone, or the studio ground — the browser chrome color. */
export function themeColor(id: ThemeId): string {
  if (id === "studio") return "#0a0a0b";
  if (id === "falcon-light") return "#edeae3";
  if (id === "falcon-dark") return "#14161a";
  const dark =
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return dark ? "#14161a" : "#edeae3";
}

export function applyTheme(id: ThemeId): void {
  const root = document.documentElement;
  if (id === "studio") {
    root.setAttribute("data-theme", "studio");
    root.removeAttribute("data-scheme");
  } else {
    root.setAttribute("data-theme", "falcon");
    root.setAttribute("data-scheme", id.slice("falcon-".length));
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor(id));
}

export function persistTheme(id: ThemeId): void {
  applyTheme(id);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, id);
    if (id !== "studio") localStorage.setItem(FALCON_SCHEME_KEY, id);
  } catch {
    /* private mode or a denied store — the attribute still holds for this view */
  }
}

/** Runs before paint from the root layout. Keep it in sync with applyTheme. */
export const THEME_BOOT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});var theme="studio";var scheme="";if(t==="falcon-light"||t==="falcon-dark"||t==="falcon-system"){theme="falcon";scheme=t.slice(7);}var root=document.documentElement;root.setAttribute("data-theme",theme);if(scheme)root.setAttribute("data-scheme",scheme);else root.removeAttribute("data-scheme");var dark=scheme==="dark"||(scheme==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var color=theme==="falcon"?(dark?"#14161a":"#edeae3"):"#0a0a0b";var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute("content",color);}catch(e){}})();`;
