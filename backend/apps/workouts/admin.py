from django.contrib import admin

from .models import Workout, WorkoutExercise


class WorkoutExerciseInline(admin.TabularInline):
    model = WorkoutExercise
    extra = 0
    ordering = ("order",)


@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "user",
        "status",
        "scheduled_date",
        "scheduled_time",
        "completed_at",
        "created_at",
    )
    list_filter = ("status", "scheduled_date")
    search_fields = ("name", "user__username", "user__email")
    ordering = ("-scheduled_date", "-scheduled_time")
    inlines = [WorkoutExerciseInline]


@admin.register(WorkoutExercise)
class WorkoutExerciseAdmin(admin.ModelAdmin):
    list_display = (
        "workout",
        "exercise",
        "sets",
        "repetitions",
        "weight",
        "duration",
        "order",
    )
    list_filter = ("exercise__category", "exercise__muscle_group")
    search_fields = ("workout__name", "exercise__name")
    ordering = ("workout", "order")
