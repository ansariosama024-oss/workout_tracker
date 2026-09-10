from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Workout
from .serializers import WorkoutSerializer

_NOT_FOUND_RESPONSE = OpenApiResponse(
    description=(
        "Not found. Returned both when no workout with this ID exists, "
        "and when it exists but belongs to a different user -- the API "
        "never reveals which, to avoid exposing another user's data."
    )
)


@extend_schema_view(
    list=extend_schema(
        tags=["Workouts"],
        summary="List your workouts",
        description="Returns only the authenticated user's own workouts.",
    ),
    create=extend_schema(
        tags=["Workouts"],
        summary="Create a workout",
        description=(
            "Creates a workout owned by the authenticated user. The owner "
            "is always request.user -- it cannot be set via the request "
            "body. Optionally accepts a nested `exercises` array."
        ),
    ),
    retrieve=extend_schema(
        tags=["Workouts"],
        summary="Retrieve a workout",
        responses={404: _NOT_FOUND_RESPONSE},
    ),
    update=extend_schema(
        tags=["Workouts"],
        summary="Replace a workout",
        responses={404: _NOT_FOUND_RESPONSE},
    ),
    partial_update=extend_schema(
        tags=["Workouts"],
        summary="Partially update a workout",
        responses={404: _NOT_FOUND_RESPONSE},
    ),
    destroy=extend_schema(
        tags=["Workouts"],
        summary="Delete a workout",
        responses={204: OpenApiResponse(description="Deleted."), 404: _NOT_FOUND_RESPONSE},
    ),
)
class WorkoutViewSet(viewsets.ModelViewSet):
    """
    CRUD API for the authenticated user's own workouts.

    Ownership is enforced at the queryset level: get_queryset() only ever
    returns workouts belonging to request.user. DRF's generic
    get_object() (used by retrieve/update/partial_update/destroy) raises
    Http404 when a requested ID isn't present in that queryset, so a
    request for another user's workout returns 404 -- not 403 -- without
    ever confirming that the workout exists.
    """

    serializer_class = WorkoutSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status", "scheduled_date"]
    ordering_fields = ["scheduled_date", "scheduled_time", "status", "created_at"]
    # Soonest-scheduled first by default, so upcoming/pending workouts
    # (e.g. via ?status=pending) are easy to retrieve without extra params.
    ordering = ["scheduled_date", "scheduled_time"]

    def get_queryset(self):
        # drf-spectacular introspects this method while generating the
        # OpenAPI schema, using a fake view with no real authenticated
        # request (self.request.user is AnonymousUser there). Filtering
        # by user=AnonymousUser raises, since the FK expects a real user
        # ID -- returning an empty, unfiltered-by-user queryset in that
        # case keeps schema generation working without weakening the
        # real runtime behavior below.
        if getattr(self, "swagger_fake_view", False):
            return Workout.objects.none()

        return Workout.objects.filter(user=self.request.user).prefetch_related(
            "workout_exercises__exercise"
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
