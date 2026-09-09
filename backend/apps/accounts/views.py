from django.contrib.auth import get_user_model
from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from .serializers import (
    LoginSerializer,
    LogoutSerializer,
    RegisterSerializer,
    UserMiniSerializer,
    UserSerializer,
)

User = get_user_model()


@extend_schema(
    tags=["Authentication"],
    summary="Register a new user",
    description=(
        "Creates a new user account. Does not log the user in -- no "
        "tokens are issued here, call /api/auth/login/ afterward."
    ),
    request=RegisterSerializer,
    responses={201: UserMiniSerializer},
)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            UserMiniSerializer(user).data, status=status.HTTP_201_CREATED
        )


@extend_schema(
    tags=["Authentication"],
    summary="Log in with email + password",
    description="Authenticates the user and returns a JWT access/refresh pair.",
    request=LoginSerializer,
    responses={
        200: OpenApiResponse(
            description="Authentication successful.",
            examples=[
                OpenApiExample(
                    "Success",
                    value={
                        "access": "<access_token>",
                        "refresh": "<refresh_token>",
                        "user": {
                            "id": 1,
                            "username": "john",
                            "email": "john@example.com",
                            "first_name": "John",
                            "last_name": "Doe",
                        },
                    },
                )
            ],
        ),
        400: OpenApiResponse(description="Invalid email or password."),
    },
)
class LoginView(APIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = LoginSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserMiniSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


@extend_schema(
    tags=["Authentication"],
    summary="Log out (blacklist refresh token)",
    description=(
        "Blacklists the given refresh token so it can never be used again "
        "to obtain a new access token. Requires a valid access token in "
        "the Authorization header."
    ),
    request=LogoutSerializer,
    responses={
        200: OpenApiResponse(description="Successfully logged out."),
        401: OpenApiResponse(description="Authentication credentials were not provided."),
        400: OpenApiResponse(description="Invalid or already-blacklisted refresh token."),
    },
)
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LogoutSerializer

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Successfully logged out."}, status=status.HTTP_200_OK
        )


@extend_schema(
    tags=["Authentication"],
    summary="Get the current authenticated user",
    description=(
        "Returns the user identified by the request's access token "
        "(request.user). A user ID can never be supplied by the caller "
        "to impersonate another account."
    ),
    responses={200: UserSerializer},
)
class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


@extend_schema(tags=["Authentication"], summary="Refresh an access token")
class CustomTokenRefreshView(TokenRefreshView):
    """
    Thin subclass of SimpleJWT's TokenRefreshView, kept only so it shows
    up grouped under the "Authentication" tag in the OpenAPI schema.
    Validation (including rejecting blacklisted/expired refresh tokens)
    is entirely SimpleJWT's own.
    """
