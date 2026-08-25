import { useEffect, useState } from "react";
import { CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { ErrorState } from "../../components/common/ErrorState";
import { PageHeader } from "../../components/common/PageHeader";
import { useDisclosure } from "../../hooks/useDisclosure";

/**
 * Workout details. There is no workoutService.getWorkout() call wired up
 * yet, so this page resolves its simulated fetch to "not found" rather
 * than inventing a fake workout to display.
 */
export default function WorkoutDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | not-found | error
  const deleteDialog = useDisclosure(false);

  useEffect(() => {
    setStatus("loading");
    const timer = setTimeout(() => setStatus("not-found"), 500);
    return () => clearTimeout(timer);
  }, [id]);

  const handleDelete = () => {
    deleteDialog.close();
    toast("Delete will be enabled once the API is connected.");
  };

  if (status === "loading") {
    return (
      <div>
        <PageHeader title="Workout details" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div>
        <PageHeader title="Workout details" />
        <ErrorState onRetry={() => setStatus("loading")} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Workout details"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/workouts")}>
            Back to workouts
          </Button>
        }
      />

      <EmptyState
        icon={CheckCircle2}
        title="This workout isn't available yet"
        description={`No workout with ID "${id}" could be loaded because the workout API isn't connected in this phase.`}
        action={
          <Button as={Link} to="/workouts" variant="outline">
            Return to workout list
          </Button>
        }
      />

      {/* Structural preview of the details layout, ready for real data. */}
      <Card className="mt-6 opacity-60">
        <Card.Header>
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary">
              Workout title
            </h2>
            <div className="mt-1.5 flex items-center gap-2">
              <Badge variant="neutral">Status</Badge>
              <span className="text-sm text-text-muted">Schedule &middot; Comments</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={Pencil} disabled>
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Trash2}
              disabled
              onClick={deleteDialog.open}
            >
              Delete
            </Button>
            <Button size="sm" icon={CheckCircle2} disabled>
              Mark complete
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <p className="text-sm text-text-secondary">
            Description, exercise list (sets, reps, weight, duration, rest,
            notes) will render here once workout data is available.
          </p>
        </Card.Body>
      </Card>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDelete}
        title="Delete this workout?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}
