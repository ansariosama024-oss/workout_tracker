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
import { WorkoutCard } from "../../components/workout/WorkoutCard";
import * as workoutService from "../../services/workoutService";

const STAT_DEFINITIONS = [
  { key: "total", label: "Total Workouts", icon: Dumbbell },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
  { key: "pending", label: "Pending", icon: Clock },
  { key: "streak", label: "Current Streak", icon: Flame, tone: "accent" },
  { key: "volume", label: "Training Volume", icon: TrendingUp },
];

/**
 * Dashboard overview.
 *
 * Total/Completed/Pending counts and the Upcoming/Recent workout lists
 * come from GET /api/workouts/ (Backend Phase 5) since they're simple
 * derivations of the same list. Current Streak, Training Volume, and the
 * three charts stay as honest placeholders -- computing those correctly
 * (consecutive-day streak logic, weight*reps*sets aggregation, weekly/
 * monthly bucketing) is meaningfully more than a trivial connection and
 * belongs in a dedicated reports phase, not bolted on here.
 */
export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [workouts, setWorkouts] = useState([]);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    workoutService
      .getWorkouts()
      .then((data) => {
        const results = Array.isArray(data) ? data : data.results ?? [];
        setWorkouts(results);
      })
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const totalCount = workouts.length;
  const completedCount = workouts.filter((w) => w.status === "completed").length;
  const pendingCount = workouts.filter((w) => w.status === "pending").length;

  const today = new Date().toISOString().slice(0, 10);
  const upcomingWorkouts = workouts
    .filter((w) => w.status === "pending" && w.scheduled_date >= today)
    .sort((a, b) => (a.scheduled_date ?? "").localeCompare(b.scheduled_date ?? ""))
    .slice(0, 3);
  const recentWorkouts = workouts
    .filter((w) => w.status === "completed")
    .sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""))
    .slice(0, 3);

  const statValues = {
    total: isLoading || hasError ? undefined : totalCount,
    completed: isLoading || hasError ? undefined : completedCount,
    pending: isLoading || hasError ? undefined : pendingCount,
    // Left as placeholders -- see the note above.
    streak: undefined,
    volume: undefined,
  };

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
            value={statValues[stat.key]}
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
            ) : upcomingWorkouts.length === 0 ? (
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
            ) : (
              <div className="space-y-3">
                {upcomingWorkouts.map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
              </div>
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
            ) : recentWorkouts.length === 0 ? (
              <EmptyState
                icon={History}
                title="No workout history yet"
                description="Completed workouts will appear here once you log some."
                className="border-none bg-transparent py-8"
              />
            ) : (
              <div className="space-y-3">
                {recentWorkouts.map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
              </div>
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
