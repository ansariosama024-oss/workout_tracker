import { NavLink } from "react-router-dom";

import { cn } from "../../utils/cn";

/**
 * Single navigation link used by both the desktop Sidebar and the
 * MobileSidebar drawer, so active-state logic lives in exactly one place.
 */
export function NavItem({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          isActive
            ? "bg-primary-subtle text-primary"
            : "text-text-secondary hover:bg-paper hover:text-text-primary"
        )
      }
    >
      {Icon && <Icon className="h-4.5 w-4.5 flex-none" aria-hidden="true" />}
      <span>{label}</span>
    </NavLink>
  );
}
