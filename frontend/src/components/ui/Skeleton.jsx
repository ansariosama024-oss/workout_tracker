import { cn } from "../../utils/cn";

/**
 * Base shimmering placeholder block. Compose freely to build skeleton
 * layouts for cards, lists, and stat tiles.
 */
export function Skeleton({ className, ...rest }) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={cn(
        "skeleton-shimmer animate-shimmer rounded-md bg-border/60",
        className
      )}
      {...rest}
    />
  );
}

/** A block of skeleton text lines of decreasing width. */
Skeleton.Text = function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn("h-3", index === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
};

/** A skeleton shaped like a Card, for list/grid loading states. */
Skeleton.Card = function SkeletonCard({ className }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-5 shadow-card",
        className
      )}
    >
      <Skeleton className="mb-3 h-5 w-1/2" />
      <Skeleton.Text lines={2} />
    </div>
  );
};
