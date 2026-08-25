import { useEffect, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  History,
  Plus,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { PageHeader } from "../../components/common/PageHeader";
import { ChartContainer } from "../../components/common/ChartContainer";
import { StatCard } from "../../components/workout/StatCard";

const STAT_DEFINITIONS = [
  { key: "total", label: "Total Workouts", icon: Dumbbell },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
  { key: "pending", label: "Pending", icon: Clock },
  { key: "streak", label: "Current Streak", icon: Flame, tone: "accent" },
  { key: "volume", label: "Training Volume", icon: TrendingUp },
];

/**
 * Dashboard overview. No reports API exists yet, so every section briefly
 * shows a loading state and then settles into an honest empty state --
 * never fabricated numbers or history.
 */
export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="A snapshot of your training activity."
        actions={
          <Button as={Link} to="/workouts/create" icon={Plus}>
            New workout
          </Button>
        }
      />

      <section
        aria-label="Statistics"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
      >
        {STAT_DEFINITIONS.map((stat) => (
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
        <Card>
          <Card.Header>
            <h2 className="font-display text-base font-semibold text-text-primary">
              Upcoming Workouts
            </h2>
          </Card.Header>
          <Card.Body>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <EmptyState
                icon={CalendarClock}
                title="Nothing scheduled"
                description="Workouts you schedule will show up here."
                action={
                  <Button as={Link} to="/workouts/create" size="sm" variant="outline">
                    Schedule a workout
                  </Button>
                }
                className="border-none bg-transparent py-8"
              />
            )}
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="font-display text-base font-semibold text-text-primary">
              Recent Workouts
            </h2>
          </Card.Header>
          <Card.Body>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <EmptyState
                icon={History}
                title="No workout history yet"
                description="Completed workouts will appear here once you log some."
                className="border-none bg-transparent py-8"
              />
            )}
          </Card.Body>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartContainer
          title="Weekly Workouts"
          description="Sessions completed per week"
          type="bar"
          isLoading={isLoading}
        />
        <ChartContainer
          title="Training Volume"
          description="Total load lifted over time"
          type="line"
          isLoading={isLoading}
        />
      </div>

      <div className="mt-6">
        <ChartContainer
          title="Progress"
          description="Trend across your tracked lifts"
          type="line"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
