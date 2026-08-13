"use client";

import { useEffect, useState } from "react";
import { useDict } from "@/components/i18n/provider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className }: { className?: string }) {
  const t = useDict().ui;
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("fn-theme", next ? "dark" : "light");
    } catch {}
    document.cookie = `fn_theme=${next ? "dark" : "light"};path=/;max-age=31536000;samesite=lax`;
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? t.themeLight : t.themeDark}
      className={`inline-flex size-10 items-center justify-center rounded-xl text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-50 ${className ?? ""}`}
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}

/** Hydration öncesi tema uygulaması — FOUC engeller */
export const themeScript = `(function(){try{var t=localStorage.getItem('fn-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.classList.toggle('dark',t!=='light');}catch(e){document.documentElement.classList.add('dark');}})();`;
