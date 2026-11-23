"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";

import { CheckIcon, ThemeIcon } from "./icons";
import {
  DEFAULT_THEME,
  FALCON_SCHEME_KEY,
  THEME_STORAGE_KEY,
  applyTheme,
  persistTheme,
  readFalconScheme,
  readTheme,
  type FalconScheme,
  type ThemeId,
} from "./theme";

/** Painted theme, already set by the head script. The server render has no
    storage, so the first state matches that HTML. A layout effect then reads
    this before the browser paints, which is earlier than a passive effect. */
function themeIdFromDocument(): ThemeId {
  const { theme, scheme } = document.documentElement.dataset;
  if (theme !== "falcon") return DEFAULT_THEME;
  if (scheme === "light" || scheme === "dark" || scheme === "system") return `falcon-${scheme}`;
  return "falcon-system";
}

const SCHEMES: { id: FalconScheme; label: string }[] = [
  { id: "falcon-system", label: "System" },
  { id: "falcon-light", label: "Light" },
  { id: "falcon-dark", label: "Dark" },
];

function step(index: number, count: number, key: string): number | null {
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  if (key === "ArrowDown" || key === "ArrowRight") return (index + 1) % count;
  if (key === "ArrowUp" || key === "ArrowLeft") return (index - 1 + count) % count;
  return null;
}

export function ThemeControl() {
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const familyLabelId = useId();
  const lookLabelId = useId();
  const menuId = useId();

  useLayoutEffect(() => {
    const stored = readTheme();
    const next = stored === DEFAULT_THEME ? themeIdFromDocument() : stored;
    setThemeId(next);
    applyTheme(next);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onMedia = () => {
      if (readTheme() === "falcon-system") applyTheme("falcon-system");
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY && event.key !== FALCON_SCHEME_KEY) return;
      const next = readTheme();
      setThemeId(next);
      applyTheme(next);
    };
    media.addEventListener("change", onMedia);
    window.addEventListener("storage", onStorage);
    return () => {
      media.removeEventListener("change", onMedia);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = rootRef.current;
    const onPointer = (event: PointerEvent) => {
      if (!root?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    root?.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]')?.focus();
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (id: ThemeId) => {
    setThemeId(id);
    persistTheme(id);
  };

  const falcon = themeId !== "studio";

  const focusChoice = (choice: string) => {
    requestAnimationFrame(() => {
      rootRef.current?.querySelector<HTMLElement>(`[data-choice="${choice}"]`)?.focus();
    });
  };

  const onFamilyKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const next = step(falcon ? 1 : 0, 2, event.key);
    if (next === null) return;
    event.preventDefault();
    if (next === 0) choose("studio");
    else choose(readFalconScheme());
    focusChoice(next === 0 ? "studio" : "falcon");
  };

  const onSchemeKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = Math.max(
      0,
      SCHEMES.findIndex((item) => item.id === themeId),
    );
    const next = step(index, SCHEMES.length, event.key);
    if (next === null) return;
    event.preventDefault();
    const id = SCHEMES[next]!.id;
    choose(id);
    focusChoice(id);
  };

  return (
    <div
      className="ohf-bar ohf-theme ohf-enter-1"
      ref={rootRef}
      onBlur={(event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && event.currentTarget.contains(next)) return;
        setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className="ohf-key"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={falcon ? "Theme, Falcon" : "Theme, Studio"}
        onClick={() => setOpen((current) => !current)}
      >
        <ThemeIcon />
        <span className="ohf-key-text">{falcon ? "Falcon" : "Studio"}</span>
      </button>
      {open && (
        <div
          id={menuId}
          className="ohf-theme-menu"
          role="dialog"
          aria-label="Theme"
        >
          <div role="radiogroup" aria-labelledby={familyLabelId} className="ohf-theme-group">
            <p id={familyLabelId} className="ohf-pop-head">
              Theme
            </p>
            <div className="ohf-theme-options">
              <ThemeRadio
                choice="studio"
                checked={!falcon}
                label="Studio"
                hint="Lime"
                onSelect={() => choose("studio")}
                onKeyDown={onFamilyKey}
              />
              <ThemeRadio
                choice="falcon"
                checked={falcon}
                label="Falcon"
                hint="Cere"
                onSelect={() => {
                  if (!falcon) choose(readFalconScheme());
                }}
                onKeyDown={onFamilyKey}
              />
            </div>
          </div>
          {falcon && (
            <div role="radiogroup" aria-labelledby={lookLabelId} className="ohf-theme-group">
              <p id={lookLabelId} className="ohf-pop-head">
                Appearance
              </p>
              <div className="ohf-theme-options">
                {SCHEMES.map((item) => (
                  <ThemeRadio
                    key={item.id}
                    choice={item.id}
                    checked={themeId === item.id}
                    label={item.label}
                    onSelect={() => choose(item.id)}
                    onKeyDown={onSchemeKey}
                  />
                ))}
              </div>
              <p className="ohf-theme-note">Proposed identity. No logo yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ThemeRadio({
  choice,
  checked,
  label,
  hint,
  onSelect,
  onKeyDown,
}: {
  choice: string;
  checked: boolean;
  label: string;
  hint?: string;
  onSelect: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      data-choice={choice}
      aria-checked={checked}
      tabIndex={checked ? 0 : -1}
      className="ohf-menu-row"
      onClick={onSelect}
      onKeyDown={onKeyDown}
    >
      <span className="ohf-menu-label">{label}</span>
      {hint ? <span className="ohf-menu-count">{hint}</span> : null}
      <span className="ohf-menu-ic" aria-hidden>
        {checked ? <CheckIcon /> : null}
      </span>
    </button>
  );
}
