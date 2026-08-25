from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.test import TestCase

from .models import Exercise


class ExerciseModelTests(TestCase):
    def test_create_exercise(self):
        exercise = Exercise.objects.create(
            name="Bench Press",
            description="Chest exercise",
            category=Exercise.Category.STRENGTH,
            muscle_group=Exercise.MuscleGroup.CHEST,
            equipment="Barbell",
            instructions="Lie on bench and press.",
        )
        self.assertEqual(str(exercise), "Bench Press")
        self.assertEqual(exercise.category, Exercise.Category.STRENGTH)
        self.assertEqual(exercise.muscle_group, Exercise.MuscleGroup.CHEST)

    def test_name_must_be_unique(self):
        Exercise.objects.create(
            name="Squat",
            category=Exercise.Category.STRENGTH,
            muscle_group=Exercise.MuscleGroup.LEGS,
        )
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Exercise.objects.create(
                    name="Squat",
                    category=Exercise.Category.STRENGTH,
                    muscle_group=Exercise.MuscleGroup.LEGS,
                )

    def test_invalid_category_rejected(self):
        exercise = Exercise(
            name="Mystery Move",
            category="not_a_category",
            muscle_group=Exercise.MuscleGroup.CORE,
        )
        with self.assertRaises(ValidationError):
            exercise.full_clean()
