import { Trash2 } from "lucide-react";

import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";

/**
 * One exercise entry inside the workout builder (Create/Edit Workout).
 *
 * @param {number} index - position within the field array
 * @param {import("react-hook-form").UseFormRegister} register
 * @param {object} [errors] - errors.workout_exercises[index], if any
 * @param {() => void} onRemove
 * @param {boolean} canRemove
 * @param {{id: number|string, name: string}[]} exerciseOptions - from
 *   exerciseService.getExercises(), fetched once by the parent form
 * @param {boolean} exerciseOptionsLoading
 */
export function WorkoutExerciseRow({
  index,
  register,
  errors,
  onRemove,
  canRemove,
  exerciseOptions,
  exerciseOptionsLoading,
}) {
  const rowErrors = errors ?? {};

  return (
    <div className="rounded-xl border border-border bg-paper/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="mt-2 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary-subtle text-xs font-semibold text-primary">
          {index + 1}
        </span>
        <div className="flex-1">
          <Select
            label="Exercise"
            placeholder={
              exerciseOptionsLoading ? "Loading exercises..." : "Select an exercise"
            }
            options={exerciseOptions.map((exercise) => ({
              value: String(exercise.id),
              label: exercise.name,
            }))}
            disabled={exerciseOptionsLoading}
            error={rowErrors.exercise?.message}
            required
            {...register(`workout_exercises.${index}.exercise`, {
              required: "Select an exercise.",
            })}
          />
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove exercise ${index + 1}`}
            className="mt-2 flex h-8 w-8 flex-none items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-danger-subtle hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Input
          label="Sets"
          type="number"
          min="1"
          step="1"
          error={rowErrors.sets?.message}
          {...register(`workout_exercises.${index}.sets`, {
            required: "Required",
            min: { value: 1, message: "> 0" },
          })}
        />
        <Input
          label="Reps"
          type="number"
          min="1"
          step="1"
          error={rowErrors.repetitions?.message}
          {...register(`workout_exercises.${index}.repetitions`, {
            min: { value: 1, message: "> 0" },
          })}
        />
        <Input
          label="Weight (kg)"
          type="number"
          min="0"
          step="0.5"
          error={rowErrors.weight?.message}
          {...register(`workout_exercises.${index}.weight`, {
            min: { value: 0, message: ">= 0" },
          })}
        />
        <Input
          label="Duration (s)"
          type="number"
          min="0"
          step="1"
          error={rowErrors.duration?.message}
          {...register(`workout_exercises.${index}.duration`, {
            min: { value: 0, message: ">= 0" },
          })}
        />
        <Input
          label="Rest (s)"
          type="number"
          min="0"
          step="1"
          error={rowErrors.rest_seconds?.message}
          {...register(`workout_exercises.${index}.rest_seconds`, {
            min: { value: 0, message: ">= 0" },
          })}
        />
      </div>

      <div className="mt-3">
        <Textarea
          label="Notes"
          rows={2}
          placeholder="Optional notes for this exercise"
          {...register(`workout_exercises.${index}.notes`)}
        />
      </div>
    </div>
  );
}
