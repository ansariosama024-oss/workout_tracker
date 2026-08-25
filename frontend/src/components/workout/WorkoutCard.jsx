import { CalendarDays, Clock, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";

import { Card } from "../ui/Card";
import { WorkoutStatusBadge } from "./WorkoutStatusBadge";
import { formatDate, formatTime } from "../../utils/formatters";

/**
 * Summary card for a single workout in the workout list.
 *
 * @param {{
 *   id: string|number,
 *   name: string,
 *   status: string,
 *   scheduled_date?: string,
 *   scheduled_time?: string,
 *   exercise_count?: number,
 * }} workout
 */
export function WorkoutCard({ workout }) {
  return (
    <Card hoverable className="p-5">
      <Link to={`/workouts/${workout.id}`} className="block focus:outline-none">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-semibold text-text-primary">
            {workout.name}
          </h3>
          <WorkoutStatusBadge status={workout.status} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-text-muted" aria-hidden="true" />
            {formatDate(workout.scheduled_date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-text-muted" aria-hidden="true" />
            {formatTime(workout.scheduled_time)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Dumbbell className="h-4 w-4 text-text-muted" aria-hidden="true" />
            {workout.exercise_count ?? 0} exercises
          </span>
        </div>
      </Link>
    </Card>
  );
}
