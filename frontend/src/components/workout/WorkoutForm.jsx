import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { InlineAlert } from "../common/InlineAlert";
import { WorkoutExerciseRow } from "./WorkoutExerciseRow";
import * as exerciseService from "../../services/exerciseService";
import * as workoutService from "../../services/workoutService";
import { getFieldErrors } from "../../utils/apiErrors";

const EMPTY_EXERCISE = {
  exercise: "",
  sets: "",
  repetitions: "",
  weight: "",
  duration: "",
  rest_seconds: "",
  notes: "",
};

const FORM_FIELD_NAMES = ["name", "description", "scheduled_date", "scheduled_time"];

/** Native <input type="time"> yields "HH:MM"; the API needs seconds. */
function toApiTime(value) {
  if (!value) return null;
  return value.length === 5 ? `${value}:00` : value;
}

function toApiNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

/** Builds the exact payload shape the Phase 5 Workout API expects. */
function buildWorkoutPayload(formValues) {
  const exercises = (formValues.workout_exercises ?? [])
    .filter((item) => item.exercise)
    .map((item) => {
      const entry = { exercise: Number(item.exercise), sets: toApiNumber(item.sets) };
      const repetitions = toApiNumber(item.repetitions);
      if (repetitions !== null) entry.repetitions = repetitions;
      const weight = toApiNumber(item.weight);
      if (weight !== null) entry.weight = weight;
      const duration = toApiNumber(item.duration);
      if (duration !== null) entry.duration = duration;
      const restSeconds = toApiNumber(item.rest_seconds);
      if (restSeconds !== null) entry.rest_seconds = restSeconds;
      if (item.notes) entry.notes = item.notes;
      return entry;
    });

  return {
    name: formValues.name,
    description: formValues.description || "",
    scheduled_date: formValues.scheduled_date || null,
    scheduled_time: toApiTime(formValues.scheduled_time),
    exercises,
  };
}

/**
 * Converts a Workout API response into this form's field shape. Exported
 * so EditWorkoutPage can build `defaultValues` after fetching the workout.
 */
export function mapWorkoutToFormValues(workout) {
  return {
    name: workout.name ?? "",
    description: workout.description ?? "",
    scheduled_date: workout.scheduled_date ?? "",
    scheduled_time: workout.scheduled_time ? workout.scheduled_time.slice(0, 5) : "",
    workout_exercises: (workout.exercises ?? []).map((item) => ({
      exercise: String(item.exercise),
      sets: item.sets ?? "",
      repetitions: item.repetitions ?? "",
      weight: item.weight ?? "",
      duration: item.duration ?? "",
      rest_seconds: item.rest_seconds ?? "",
      notes: item.notes ?? "",
    })),
  };
}

/**
 * Shared workout builder form, used by both /workouts/create and
 * /workouts/:id/edit so the form is never duplicated.
 *
 * @param {"create"|"edit"} mode
 * @param {string|number} [workoutId] - required in edit mode
 * @param {object} [defaultValues]
 */
export function WorkoutForm({ mode = "create", workoutId, defaultValues }) {
  const navigate = useNavigate();
  const [formError, setFormError] = useState(null);
  const [exerciseOptions, setExerciseOptions] = useState([]);
  const [exerciseOptionsLoading, setExerciseOptionsLoading] = useState(true);
  const [exerciseOptionsError, setExerciseOptionsError] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
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

  const loadExerciseOptions = () => {
    setExerciseOptionsLoading(true);
    setExerciseOptionsError(null);
    exerciseService
      .getExercises()
      .then((data) => {
        const list = Array.isArray(data) ? data : data.results ?? [];
        setExerciseOptions(list);
      })
      .catch((error) => {
        setExerciseOptionsError(workoutService.getWorkoutErrorMessage(error));
      })
      .finally(() => setExerciseOptionsLoading(false));
  };

  useEffect(() => {
    loadExerciseOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values) => {
    setFormError(null);
    const payload = buildWorkoutPayload(values);

    try {
      if (mode === "create") {
        await workoutService.createWorkout(payload);
        toast.success("Workout created.");
      } else {
        // Partial update: omitting status/comments/completed_at (which
        // this form doesn't manage) leaves them exactly as they were.
        await workoutService.patchWorkout(workoutId, payload);
        toast.success("Workout updated.");
      }
      navigate("/workouts");
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      let mappedCount = 0;
      FORM_FIELD_NAMES.forEach((field) => {
        if (fieldErrors[field]) {
          setError(field, { type: "server", message: fieldErrors[field] });
          mappedCount += 1;
        }
      });
      const hasUnmappedErrors = Object.keys(fieldErrors).some(
        (key) => !FORM_FIELD_NAMES.includes(key)
      );
      if (hasUnmappedErrors || mappedCount === 0) {
        setFormError(workoutService.getWorkoutErrorMessage(error));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {formError && <InlineAlert variant="error">{formError}</InlineAlert>}

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
              error={errors.description?.message}
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
            {exerciseOptionsError ? (
              <p className="mt-0.5 text-xs text-danger">
                Couldn&apos;t load exercises: {exerciseOptionsError}{" "}
                <button
                  type="button"
                  onClick={loadExerciseOptions}
                  className="font-medium underline underline-offset-2"
                >
                  Retry
                </button>
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-text-muted">
                Add the exercises you&apos;ll perform in this session.
              </p>
            )}
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
          {fields.length === 0 && (
            <p className="text-sm text-text-muted">No exercises added yet.</p>
          )}
          {fields.map((field, index) => (
            <WorkoutExerciseRow
              key={field.id}
              index={index}
              register={register}
              errors={errors.workout_exercises?.[index]}
              onRemove={() => remove(index)}
              canRemove
              exerciseOptions={exerciseOptions}
              exerciseOptionsLoading={exerciseOptionsLoading}
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
