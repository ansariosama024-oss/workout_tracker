import { Dumbbell } from "lucide-react";

import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { formatLabel } from "../../utils/formatters";

/**
 * @param {{
 *   name: string,
 *   category: string,
 *   muscle_group: string,
 *   equipment?: string,
 *   description?: string,
 * }} exercise
 */
export function ExerciseCard({ exercise }) {
  return (
    <Card hoverable className="p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-primary-subtle text-primary">
          <Dumbbell className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-semibold text-text-primary">
            {exercise.name}
          </h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge variant="primary">{formatLabel(exercise.category)}</Badge>
            <Badge variant="neutral">{formatLabel(exercise.muscle_group)}</Badge>
          </div>
        </div>
      </div>

      {exercise.equipment && (
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-text-muted">
          Equipment: {exercise.equipment}
        </p>
      )}

      {exercise.description && (
        <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
          {exercise.description}
        </p>
      )}
    </Card>
  );
}
