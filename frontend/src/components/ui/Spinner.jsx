import { Loader2 } from "lucide-react";

import { cn } from "../../utils/cn";

const SIZE_STYLES = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-9 w-9",
};

/**
 * Simple spinner for inline or full-section loading states.
 * @param {"sm"|"md"|"lg"} [size]
 */
export function Spinner({ size = "md", className, label = "Loading" }) {
  return (
    <span role="status" className="inline-flex items-center">
      <Loader2
        className={cn("animate-spin text-primary", SIZE_STYLES[size], className)}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
