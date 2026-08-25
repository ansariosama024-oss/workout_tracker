from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model for the Workout Tracker application.

    Extends Django's AbstractUser to keep the familiar username-based login
    while enforcing a unique, required email address. Password storage and
    hashing are handled entirely by Django's built-in auth machinery
    (AbstractUser -> AbstractBaseUser), so plaintext passwords are never
    stored.
    """

    email = models.EmailField(unique=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date_joined"]

    def __str__(self):
        return self.email
