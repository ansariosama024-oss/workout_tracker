import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Dumbbell,
  FileText,
  Plus,
  Save,
  Sparkles,
} from "lucide-react";
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

const FORM_FIELD_NAMES = [
  "name",
  "description",
  "scheduled_date",
  "scheduled_time",
];

function toApiTime(value) {
  if (!value) return null;

  return value.length === 5
    ? `${value}:00`
    : value;
}

function toApiNumber(value) {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isNaN(number)
    ? null
    : number;
}

function buildWorkoutPayload(formValues) {
  const exercises = (
    formValues.workout_exercises ?? []
  )
    .filter((item) => item.exercise)
    .map((item) => {
      const entry = {
        exercise: Number(item.exercise),
        sets: toApiNumber(item.sets),
      };

      const repetitions = toApiNumber(
        item.repetitions,
      );

      if (repetitions !== null) {
        entry.repetitions = repetitions;
      }

      const weight = toApiNumber(
        item.weight,
      );

      if (weight !== null) {
        entry.weight = weight;
      }

      const duration = toApiNumber(
        item.duration,
      );

      if (duration !== null) {
        entry.duration = duration;
      }

      const restSeconds = toApiNumber(
        item.rest_seconds,
      );

      if (restSeconds !== null) {
        entry.rest_seconds = restSeconds;
      }

      if (item.notes) {
        entry.notes = item.notes;
      }

      return entry;
    });

  return {
    name: formValues.name,
    description: formValues.description || "",
    scheduled_date:
      formValues.scheduled_date || null,
    scheduled_time: toApiTime(
      formValues.scheduled_time,
    ),
    exercises,
  };
}

export function mapWorkoutToFormValues(workout) {
  return {
    name: workout.name ?? "",
    description: workout.description ?? "",
    scheduled_date:
      workout.scheduled_date ?? "",
    scheduled_time: workout.scheduled_time
      ? workout.scheduled_time.slice(0, 5)
      : "",
    workout_exercises: (
      workout.exercises ?? []
    ).map((item) => ({
      exercise: String(item.exercise),
      sets: item.sets ?? "",
      repetitions: item.repetitions ?? "",
      weight: item.weight ?? "",
      duration: item.duration ?? "",
      rest_seconds:
        item.rest_seconds ?? "",
      notes: item.notes ?? "",
    })),
  };
}

export function WorkoutForm({
  mode = "create",
  workoutId,
  defaultValues,
}) {
  const navigate = useNavigate();

  const [formError, setFormError] =
    useState(null);

  const [
    exerciseOptions,
    setExerciseOptions,
  ] = useState([]);

  const [
    exerciseOptionsLoading,
    setExerciseOptionsLoading,
  ] = useState(true);

  const [
    exerciseOptionsError,
    setExerciseOptionsError,
  ] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    defaultValues:
      defaultValues ?? {
        name: "",
        description: "",
        scheduled_date: "",
        scheduled_time: "",
        workout_exercises: [
          EMPTY_EXERCISE,
        ],
      },
  });

  const {
    fields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "workout_exercises",
  });

  const loadExerciseOptions = () => {
    setExerciseOptionsLoading(true);
    setExerciseOptionsError(null);

    exerciseService
      .getExercises()
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : data?.results ?? [];

        setExerciseOptions(list);
      })
      .catch((error) => {
        setExerciseOptionsError(
          workoutService.getWorkoutErrorMessage(
            error,
          ),
        );
      })
      .finally(() => {
        setExerciseOptionsLoading(false);
      });
  };

  useEffect(() => {
    loadExerciseOptions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values) => {
    setFormError(null);

    const payload =
      buildWorkoutPayload(values);

    if (payload.exercises.length === 0) {
      setFormError(
        "Please add at least one exercise to your workout.",
      );

      return;
    }

    try {
      if (mode === "create") {
        await workoutService.createWorkout(
          payload,
        );

        toast.success(
          "Workout created successfully.",
        );
      } else {
        await workoutService.patchWorkout(
          workoutId,
          payload,
        );

        toast.success(
          "Workout updated successfully.",
        );
      }

      navigate("/workouts");
    } catch (error) {
      const fieldErrors =
        getFieldErrors(error);

      let mappedCount = 0;

      FORM_FIELD_NAMES.forEach(
        (field) => {
          if (fieldErrors[field]) {
            setError(field, {
              type: "server",
              message:
                fieldErrors[field],
            });

            mappedCount += 1;
          }
        },
      );

      const hasUnmappedErrors =
        Object.keys(fieldErrors).some(
          (key) =>
            !FORM_FIELD_NAMES.includes(
              key,
            ),
        );

      if (
        hasUnmappedErrors ||
        mappedCount === 0
      ) {
        setFormError(
          workoutService.getWorkoutErrorMessage(
            error,
          ),
        );
      }
    }
  };

  const pageTitle =
    mode === "create"
      ? "Create your workout"
      : "Edit your workout";

  const pageDescription =
    mode === "create"
      ? "Build a focused training session and track every exercise."
      : "Update your workout plan and training details.";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 pb-10"
      noValidate
    >
      {/* =====================================================
          TOP INTRO
      ====================================================== */}

      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
              <Sparkles className="h-3 w-3" />
              Training Builder
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              {pageTitle}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
              {pageDescription}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            icon={ArrowLeft}
            onClick={() =>
              navigate("/workouts")
            }
          >
            Back to workouts
          </Button>
        </div>
      </section>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {formError && (
        <InlineAlert variant="error">
          {formError}
        </InlineAlert>
      )}

      {/* =====================================================
          WORKOUT INFORMATION
      ====================================================== */}

      <Card>
        <Card.Header>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-accent/10 p-2.5 text-accent">
              <FileText className="h-4 w-4" />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold text-text-primary">
                Workout Information
              </h2>

              <p className="mt-0.5 text-xs text-text-muted">
                Give your training session a clear identity.
              </p>
            </div>
          </div>
        </Card.Header>

        <Card.Body className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Workout name"
              placeholder="e.g. Upper Body Strength"
              required
              error={errors.name?.message}
              {...register("name", {
                required:
                  "Workout name is required.",
                minLength: {
                  value: 2,
                  message:
                    "Workout name must be at least 2 characters.",
                },
              })}
            />
          </div>

          <div className="sm:col-span-2">
            <Textarea
              label="Description"
              placeholder="What's the focus of this session?"
              error={
                errors.description?.message
              }
              {...register("description")}
            />
          </div>
        </Card.Body>
      </Card>

      {/* =====================================================
          SCHEDULE
      ====================================================== */}

      <Card>
        <Card.Header>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-accent/10 p-2.5 text-accent">
              <CalendarDays className="h-4 w-4" />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold text-text-primary">
                Schedule
              </h2>

              <p className="mt-0.5 text-xs text-text-muted">
                Choose when you plan to train.
              </p>
            </div>
          </div>
        </Card.Header>

        <Card.Body className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            label="Scheduled date"
            type="date"
            error={
              errors.scheduled_date?.message
            }
            {...register("scheduled_date")}
          />

          <Input
            label="Scheduled time"
            type="time"
            error={
              errors.scheduled_time?.message
            }
            {...register("scheduled_time")}
          />
        </Card.Body>
      </Card>

      {/* =====================================================
          EXERCISES
      ====================================================== */}

      <Card>
        <Card.Header>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-accent/10 p-2.5 text-accent">
                <Dumbbell className="h-4 w-4" />
              </div>

              <div>
                <h2 className="font-display text-base font-semibold text-text-primary">
                  Exercises
                </h2>

                {exerciseOptionsError ? (
                  <p className="mt-1 text-xs text-danger">
                    Couldn&apos;t load exercises.{" "}
                    <button
                      type="button"
                      onClick={
                        loadExerciseOptions
                      }
                      className="font-medium underline underline-offset-2"
                    >
                      Retry
                    </button>
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-text-muted">
                    Add exercises and define your training targets.
                  </p>
                )}
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() =>
                append(EMPTY_EXERCISE)
              }
            >
              Add exercise
            </Button>
          </div>
        </Card.Header>

        <Card.Body className="space-y-4">
          {/* Exercise count */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent" />

              <span className="text-xs text-text-secondary">
                {fields.length} exercise
                {fields.length === 1
                  ? ""
                  : "s"} added
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-text-muted">
              <Clock3 className="h-3.5 w-3.5" />
              Configure sets, reps & weight below
            </div>
          </div>

          {/* Exercise rows */}
          {fields.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <Dumbbell className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-text-primary">
                No exercises added
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-text-muted">
                Start building your session by adding an exercise from the library.
              </p>

              <Button
                type="button"
                size="sm"
                icon={Plus}
                className="mt-5"
                onClick={() =>
                  append(EMPTY_EXERCISE)
                }
              >
                Add first exercise
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map(
                (field, index) => (
                  <div
                    key={field.id}
                    className="rounded-2xl border border-white/7 bg-white/[0.015] p-3 transition hover:border-accent/10 sm:p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/10 text-[10px] font-bold text-accent">
                          {String(
                            index + 1,
                          ).padStart(
                            2,
                            "0",
                          )}
                        </span>

                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                          Exercise{" "}
                          {index + 1}
                        </span>
                      </div>
                    </div>

                    <WorkoutExerciseRow
                      index={index}
                      register={register}
                      errors={
                        errors
                          .workout_exercises?.[
                          index
                        ]
                      }
                      onRemove={() =>
                        remove(index)
                      }
                      canRemove={
                        fields.length > 1
                      }
                      exerciseOptions={
                        exerciseOptions
                      }
                      exerciseOptionsLoading={
                        exerciseOptionsLoading
                      }
                    />
                  </div>
                ),
              )}
            </div>
          )}

          {/* Add another */}
          {fields.length > 0 && (
            <button
              type="button"
              onClick={() =>
                append(EMPTY_EXERCISE)
              }
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 py-4 text-xs font-semibold text-text-muted transition hover:border-accent/20 hover:bg-accent/[0.02] hover:text-accent"
            >
              <Plus className="h-4 w-4" />
              Add another exercise
            </button>
          )}
        </Card.Body>
      </Card>

      {/* =====================================================
          BOTTOM ACTIONS
      ====================================================== */}

      <div className="sticky bottom-4 z-20">
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#101218]/95 p-3 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="rounded-lg bg-accent/10 p-2 text-accent">
              <Save className="h-4 w-4" />
            </div>

            <div>
              <p className="text-xs font-semibold text-text-primary">
                Ready to train?
              </p>

              <p className="text-[10px] text-text-muted">
                Save your session when everything looks right.
              </p>
            </div>
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() =>
                navigate("/workouts")
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              icon={Save}
              isLoading={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              {mode === "create"
                ? "Save Workout"
                : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}