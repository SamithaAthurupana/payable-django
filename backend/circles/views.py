from rest_framework import generics, permissions
from django.db import transaction

from .serializers import RegisterSerializer, CircleSerializer
from .models import Circle, Membership


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer


class CreateCircleView(generics.CreateAPIView):
    serializer_class = CircleSerializer
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def perform_create(self, serializer):

        circle = serializer.save(admin=self.request.user)

        Membership.objects.create(
            circle=circle,
            user=self.request.user,
            position=1
        )