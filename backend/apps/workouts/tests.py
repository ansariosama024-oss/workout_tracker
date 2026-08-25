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
