import { useEffect, useState } from "react";
import { Activity, Dumbbell, Flame, TrendingUp } from "lucide-react";

import { Card } from "../../components/ui/Card";
import { ChartContainer } from "../../components/common/ChartContainer";
import { PageHeader } from "../../components/common/PageHeader";
import { StatCard } from "../../components/workout/StatCard";

const SUMMARY_STATS = [
  { key: "sessions", label: "Sessions Logged", icon: Dumbbell },
  { key: "volume", label: "Total Volume", icon: TrendingUp },
  { key: "streak", label: "Longest Streak", icon: Flame, tone: "accent" },
  { key: "avg", label: "Avg. Session Length", icon: Activity },
];

/**
 * Analytics dashboard. No reportService calls are wired up yet -- every
 * chart and stat renders honestly empty rather than fabricated analytics.
 */
export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Analyze your training trends over time."
      />

      <section
        aria-label="Summary"
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {SUMMARY_STATS.map((stat) => (
          <StatCard
            key={stat.key}
            label={stat.label}
            icon={stat.icon}
            tone={stat.tone}
            value={undefined}
          />
        ))}
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartContainer
          title="Weekly Workout Volume"
          description="Sessions per week"
          type="bar"
          isLoading={isLoading}
        />
        <ChartContainer
          title="Monthly Workout Volume"
          description="Sessions per month"
          type="bar"
          isLoading={isLoading}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartContainer
          title="Training Volume"
          description="Total weight lifted over time"
          type="line"
          isLoading={isLoading}
        />
        <ChartContainer
          title="Exercise Frequency"
          description="Most-performed exercises"
          type="bar"
          isLoading={isLoading}
        />
      </div>

      <div className="mt-6">
        <Card>
          <Card.Header>
            <h2 className="font-display text-base font-semibold text-text-primary">
              Progress
            </h2>
          </Card.Header>
          <Card.Body>
            <p className="py-6 text-center text-sm text-text-muted">
              Per-exercise progress charts will appear here once workout
              history is available from the API.
            </p>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
