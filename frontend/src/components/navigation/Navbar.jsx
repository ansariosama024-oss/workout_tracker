import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";

import { ThemeToggle } from "../common/ThemeToggle";
import { NAV_ITEMS } from "../../utils/constants";

/**
 * Top header shown on every authenticated page: mobile hamburger trigger,
 * current section label, and the theme toggle.
 */
export function Navbar({ onMenuClick }) {
  const location = useLocation();
  const currentSection = NAV_ITEMS.find((item) =>
    location.pathname.startsWith(item.to)
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 flex-none items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="flex h-9 w-9 flex-none items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-paper hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <p className="flex-1 truncate text-sm font-medium text-text-secondary">
        {currentSection?.label ?? "Workout Tracker"}
      </p>

      <ThemeToggle />
    </header>
  );
}
