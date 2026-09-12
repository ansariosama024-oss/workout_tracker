import { useEffect, useState } from "react";
import { CheckCircle2, FileQuestion, Pencil, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { ErrorState } from "../../components/common/ErrorState";
import { PageHeader } from "../../components/common/PageHeader";
import { WorkoutStatusBadge } from "../../components/workout/WorkoutStatusBadge";
import { useDisclosure } from "../../hooks/useDisclosure";
import * as workoutService from "../../services/workoutService";
import {
  formatDate,
  formatDuration,
  formatLabel,
  formatTime,
} from "../../utils/formatters";

/** Workout details, backed by GET/DELETE/PATCH /api/workouts/{id}/. */
export default function WorkoutDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | error | not-found | ready
  const [workout, setWorkout] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const deleteDialog = useDisclosure(false);

  const loadWorkout = () => {
    setStatus("loading");
    workoutService
      .getWorkout(id)
      .then((data) => {
        setWorkout(data);
        setStatus("ready");
      })
      .catch((error) => {
        setStatus(error?.response?.status === 404 ? "not-found" : "error");
      });
  };

  useEffect(loadWorkout, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await workoutService.deleteWorkout(id);
      toast.success("Workout deleted.");
      navigate("/workouts");
    } catch (error) {
      toast.error(workoutService.getWorkoutErrorMessage(error));
      setIsDeleting(false);
      deleteDialog.close();
    }
  };

  const handleMarkComplete = async () => {
    setIsCompleting(true);
    try {
      const updated = await workoutService.markWorkoutComplete(id);
      setWorkout(updated);
      toast.success("Workout marked complete.");
    } catch (error) {
      toast.error(workoutService.getWorkoutErrorMessage(error));
    } finally {
      setIsCompleting(false);
    }
  };

  if (status === "loading") {
    return (
      <div>
        <PageHeader title="Workout details" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div>
        <PageHeader title="Workout details" />
        <EmptyState
          icon={FileQuestion}
          title="Workout not found"
          description="This workout doesn't exist, or it doesn't belong to your account."
          action={
            <Button as={Link} to="/workouts" variant="outline">
              Back to workouts
            </Button>
          }
        />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div>
        <PageHeader title="Workout details" />
        <ErrorState onRetry={loadWorkout} />
      </div>
    );
  }

  const exercises = workout.exercises ?? [];

  return (
    <div>
      <PageHeader
        title="Workout details"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/workouts")}>
            Back to workouts
          </Button>
        }
      />

      <Card>
        <Card.Header>
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary">
              {workout.name}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <WorkoutStatusBadge status={workout.status} />
              <span className="text-sm text-text-muted">
                {formatDate(workout.scheduled_date)} &middot;{" "}
                {formatTime(workout.scheduled_time)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
            {workout.status !== "completed" && (
              <Button
                size="sm"
                icon={CheckCircle2}
                isLoading={isCompleting}
                onClick={handleMarkComplete}
              >
                Mark complete
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body className="space-y-6">
          {workout.description && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Description
              </h3>
              <p className="mt-1 text-sm text-text-secondary">{workout.description}</p>
            </div>
          )}

          {workout.comments && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Comments
              </h3>
              <p className="mt-1 text-sm text-text-secondary">{workout.comments}</p>
            </div>
          )}

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Exercises
            </h3>
            {exercises.length === 0 ? (
              <p className="text-sm text-text-muted">No exercises added to this workout.</p>
            ) : (
              <ul className="space-y-3">
                {exercises.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-border bg-paper/60 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-text-primary">
                        {item.exercise_detail?.name ?? "Exercise"}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="neutral">
                          {formatLabel(item.exercise_detail?.category)}
                        </Badge>
                        <Badge variant="neutral">
                          {formatLabel(item.exercise_detail?.muscle_group)}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-text-secondary">
                      <span>{item.sets} sets</span>
                      {item.repetitions != null && <span>{item.repetitions} reps</span>}
                      {item.weight != null && <span>{item.weight} kg</span>}
                      {item.duration != null && (
                        <span>{formatDuration(item.duration)}</span>
                      )}
                      {item.rest_seconds != null && item.rest_seconds > 0 && (
                        <span>{formatDuration(item.rest_seconds)} rest</span>
                      )}
                    </div>
                    {item.notes && (
                      <p className="mt-2 text-sm text-text-muted">{item.notes}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card.Body>
      </Card>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDelete}
        title="Delete this workout?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}
