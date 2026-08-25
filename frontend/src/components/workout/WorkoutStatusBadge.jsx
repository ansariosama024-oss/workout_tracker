import { Badge } from "../ui/Badge";
import { WORKOUT_STATUS_BADGE_VARIANT } from "../../utils/constants";
import { formatLabel } from "../../utils/formatters";

/** Status badge for a workout, mapped to the shared color convention. */
export function WorkoutStatusBadge({ status }) {
  return (
    <Badge variant={WORKOUT_STATUS_BADGE_VARIANT[status] ?? "neutral"}>
      {formatLabel(status)}
    </Badge>
  );
}
