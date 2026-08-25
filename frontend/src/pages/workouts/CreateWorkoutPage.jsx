import { PageHeader } from "../../components/common/PageHeader";
import { WorkoutForm } from "../../components/workout/WorkoutForm";

export default function CreateWorkoutPage() {
  return (
    <div>
      <PageHeader
        title="Create workout"
        description="Plan a session and add the exercises you'll perform."
      />
      <WorkoutForm mode="create" />
    </div>
  );
}
