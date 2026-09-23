// Light / dark toggle, sitting next to the language switch.
//
// One button rather than a three-way control: the icon shows what pressing it
// will give you, which is all a student needs. "Follow the system" is the
// starting state, not something to pick from a menu.

import { MoonIcon, SunIcon } from "@/components/Icons";
import { useStrings } from "@/i18n/LanguageContext";
import { useTheme } from "@/theme/ThemeContext";

export function ThemeSwitch() {
  const t = useStrings();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? t.switchToLight : t.switchToDark;

  return (
    <button
      type="button"
      className="themeswitch"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      aria-pressed={isDark}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
