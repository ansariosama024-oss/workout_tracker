import { Activity } from "lucide-react";

import { cn } from "../../utils/cn";

/**
 * App wordmark. The pulse-divider underline is the product's one
 * recurring visual signature -- used here and beneath page headers only.
 */
export function Logo({ compact = false, className }) {
  return (
    <div className={cn("select-none", className)}>
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-primary text-white">
          <Activity className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
        {!compact && (
          <span className="font-display text-lg font-semibold tracking-tight text-text-primary">
            Workout Tracker
          </span>
        )}
      </div>
      {!compact && <span className="pulse-divider pulse-divider-sm mt-1.5" />}
    </div>
  );
}
