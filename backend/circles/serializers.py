from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Circle


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
    class Meta:
        model = Circle
        fields = ["id", "name", "invite_code"]
        read_only_fields = ["id", "invite_code"]