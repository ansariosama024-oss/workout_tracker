import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Skeleton } from "../../components/ui/Skeleton";
import { PageHeader } from "../../components/common/PageHeader";
import { WorkoutForm } from "../../components/workout/WorkoutForm";

/**
 * Edit Workout reuses the exact same <WorkoutForm /> used by Create
 * Workout -- see components/workout/WorkoutForm.jsx -- so the form itself
 * is never duplicated.
 *
 * There is no workoutService.getWorkout() call yet, so this page can't
 * pre-fill real data. It shows a brief loading state (standing in for the
 * future fetch-by-id) and then renders the form with empty defaults.
 */
export default function EditWorkoutPage() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [id]);

  return (
    <div>
      <PageHeader
        title="Edit workout"
        description="Update the plan and exercises for this session."
      />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <div className="mb-4 rounded-lg border border-primary/20 bg-primary-subtle px-4 py-3 text-sm text-primary">
            This workout&apos;s existing details will pre-fill automatically
            once the backend API is connected. For now the form starts
            blank.
          </div>
          <WorkoutForm mode="edit" />
        </>
      )}
    </div>
  );
}
