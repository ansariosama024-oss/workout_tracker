import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "../../utils/cn";

const VARIANT_STYLES = {
  primary:
    "bg-primary text-white hover:bg-primary-hover focus-visible:ring-primary/40 shadow-card",
  secondary:
    "bg-surface text-text-primary border border-border hover:bg-paper focus-visible:ring-primary/30",
  outline:
    "bg-transparent text-text-primary border border-border hover:bg-surface focus-visible:ring-primary/30",
  ghost:
    "bg-transparent text-text-secondary hover:bg-surface hover:text-text-primary",
  danger:
    "bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger/40 shadow-card",
};

const SIZE_STYLES = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

/**
 * Base action button used throughout the app.
 *
 * @param {"primary"|"secondary"|"outline"|"ghost"|"danger"} [variant]
 * @param {"sm"|"md"|"lg"} [size]
 * @param {boolean} [isLoading]
 * @param {boolean} [fullWidth]
 * @param {React.ElementType} [icon] - Icon component rendered before children
 * @param {React.ElementType} [as] - Render as a different element/component
 *   (e.g. react-router's Link) while keeping identical button styling.
 *   When used with `as`, the button's own `type`/`disabled` attributes are
 *   omitted since they aren't valid on non-button elements.
 */
export const Button = forwardRef(function Button(
  {
    as: Component = "button",
    variant = "primary",
    size = "md",
    isLoading = false,
    fullWidth = false,
    icon: Icon,
    disabled,
    className,
    children,
    type = "button",
    ...rest
  },
  ref
) {
  const isNativeButton = Component === "button";

  return (
    <Component
      ref={ref}
      {...(isNativeButton ? { type, disabled: disabled || isLoading } : {})}
      aria-busy={isLoading || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        fullWidth && "w-full",
        className
      )}
      {...rest}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="h-4 w-4" aria-hidden="true" />
      )}
      {children}
    </Component>
  );
});
