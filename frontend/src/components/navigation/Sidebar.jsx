import { LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Avatar } from "../common/Avatar";
import { Logo } from "../common/Logo";
import { NavItem } from "./NavItem";
import { useAuth } from "../../hooks/useAuth";
import { NAV_ITEMS } from "../../utils/constants";
import { getInitials } from "../../utils/formatters";

/**
 * Fixed desktop sidebar: wordmark, primary navigation, and a bottom user
 * area with a working (if currently no-op) logout button. Hidden below
 * the lg breakpoint in favor of MobileSidebar.
 *
 * Shows "Not signed in" whenever user is null -- which is always, until
 * real authentication exists. Once a real session exists, the same
 * markup below picks up first/last name, email, and avatar initials
 * automatically; nothing here is hardcoded.
 */
export function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    // Clears local session state and best-effort notifies the backend
    // (see AuthContext.logout / authService.logout). Since there is no
    // real session yet, this is effectively a no-op today, but the full
    // flow -- including the redirect below -- is exactly what will run
    // once authentication is connected.
    await logout();
    navigate("/login");
  };

  return (
    <aside className="hidden w-64 flex-none flex-col border-r border-border bg-surface lg:flex">
      <div className="px-5 py-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Link
            to="/profile"
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <Avatar
              initials={getInitials(user?.first_name, user?.last_name)}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">
                {user ? `${user.first_name} ${user.last_name}` : "Not signed in"}
              </p>
              <p className="truncate text-xs text-text-muted">
                {user?.email ?? "Sign in to sync your data"}
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-paper hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
