from rest_framework import serializers

from .models import Exercise


class ExerciseSerializer(serializers.ModelSerializer):
    """
    Minimal read-only representation of an Exercise.

    Used to embed useful exercise details inside nested WorkoutExercise
    responses (see apps.workouts.serializers.WorkoutExerciseSerializer) so
    a workout response is self-contained. This is not a general Exercise
    API -- no views or URLs are added for Exercise in this phase, only
    this serializer for embedding.
    """

    class Meta:
        model = Exercise
        fields = ["id", "name", "category", "muscle_group", "equipment"]
        read_only_fields = fields
