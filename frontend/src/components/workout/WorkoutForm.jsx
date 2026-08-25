import { useFieldArray, useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { WorkoutExerciseRow } from "./WorkoutExerciseRow";

const EMPTY_EXERCISE = {
  exercise: "",
  sets: "",
  repetitions: "",
  weight: "",
  duration: "",
  rest_seconds: "",
  notes: "",
};

/**
 * Shared workout builder form, used by both /workouts/create and
 * /workouts/:id/edit so the form is never duplicated.
 *
 * There is no backend integration yet: submitting shows a confirmation
 * toast and returns to the workout list rather than persisting anything.
 *
 * @param {"create"|"edit"} mode
 * @param {object} [defaultValues]
 */
export function WorkoutForm({ mode = "create", defaultValues }) {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: defaultValues ?? {
      name: "",
      description: "",
      scheduled_date: "",
      scheduled_time: "",
      workout_exercises: [EMPTY_EXERCISE],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "workout_exercises",
  });

  const onSubmit = async () => {
    // No backend integration yet -- this intentionally does not call
    // workoutService.createWorkout()/updateWorkout(). It only confirms
    // that the form captured input correctly.
    await new Promise((resolve) => setTimeout(resolve, 400));
    toast.success(
      mode === "create"
        ? "Workout form captured. Saving will be enabled once the API is connected."
        : "Changes captured. Saving will be enabled once the API is connected."
    );
    navigate("/workouts");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Card>
        <Card.Header>
          <h2 className="font-display text-base font-semibold text-text-primary">
            Workout information
          </h2>
        </Card.Header>
        <Card.Body className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Workout name"
              placeholder="e.g. Upper Body Strength"
              required
              error={errors.name?.message}
              {...register("name", { required: "Workout name is required." })}
            />
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Description"
              placeholder="What's the focus of this session?"
              {...register("description")}
            />
          </div>
          <Input
            label="Scheduled date"
            type="date"
            error={errors.scheduled_date?.message}
            {...register("scheduled_date")}
          />
          <Input
            label="Scheduled time"
            type="time"
            error={errors.scheduled_time?.message}
            {...register("scheduled_time")}
          />
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <div>
            <h2 className="font-display text-base font-semibold text-text-primary">
              Exercises
            </h2>
            <p className="mt-0.5 text-xs text-text-muted">
              Exercise options shown here are temporary placeholders for UI
              development -- the real exercise library will load from the
              backend in a later phase.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => append(EMPTY_EXERCISE)}
          >
            Add exercise
          </Button>
        </Card.Header>
        <Card.Body className="space-y-4">
          {fields.map((field, index) => (
            <WorkoutExerciseRow
              key={field.id}
              index={index}
              register={register}
              errors={errors.workout_exercises?.[index]}
              onRemove={() => remove(index)}
              canRemove={fields.length > 1}
            />
          ))}
        </Card.Body>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/workouts")}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === "create" ? "Save workout" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
