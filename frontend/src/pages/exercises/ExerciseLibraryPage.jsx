import { useEffect, useState } from "react";
import { Dumbbell, Search } from "lucide-react";

import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Skeleton } from "../../components/ui/Skeleton";
import { PageHeader } from "../../components/common/PageHeader";
import { ExerciseCard } from "../../components/workout/ExerciseCard";
import {
  EXERCISE_CATEGORY_OPTIONS,
  MUSCLE_GROUP_OPTIONS,
} from "../../utils/constants";

/**
 * Exercise library. No exerciseService.getExercises() call is wired up
 * yet, so the grid briefly "loads" and then settles into an empty state
 * rather than a fabricated exercise database.
 */
export default function ExerciseLibraryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");

  const exercises = [];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const hasFilters = Boolean(search || category || muscleGroup);

  return (
    <div>
      <PageHeader
        title="Exercise Library"
        description="Browse exercises to add to your workouts."
      />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input
          placeholder="Search exercises"
          icon={Search}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search exercises"
        />
        <Select
          placeholder="All categories"
          options={EXERCISE_CATEGORY_OPTIONS}
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filter by category"
        />
        <Select
          placeholder="All muscle groups"
          options={MUSCLE_GROUP_OPTIONS}
          value={muscleGroup}
          onChange={(event) => setMuscleGroup(event.target.value)}
          aria-label="Filter by muscle group"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton.Card key={index} />
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title={
            hasFilters ? "No exercises match your filters" : "Exercise library is empty"
          }
          description={
            hasFilters
              ? "Try a different search term or filter combination."
              : "Exercises will appear here once the exercise API is connected."
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="text-sm text-text-muted">Page 1 of 1</span>
          </div>
        </>
      )}
    </div>
  );
}
