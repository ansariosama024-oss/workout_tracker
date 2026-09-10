from datetime import date, time

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone

from apps.exercises.models import Exercise

from .models import Workout, WorkoutExercise

User = get_user_model()


class WorkoutModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="athlete",
            email="athlete@example.com",
            password="Passw0rd!123",
        )

    def test_create_workout(self):
        workout = Workout.objects.create(
            user=self.user,
            name="Leg Day",
            scheduled_date=date(2026, 1, 1),
            scheduled_time=time(9, 0),
        )
        self.assertEqual(workout.status, Workout.Status.PENDING)
        self.assertEqual(workout.user, self.user)

    def test_workout_belongs_to_owner(self):
        workout = Workout.objects.create(user=self.user, name="Push Day")
        self.assertIn(workout, self.user.workouts.all())

    def test_status_choices_enforced(self):
        workout = Workout(user=self.user, name="Bad Status", status="not_a_status")
        with self.assertRaises(ValidationError):
            workout.full_clean()

    def test_completed_requires_completed_at(self):
        workout = Workout(
            user=self.user,
            name="Missing Timestamp",
            status=Workout.Status.COMPLETED,
        )
        with self.assertRaises(ValidationError):
            workout.full_clean()

    def test_completed_at_rejected_for_pending_workout(self):
        workout = Workout(
            user=self.user,
            name="Should Be Empty",
            status=Workout.Status.PENDING,
            completed_at=timezone.now(),
        )
        with self.assertRaises(ValidationError):
            workout.full_clean()

    def test_completed_at_valid_with_completed_status(self):
        workout = Workout(
            user=self.user,
            name="Done",
            status=Workout.Status.COMPLETED,
            completed_at=timezone.now(),
        )
        workout.full_clean()
        workout.save()
        self.assertIsNotNone(workout.completed_at)


class WorkoutExerciseModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="lifter",
            email="lifter@example.com",
            password="Passw0rd!123",
        )
        self.workout = Workout.objects.create(user=self.user, name="Full Body")
        self.exercise = Exercise.objects.create(
            name="Squat",
            category=Exercise.Category.STRENGTH,
            muscle_group=Exercise.MuscleGroup.LEGS,
        )

    def test_create_workout_exercise(self):
        we = WorkoutExercise.objects.create(
            workout=self.workout,
            exercise=self.exercise,
            sets=3,
            repetitions=10,
            weight="60.00",
            order=1,
        )
        self.assertEqual(we.workout, self.workout)
        self.assertEqual(we.exercise, self.exercise)
        self.assertIn(we, self.workout.workout_exercises.all())

    def test_invalid_sets_rejected(self):
        we = WorkoutExercise(
            workout=self.workout, exercise=self.exercise, sets=0, order=1
        )
        with self.assertRaises(ValidationError):
            we.full_clean()

    def test_invalid_repetitions_rejected(self):
        we = WorkoutExercise(
            workout=self.workout,
            exercise=self.exercise,
            sets=3,
            repetitions=0,
            order=1,
        )
        with self.assertRaises(ValidationError):
            we.full_clean()

    def test_invalid_weight_rejected(self):
        we = WorkoutExercise(
            workout=self.workout,
            exercise=self.exercise,
            sets=3,
            weight="-5.00",
            order=1,
        )
        with self.assertRaises(ValidationError):
            we.full_clean()

    def test_duplicate_order_within_workout_rejected(self):
        WorkoutExercise.objects.create(
            workout=self.workout, exercise=self.exercise, sets=3, order=1
        )
        other_exercise = Exercise.objects.create(
            name="Deadlift",
            category=Exercise.Category.STRENGTH,
            muscle_group=Exercise.MuscleGroup.BACK,
        )
        dup = WorkoutExercise(
            workout=self.workout, exercise=other_exercise, sets=3, order=1
        )
        with self.assertRaises(ValidationError):
            dup.full_clean()


# ----------------------------------------------------------------------
# Workout API tests
# ----------------------------------------------------------------------

from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

WORKOUTS_URL = "/api/workouts/"


def workout_url(pk):
    return f"/api/workouts/{pk}/"


class WorkoutAPITestCase(APITestCase):
    """Shared setup: two users, each authenticated via a real access token."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="apiuser",
            email="apiuser@example.com",
            password="Passw0rd!123",
        )
        self.other_user = User.objects.create_user(
            username="otheruser",
            email="otheruser@example.com",
            password="Passw0rd!123",
        )
        self.exercise = Exercise.objects.create(
            name="Bench Press",
            category=Exercise.Category.STRENGTH,
            muscle_group=Exercise.MuscleGroup.CHEST,
        )
        self.other_exercise = Exercise.objects.create(
            name="Lat Pulldown",
            category=Exercise.Category.STRENGTH,
            muscle_group=Exercise.MuscleGroup.BACK,
        )

    def authenticate_as(self, user):
        access = str(RefreshToken.for_user(user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    def create_workout(self, user, **overrides):
        defaults = {"user": user, "name": "Existing Workout"}
        defaults.update(overrides)
        return Workout.objects.create(**defaults)


class UnauthenticatedWorkoutAccessTests(WorkoutAPITestCase):
    def setUp(self):
        super().setUp()
        self.workout = self.create_workout(self.user)

    def test_cannot_list_workouts(self):
        response = self.client.get(WORKOUTS_URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cannot_create_workout(self):
        response = self.client.post(
            WORKOUTS_URL, {"name": "New Workout"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cannot_retrieve_workout(self):
        response = self.client.get(workout_url(self.workout.id))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cannot_update_workout(self):
        response = self.client.patch(
            workout_url(self.workout.id), {"name": "Hacked"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cannot_delete_workout(self):
        response = self.client.delete(workout_url(self.workout.id))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class WorkoutCRUDTests(WorkoutAPITestCase):
    def setUp(self):
        super().setUp()
        self.authenticate_as(self.user)

    def test_authenticated_user_can_create_workout(self):
        response = self.client.post(
            WORKOUTS_URL,
            {
                "name": "Push Day",
                "comments": "Chest and triceps",
                "scheduled_date": "2026-09-15",
                "scheduled_time": "18:00:00",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Workout.objects.count(), 1)
        self.assertEqual(response.data["name"], "Push Day")

    def test_owner_is_automatically_assigned(self):
        response = self.client.post(
            WORKOUTS_URL, {"name": "Auto Owner"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        workout = Workout.objects.get(id=response.data["id"])
        self.assertEqual(workout.user, self.user)

    def test_client_cannot_spoof_owner(self):
        response = self.client.post(
            WORKOUTS_URL,
            {"name": "Spoof Attempt", "user": self.other_user.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        workout = Workout.objects.get(id=response.data["id"])
        self.assertEqual(workout.user, self.user)
        self.assertNotEqual(workout.user, self.other_user)

    def test_authenticated_user_can_list_own_workouts(self):
        self.create_workout(self.user, name="Mine 1")
        self.create_workout(self.user, name="Mine 2")

        response = self.client.get(WORKOUTS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 2)

    def test_authenticated_user_can_retrieve_own_workout(self):
        workout = self.create_workout(self.user, name="Retrieve Me")

        response = self.client.get(workout_url(workout.id))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Retrieve Me")

    def test_authenticated_user_can_update_own_workout(self):
        workout = self.create_workout(self.user, name="Old Name")

        response = self.client.put(
            workout_url(workout.id),
            {"name": "New Name", "status": "pending"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        workout.refresh_from_db()
        self.assertEqual(workout.name, "New Name")

    def test_authenticated_user_can_partially_update_own_workout(self):
        workout = self.create_workout(self.user, name="Partial Update Me")

        response = self.client.patch(
            workout_url(workout.id), {"comments": "Updated comment"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        workout.refresh_from_db()
        self.assertEqual(workout.comments, "Updated comment")
        self.assertEqual(workout.name, "Partial Update Me")

    def test_authenticated_user_can_delete_own_workout(self):
        workout = self.create_workout(self.user, name="Delete Me")

        response = self.client.delete(workout_url(workout.id))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Workout.objects.filter(id=workout.id).exists())


class WorkoutOwnershipTests(WorkoutAPITestCase):
    def setUp(self):
        super().setUp()
        self.other_workout = self.create_workout(
            self.other_user, name="Other User's Workout"
        )
        self.authenticate_as(self.user)

    def test_cannot_retrieve_another_users_workout(self):
        response = self.client.get(workout_url(self.other_workout.id))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_update_another_users_workout(self):
        response = self.client.patch(
            workout_url(self.other_workout.id), {"name": "Hijacked"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.other_workout.refresh_from_db()
        self.assertEqual(self.other_workout.name, "Other User's Workout")

    def test_cannot_delete_another_users_workout(self):
        response = self.client.delete(workout_url(self.other_workout.id))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Workout.objects.filter(id=self.other_workout.id).exists())

    def test_list_never_contains_another_users_workouts(self):
        self.create_workout(self.user, name="Mine")

        response = self.client.get(WORKOUTS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        names = [item["name"] for item in results]
        self.assertIn("Mine", names)
        self.assertNotIn("Other User's Workout", names)


class WorkoutNestedExerciseTests(WorkoutAPITestCase):
    def setUp(self):
        super().setUp()
        self.authenticate_as(self.user)

    def test_create_workout_with_multiple_exercises(self):
        payload = {
            "name": "Push Day",
            "comments": "Chest and triceps",
            "scheduled_date": "2026-09-15",
            "scheduled_time": "18:00:00",
            "exercises": [
                {
                    "exercise": self.exercise.id,
                    "sets": 4,
                    "repetitions": 10,
                    "weight": "60.00",
                    "notes": "Controlled reps",
                },
                {
                    "exercise": self.other_exercise.id,
                    "sets": 3,
                    "repetitions": 12,
                    "weight": "20.00",
                },
            ],
        }

        response = self.client.post(WORKOUTS_URL, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        workout = Workout.objects.get(id=response.data["id"])
        self.assertEqual(workout.workout_exercises.count(), 2)

    def test_returned_workout_includes_its_exercises(self):
        payload = {
            "name": "Pull Day",
            "exercises": [
                {"exercise": self.exercise.id, "sets": 3, "repetitions": 8},
            ],
        }

        response = self.client.post(WORKOUTS_URL, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data["exercises"]), 1)
        returned_exercise = response.data["exercises"][0]
        self.assertEqual(returned_exercise["sets"], 3)
        self.assertEqual(returned_exercise["repetitions"], 8)
        self.assertEqual(
            returned_exercise["exercise_detail"]["name"], self.exercise.name
        )

        # Also verify a plain GET returns the same nested data.
        get_response = self.client.get(workout_url(response.data["id"]))
        self.assertEqual(len(get_response.data["exercises"]), 1)

    def test_update_replaces_workout_exercises(self):
        workout = self.create_workout(self.user, name="Leg Day")
        WorkoutExercise.objects.create(
            workout=workout, exercise=self.exercise, sets=3, order=1
        )

        response = self.client.patch(
            workout_url(workout.id),
            {
                "exercises": [
                    {
                        "exercise": self.other_exercise.id,
                        "sets": 5,
                        "repetitions": 5,
                    }
                ]
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        workout.refresh_from_db()
        self.assertEqual(workout.workout_exercises.count(), 1)
        remaining = workout.workout_exercises.first()
        self.assertEqual(remaining.exercise, self.other_exercise)
        self.assertEqual(remaining.sets, 5)

    def test_omitting_exercises_on_patch_leaves_them_untouched(self):
        workout = self.create_workout(self.user, name="Core Day")
        WorkoutExercise.objects.create(
            workout=workout, exercise=self.exercise, sets=3, order=1
        )

        response = self.client.patch(
            workout_url(workout.id), {"comments": "Just a note"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        workout.refresh_from_db()
        self.assertEqual(workout.workout_exercises.count(), 1)

    def test_invalid_exercise_id_is_rejected(self):
        payload = {
            "name": "Bad Exercise Reference",
            "exercises": [{"exercise": 999999, "sets": 3, "repetitions": 10}],
        }

        response = self.client.post(WORKOUTS_URL, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("exercises", response.data)

    def test_duplicate_order_in_nested_exercises_is_rejected(self):
        payload = {
            "name": "Duplicate Order",
            "exercises": [
                {"exercise": self.exercise.id, "sets": 3, "repetitions": 10, "order": 1},
                {
                    "exercise": self.other_exercise.id,
                    "sets": 3,
                    "repetitions": 10,
                    "order": 1,
                },
            ],
        }

        response = self.client.post(WORKOUTS_URL, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class InvalidWorkoutDataTests(WorkoutAPITestCase):
    def setUp(self):
        super().setUp()
        self.authenticate_as(self.user)

    def test_missing_name_is_rejected(self):
        response = self.client.post(WORKOUTS_URL, {"comments": "No name"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.data)

    def test_invalid_status_is_rejected(self):
        response = self.client.post(
            WORKOUTS_URL,
            {"name": "Bad Status", "status": "not_a_real_status"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("status", response.data)

    def test_completed_status_without_completed_at_is_rejected(self):
        response = self.client.post(
            WORKOUTS_URL,
            {"name": "Missing Timestamp", "status": "completed"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("completed_at", response.data)

    def test_negative_sets_in_nested_exercise_is_rejected(self):
        response = self.client.post(
            WORKOUTS_URL,
            {
                "name": "Bad Sets",
                "exercises": [
                    {"exercise": self.exercise.id, "sets": 0, "repetitions": 10}
                ],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
