import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, X } from "lucide-react";

import { Avatar } from "../common/Avatar";
import { Logo } from "../common/Logo";
import { NavItem } from "./NavItem";
import { useAuth } from "../../hooks/useAuth";
import { NAV_ITEMS } from "../../utils/constants";
import { getInitials } from "../../utils/formatters";

/**
 * Slide-in navigation drawer for small screens. Renders via a portal so it
 * sits above all page content, and closes automatically on route change.
 */
export function MobileSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-ink/50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="relative flex h-full w-72 max-w-[85vw] animate-slide-in flex-col bg-surface shadow-popover"
      >
        <div className="flex items-center justify-between px-5 py-6">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-paper hover:text-text-primary"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <nav
          className="flex-1 space-y-1 overflow-y-auto px-3"
          aria-label="Primary"
        >
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
                  {user
                    ? `${user.first_name} ${user.last_name}`
                    : "Not signed in"}
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
              className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-paper hover:text-danger"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>
    </div>,
    document.body
  );
}
