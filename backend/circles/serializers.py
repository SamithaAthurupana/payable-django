from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Circle, Membership, Round, Contribution


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"]
        )
        return user


class CircleSerializer(serializers.ModelSerializer):
    member_count = serializers.IntegerField(
        source="memberships.count",
        read_only=True
    )

    class Meta:
        model = Circle
        fields = ["id", "name", "invite_code", "member_count"]
        read_only_fields = ["id", "invite_code", "member_count"]


class JoinCircleSerializer(serializers.Serializer):
    invite_code = serializers.CharField(max_length=8)


class MembershipSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Membership
        fields = ["id", "username", "position", "has_been_paid"]


class ContributionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="member.user.username",
        read_only=True
    )

    class Meta:
        model = Contribution
        fields = ["id", "username", "amount", "penalty", "is_late", "paid_at"]


class RoundSerializer(serializers.ModelSerializer):
    payout_member = serializers.CharField(
        source="payout_member.user.username",
        read_only=True
    )
    contributions = serializers.SerializerMethodField()

    class Meta:
        model = Round
        fields = [
            "id", "status", "contribution_amount", "penalty_rate",
            "deadline", "final_payout_amount", "payout_member",
            "contributions",
        ]

    def get_contributions(self, obj):
        qs = obj.contribution_set.order_by("paid_at")
        return ContributionSerializer(qs, many=True).data


class CircleDetailSerializer(CircleSerializer):
    admin = serializers.CharField(source="admin.username", read_only=True)
    members = serializers.SerializerMethodField()
    rounds = serializers.SerializerMethodField()

    class Meta(CircleSerializer.Meta):
        fields = CircleSerializer.Meta.fields + ["admin", "members", "rounds"]

    def get_members(self, obj):
        qs = obj.memberships.order_by("position")
        return MembershipSerializer(qs, many=True).data

    def get_rounds(self, obj):
        qs = obj.round_set.order_by("created_at")
        return RoundSerializer(qs, many=True).data