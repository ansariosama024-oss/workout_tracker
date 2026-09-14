import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Dumbbell,
  Filter,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Skeleton } from "../../components/ui/Skeleton";
import { PageHeader } from "../../components/common/PageHeader";
import { ExerciseCard } from "../../components/workout/ExerciseCard";
import { ErrorState } from "../../components/common/ErrorState";

import * as exerciseService from "../../services/exerciseService";
import {
  EXERCISE_CATEGORY_OPTIONS,
  MUSCLE_GROUP_OPTIONS,
} from "../../utils/constants";

export default function ExerciseLibraryPage() {
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadExercises = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await exerciseService.getExercises();

        if (isMounted) {
          setExercises(Array.isArray(data) ? data : data?.results ?? []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          toast.error(
            exerciseService.getExerciseErrorMessage
              ? exerciseService.getExerciseErrorMessage(err)
              : "Unable to load exercises."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadExercises();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredExercises = useMemo(() => {
    const query = search.trim().toLowerCase();

    return exercises.filter((exercise) => {
      const matchesSearch =
        !query ||
        exercise.name?.toLowerCase().includes(query) ||
        exercise.description?.toLowerCase().includes(query) ||
        exercise.muscle_group?.toLowerCase().includes(query);

      const matchesCategory =
        !category || exercise.category === category;

      const matchesMuscleGroup =
        !muscleGroup || exercise.muscle_group === muscleGroup;

      return matchesSearch && matchesCategory && matchesMuscleGroup;
    });
  }, [exercises, search, category, muscleGroup]);

  const hasFilters = Boolean(search || category || muscleGroup);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setMuscleGroup("");
  };

  const strengthCount = exercises.filter(
    (exercise) => exercise.category === "strength"
  ).length;

  const cardioCount = exercises.filter(
    (exercise) => exercise.category === "cardio"
  ).length;

  const flexibilityCount = exercises.filter(
    (exercise) => exercise.category === "flexibility"
  ).length;

  return (
    <div className="space-y-7">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#151515] via-[#101010] to-[#0a0a0a] px-6 py-8 sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#BAFF24]/10 blur-3xl" />

        <div className="relative max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#BAFF24]/20 bg-[#BAFF24]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#BAFF24]">
            <Sparkles className="h-3.5 w-3.5" />
            Exercise Intelligence
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Know your exercises.
            <span className="block text-[#BAFF24]">
              Train with purpose.
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55 sm:text-base">
            Explore your exercise library, find the right movement for each
            muscle group, and build better workouts.
          </p>
        </div>
      </section>

      {/* Stats */}
      {!isLoading && !error && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <LibraryStat
            label="Total exercises"
            value={exercises.length}
            icon={Dumbbell}
          />

          <LibraryStat
            label="Strength"
            value={strengthCount}
            icon={Activity}
          />

          <LibraryStat
            label="Cardio"
            value={cardioCount}
            icon={Activity}
          />

          <LibraryStat
            label="Flexibility"
            value={flexibilityCount}
            icon={Activity}
          />
        </div>
      )}

      {/* Filters */}
      <section className="rounded-2xl border border-white/10 bg-[#111111] p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
              <Filter className="h-4 w-4 text-[#BAFF24]" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white">
                Find an exercise
              </h2>
              <p className="text-xs text-white/40">
                Search or filter your library
              </p>
            </div>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white/50 transition hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input
            placeholder="Search exercises..."
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
      </section>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton.Card key={index} />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Couldn't load exercises"
          description="Something went wrong while loading your exercise library."
          onRetry={() => window.location.reload()}
        />
      ) : filteredExercises.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title={
            hasFilters
              ? "No exercises found"
              : "Exercise library is empty"
          }
          description={
            hasFilters
              ? "Try another search term or change your filters."
              : "Exercises will appear here once they are added to the database."
          }
          action={
            hasFilters
              ? {
                  label: "Clear filters",
                  onClick: clearFilters,
                }
              : undefined
          }
        />
      ) : (
        <>
          {/* Result header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#BAFF24]">
                Exercise Library
              </p>

              <h2 className="mt-1 text-xl font-bold text-white">
                {filteredExercises.length}{" "}
                {filteredExercises.length === 1
                  ? "exercise"
                  : "exercises"}
              </h2>
            </div>

            <p className="text-xs text-white/35">
              Showing {filteredExercises.length} of {exercises.length}
            </p>
          </div>

          {/* Exercise grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function LibraryStat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] p-4">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
          <Icon className="h-4 w-4 text-[#BAFF24]" />
        </div>

        <span className="text-2xl font-bold text-white">
          {value}
        </span>
      </div>

      <p className="mt-3 text-xs font-medium text-white/45">
        {label}
      </p>
    </div>
  );
}