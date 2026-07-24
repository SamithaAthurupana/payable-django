from math import floor
from datetime import timedelta

from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import (
    Circle,
    Membership,
    Round,
    Contribution,
)

from .serializers import (
    RegisterSerializer,
    CircleSerializer,
    CircleDetailSerializer,
    JoinCircleSerializer,
    RoundSerializer,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer


class CircleListCreateView(generics.ListCreateAPIView):
    serializer_class = CircleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Circle.objects.filter(
            memberships__user=self.request.user
        ).distinct()

    @transaction.atomic
    def perform_create(self, serializer):
        circle = serializer.save(admin=self.request.user)

        Membership.objects.create(
            circle=circle,
            user=self.request.user,
            position=1
        )


class CircleDetailView(generics.RetrieveAPIView):
    serializer_class = CircleDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Circle.objects.filter(
            memberships__user=self.request.user
        ).distinct()


class JoinCircleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = JoinCircleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        invite_code = serializer.validated_data["invite_code"]

        try:
            circle = Circle.objects.get(invite_code=invite_code)

        except Circle.DoesNotExist:
            return Response(
                {"error": "Invalid invite code"},
                status=status.HTTP_404_NOT_FOUND
            )

        if Membership.objects.filter(
            circle=circle,
            user=request.user
        ).exists():
            return Response(
                {"error": "Already a member"},
                status=status.HTTP_400_BAD_REQUEST
            )

        member_count = Membership.objects.filter(circle=circle).count()

        if member_count >= 4:
            return Response(
                {"error": "Circle is full"},
                status=status.HTTP_400_BAD_REQUEST
            )

        Membership.objects.create(
            circle=circle,
            user=request.user,
            position=member_count + 1
        )

        return Response(
            {"message": "Joined successfully"},
            status=status.HTTP_201_CREATED
        )


class ContributeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, round_id):

        round_obj = Round.objects.get(id=round_id)

        membership = Membership.objects.get(
            circle=round_obj.circle,
            user=request.user
        )

        if membership == round_obj.payout_member:
            return Response(
                {"error": "Recipient does not contribute"},
                status=status.HTTP_400_BAD_REQUEST
            )

        amount = round_obj.contribution_amount

        penalty = 0
        late = False

        if timezone.now() > round_obj.deadline:
            late = True

            penalty = round(
                amount * round_obj.penalty_rate / 100
            )

        Contribution.objects.create(
            round=round_obj,
            member=membership,
            amount=amount,
            penalty=penalty,
            is_late=late
        )

        return Response(
            {
                "amount": amount,
                "penalty": penalty,
                "total": amount + penalty
            },
            status=status.HTTP_201_CREATED
        )


class ApproveRoundView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, round_id):

        # Lock this row until transaction finishes
        round_obj = Round.objects.select_for_update().get(id=round_id)

        # Already processed?
        if round_obj.status == "CLOSED":
            return Response(
                {"message": "Round already approved"},
                status=status.HTTP_200_OK
            )

        # Only admin can approve
        if round_obj.circle.admin != request.user:
            return Response(
                {"error": "Only admin can approve"},
                status=status.HTTP_403_FORBIDDEN
            )

        total = Contribution.objects.filter(
            round=round_obj
        ).aggregate(
            Sum("amount"),
            Sum("penalty")
        )

        contribution_total = total["amount__sum"] or 0
        penalty_total = total["penalty__sum"] or 0

        grand_total = contribution_total + penalty_total

        # Deduct 1% platform fee
        final_amount = floor(grand_total * 0.99)

        round_obj.final_payout_amount = final_amount
        round_obj.status = "CLOSED"
        round_obj.save()

        # Mark recipient as paid
        payout = round_obj.payout_member
        payout.has_been_paid = True
        payout.save()

        # Create the next round automatically
        next_member = Membership.objects.filter(
            circle=round_obj.circle,
            has_been_paid=False
        ).order_by("position").first()

        if next_member:
            Round.objects.create(
                circle=round_obj.circle,
                payout_member=next_member,
                contribution_amount=5000,
                penalty_rate=3,
                deadline=timezone.now() + timedelta(days=7),
                status="OPEN"
            )

        return Response(
            {
                "final_payout": final_amount
            },
            status=status.HTTP_200_OK
        )