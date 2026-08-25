import { cn } from "../../utils/cn";

/**
 * Base surface used for panels throughout the app: subtle border,
 * soft shadow, generous rounding. Compose with Card.Header/Body/Footer.
 */
export function Card({ className, children, hoverable = false, ...rest }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface shadow-card",
        hoverable && "transition-shadow hover:shadow-card-hover",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ className, children, ...rest }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b border-border px-5 py-4",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

Card.Body = function CardBody({ className, children, ...rest }) {
  return (
    <div className={cn("px-5 py-4", className)} {...rest}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ className, children, ...rest }) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 border-t border-border px-5 py-4",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
