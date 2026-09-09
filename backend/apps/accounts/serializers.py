from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Full user representation, used by GET /api/auth/me/."""

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "date_joined",
            "updated_at",
        ]
        read_only_fields = fields


class UserMiniSerializer(serializers.ModelSerializer):
    """Minimal user representation embedded in register/login responses."""

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    """
    Validates and creates a new user account.

    password/password_confirm are write-only so they can never appear in
    a serialized response, and the view returns a separate
    UserMiniSerializer for the created user rather than this serializer's
    own .data.
    """

    password = serializers.CharField(
        write_only=True, style={"input_type": "password"}
    )
    password_confirm = serializers.CharField(
        write_only=True, style={"input_type": "password"}
    )
    # Declared explicitly (rather than left to ModelSerializer's
    # auto-generation) so DRF does not attach its own exact-match
    # UniqueValidator to these fields -- that would run before, and with
    # a different message than, the case-insensitive checks in
    # validate_email()/validate_username() below.
    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
        ]
        extra_kwargs = {
            "first_name": {"required": True, "allow_blank": False},
            "last_name": {"required": True, "allow_blank": False},
        }

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return normalized

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this username already exists."
            )
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        try:
            validate_password(attrs["password"])
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """
    Authenticates a user by email + password via EmailBackend (see
    accounts.backends and settings.AUTHENTICATION_BACKENDS).
    """

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, attrs):
        request = self.context.get("request")
        user = authenticate(
            request=request,
            email=attrs["email"],
            password=attrs["password"],
        )
        if user is None:
            raise serializers.ValidationError(
                "Invalid email or password.", code="authorization"
            )
        if not user.is_active:
            raise serializers.ValidationError(
                "This account is inactive.", code="authorization"
            )
        attrs["user"] = user
        return attrs


class LogoutSerializer(serializers.Serializer):
    """
    Validates a refresh token and blacklists it on save(), ending the
    session it belongs to. Blacklisting requires
    rest_framework_simplejwt.token_blacklist in INSTALLED_APPS.
    """

    refresh = serializers.CharField(write_only=True)

    def validate_refresh(self, value):
        try:
            self._token = RefreshToken(value)
        except TokenError as exc:
            raise serializers.ValidationError(str(exc) or "Invalid or expired token.")
        return value

    def save(self, **kwargs):
        self._token.blacklist()
