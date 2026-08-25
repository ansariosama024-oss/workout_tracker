from django.db import models


class Exercise(models.Model):
    """
    A reusable exercise definition (e.g. "Bench Press", "Running").

    Exercises are shared, reference-data records: the same Exercise row can
    be attached to many WorkoutExercise entries across many workouts and
    users. No workout- or user-specific data belongs on this model.
    """

    class Category(models.TextChoices):
        STRENGTH = "strength", "Strength"
        CARDIO = "cardio", "Cardio"
        FLEXIBILITY = "flexibility", "Flexibility"

    class MuscleGroup(models.TextChoices):
        CHEST = "chest", "Chest"
        BACK = "back", "Back"
        SHOULDERS = "shoulders", "Shoulders"
        ARMS = "arms", "Arms"
        LEGS = "legs", "Legs"
        CORE = "core", "Core"
        FULL_BODY = "full_body", "Full Body"

    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=Category.choices)
    muscle_group = models.CharField(max_length=20, choices=MuscleGroup.choices)
    equipment = models.CharField(max_length=150, blank=True)
    instructions = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["category"], name="exercise_category_idx"),
            models.Index(fields=["muscle_group"], name="exercise_muscle_group_idx"),
            models.Index(
                fields=["category", "muscle_group"],
                name="exercise_cat_muscle_idx",
            ),
        ]

    def __str__(self):
        return self.name
