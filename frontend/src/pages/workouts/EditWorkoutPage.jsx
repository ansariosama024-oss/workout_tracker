import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FileQuestion } from "lucide-react";

import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { ErrorState } from "../../components/common/ErrorState";
import { PageHeader } from "../../components/common/PageHeader";
import { WorkoutForm, mapWorkoutToFormValues } from "../../components/workout/WorkoutForm";
import * as workoutService from "../../services/workoutService";

/**
 * Edit Workout reuses the exact same <WorkoutForm /> used by Create
 * Workout -- see components/workout/WorkoutForm.jsx -- so the form itself
 * is never duplicated. This page's only job is fetching the real workout
 * by ID and translating it into the form's field shape.
 */
export default function EditWorkoutPage() {
  const { id } = useParams();
  const [status, setStatus] = useState("loading"); // loading | error | not-found | ready
  const [defaultValues, setDefaultValues] = useState(null);

  const loadWorkout = () => {
    setStatus("loading");
    workoutService
      .getWorkout(id)
      .then((workout) => {
        setDefaultValues(mapWorkoutToFormValues(workout));
        setStatus("ready");
      })
      .catch((error) => {
        setStatus(error?.response?.status === 404 ? "not-found" : "error");
      });
  };

  useEffect(loadWorkout, [id]);

  if (status === "loading") {
    return (
      <div>
        <PageHeader title="Edit workout" />
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div>
        <PageHeader title="Edit workout" />
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
        <PageHeader title="Edit workout" />
        <ErrorState onRetry={loadWorkout} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit workout"
        description="Update the plan and exercises for this session."
      />
      <WorkoutForm mode="edit" workoutId={id} defaultValues={defaultValues} />
    </div>
  );
}
