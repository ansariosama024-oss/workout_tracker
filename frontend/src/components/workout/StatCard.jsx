import { Card } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";
import { cn } from "../../utils/cn";

/**
 * Dashboard statistic tile. Renders a skeleton instead of a fabricated
 * number whenever `value` is undefined -- the real value comes from the
 * reports API in a later phase.
 *
 * @param {string} label
 * @param {string|number} [value]
 * @param {React.ElementType} icon
 * @param {"primary"|"accent"} [tone]
 */
export function StatCard({ label, value, icon: Icon, tone = "primary" }) {
  const isLoading = value === undefined;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        <span
          className={cn(
            "flex h-9 w-9 flex-none items-center justify-center rounded-lg",
            tone === "accent"
              ? "bg-accent-subtle text-accent"
              : "bg-primary-subtle text-primary"
          )}
        >
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-3">
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="font-display text-2xl font-semibold tabular-nums text-text-primary">
            {value}
          </p>
        )}
      </div>
    </Card>
  );
}
