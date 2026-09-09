from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

REGISTER_URL = "/api/auth/register/"
LOGIN_URL = "/api/auth/login/"
REFRESH_URL = "/api/auth/token/refresh/"
LOGOUT_URL = "/api/auth/logout/"
ME_URL = "/api/auth/me/"


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


def valid_registration_payload(**overrides):
    payload = {
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "StrongPassword123!",
        "password_confirm": "StrongPassword123!",
        "first_name": "New",
        "last_name": "User",
    }
    payload.update(overrides)
    return payload


class RegistrationTests(APITestCase):
    def test_successful_registration(self):
        response = self.client.post(
            REGISTER_URL, valid_registration_payload(), format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="newuser@example.com").exists())
        self.assertEqual(response.data["username"], "newuser")
        self.assertEqual(response.data["email"], "newuser@example.com")

    def test_duplicate_email_rejected(self):
        User.objects.create_user(
            username="existing", email="taken@example.com", password="Passw0rd!123"
        )
        response = self.client.post(
            REGISTER_URL,
            valid_registration_payload(username="another", email="taken@example.com"),
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_duplicate_username_rejected(self):
        User.objects.create_user(
            username="taken", email="first@example.com", password="Passw0rd!123"
        )
        response = self.client.post(
            REGISTER_URL,
            valid_registration_payload(username="taken", email="second@example.com"),
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", response.data)

    def test_password_mismatch_rejected(self):
        response = self.client.post(
            REGISTER_URL,
            valid_registration_payload(password_confirm="SomethingElse123!"),
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password_confirm", response.data)

    def test_invalid_email_rejected(self):
        response = self.client.post(
            REGISTER_URL,
            valid_registration_payload(email="not-an-email"),
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_weak_password_rejected(self):
        response = self.client.post(
            REGISTER_URL,
            valid_registration_payload(password="password", password_confirm="password"),
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_password_is_hashed_not_plaintext(self):
        self.client.post(REGISTER_URL, valid_registration_payload(), format="json")
        user = User.objects.get(email="newuser@example.com")
        self.assertNotEqual(user.password, "StrongPassword123!")
        self.assertTrue(user.password.startswith("pbkdf2_") or "$" in user.password)

    def test_password_is_not_returned(self):
        response = self.client.post(
            REGISTER_URL, valid_registration_payload(), format="json"
        )
        self.assertNotIn("password", response.data)
        self.assertNotIn("password_confirm", response.data)


class LoginTests(APITestCase):
    def setUp(self):
        self.password = "StrongPassword123!"
        self.user = User.objects.create_user(
            username="loginuser",
            email="login@example.com",
            password=self.password,
            first_name="Log",
            last_name="In",
        )

    def test_successful_login(self):
        response = self.client.post(
            LOGIN_URL,
            {"email": "login@example.com", "password": self.password},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"]["email"], "login@example.com")

    def test_wrong_password_rejected(self):
        response = self.client.post(
            LOGIN_URL,
            {"email": "login@example.com", "password": "WrongPassword123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_nonexistent_email_rejected(self):
        response = self.client.post(
            LOGIN_URL,
            {"email": "doesnotexist@example.com", "password": "Whatever123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_access_token_returned(self):
        response = self.client.post(
            LOGIN_URL,
            {"email": "login@example.com", "password": self.password},
            format="json",
        )
        self.assertIn("access", response.data)
        self.assertTrue(response.data["access"])

    def test_refresh_token_returned(self):
        response = self.client.post(
            LOGIN_URL,
            {"email": "login@example.com", "password": self.password},
            format="json",
        )
        self.assertIn("refresh", response.data)
        self.assertTrue(response.data["refresh"])


class TokenRefreshTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="refreshuser",
            email="refresh@example.com",
            password="StrongPassword123!",
        )

    def test_valid_refresh_token_returns_new_access_token(self):
        refresh = RefreshToken.for_user(self.user)
        response = self.client.post(
            REFRESH_URL, {"refresh": str(refresh)}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_invalid_refresh_token_rejected(self):
        response = self.client.post(
            REFRESH_URL, {"refresh": "not-a-real-token"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_blacklisted_refresh_token_cannot_be_refreshed(self):
        refresh = RefreshToken.for_user(self.user)
        refresh.blacklist()
        response = self.client.post(
            REFRESH_URL, {"refresh": str(refresh)}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class MeTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="meuser",
            email="me@example.com",
            password="StrongPassword123!",
            first_name="Me",
            last_name="User",
        )

    def test_authenticated_user_can_access_me(self):
        access = str(RefreshToken.for_user(self.user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        response = self.client.get(ME_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unauthenticated_user_receives_401(self):
        response = self.client.get(ME_URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_request_user(self):
        access = str(RefreshToken.for_user(self.user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        response = self.client.get(ME_URL)
        self.assertEqual(response.data["id"], self.user.id)
        self.assertEqual(response.data["email"], "me@example.com")


class LogoutTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="logoutuser",
            email="logout@example.com",
            password="StrongPassword123!",
        )

    def _authenticated_client_with_tokens(self):
        refresh = RefreshToken.for_user(self.user)
        access = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        return refresh

    def test_authenticated_user_can_logout(self):
        refresh = self._authenticated_client_with_tokens()
        response = self.client.post(
            LOGOUT_URL, {"refresh": str(refresh)}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_refresh_token_is_blacklisted_after_logout(self):
        refresh = self._authenticated_client_with_tokens()
        self.client.post(LOGOUT_URL, {"refresh": str(refresh)}, format="json")

        response = self.client.post(
            REFRESH_URL, {"refresh": str(refresh)}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_blacklisted_refresh_token_cannot_be_reused_to_logout_again(self):
        refresh = self._authenticated_client_with_tokens()
        self.client.post(LOGOUT_URL, {"refresh": str(refresh)}, format="json")

        response = self.client.post(
            LOGOUT_URL, {"refresh": str(refresh)}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_requires_authentication(self):
        self.client.credentials()
        refresh = RefreshToken.for_user(self.user)
        response = self.client.post(
            LOGOUT_URL, {"refresh": str(refresh)}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class SecurityTests(APITestCase):
    def setUp(self):
        self.user_a = User.objects.create_user(
            username="usera",
            email="usera@example.com",
            password="StrongPassword123!",
            first_name="User",
            last_name="A",
        )
        self.user_b = User.objects.create_user(
            username="userb",
            email="userb@example.com",
            password="StrongPassword123!",
            first_name="User",
            last_name="B",
        )

    def test_authentication_cannot_access_another_users_account(self):
        access_a = str(RefreshToken.for_user(self.user_a).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_a}")

        response = self.client.get(ME_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.user_a.id)
        self.assertNotEqual(response.data["id"], self.user_b.id)

