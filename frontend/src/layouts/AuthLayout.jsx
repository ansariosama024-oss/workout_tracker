import { Activity } from "lucide-react";

import { ThemeToggle } from "../components/common/ThemeToggle";

/**
 * Split layout for authentication screens: a branding panel (hidden on
 * small screens) and a centered form panel.
 */
export function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-paper">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-ink px-12 py-10 text-white lg:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Workout Tracker
          </span>
        </div>

        <div className="max-w-sm">
          <p className="font-display text-3xl font-semibold leading-tight tracking-tight">
            Plan the work. Log the reps. See the progress.
          </p>
          <span className="pulse-divider mt-6 opacity-70" />
          <p className="mt-6 text-sm text-white/60">
            One place for your training plan, your workout history, and the
            numbers that show it's working.
          </p>
        </div>

        <p className="text-xs text-white/40">
          &copy; {new Date().getFullYear()} Workout Tracker
        </p>
      </div>

      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex justify-end px-6 py-6">
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
