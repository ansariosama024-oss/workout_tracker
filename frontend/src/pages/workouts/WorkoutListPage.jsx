import { useEffect, useState } from "react";
import { Dumbbell, Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Skeleton } from "../../components/ui/Skeleton";
import { PageHeader } from "../../components/common/PageHeader";
import { WorkoutCard } from "../../components/workout/WorkoutCard";
import { WORKOUT_STATUS_OPTIONS } from "../../utils/constants";

/**
 * Workout list. No workoutService.getWorkouts() call is wired up yet, so
 * the list briefly "loads" and then settles into an honest empty state.
 */
export default function WorkoutListPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");

  // Placeholder data set -- always empty until workoutService is connected.
  const workouts = [];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const hasFilters = Boolean(search || status || date);

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
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter by status"
        />
        <Input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          aria-label="Filter by date"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton.Card key={index} />
          ))}
        </div>
      ) : workouts.length === 0 ? (
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
            {workouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
          {/* Pagination placeholder -- wired up once the API supports paging. */}
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
