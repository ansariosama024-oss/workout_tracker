import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  Dumbbell,
  LayoutDashboard,
  LibraryBig,
  Settings,
  UserRound,
} from "lucide-react";

import { MobileSidebar } from "../components/navigation/MobileSidebar";
import { Navbar } from "../components/navigation/Navbar";
import { useDisclosure } from "../hooks/useDisclosure";

const navItems = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Workouts",
    to: "/workouts",
    icon: Dumbbell,
  },
  {
    label: "Exercises",
    to: "/exercises",
    icon: LibraryBig,
  },
  {
    label: "Reports",
    to: "/reports",
    icon: BarChart3,
  },
  {
    label: "Profile",
    to: "/profile",
    icon: UserRound,
  },
  {
    label: "Settings",
    to: "/settings",
    icon: Settings,
  },
];

function TopNavigation() {
  return (
    <nav className="hidden border-b border-white/[0.07] bg-paper/95 backdrop-blur-xl md:block">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "group relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5",
                    "text-xs font-semibold transition-all duration-200",
                    "focus:outline-none",
                    isActive
                      ? "bg-accent/10 text-accent"
                      : "text-text-secondary hover:bg-white/[0.04] hover:text-text-primary",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={[
                        "h-4 w-4 transition-all duration-200",
                        isActive
                          ? "text-accent"
                          : "text-text-muted group-hover:text-text-primary",
                      ].join(" ")}
                    />

                    <span>{item.label}</span>

                    {isActive && (
                      <span className="absolute -bottom-[9px] left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_12px_rgba(186,255,36,0.75)]" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function AppLayout() {
  const { isOpen, open, close } = useDisclosure(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-paper">
      <Navbar onMenuClick={open} />

      <TopNavigation />

      <MobileSidebar isOpen={isOpen} onClose={close} />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}