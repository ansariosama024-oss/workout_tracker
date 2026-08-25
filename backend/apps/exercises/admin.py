from django.contrib import admin

from .models import Exercise


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "muscle_group",
        "equipment",
        "created_at",
    )
    list_filter = ("category", "muscle_group")
    search_fields = ("name", "equipment", "description")
    ordering = ("name",)
