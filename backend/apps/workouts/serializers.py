from rest_framework import serializers

from apps.exercises.models import Exercise
from apps.exercises.serializers import ExerciseSerializer

from .models import Workout, WorkoutExercise


class WorkoutExerciseSerializer(serializers.ModelSerializer):
    """
    One exercise entry within a workout.

    `exercise` accepts an Exercise primary key on write -- DRF's
    PrimaryKeyRelatedField automatically rejects IDs that don't correspond
    to a real Exercise row. `exercise_detail` echoes back useful exercise
    information (name, category, muscle group, equipment) alongside it so
    a workout response is useful without a second request.

    Field names intentionally match the existing WorkoutExercise model
    (e.g. `repetitions`, not `reps`; `notes`, not `comments`) rather than
    introducing new names.

    `order` is optional on write: if omitted, WorkoutSerializer assigns it
    automatically based on each exercise's position in the submitted list
    (see WorkoutSerializer._save_exercises).
    """

    exercise = serializers.PrimaryKeyRelatedField(queryset=Exercise.objects.all())
    exercise_detail = ExerciseSerializer(source="exercise", read_only=True)

    class Meta:
        model = WorkoutExercise
        fields = [
            "id",
            "exercise",
            "exercise_detail",
            "sets",
            "repetitions",
            "weight",
            "duration",
            "rest_seconds",
            "order",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            "order": {"required": False},
        }


class WorkoutSerializer(serializers.ModelSerializer):
    """
    A workout and its nested exercises.

    Ownership: `user` is deliberately NOT a serializer field, so it can
    never be read from the request body -- a client cannot assign a
    workout to another user. The owner is set by the view
    (WorkoutViewSet.perform_create) from request.user.

    Nested exercises: submitting an `exercises` array on create or update
    replaces the workout's full exercise list. This keeps the write
    semantics simple and predictable (no partial merge/diff logic to get
    subtly wrong). Omitting `exercises` entirely from a PATCH body leaves
    the workout's existing exercises untouched; submitting `"exercises":
    []` clears them.
    """

    exercises = WorkoutExerciseSerializer(
        source="workout_exercises", many=True, required=False
    )

    class Meta:
        model = Workout
        fields = [
            "id",
            "name",
            "description",
            "scheduled_date",
            "scheduled_time",
            "status",
            "comments",
            "completed_at",
            "exercises",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        # Mirrors Workout.clean()'s status/completed_at consistency rule
        # at the API layer, using the existing instance's current values
        # for any field a PATCH doesn't include.
        status = attrs.get(
            "status", getattr(self.instance, "status", Workout.Status.PENDING)
        )
        completed_at = attrs.get(
            "completed_at", getattr(self.instance, "completed_at", None)
        )

        if status == Workout.Status.COMPLETED and completed_at is None:
            raise serializers.ValidationError(
                {
                    "completed_at": "completed_at must be set when status is completed."
                }
            )
        if status != Workout.Status.COMPLETED and completed_at is not None:
            raise serializers.ValidationError(
                {
                    "completed_at": "completed_at must be empty unless status is completed."
                }
            )

        exercises_data = attrs.get("workout_exercises")
        if exercises_data:
            orders = [
                item["order"]
                for item in exercises_data
                if item.get("order") is not None
            ]
            if len(orders) != len(set(orders)):
                raise serializers.ValidationError(
                    {
                        "exercises": "Duplicate order values are not allowed within a workout."
                    }
                )

        return attrs

    def create(self, validated_data):
        exercises_data = validated_data.pop("workout_exercises", [])
        # `user` arrives here via WorkoutViewSet.perform_create's
        # serializer.save(user=request.user) -- never from client input.
        workout = Workout.objects.create(**validated_data)
        self._save_exercises(workout, exercises_data)
        return workout

    def update(self, instance, validated_data):
        exercises_data = validated_data.pop("workout_exercises", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if exercises_data is not None:
            instance.workout_exercises.all().delete()
            self._save_exercises(instance, exercises_data)

        return instance

    @staticmethod
    def _save_exercises(workout, exercises_data):
        for index, item in enumerate(exercises_data, start=1):
            item.setdefault("order", index)
            WorkoutExercise.objects.create(workout=workout, **item)
