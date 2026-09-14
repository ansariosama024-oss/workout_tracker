import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Flame,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

import { Card } from "../../components/ui/Card";
import { Skeleton } from "../../components/ui/Skeleton";
import { ErrorState } from "../../components/common/ErrorState";
import { PageHeader } from "../../components/common/PageHeader";
import * as workoutService from "../../services/workoutService";

export default function ReportsPage() {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadReports = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await workoutService.getWorkouts();

        if (mounted) {
          setWorkouts(Array.isArray(data) ? data : data?.results ?? []);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
          toast.error(
            workoutService.getWorkoutErrorMessage
              ? workoutService.getWorkoutErrorMessage(err)
              : "Unable to load workout reports."
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadReports();

    return () => {
      mounted = false;
    };
  }, []);

  const analytics = useMemo(() => {
    const completed = workouts.filter(
      (workout) => workout.status === "completed"
    );

    let totalVolume = 0;
    let totalSets = 0;
    let exerciseCount = 0;

    const exerciseFrequency = {};

    workouts.forEach((workout) => {
      const exercises = workout.exercises || workout.workout_exercises || [];

      exercises.forEach((item) => {
        const sets = Number(item.sets || 0);
        const reps = Number(item.repetitions || item.reps || 0);
        const weight = Number(item.weight || 0);

        totalSets += sets;
        exerciseCount += 1;
        totalVolume += sets * reps * weight;

        const name =
          item.exercise_name ||
          item.exercise?.name ||
          "Unknown exercise";

        exerciseFrequency[name] =
          (exerciseFrequency[name] || 0) + 1;
      });
    });

    const topExercises = Object.entries(exerciseFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const weekly = getWeeklyData(workouts);
    const monthly = getMonthlyData(workouts);

    return {
      completedCount: completed.length,
      totalVolume,
      totalSets,
      exerciseCount,
      weekly,
      monthly,
      topExercises,
    };
  }, [workouts]);

  if (isLoading) {
    return <ReportsSkeleton />;
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Reports"
          description="Analyze your training trends over time."
        />

        <ErrorState
          title="Couldn't load reports"
          description="Something went wrong while loading your workout analytics."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#151515] via-[#101010] to-[#090909] px-6 py-8 sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#BAFF24]/10 blur-3xl" />

        <div className="relative max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#BAFF24]/20 bg-[#BAFF24]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#BAFF24]">
            <TrendingUp className="h-3.5 w-3.5" />
            Training Analytics
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            See your progress.
            <span className="block text-[#BAFF24]">
              Train smarter.
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55 sm:text-base">
            Understand your workout consistency, training volume, and
            exercise patterns from your logged workouts.
          </p>
        </div>
      </section>

      {/* Summary */}
      <section
        aria-label="Training summary"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <ReportStat
          label="Sessions"
          value={workouts.length}
          icon={Dumbbell}
        />

        <ReportStat
          label="Completed"
          value={analytics.completedCount}
          icon={CheckCircle2}
        />

        <ReportStat
          label="Total Sets"
          value={analytics.totalSets}
          icon={Activity}
        />

        <ReportStat
          label="Total Volume"
          value={formatVolume(analytics.totalVolume)}
          icon={TrendingUp}
          accent
        />
      </section>

      {/* Weekly activity */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ActivityChart
          title="Weekly Activity"
          description="Workouts logged during the last 7 days"
          data={analytics.weekly}
        />

        <ActivityChart
          title="Monthly Activity"
          description="Workouts logged during the last 6 months"
          data={analytics.monthly}
          monthly
        />
      </section>

      {/* Volume + exercise frequency */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <VolumeCard volume={analytics.totalVolume} />

        <TopExercisesCard exercises={analytics.topExercises} />
      </section>

      {/* Progress overview */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#BAFF24]/10">
              <CalendarDays className="h-5 w-5 text-[#BAFF24]" />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold text-white">
                Progress Overview
              </h2>
              <p className="mt-0.5 text-xs text-white/40">
                Your current workout history
              </p>
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          {workouts.length === 0 ? (
            <div className="py-8 text-center">
              <Dumbbell className="mx-auto h-8 w-8 text-white/20" />

              <p className="mt-3 text-sm font-medium text-white">
                No workout history yet
              </p>

              <p className="mt-1 text-xs text-white/40">
                Complete and log workouts to see your progress here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <MiniMetric
                label="Exercises logged"
                value={analytics.exerciseCount}
              />

              <MiniMetric
                label="Sets completed"
                value={analytics.totalSets}
              />

              <MiniMetric
                label="Workouts completed"
                value={analytics.completedCount}
              />
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

/* ----------------------------- */
/* Components                    */
/* ----------------------------- */

function ReportStat({ label, value, icon: Icon, accent = false }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            accent ? "bg-[#BAFF24]/10" : "bg-white/5"
          }`}
        >
          <Icon
            className={`h-4.5 w-4.5 ${
              accent ? "text-[#BAFF24]" : "text-white/60"
            }`}
          />
        </div>

        <span className="text-xl font-bold text-white sm:text-2xl">
          {value}
        </span>
      </div>

      <p className="mt-4 text-xs font-medium text-white/40">
        {label}
      </p>
    </div>
  );
}

function ActivityChart({
  title,
  description,
  data,
  monthly = false,
}) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <Card>
      <Card.Header>
        <h2 className="font-display text-base font-semibold text-white">
          {title}
        </h2>

        <p className="mt-1 text-xs text-white/40">
          {description}
        </p>
      </Card.Header>

      <Card.Body>
        <div className="flex h-52 items-end gap-2 sm:gap-3">
          {data.map((item) => {
            const height =
              item.value === 0
                ? 4
                : Math.max((item.value / max) * 100, 8);

            return (
              <div
                key={item.label}
                className="group flex h-full flex-1 flex-col items-center justify-end"
              >
                <div className="mb-2 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                  {item.value}
                </div>

                <div className="flex h-[80%] w-full items-end justify-center">
                  <div
                    className="w-full max-w-10 rounded-t-lg bg-[#BAFF24]/70 transition-all duration-300 group-hover:bg-[#BAFF24]"
                    style={{ height: `${height}%` }}
                    title={`${item.label}: ${item.value}`}
                  />
                </div>

                <span className="mt-3 truncate text-[10px] text-white/35 sm:text-xs">
                  {monthly ? item.label : item.label.slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </Card.Body>
    </Card>
  );
}

function VolumeCard({ volume }) {
  return (
    <Card>
      <Card.Header>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#BAFF24]/10">
            <TrendingUp className="h-5 w-5 text-[#BAFF24]" />
          </div>

          <div>
            <h2 className="font-display text-base font-semibold text-white">
              Training Volume
            </h2>
            <p className="mt-0.5 text-xs text-white/40">
              Total weight × reps × sets
            </p>
          </div>
        </div>
      </Card.Header>

      <Card.Body>
        <div className="py-4">
          <p className="text-4xl font-bold tracking-tight text-white">
            {formatVolume(volume)}
          </p>

          <p className="mt-2 text-sm text-white/40">
            total training volume
          </p>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-[#BAFF24]"
              style={{
                width: volume > 0 ? "100%" : "0%",
              }}
            />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

function TopExercisesCard({ exercises }) {
  return (
    <Card>
      <Card.Header>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
            <Dumbbell className="h-5 w-5 text-white/60" />
          </div>

          <div>
            <h2 className="font-display text-base font-semibold text-white">
              Exercise Frequency
            </h2>
            <p className="mt-0.5 text-xs text-white/40">
              Most frequently logged exercises
            </p>
          </div>
        </div>
      </Card.Header>

      <Card.Body>
        {exercises.length === 0 ? (
          <p className="py-8 text-center text-sm text-white/35">
            Exercise frequency will appear after you log exercises.
          </p>
        ) : (
          <div className="space-y-4">
            {exercises.map(([name, count], index) => {
              const max = exercises[0][1];
              const width = (count / max) * 100;

              return (
                <div key={name}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium text-white">
                      {index + 1}. {name}
                    </span>

                    <span className="shrink-0 text-xs text-white/40">
                      {count}×
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-[#BAFF24]"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-white/40">{label}</p>
    </div>
  );
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-44 w-full rounded-3xl" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton.Card key={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton.Card />
        <Skeleton.Card />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton.Card />
        <Skeleton.Card />
      </div>
    </div>
  );
}

/* ----------------------------- */
/* Analytics helpers              */
/* ----------------------------- */

function getWeeklyData(workouts) {
  const days = [];

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);

    const key = formatDateKey(date);

    const count = workouts.filter((workout) => {
      const workoutDate = workout.scheduled_date || workout.date;

      return workoutDate && workoutDate.slice(0, 10) === key;
    }).length;

    days.push({
      label: date.toLocaleDateString(undefined, {
        weekday: "short",
      }),
      value: count,
    });
  }

  return days;
}

function getMonthlyData(workouts) {
  const months = [];

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - i);

    const year = date.getFullYear();
    const month = date.getMonth();

    const count = workouts.filter((workout) => {
      const workoutDate = workout.scheduled_date || workout.date;

      if (!workoutDate) return false;

      const parsed = new Date(workoutDate);

      return (
        parsed.getFullYear() === year &&
        parsed.getMonth() === month
      );
    }).length;

    months.push({
      label: date.toLocaleDateString(undefined, {
        month: "short",
      }),
      value: count,
    });
  }

  return months;
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatVolume(value) {
  if (!value) return "0 kg";

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M kg`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K kg`;
  }

  return `${Math.round(value)} kg`;
}