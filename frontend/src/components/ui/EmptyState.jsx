import { cn } from "../../utils/cn";

/**
 * Empty/zero-data placeholder with icon, message, and an optional action.
 * Used instead of ever rendering fake placeholder data.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center",
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-subtle text-primary">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      )}
      <h3 className="font-display text-base font-semibold text-text-primary">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-text-secondary">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
