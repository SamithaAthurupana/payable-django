import uuid

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


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

    has_been_paid = models.BooleanField(default=False)

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("circle", "user")

    def __str__(self):
        return f"{self.user.username} - {self.circle.name}"


class Round(models.Model):

    STATUS_CHOICES = [
        ("OPEN", "OPEN"),
        ("PENDING", "PENDING"),
        ("CLOSED", "CLOSED"),
    ]

    circle = models.ForeignKey(
        Circle,
        on_delete=models.CASCADE
    )

    payout_member = models.ForeignKey(
        Membership,
        on_delete=models.CASCADE,
        related_name="payouts"
    )

    contribution_amount = models.IntegerField(default=5000)

    penalty_rate = models.IntegerField(default=3)

    deadline = models.DateTimeField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="OPEN"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    final_payout_amount = models.IntegerField(default=0)

    def __str__(self):
        return f"Round {self.id}"


class Contribution(models.Model):

    round = models.ForeignKey(
        Round,
        on_delete=models.CASCADE
    )

    member = models.ForeignKey(
        Membership,
        on_delete=models.CASCADE
    )

    amount = models.IntegerField()

    penalty = models.IntegerField(default=0)

    is_late = models.BooleanField(default=False)

    paid_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("round", "member")

    def __str__(self):
        return f"{self.member.user.username} - Round {self.round.id}"