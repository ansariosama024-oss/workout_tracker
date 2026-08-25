import { cn } from "../../utils/cn";

const VARIANT_STYLES = {
  neutral: "bg-paper text-text-secondary border-border",
  primary: "bg-primary-subtle text-primary border-transparent",
  accent: "bg-accent-subtle text-accent border-transparent",
  success: "bg-success-subtle text-success border-transparent",
  warning: "bg-warning-subtle text-warning border-transparent",
  danger: "bg-danger-subtle text-danger border-transparent",
};

/**
 * Small status/category label.
 * @param {"neutral"|"primary"|"accent"|"success"|"warning"|"danger"} [variant]
 */
export function Badge({ variant = "neutral", className, children, ...rest }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        VARIANT_STYLES[variant],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
