from django.urls import path

from .views import (
    RegisterView,
    CreateCircleView,
    JoinCircleView,
    ContributeView,
    ApproveRoundView,
)

urlpatterns = [
    path("register/", RegisterView.as_view()),

    path("circles/", CreateCircleView.as_view()),

    path("join/", JoinCircleView.as_view()),

    path(
        "rounds/<int:round_id>/contribute/",
        ContributeView.as_view()
    ),

    path(
        "rounds/<int:round_id>/approve/",
        ApproveRoundView.as_view()
    ),
]