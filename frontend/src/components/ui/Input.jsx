import { forwardRef, useId } from "react";

import { cn } from "../../utils/cn";

/**
 * Text input with label, helper text, error state, and optional leading/
 * trailing icon or button (e.g. a password show/hide toggle).
 */
export const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    icon: Icon,
    trailing,
    className,
    id,
    required,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-text-primary"
        >
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={cn(errorId, hintId) || undefined}
          required={required}
          className={cn(
            "h-10 w-full rounded-lg border bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted",
            "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
            error
              ? "border-danger focus-visible:ring-danger/30"
              : "border-border focus-visible:border-primary",
            Icon && "pl-9",
            trailing && "pr-10",
            className
          )}
          {...rest}
        />
        {trailing && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {trailing}
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={hintId} className="mt-1.5 text-sm text-text-muted">
          {hint}
        </p>
      )}
    </div>
  );
});
