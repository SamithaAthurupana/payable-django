import uuid

from django.db import models
from django.contrib.auth.models import User


class Circle(models.Model):
    name = models.CharField(max_length=100)

    admin = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="owned_circles"
    )

    invite_code = models.CharField(
        max_length=8,
        unique=True,
        default=""
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.invite_code:
            self.invite_code = str(uuid.uuid4())[:8].upper()

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Membership(models.Model):
    circle = models.ForeignKey(
        Circle,
        on_delete=models.CASCADE,
        related_name="memberships"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    position = models.PositiveIntegerField()

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("circle", "user")

    def __str__(self):
        return f"{self.user.username} - {self.circle.name}"