import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Filter,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Skeleton } from "../../components/ui/Skeleton";
import { ErrorState } from "../../components/common/ErrorState";
import { WorkoutCard } from "../../components/workout/WorkoutCard";
import * as workoutService from "../../services/workoutService";
import { WORKOUT_STATUS_OPTIONS } from "../../utils/constants";

const ACCENT = "#BAFF24";

function normalizeWorkouts(data) {
  const results = Array.isArray(data)
    ? data
    : data?.results ?? [];

  return results.map((workout) => ({
    ...workout,
    exercise_count:
      workout.exercises?.length ??
      workout.workout_exercises?.length ??
      0,
  }));
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
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function WorkoutListPage() {
  const [status, setStatus] = useState("loading");
  const [workouts, setWorkouts] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [date, setDate] = useState("");

  const loadWorkouts = () => {
    setStatus("loading");

    workoutService
      .getWorkouts()
      .then((data) => {
        setWorkouts(normalizeWorkouts(data));
        setStatus("ready");
      })
      .catch(() => {
        setStatus("error");
      });
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const hasFilters = Boolean(
    search || statusFilter || date
  );

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setDate("");
  };

  const filteredWorkouts = useMemo(() => {
    return workouts.filter((workout) => {
      const searchValue = search.trim().toLowerCase();

      if (
        searchValue &&
        !workout.name?.toLowerCase().includes(searchValue)
      ) {
        return false;
      }

      if (
        statusFilter &&
        workout.status !== statusFilter
      ) {
        return false;
      }

      if (
        date &&
        workout.scheduled_date !== date
      ) {
        return false;
      }

      return true;
    });
  }, [workouts, search, statusFilter, date]);

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

  const completionRate =
    totalCount > 0
      ? Math.round(
          (completedCount / totalCount) * 100
        )
      : 0;

  return (
    <div className="space-y-6 pb-10">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl"
          style={{
            backgroundColor: `${ACCENT}12`,
          }}
        />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div
              className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{
                borderColor: `${ACCENT}35`,
                backgroundColor: `${ACCENT}08`,
                color: ACCENT,
              }}
            >
              <Sparkles className="h-3 w-3" />
              Training Library
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              Your Workouts
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
              Plan, manage and review every training session
              from one organized workspace.
            </p>
          </div>

          <Button
            as={Link}
            to="/workouts/create"
            icon={Plus}
          >
            Create Workout
          </Button>
        </div>
      </section>

      {/* =====================================================
          QUICK STATS
      ====================================================== */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/8 bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">
              Total
            </span>

            <Dumbbell
              className="h-4 w-4"
              style={{ color: ACCENT }}
            />
          </div>

          <p className="mt-4 font-display text-3xl font-bold text-text-primary">
            {status === "loading" ? "--" : totalCount}
          </p>

          <p className="mt-1 text-[10px] text-text-muted">
            All workouts
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">
              Completed
            </span>

            <CheckCircle2
              className="h-4 w-4"
              style={{ color: ACCENT }}
            />
          </div>

          <p className="mt-4 font-display text-3xl font-bold text-text-primary">
            {status === "loading"
              ? "--"
              : completedCount}
          </p>

          <p className="mt-1 text-[10px] text-text-muted">
            Finished sessions
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">
              Pending
            </span>

            <Clock3
              className="h-4 w-4"
              style={{ color: ACCENT }}
            />
          </div>

          <p className="mt-4 font-display text-3xl font-bold text-text-primary">
            {status === "loading"
              ? "--"
              : pendingCount}
          </p>

          <p className="mt-1 text-[10px] text-text-muted">
            Upcoming sessions
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">
              Completion
            </span>

            <TrendingUp
              className="h-4 w-4"
              style={{ color: ACCENT }}
            />
          </div>

          <p className="mt-4 font-display text-3xl font-bold text-text-primary">
            {status === "loading"
              ? "--"
              : `${completionRate}%`}
          </p>

          <p className="mt-1 text-[10px] text-text-muted">
            Overall completion rate
          </p>
        </div>
      </section>

      {/* =====================================================
          FILTER BAR
      ====================================================== */}
      <section className="rounded-2xl border border-white/8 bg-surface p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="rounded-lg p-2"
              style={{
                backgroundColor: `${ACCENT}10`,
                color: ACCENT,
              }}
            >
              <Filter className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                Find a workout
              </h2>

              <p className="text-[10px] text-text-muted">
                Search and filter your training sessions
              </p>
            </div>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold transition hover:opacity-80"
              style={{ color: ACCENT }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.5fr_1fr_1fr]">
          <Input
            placeholder="Search by workout name..."
            icon={Search}
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            aria-label="Search workouts"
          />

          <Select
            placeholder="All statuses"
            options={WORKOUT_STATUS_OPTIONS}
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            aria-label="Filter by status"
          />

          <Input
            type="date"
            value={date}
            onChange={(event) =>
              setDate(event.target.value)
            }
            aria-label="Filter by date"
          />
        </div>

        {hasFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-text-muted">
              Active:
            </span>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-text-secondary transition"
                onMouseEnter={(event) => {
                  event.currentTarget.style.borderColor =
                    `${ACCENT}35`;
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.borderColor = "";
                }}
              >
                Search: {search}
                <X className="h-3 w-3" />
              </button>
            )}

            {statusFilter && (
              <button
                type="button"
                onClick={() => setStatusFilter("")}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] capitalize text-text-secondary transition"
                onMouseEnter={(event) => {
                  event.currentTarget.style.borderColor =
                    `${ACCENT}35`;
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.borderColor = "";
                }}
              >
                Status: {statusFilter}
                <X className="h-3 w-3" />
              </button>
            )}

            {date && (
              <button
                type="button"
                onClick={() => setDate("")}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-text-secondary transition"
                onMouseEnter={(event) => {
                  event.currentTarget.style.borderColor =
                    `${ACCENT}35`;
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.borderColor = "";
                }}
              >
                Date: {formatDate(date)}
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </section>

      {/* =====================================================
          RESULT HEADER
      ====================================================== */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-text-primary">
            {hasFilters
              ? "Filtered Workouts"
              : "All Workouts"}
          </h2>

          <p className="mt-1 text-xs text-text-muted">
            {status === "loading"
              ? "Loading your training data..."
              : `${filteredWorkouts.length} session${
                  filteredWorkouts.length === 1
                    ? ""
                    : "s"
                } found`}
          </p>
        </div>

        {!hasFilters && cancelledCount > 0 && (
          <span className="hidden text-[10px] text-text-muted sm:block">
            {cancelledCount} cancelled
          </span>
        )}
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      {status === "loading" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton.Card key={index} />
          ))}
        </div>
      ) : status === "error" ? (
        <div className="rounded-2xl border border-white/8 bg-surface p-8">
          <ErrorState onRetry={loadWorkouts} />
        </div>
      ) : filteredWorkouts.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-surface">
          <EmptyState
            icon={hasFilters ? Search : Dumbbell}
            title={
              hasFilters
                ? "No workouts match your filters"
                : "No workouts yet"
            }
            description={
              hasFilters
                ? "Try changing your search, status or date filters."
                : "Create your first workout and start tracking your training."
            }
            action={
              hasFilters ? (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              ) : (
                <Button
                  as={Link}
                  to="/workouts/create"
                  icon={Plus}
                >
                  Create workout
                </Button>
              )
            }
            className="border-none bg-transparent py-16"
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredWorkouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
              />
            ))}
          </div>

          <div className="flex items-center justify-center pt-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-surface px-4 py-2 text-[10px] text-text-muted">
              <CalendarDays
                className="h-3.5 w-3.5"
                style={{ color: ACCENT }}
              />

              Showing {filteredWorkouts.length} workout
              {filteredWorkouts.length === 1
                ? ""
                : "s"}
            </div>
          </div>
        </>
      )}
    </div>
  );
}