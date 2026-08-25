from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import CheckConstraint, Q, UniqueConstraint

from apps.exercises.models import Exercise


def _to_number(value):
    """
    Best-effort conversion of a field value to a Decimal for comparison.

    Model-level clean() runs against whatever raw value was assigned to the
    instance, which may not yet have been coerced by the field's to_python()
    (that coercion happens inside clean_fields(), but it isn't written back
    onto the instance). Returning None for anything that can't be converted
    lets the field's own validators/type checks surface the real error
    instead of this helper raising a confusing TypeError.
    """
    if value is None or value == "":
        return None
    try:
        return Decimal(value)
    except (InvalidOperation, TypeError, ValueError):
        return None


class Workout(models.Model):
    """
    A single workout session belonging to exactly one user.

    A workout may be scheduled for a future date/time, in progress, or
    already finished. `completed_at` is only meaningful once the workout's
    status is COMPLETED; that relationship is enforced both at the Python
    level (clean()) and at the database level (CheckConstraint) so it can
    never be silently violated regardless of which layer writes the row.
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="workouts",
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    scheduled_date = models.DateField(null=True, blank=True)
    scheduled_time = models.TimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    comments = models.TextField(blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-scheduled_date", "-scheduled_time"]
        indexes = [
            models.Index(fields=["user"], name="workout_user_idx"),
            models.Index(fields=["scheduled_date"], name="workout_sched_date_idx"),
            models.Index(fields=["status"], name="workout_status_idx"),
            models.Index(
                fields=["user", "scheduled_date"],
                name="workout_user_date_idx",
            ),
        ]
        constraints = [
            CheckConstraint(
                check=Q(status__in=["pending", "completed", "cancelled"]),
                name="workout_status_valid",
            ),
            CheckConstraint(
                check=(
                    Q(status="completed", completed_at__isnull=False)
                    | Q(status__in=["pending", "cancelled"], completed_at__isnull=True)
                ),
                name="workout_completed_at_matches_status",
            ),
        ]

    def __str__(self):
        return f"{self.name} ({self.user})"

    def clean(self):
        super().clean()
        if self.status == self.Status.COMPLETED and self.completed_at is None:
            raise ValidationError(
                {"completed_at": "completed_at must be set when status is completed."}
            )
        if self.status != self.Status.COMPLETED and self.completed_at is not None:
            raise ValidationError(
                {
                    "completed_at": (
                        "completed_at must be empty unless status is completed."
                    )
                }
            )


class WorkoutExercise(models.Model):
    """
    A single exercise entry within a workout, capturing how that exercise
    was (or will be) performed: sets, reps, weight, duration, rest, and
    ordering. No exercise metadata (name, category, muscle group, etc.) is
    duplicated here -- it lives solely on the related Exercise record.
    """

    workout = models.ForeignKey(
        Workout,
        on_delete=models.CASCADE,
        related_name="workout_exercises",
    )
    exercise = models.ForeignKey(
        Exercise,
        on_delete=models.PROTECT,
        related_name="workout_exercises",
    )
    sets = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    repetitions = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1)],
    )
    weight = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Weight used, in kilograms.",
    )
    duration = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Duration in seconds.",
    )
    rest_seconds = models.PositiveIntegerField(
        null=True,
        blank=True,
        default=0,
        validators=[MinValueValidator(0)],
    )
    order = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["workout", "order"]
        indexes = [
            models.Index(fields=["workout"], name="workoutexercise_workout_idx"),
            models.Index(fields=["exercise"], name="workoutexercise_exercise_idx"),
            models.Index(
                fields=["workout", "order"],
                name="workoutexercise_wk_order_idx",
            ),
        ]
        constraints = [
            UniqueConstraint(
                fields=["workout", "order"],
                name="unique_order_per_workout",
            ),
            CheckConstraint(
                check=Q(sets__gt=0),
                name="workoutexercise_sets_positive",
            ),
            CheckConstraint(
                check=Q(repetitions__isnull=True) | Q(repetitions__gt=0),
                name="workoutexercise_repetitions_positive",
            ),
            CheckConstraint(
                check=Q(weight__isnull=True) | Q(weight__gte=0),
                name="workoutexercise_weight_non_negative",
            ),
            CheckConstraint(
                check=Q(duration__isnull=True) | Q(duration__gte=0),
                name="workoutexercise_duration_non_negative",
            ),
            CheckConstraint(
                check=Q(rest_seconds__isnull=True) | Q(rest_seconds__gte=0),
                name="workoutexercise_rest_non_negative",
            ),
            CheckConstraint(
                check=Q(order__gt=0),
                name="workoutexercise_order_positive",
            ),
        ]

    def __str__(self):
        return f"{self.exercise.name} in {self.workout.name}"

    def clean(self):
        super().clean()

        sets_value = _to_number(self.sets)
        if sets_value is not None and sets_value <= 0:
            raise ValidationError({"sets": "sets must be greater than 0."})

        repetitions_value = _to_number(self.repetitions)
        if repetitions_value is not None and repetitions_value <= 0:
            raise ValidationError(
                {"repetitions": "repetitions must be greater than 0."}
            )

        weight_value = _to_number(self.weight)
        if weight_value is not None and weight_value < 0:
            raise ValidationError(
                {"weight": "weight must be greater than or equal to 0."}
            )

        duration_value = _to_number(self.duration)
        if duration_value is not None and duration_value < 0:
            raise ValidationError(
                {"duration": "duration must be greater than or equal to 0."}
            )

        rest_seconds_value = _to_number(self.rest_seconds)
        if rest_seconds_value is not None and rest_seconds_value < 0:
            raise ValidationError(
                {"rest_seconds": "rest_seconds must be greater than or equal to 0."}
            )

        order_value = _to_number(self.order)
        if order_value is not None and order_value <= 0:
            raise ValidationError({"order": "order must be a positive integer."})
