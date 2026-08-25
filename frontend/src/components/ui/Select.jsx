import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "../../utils/cn";

/**
 * @param {{value: string, label: string}[]} options
 * @param {string} [placeholder] - Rendered as a disabled first option.
 */
export const Select = forwardRef(function Select(
  {
    label,
    error,
    hint,
    options = [],
    placeholder,
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
        <select
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={cn(errorId, hintId) || undefined}
          required={required}
          defaultValue={placeholder ? "" : undefined}
          className={cn(
            "h-10 w-full appearance-none rounded-lg border bg-surface px-3 pr-9 text-sm text-text-primary",
            "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
            error
              ? "border-danger focus-visible:ring-danger/30"
              : "border-border focus-visible:border-primary",
            className
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          aria-hidden="true"
        />
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
