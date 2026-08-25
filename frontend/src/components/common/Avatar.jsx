import { cn } from "../../utils/cn";

const SIZE_STYLES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

/**
 * Initials-based avatar. No placeholder photos are used since there is
 * no real user data yet.
 */
export function Avatar({ initials = "?", size = "md", className }) {
  return (
    <span
      className={cn(
        "flex flex-none items-center justify-center rounded-full bg-primary-subtle font-display font-semibold text-primary",
        SIZE_STYLES[size],
        className
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
