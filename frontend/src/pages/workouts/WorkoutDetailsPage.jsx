import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Dumbbell,
  FileQuestion,
  Flame,
  Pencil,
  Target,
  Trash2,
  Trophy,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { ErrorState } from "../../components/common/ErrorState";
import { WorkoutStatusBadge } from "../../components/workout/WorkoutStatusBadge";
import { useDisclosure } from "../../hooks/useDisclosure";
import * as workoutService from "../../services/workoutService";
import {
  formatDate,
  formatDuration,
  formatLabel,
  formatTime,
} from "../../utils/formatters";

function calculateVolume(exercises) {
  return exercises.reduce((total, item) => {
    const sets = Number(item.sets || 0);
    const reps = Number(item.repetitions || 0);
    const weight = Number(item.weight || 0);

    if (!Number.isFinite(sets) || !Number.isFinite(reps)) {
      return total;
    }

    if (!Number.isFinite(weight)) {
      return total;
    }

    return total + sets * reps * weight;
  }, 0);
}

function formatVolume(volume) {
  if (!volume) {
    return "0 kg";
  }

  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K kg`;
  }

  return `${Math.round(volume)} kg`;
}

export default function WorkoutDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [workout, setWorkout] = useState(null);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [isCompleting, setIsCompleting] =
    useState(false);

  const deleteDialog =
    useDisclosure(false);

  const loadWorkout = () => {
    setStatus("loading");

    workoutService
      .getWorkout(id)
      .then((data) => {
        setWorkout(data);
        setStatus("ready");
      })
      .catch((error) => {
        setStatus(
          error?.response?.status === 404
            ? "not-found"
            : "error",
        );
      });
  };

  useEffect(() => {
    loadWorkout();
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await workoutService.deleteWorkout(id);

      toast.success("Workout deleted.");

      navigate("/workouts");
    } catch (error) {
      toast.error(
        workoutService.getWorkoutErrorMessage(
          error,
        ),
      );

      setIsDeleting(false);
      deleteDialog.close();
    }
  };

  const handleMarkComplete = async () => {
    setIsCompleting(true);

    try {
      const updated =
        await workoutService.markWorkoutComplete(
          id,
        );

      setWorkout(updated);

      toast.success(
        "Workout marked complete.",
      );
    } catch (error) {
      toast.error(
        workoutService.getWorkoutErrorMessage(
          error,
        ),
      );
    } finally {
      setIsCompleting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-3xl" />
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div>
        <EmptyState
          icon={FileQuestion}
          title="Workout not found"
          description="This workout doesn't exist, or it doesn't belong to your account."
          action={
            <Button
              as={Link}
              to="/workouts"
              variant="outline"
              icon={ArrowLeft}
            >
              Back to workouts
            </Button>
          }
        />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-white/8 bg-surface p-8">
        <ErrorState onRetry={loadWorkout} />
      </div>
    );
  }

  const exercises = workout.exercises ?? [];

  const totalSets = exercises.reduce(
    (total, item) =>
      total + Number(item.sets || 0),
    0,
  );

  const totalVolume =
    calculateVolume(exercises);

  const isCompleted =
    workout.status === "completed";

  return (
    <div className="space-y-6 pb-10">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative z-10">

          <button
            type="button"
            onClick={() => navigate("/workouts")}
            className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-text-muted transition hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to workouts
          </button>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div className="max-w-3xl">

              <div className="mb-3 flex flex-wrap items-center gap-2">
                <WorkoutStatusBadge
                  status={workout.status}
                />

                {isCompleted && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/5 px-2.5 py-1 text-[10px] font-semibold text-accent">
                    <CheckCircle2 className="h-3 w-3" />
                    Completed
                  </span>
                )}
              </div>

              <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
                {workout.name}
              </h1>

              {workout.description && (
                <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary">
                  {workout.description}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-4 text-xs text-text-muted">

                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-accent" />
                  {formatDate(
                    workout.scheduled_date,
                  )}
                </span>

                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-accent" />
                  {formatTime(
                    workout.scheduled_time,
                  )}
                </span>

              </div>
            </div>

            <div className="flex flex-wrap gap-2">

              <Button
                as={Link}
                to={`/workouts/${id}/edit`}
                variant="outline"
                size="sm"
                icon={Pencil}
              >
                Edit
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={Trash2}
                onClick={deleteDialog.open}
              >
                Delete
              </Button>

              {!isCompleted && (
                <Button
                  size="sm"
                  icon={CheckCircle2}
                  isLoading={isCompleting}
                  onClick={handleMarkComplete}
                >
                  Mark Complete
                </Button>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          WORKOUT METRICS
      ====================================================== */}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">

        <div className="rounded-2xl border border-white/8 bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-text-muted">
              Exercises
            </span>

            <Dumbbell className="h-4 w-4 text-accent" />
          </div>

          <p className="mt-4 font-display text-3xl font-bold text-text-primary">
            {exercises.length}
          </p>

          <p className="mt-1 text-[10px] text-text-muted">
            Movements in session
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-text-muted">
              Total Sets
            </span>

            <Target className="h-4 w-4 text-accent" />
          </div>

          <p className="mt-4 font-display text-3xl font-bold text-text-primary">
            {totalSets}
          </p>

          <p className="mt-1 text-[10px] text-text-muted">
            Across all exercises
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-text-muted">
              Volume
            </span>

            <TrendingUpIcon />
          </div>

          <p className="mt-4 font-display text-3xl font-bold text-text-primary">
            {formatVolume(totalVolume)}
          </p>

          <p className="mt-1 text-[10px] text-text-muted">
            Sets × reps × weight
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-text-muted">
              Status
            </span>

            {isCompleted ? (
              <Trophy className="h-4 w-4 text-accent" />
            ) : (
              <Flame className="h-4 w-4 text-accent" />
            )}
          </div>

          <p className="mt-4 font-display text-2xl font-bold capitalize text-text-primary">
            {workout.status}
          </p>

          <p className="mt-1 text-[10px] text-text-muted">
            Session state
          </p>
        </div>

      </section>

      {/* =====================================================
          EXERCISES
      ====================================================== */}

      <Card>
        <Card.Header>
          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-accent/10 p-2.5 text-accent">
                <Dumbbell className="h-4 w-4" />
              </div>

              <div>
                <h2 className="font-display text-base font-semibold text-text-primary">
                  Exercise Breakdown
                </h2>

                <p className="mt-1 text-xs text-text-muted">
                  Your planned work for this session.
                </p>
              </div>
            </div>

            <span className="hidden rounded-full border border-white/8 bg-white/[0.025] px-3 py-1.5 text-[10px] text-text-muted sm:block">
              {exercises.length} exercise
              {exercises.length === 1
                ? ""
                : "s"}
            </span>

          </div>
        </Card.Header>

        <Card.Body>

          {exercises.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <Dumbbell className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-text-primary">
                No exercises added
              </h3>

              <p className="mt-2 text-xs text-text-muted">
                This workout doesn't contain any exercises yet.
              </p>

              <Button
                as={Link}
                to={`/workouts/${id}/edit`}
                variant="outline"
                size="sm"
                icon={Pencil}
                className="mt-5"
              >
                Add Exercises
              </Button>

            </div>

          ) : (

            <div className="space-y-3">

              {exercises.map(
                (item, index) => (
                  <div
                    key={item.id}
                    className="group rounded-2xl border border-white/7 bg-white/[0.02] p-4 transition duration-200 hover:border-accent/15 hover:bg-white/[0.03] sm:p-5"
                  >

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                      <div className="flex items-start gap-4">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 font-display text-sm font-bold text-accent">
                          {String(
                            index + 1,
                          ).padStart(2, "0")}
                        </div>

                        <div>

                          <h3 className="font-display text-sm font-semibold text-text-primary sm:text-base">
                            {item.exercise_detail?.name ??
                              "Exercise"}
                          </h3>

                          <div className="mt-2 flex flex-wrap gap-1.5">

                            {item.exercise_detail?.category && (
                              <Badge variant="neutral">
                                {formatLabel(
                                  item
                                    .exercise_detail
                                    .category,
                                )}
                              </Badge>
                            )}

                            {item.exercise_detail?.muscle_group && (
                              <Badge variant="neutral">
                                {formatLabel(
                                  item
                                    .exercise_detail
                                    .muscle_group,
                                )}
                              </Badge>
                            )}

                          </div>

                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

                        <Metric
                          label="Sets"
                          value={item.sets ?? "--"}
                        />

                        <Metric
                          label="Reps"
                          value={
                            item.repetitions ??
                            "--"
                          }
                        />

                        <Metric
                          label="Weight"
                          value={
                            item.weight != null
                              ? `${item.weight} kg`
                              : "--"
                          }
                        />

                        <Metric
                          label="Rest"
                          value={
                            item.rest_seconds != null
                              ? formatDuration(
                                  item.rest_seconds,
                                )
                              : "--"
                          }
                        />

                      </div>

                    </div>

                    {(item.duration != null ||
                      item.notes) && (
                      <div className="mt-4 border-t border-white/5 pt-3">

                        {item.duration != null && (
                          <p className="text-[11px] text-text-muted">
                            Duration:{" "}
                            <span className="text-text-secondary">
                              {formatDuration(
                                item.duration,
                              )}
                            </span>
                          </p>
                        )}

                        {item.notes && (
                          <p className="mt-2 text-xs leading-5 text-text-muted">
                            {item.notes}
                          </p>
                        )}

                      </div>
                    )}

                  </div>
                ),
              )}

            </div>
          )}

        </Card.Body>
      </Card>

      {/* =====================================================
          COMMENTS
      ====================================================== */}

      {(workout.comments ||
        workout.completed_at) && (
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          {workout.comments && (
            <Card>
              <Card.Header>
                <h2 className="font-display text-base font-semibold text-text-primary">
                  Training Notes
                </h2>
              </Card.Header>

              <Card.Body>
                <p className="text-sm leading-7 text-text-secondary">
                  {workout.comments}
                </p>
              </Card.Body>
            </Card>
          )}

          {workout.completed_at && (
            <Card>
              <Card.Header>
                <h2 className="font-display text-base font-semibold text-text-primary">
                  Completion
                </h2>
              </Card.Header>

              <Card.Body>
                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-accent/10 p-3 text-accent">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs text-text-muted">
                      Completed at
                    </p>

                    <p className="mt-1 text-sm font-semibold text-text-primary">
                      {new Date(
                        workout.completed_at,
                      ).toLocaleString()}
                    </p>
                  </div>

                </div>
              </Card.Body>
            </Card>
          )}

        </section>
      )}

      {/* =====================================================
          DELETE DIALOG
      ====================================================== */}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDelete}
        title="Delete this workout?"
        description="This action cannot be undone. All exercises inside this workout will also be removed."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />

    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="min-w-[72px] rounded-xl border border-white/5 bg-black/10 px-3 py-2.5">
      <p className="text-[9px] uppercase tracking-wider text-text-muted">
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold text-text-primary">
        {value}
      </p>
    </div>
  );
}

function TrendingUpIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4 text-accent"
      aria-hidden="true"
    >
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  );
}