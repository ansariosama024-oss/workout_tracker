import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Flame,
  History,
  Plus,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { StatCard } from "../../components/workout/StatCard";
import { WorkoutCard } from "../../components/workout/WorkoutCard";
import * as workoutService from "../../services/workoutService";

const ACCENT = "#BAFF24";

function normalizeWorkouts(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
}

function getExerciseItems(workout) {
  if (Array.isArray(workout?.exercises)) {
    return workout.exercises;
  }

  if (Array.isArray(workout?.workout_exercises)) {
    return workout.workout_exercises;
  }

  if (Array.isArray(workout?.workout_exercises_data)) {
    return workout.workout_exercises_data;
  }

  return [];
}

function getExerciseVolume(exercise) {
  const sets = Number(exercise?.sets || 0);
  const repetitions = Number(
    exercise?.repetitions ?? exercise?.reps ?? 0
  );
  const weight = Number(exercise?.weight || 0);

  if (
    !Number.isFinite(sets) ||
    !Number.isFinite(repetitions) ||
    !Number.isFinite(weight)
  ) {
    return 0;
  }

  return sets * repetitions * weight;
}

function calculateWorkoutVolume(workout) {
  return getExerciseItems(workout).reduce(
    (total, exercise) => total + getExerciseVolume(exercise),
    0
  );
}

function getDateKey(workout) {
  return (
    workout?.scheduled_date ||
    workout?.completed_at?.slice?.(0, 10) ||
    workout?.updated_at?.slice?.(0, 10) ||
    workout?.created_at?.slice?.(0, 10) ||
    null
  );
}

function calculateStreak(workouts) {
  const completedDates = new Set(
    workouts
      .filter((workout) => workout.status === "completed")
      .map(getDateKey)
      .filter(Boolean)
  );

  if (completedDates.size === 0) {
    return 0;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let cursor = new Date(today);

  while (true) {
    const key = formatDateKey(cursor);

    if (!completedDates.has(key)) {
      break;
    }

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatVolume(value) {
  if (!value) {
    return "0 kg";
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K kg`;
  }

  return `${Math.round(value)} kg`;
}

function formatDate(dateString) {
  if (!dateString) {
    return "No date";
  }

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getLastSevenDays() {
  const days = [];

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);

    days.push({
      key: formatDateKey(date),
      label: date.toLocaleDateString(undefined, {
        weekday: "short",
      }),
  date,
    });
  }

  return days;
}

function getWeeklyWorkoutData(workouts) {
  const days = getLastSevenDays();

  return days.map((day) => ({
    label: day.label,
    value: workouts.filter(
      (workout) =>
        workout.status === "completed" &&
        getDateKey(workout) === day.key
    ).length,
  }));
}

function getWeeklyVolumeData(workouts) {
  const days = getLastSevenDays();

  return days.map((day) => ({
    label: day.label,
    value: workouts
      .filter(
        (workout) =>
          workout.status === "completed" &&
          getDateKey(workout) === day.key
      )
      .reduce(
        (total, workout) => total + calculateWorkoutVolume(workout),
        0
      ),
  }));
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [workouts, setWorkouts] = useState([]);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    workoutService
      .getWorkouts()
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setWorkouts(normalizeWorkouts(data));
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setHasError(true);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const today = formatDateKey(new Date());

  const totalCount = workouts.length;

  const completedCount = workouts.filter(
    (workout) => workout.status === "completed"
  ).length;

  const pendingCount = workouts.filter(
    (workout) => workout.status === "pending"
  ).length;

  const cancelledCount = workouts.filter(
    (workout) => workout.status === "cancelled"
  ).length;

  const streak = useMemo(
    () => calculateStreak(workouts),
    [workouts]
  );

  const totalVolume = useMemo(
    () =>
      workouts
        .filter((workout) => workout.status === "completed")
        .reduce(
          (total, workout) =>
            total + calculateWorkoutVolume(workout),
          0
        ),
    [workouts]
  );

  const weeklyWorkoutData = useMemo(
    () => getWeeklyWorkoutData(workouts),
    [workouts]
  );

  const weeklyVolumeData = useMemo(
    () => getWeeklyVolumeData(workouts),
    [workouts]
  );

  const todayWorkout = useMemo(
    () =>
      workouts
        .filter(
          (workout) =>
            workout.scheduled_date === today &&
            workout.status !== "cancelled"
        )
        .sort((a, b) =>
          (a.scheduled_time || "").localeCompare(
            b.scheduled_time || ""
          )
        )[0] || null,
    [today, workouts]
  );

  const upcomingWorkouts = useMemo(
    () =>
      workouts
        .filter(
          (workout) =>
            workout.status === "pending" &&
            workout.scheduled_date >= today
        )
        .sort((a, b) => {
          const dateA = `${a.scheduled_date || ""} ${
            a.scheduled_time || ""
          }`;

          const dateB = `${b.scheduled_date || ""} ${
            b.scheduled_time || ""
          }`;

          return dateA.localeCompare(dateB);
        })
        .slice(0, 3),
    [today, workouts]
  );

  const recentWorkouts = useMemo(
    () =>
      workouts
        .filter((workout) => workout.status === "completed")
        .sort((a, b) =>
          (
            b.completed_at ||
            b.updated_at ||
            b.created_at ||
            ""
          ).localeCompare(
            a.completed_at ||
              a.updated_at ||
              a.created_at ||
              ""
          )
        )
        .slice(0, 4),
    [workouts]
  );

  const completionRate =
    totalCount > 0
      ? Math.round((completedCount / totalCount) * 100)
      : 0;

  return (
    <div className="space-y-7 pb-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface p-6 shadow-2xl sm:p-8 lg:p-9">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: `${ACCENT}12` }}
        />

        <div
          className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full blur-3xl"
          style={{ backgroundColor: `${ACCENT}08` }}
        />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div
              className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{
                borderColor: `${ACCENT}35`,
                backgroundColor: `${ACCENT}08`,
                color: ACCENT,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: ACCENT,
                  boxShadow: `0 0 10px ${ACCENT}`,
                }}
              />
              Training Dashboard
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
              Train smart.
              <span
                className="block"
                style={{ color: ACCENT }}
              >
                Stay consistent.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-text-secondary">
              Your training activity, upcoming sessions and workout
              progress — all in one place.
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            <Button
              as={Link}
              to="/workouts"
              variant="outline"
            >
              View Workouts
            </Button>

            <Button as={Link} to="/workouts/create" icon={Plus}>
              New Workout
            </Button>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section
        aria-label="Training statistics"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        <StatCard
          label="Total Workouts"
          icon={Dumbbell}
          value={isLoading || hasError ? undefined : totalCount}
        />

        <StatCard
          label="Completed"
          icon={CheckCircle2}
          value={
            isLoading || hasError
              ? undefined
              : completedCount
          }
        />

        <StatCard
          label="Pending"
          icon={Clock3}
          value={
            isLoading || hasError
              ? undefined
              : pendingCount
          }
        />

        <StatCard
          label="Current Streak"
          icon={Flame}
          tone="accent"
          value={
            isLoading || hasError
              ? undefined
              : streak
          }
        />

        <StatCard
          label="Training Volume"
          icon={TrendingUp}
          value={
            isLoading || hasError
              ? undefined
              : formatVolume(totalVolume)
          }
        />
      </section>

      {/* Today + Weekly Snapshot */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden">
          <Card.Header className="border-b border-white/5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Target
                    className="h-4 w-4"
                    style={{ color: ACCENT }}
                  />

                  <h2 className="font-display text-base font-semibold text-text-primary">
                    Today&apos;s Workout
                  </h2>
                </div>

                <p className="mt-1 text-xs text-text-muted">
                  {formatDate(today)}
                </p>
              </div>

              <Link
                to="/workouts"
                className="inline-flex items-center gap-1 text-xs font-semibold transition hover:opacity-80"
                style={{ color: ACCENT }}
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card.Header>

          <Card.Body>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : hasError ? (
              <EmptyState
                icon={History}
                title="Unable to load today's workout"
                description="Please refresh the page and try again."
                className="border-none bg-transparent py-10"
              />
            ) : !todayWorkout ? (
              <EmptyState
                icon={CalendarClock}
                title="No workout scheduled today"
                description="Plan your next session and keep your momentum going."
                action={
                  <Button
                    as={Link}
                    to="/workouts/create"
                    size="sm"
                  >
                    Schedule Workout
                  </Button>
                }
                className="border-none bg-transparent py-10"
              />
            ) : (
              <div className="space-y-4">
                <WorkoutCard workout={todayWorkout} />

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <InfoBox
                    label="Date"
                    value={formatDate(
                      todayWorkout.scheduled_date
                    )}
                  />

                  <InfoBox
                    label="Time"
                    value={
                      todayWorkout.scheduled_time || "--"
                    }
                  />

                  <InfoBox
                    label="Status"
                    value={todayWorkout.status}
                    accent
                  />

                  <InfoBox
                    label="Progress"
                    value={
                      todayWorkout.status === "completed"
                        ? "100%"
                        : "In plan"
                    }
                  />
                </div>
              </div>
            )}
          </Card.Body>
        </Card>

        <Card className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl"
            style={{ backgroundColor: `${ACCENT}12` }}
          />

          <Card.Header>
            <div>
              <h2 className="font-display text-base font-semibold text-text-primary">
                Weekly Snapshot
              </h2>

              <p className="mt-1 text-xs text-text-muted">
                Your current training rhythm
              </p>
            </div>
          </Card.Header>

          <Card.Body>
            <div className="relative">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <p className="text-xs text-text-muted">
                    Completion rate
                  </p>

                  <p className="mt-1 font-display text-4xl font-bold text-text-primary">
                    {isLoading || hasError
                      ? "--"
                      : `${completionRate}%`}
                  </p>
                </div>

                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full border-4"
                  style={{ borderColor: `${ACCENT}25` }}
                >
                  <Trophy
                    className="h-6 w-6"
                    style={{ color: ACCENT }}
                  />
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${completionRate}%`,
                    backgroundColor: ACCENT,
                  }}
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <MiniBox
                  label="Streak"
                  value={
                    isLoading || hasError
                      ? "--"
                      : streak
                  }
                  suffix="days"
                  icon={Flame}
                />

                <MiniBox
                  label="Volume"
                  value={
                    isLoading || hasError
                      ? "--"
                      : formatVolume(totalVolume)
                  }
                />
              </div>

              {cancelledCount > 0 && (
                <p className="mt-4 text-[11px] text-text-muted">
                  {cancelledCount} cancelled session
                  {cancelledCount > 1 ? "s" : ""} this cycle.
                </p>
              )}
            </div>
          </Card.Body>
        </Card>
      </section>

      {/* Upcoming + Recent */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CalendarClock
                    className="h-4 w-4"
                    style={{ color: ACCENT }}
                  />

                  <h2 className="font-display text-base font-semibold text-text-primary">
                    Upcoming Workouts
                  </h2>
                </div>

                <p className="mt-1 text-xs text-text-muted">
                  What&apos;s next on your schedule
                </p>
              </div>

              <Link
                to="/workouts"
                className="text-xs font-semibold"
                style={{ color: ACCENT }}
              >
                View all
              </Link>
            </div>
          </Card.Header>

          <Card.Body>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : upcomingWorkouts.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="Nothing scheduled"
                description="Your upcoming workouts will appear here."
                action={
                  <Button
                    as={Link}
                    to="/workouts/create"
                    size="sm"
                    variant="outline"
                  >
                    Schedule workout
                  </Button>
                }
                className="border-none bg-transparent py-8"
              />
            ) : (
              <div className="space-y-3">
                {upcomingWorkouts.map((workout) => (
                  <WorkoutCard
                    key={workout.id}
                    workout={workout}
                  />
                ))}
              </div>
            )}
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <History
                    className="h-4 w-4"
                    style={{ color: ACCENT }}
                  />

                  <h2 className="font-display text-base font-semibold text-text-primary">
                    Recent Workouts
                  </h2>
                </div>

                <p className="mt-1 text-xs text-text-muted">
                  Your latest completed sessions
                </p>
              </div>

              <Link
                to="/workouts"
                className="text-xs font-semibold"
                style={{ color: ACCENT }}
              >
                History
              </Link>
            </div>
          </Card.Header>

          <Card.Body>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : recentWorkouts.length === 0 ? (
              <EmptyState
                icon={History}
                title="No workout history yet"
                description="Completed workouts will appear here."
                className="border-none bg-transparent py-8"
              />
            ) : (
              <div className="space-y-3">
                {recentWorkouts.map((workout) => (
                  <WorkoutCard
                    key={workout.id}
                    workout={workout}
                  />
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </section>

      {/* REAL ANALYTICS */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <WorkoutActivityChart
          data={weeklyWorkoutData}
          isLoading={isLoading}
        />

        <TrainingVolumeChart
          data={weeklyVolumeData}
          isLoading={isLoading}
        />
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <QuickAction
          to="/workouts/create"
          icon={Plus}
          title="Create Workout"
          description="Build your next session with exercises, sets and reps."
        />

        <QuickAction
          to="/exercises"
          icon={Dumbbell}
          title="Exercise Library"
          description="Explore available exercises and training categories."
        />

        <QuickAction
          to="/reports"
          icon={TrendingUp}
          title="View Progress"
          description="Review your training reports and performance insights."
        />
      </section>
    </div>
  );
}

/* ----------------------------- */
/* Small UI Components            */
/* ----------------------------- */

function InfoBox({ label, value, accent = false }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.025] p-3">
      <p className="text-[10px] uppercase tracking-wider text-text-muted">
        {label}
      </p>

      <p
        className="mt-1 text-sm font-semibold capitalize"
        style={{
          color: accent ? ACCENT : undefined,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function MiniBox({
  label,
  value,
  suffix,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.025] p-4">
      <p className="text-[10px] uppercase tracking-wider text-text-muted">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">
        {Icon && (
          <Icon
            className="h-4 w-4"
            style={{ color: ACCENT }}
          />
        )}

        <span className="font-display text-xl font-bold text-text-primary">
          {value}
        </span>

        {suffix && (
          <span className="text-xs text-text-muted">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  title,
  description,
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-white/8 bg-surface p-5 transition duration-200 hover:-translate-y-1"
      style={{
        transitionProperty: "transform, border-color",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.borderColor = `${ACCENT}35`;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.borderColor = "";
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="rounded-xl p-3"
          style={{
            backgroundColor: `${ACCENT}10`,
            color: ACCENT,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>

        <ArrowRight className="h-4 w-4 text-text-muted transition group-hover:translate-x-1" />
      </div>

      <h3 className="mt-5 font-display text-sm font-semibold text-text-primary">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-text-muted">
        {description}
      </p>
    </Link>
  );
}

/* ----------------------------- */
/* Real Workout Chart             */
/* ----------------------------- */

function WorkoutActivityChart({ data, isLoading }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <Card>
      <Card.Header>
        <h2 className="font-display text-base font-semibold text-text-primary">
          Weekly Workouts
        </h2>

        <p className="mt-1 text-xs text-text-muted">
          Completed sessions during the last 7 days
        </p>
      </Card.Header>

      <Card.Body>
        {isLoading ? (
          <div className="flex h-56 items-end gap-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton
                key={index}
                className="flex-1 rounded-t-xl"
                style={{
                  height: `${35 + index * 7}%`,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-56 items-end gap-3">
            {data.map((item) => {
              const height =
                item.value === 0
                  ? 5
                  : Math.max(
                      (item.value / max) * 100,
                      12
                    );

              return (
                <div
                  key={item.label}
                  className="group flex h-full flex-1 flex-col items-center justify-end"
                >
                  <span className="mb-2 text-xs font-bold text-text-primary opacity-0 transition group-hover:opacity-100">
                    {item.value}
                  </span>

                  <div className="flex h-[78%] w-full items-end justify-center">
                    <div
                      className="w-full max-w-10 rounded-t-xl transition-all duration-300"
                      style={{
                        height: `${height}%`,
                        backgroundColor: ACCENT,
                        opacity: item.value === 0 ? 0.15 : 0.8,
                      }}
                      title={`${item.label}: ${item.value} completed`}
                    />
                  </div>

                  <span className="mt-3 text-[10px] font-medium text-text-muted">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

function TrainingVolumeChart({ data, isLoading }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <Card>
      <Card.Header>
        <h2 className="font-display text-base font-semibold text-text-primary">
          Training Volume
        </h2>

        <p className="mt-1 text-xs text-text-muted">
          Completed training volume during the last 7 days
        </p>
      </Card.Header>

      <Card.Body>
        {isLoading ? (
          <div className="h-56">
            <Skeleton className="h-full w-full rounded-2xl" />
          </div>
        ) : (
          <div className="relative h-56">
            <div className="absolute inset-x-0 top-2 border-t border-white/5" />
            <div className="absolute inset-x-0 top-1/3 border-t border-white/5" />
            <div className="absolute inset-x-0 top-2/3 border-t border-white/5" />

            <div className="absolute inset-0 flex items-end gap-3 pt-5">
              {data.map((item) => {
                const height =
                  item.value === 0
                    ? 3
                    : Math.max(
                        (item.value / max) * 100,
                        10
                      );

                return (
                  <div
                    key={item.label}
                    className="group flex h-full flex-1 flex-col items-center justify-end"
                  >
                    <span className="mb-2 text-[10px] font-bold text-text-primary opacity-0 transition group-hover:opacity-100">
                      {formatVolume(item.value)}
                    </span>

                    <div className="flex h-[78%] w-full items-end justify-center">
                      <div
                        className="w-full max-w-10 rounded-t-xl transition-all duration-300"
                        style={{
                          height: `${height}%`,
                          background: `linear-gradient(to top, ${ACCENT}55, ${ACCENT})`,
                        }}
                        title={`${item.label}: ${formatVolume(
                          item.value
                        )}`}
                      />
                    </div>

                    <span className="mt-3 text-[10px] font-medium text-text-muted">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}