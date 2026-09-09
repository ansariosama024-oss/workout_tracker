from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

User = get_user_model()


class EmailBackend(ModelBackend):
    """
    Authenticates against the custom User model using email + password
    instead of username + password.

    This exists because the API's login endpoint (see
    accounts.serializers.LoginSerializer) accepts email + password, while
    Django's default ModelBackend authenticates by USERNAME_FIELD
    ("username" on this project's User model). Registering this backend
    alongside ModelBackend in settings.AUTHENTICATION_BACKENDS enables
    email-based login for the API without changing the User model, and
    without breaking username-based login elsewhere (e.g. the Django
    admin).
    """

    def authenticate(self, request, username=None, password=None, email=None, **kwargs):
        email = email or username
        if email is None or password is None:
            return None

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Hash the given password anyway so that authentication takes
            # roughly the same amount of time whether or not the email
            # exists, reducing the usefulness of timing as a way to
            # enumerate registered accounts.
            User().set_password(password)
            return None
        except User.MultipleObjectsReturned:
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
