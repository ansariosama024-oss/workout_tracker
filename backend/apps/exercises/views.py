from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Exercise
from .serializers import ExerciseSerializer


@extend_schema_view(
    list=extend_schema(
        tags=["Exercises"],
        summary="List exercises",
        description=(
            "Returns the shared exercise catalog. Read-only: exercises are "
            "reference data, not something created through this API."
        ),
    ),
    retrieve=extend_schema(tags=["Exercises"], summary="Retrieve an exercise"),
)
class ExerciseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only catalog of exercises.

    Exists so clients (e.g. the workout builder's exercise selector) can
    look up real Exercise IDs to reference in WorkoutExercise entries --
    there is no create/update/delete here, and none is needed yet.
    """

    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "muscle_group"]
    search_fields = ["name"]
    ordering_fields = ["name", "category", "muscle_group"]
    ordering = ["name"]
