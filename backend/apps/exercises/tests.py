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


# ----------------------------------------------------------------------
# Exercise API tests (read-only)
# ----------------------------------------------------------------------

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

EXERCISES_URL = "/api/exercises/"


class ExerciseAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="exerciseviewer",
            email="exerciseviewer@example.com",
            password="Passw0rd!123",
        )
        self.exercise = Exercise.objects.create(
            name="Overhead Press",
            category=Exercise.Category.STRENGTH,
            muscle_group=Exercise.MuscleGroup.SHOULDERS,
        )

    def authenticate(self):
        access = str(RefreshToken.for_user(self.user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    def test_unauthenticated_user_cannot_list_exercises(self):
        response = self.client.get(EXERCISES_URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_can_list_exercises(self):
        self.authenticate()
        response = self.client.get(EXERCISES_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        names = [item["name"] for item in results]
        self.assertIn("Overhead Press", names)

    def test_authenticated_user_can_retrieve_exercise(self):
        self.authenticate()
        response = self.client.get(f"{EXERCISES_URL}{self.exercise.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Overhead Press")

    def test_write_methods_not_allowed(self):
        self.authenticate()
        response = self.client.post(
            EXERCISES_URL, {"name": "New Exercise"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
