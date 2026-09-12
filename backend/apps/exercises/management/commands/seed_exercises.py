from django.core.management.base import BaseCommand

from apps.exercises.models import Exercise


EXERCISES = [
    {
        "name": "Bench Press",
        "description": "A compound upper-body exercise targeting the chest.",
        "category": "strength",
        "muscle_group": "chest",
        "equipment": "Barbell",
        "instructions": "Lie on the bench, lower the bar to your chest, then press it upward.",
    },
    {
        "name": "Incline Dumbbell Press",
        "description": "An upper-chest focused pressing exercise.",
        "category": "strength",
        "muscle_group": "chest",
        "equipment": "Dumbbells",
        "instructions": "Press the dumbbells upward from an inclined bench position.",
    },
    {
        "name": "Push-Up",
        "description": "A bodyweight exercise for the chest, shoulders and triceps.",
        "category": "strength",
        "muscle_group": "chest",
        "equipment": "Bodyweight",
        "instructions": "Keep your body straight and lower your chest toward the floor, then push back up.",
    },
    {
        "name": "Pull-Up",
        "description": "A bodyweight pulling exercise targeting the back.",
        "category": "strength",
        "muscle_group": "back",
        "equipment": "Pull-up Bar",
        "instructions": "Pull your body upward until your chin clears the bar.",
    },
    {
        "name": "Barbell Row",
        "description": "A compound exercise for building back strength.",
        "category": "strength",
        "muscle_group": "back",
        "equipment": "Barbell",
        "instructions": "Hinge at the hips and pull the bar toward your lower chest.",
    },
    {
        "name": "Lat Pulldown",
        "description": "A cable exercise targeting the latissimus dorsi.",
        "category": "strength",
        "muscle_group": "back",
        "equipment": "Cable Machine",
        "instructions": "Pull the bar down toward your upper chest while keeping your torso stable.",
    },
    {
        "name": "Overhead Press",
        "description": "A pressing exercise focused on the shoulders.",
        "category": "strength",
        "muscle_group": "shoulders",
        "equipment": "Barbell",
        "instructions": "Press the bar overhead from shoulder level.",
    },
    {
        "name": "Lateral Raise",
        "description": "An isolation exercise for the side deltoids.",
        "category": "strength",
        "muscle_group": "shoulders",
        "equipment": "Dumbbells",
        "instructions": "Raise the dumbbells sideways until your arms are roughly parallel to the floor.",
    },
    {
        "name": "Bicep Curl",
        "description": "An isolation exercise targeting the biceps.",
        "category": "strength",
        "muscle_group": "arms",
        "equipment": "Dumbbells",
        "instructions": "Curl the dumbbells upward while keeping your elbows close to your body.",
    },
    {
        "name": "Tricep Pushdown",
        "description": "A cable exercise targeting the triceps.",
        "category": "strength",
        "muscle_group": "arms",
        "equipment": "Cable Machine",
        "instructions": "Push the cable handle downward until your arms are fully extended.",
    },
    {
        "name": "Barbell Squat",
        "description": "A compound lower-body strength exercise.",
        "category": "strength",
        "muscle_group": "legs",
        "equipment": "Barbell",
        "instructions": "Squat down while keeping your chest up, then drive through your feet to stand.",
    },
    {
        "name": "Romanian Deadlift",
        "description": "A hip-hinge exercise targeting the hamstrings and glutes.",
        "category": "strength",
        "muscle_group": "legs",
        "equipment": "Barbell",
        "instructions": "Hinge at the hips while keeping your back neutral, then return to standing.",
    },
    {
        "name": "Leg Press",
        "description": "A machine-based lower-body strength exercise.",
        "category": "strength",
        "muscle_group": "legs",
        "equipment": "Leg Press Machine",
        "instructions": "Push the platform away using your legs without locking your knees.",
    },
    {
        "name": "Lunges",
        "description": "A unilateral lower-body exercise.",
        "category": "strength",
        "muscle_group": "legs",
        "equipment": "Bodyweight",
        "instructions": "Step forward and lower your body until both knees are comfortably bent.",
    },
    {
        "name": "Plank",
        "description": "A core stability exercise.",
        "category": "strength",
        "muscle_group": "core",
        "equipment": "Bodyweight",
        "instructions": "Hold a straight-body position supported by your forearms and toes.",
    },
    {
        "name": "Crunches",
        "description": "A bodyweight exercise targeting the abdominal muscles.",
        "category": "strength",
        "muscle_group": "core",
        "equipment": "Bodyweight",
        "instructions": "Lie on your back and curl your upper body toward your knees.",
    },
    {
        "name": "Running",
        "description": "A cardiovascular exercise that improves endurance.",
        "category": "cardio",
        "muscle_group": "full_body",
        "equipment": "Treadmill",
        "instructions": "Run at a comfortable pace while maintaining good posture.",
    },
    {
        "name": "Cycling",
        "description": "A low-impact cardiovascular exercise.",
        "category": "cardio",
        "muscle_group": "full_body",
        "equipment": "Stationary Bike",
        "instructions": "Pedal continuously at a pace appropriate for your fitness level.",
    },
    {
        "name": "Jump Rope",
        "description": "A cardiovascular exercise that improves coordination and endurance.",
        "category": "cardio",
        "muscle_group": "full_body",
        "equipment": "Jump Rope",
        "instructions": "Jump lightly while rotating the rope continuously.",
    },
    {
        "name": "Hamstring Stretch",
        "description": "A flexibility exercise targeting the hamstrings.",
        "category": "flexibility",
        "muscle_group": "legs",
        "equipment": "Bodyweight",
        "instructions": "Gently stretch the back of your legs without bouncing.",
    },
]


class Command(BaseCommand):
    help = "Seed the database with common exercises"

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for exercise_data in EXERCISES:
            name = exercise_data["name"]

            _, created = Exercise.objects.update_or_create(
                name=name,
                defaults=exercise_data,
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Exercises seeded successfully. "
                f"Created: {created_count}, Updated: {updated_count}"
            )
        )