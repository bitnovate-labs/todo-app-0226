"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import type { ThemePreference } from "@/lib/theme-preference";

const options: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
  { value: "system", label: "System", icon: <Monitor className="h-4 w-4 shrink-0" aria-hidden /> },
  { value: "light", label: "Light", icon: <Sun className="h-4 w-4 shrink-0" aria-hidden /> },
  { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4 shrink-0" aria-hidden /> },
];

export function DarkModeSetting() {
  const { preference, setPreference } = useTheme();

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-fg-muted">Theme</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map(({ value, label, icon }) => {
          const active = preference === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setPreference(value)}
              className={`flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition-colors touch-manipulation ${
                active
                  ? "bg-accent-soft text-primary ring-2 ring-inset ring-primary/25 shadow-card border border-transparent"
                  : "border border-border bg-muted text-fg-muted hover:border-border-strong hover:bg-surface hover:text-fg"
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
