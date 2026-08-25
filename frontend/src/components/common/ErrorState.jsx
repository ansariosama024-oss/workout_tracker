import { AlertCircle, RotateCw } from "lucide-react";

import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";

/**
 * Error placeholder for failed data loads. Distinct from EmptyState so
 * "nothing here yet" and "something went wrong" are never visually
 * confused with each other.
 */
export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this data. Please try again.",
  onRetry,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-danger/20 bg-danger-subtle px-6 py-12 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-danger">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="font-display text-base font-semibold text-text-primary">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-text-secondary">
        {description}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          icon={RotateCw}
          onClick={onRetry}
          className="mt-5"
        >
          Try again
        </Button>
      )}
    </div>
  );
}
