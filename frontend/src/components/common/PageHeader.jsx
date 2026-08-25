import { cn } from "../../utils/cn";

/**
 * Consistent page-level header: eyebrow-free title, optional description,
 * and an actions slot -- with the signature pulse-line divider beneath it.
 */
export function PageHeader({ title, description, actions, className }) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-text-secondary">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-none flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      <span className="pulse-divider mt-4" />
    </div>
  );
}
