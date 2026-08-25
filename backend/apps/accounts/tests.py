from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.test import TestCase

User = get_user_model()


class UserModelTests(TestCase):
    def test_create_user_hashes_password(self):
        user = User.objects.create_user(
            username="johndoe",
            email="john@example.com",
            password="StrongPass123!",
            first_name="John",
            last_name="Doe",
        )
        self.assertEqual(user.username, "johndoe")
        self.assertEqual(user.email, "john@example.com")
        self.assertTrue(user.check_password("StrongPass123!"))
        self.assertNotEqual(user.password, "StrongPass123!")

    def test_email_must_be_unique(self):
        User.objects.create_user(
            username="user1",
            email="dup@example.com",
            password="Passw0rd!123",
        )
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                User.objects.create_user(
                    username="user2",
                    email="dup@example.com",
                    password="Passw0rd!123",
                )

    def test_str_returns_email(self):
        user = User.objects.create_user(
            username="janedoe",
            email="jane@example.com",
            password="Passw0rd!123",
        )
        self.assertEqual(str(user), "jane@example.com")
