from django.db import transaction

from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Circle, Membership
from .serializers import (
    RegisterSerializer,
    CircleSerializer,
    JoinCircleSerializer,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer


class CreateCircleView(generics.CreateAPIView):
    serializer_class = CircleSerializer
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def perform_create(self, serializer):
        # Create the circle with the logged-in user as admin
        circle = serializer.save(admin=self.request.user)

        # Creator automatically becomes the first member
        Membership.objects.create(
            circle=circle,
            user=self.request.user,
            position=1
        )


class JoinCircleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        # Validate request data
        serializer = JoinCircleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        invite_code = serializer.validated_data["invite_code"]

        # Check if the invite code exists
        try:
            circle = Circle.objects.get(invite_code=invite_code)

        except Circle.DoesNotExist:
            return Response(
                {"error": "Invalid invite code"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if the user is already a member
        if Membership.objects.filter(
            circle=circle,
            user=request.user
        ).exists():
            return Response(
                {"error": "Already a member"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if the circle is full
        member_count = Membership.objects.filter(circle=circle).count()

        if member_count >= 4:
            return Response(
                {"error": "Circle is full"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Add the new member
        Membership.objects.create(
            circle=circle,
            user=request.user,
            position=member_count + 1
        )

        return Response(
            {"message": "Joined successfully"},
            status=status.HTTP_201_CREATED
        )