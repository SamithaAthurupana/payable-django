from django.urls import path

from .views import (
    RegisterView,
    CreateCircleView,
    JoinCircleView,
)

urlpatterns = [

    path("register/", RegisterView.as_view()),

    path("circles/", CreateCircleView.as_view()),

    path("join/", JoinCircleView.as_view()),
]