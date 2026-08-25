import { forwardRef, useId } from "react";

import { cn } from "../../utils/cn";

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, className, id, required, rows = 4, ...rest },
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
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={cn(errorId, hintId) || undefined}
        required={required}
        className={cn(
          "w-full resize-y rounded-lg border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          error
            ? "border-danger focus-visible:ring-danger/30"
            : "border-border focus-visible:border-primary",
          className
        )}
        {...rest}
      />
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
