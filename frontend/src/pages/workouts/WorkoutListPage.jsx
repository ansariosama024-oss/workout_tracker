import { useEffect, useMemo, useState } from "react";
import { Dumbbell, Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Skeleton } from "../../components/ui/Skeleton";
import { ErrorState } from "../../components/common/ErrorState";
import { PageHeader } from "../../components/common/PageHeader";
import { WorkoutCard } from "../../components/workout/WorkoutCard";
import * as workoutService from "../../services/workoutService";
import { WORKOUT_STATUS_OPTIONS } from "../../utils/constants";

/** Workout list, backed by GET /api/workouts/. */
export default function WorkoutListPage() {
  const [status, setStatus] = useState("loading"); // loading | error | ready
  const [workouts, setWorkouts] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [date, setDate] = useState("");

  const loadWorkouts = () => {
    setStatus("loading");
    workoutService
      .getWorkouts()
      .then((data) => {
        const results = Array.isArray(data) ? data : data.results ?? [];
        // WorkoutCard expects `exercise_count`; the API returns the full
        // nested `exercises` array (same serializer as the detail view),
        // so derive the count here rather than changing WorkoutCard.
        setWorkouts(
          results.map((workout) => ({
            ...workout,
            exercise_count: workout.exercises?.length ?? 0,
          }))
        );
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(loadWorkouts, []);

  const hasFilters = Boolean(search || statusFilter || date);

  const filteredWorkouts = useMemo(() => {
    return workouts.filter((workout) => {
      if (
        search &&
        !workout.name?.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      if (statusFilter && workout.status !== statusFilter) return false;
      if (date && workout.scheduled_date !== date) return false;
      return true;
    });
  }, [workouts, search, statusFilter, date]);

  return (
    <div>
      <PageHeader
        title="Workouts"
        description="Everything you've planned and logged."
        actions={
          <Button as={Link} to="/workouts/create" icon={Plus}>
            Create workout
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input
          placeholder="Search workouts"
          icon={Search}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search workouts"
        />
        <Select
          placeholder="All statuses"
          options={WORKOUT_STATUS_OPTIONS}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter by status"
        />
        <Input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          aria-label="Filter by date"
        />
      </div>

      {status === "loading" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton.Card key={index} />
          ))}
        </div>
      ) : status === "error" ? (
        <ErrorState onRetry={loadWorkouts} />
      ) : filteredWorkouts.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title={hasFilters ? "No workouts match your filters" : "No workouts yet"}
          description={
            hasFilters
              ? "Try adjusting your search, status, or date filters."
              : "Create your first workout to start tracking your training."
          }
          action={
            !hasFilters && (
              <Button as={Link} to="/workouts/create" icon={Plus}>
                Create workout
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredWorkouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
          {/* Pagination placeholder -- wired up once list volume needs it. */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <span className="text-sm text-text-muted">Page 1 of 1</span>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
