from django.urls import path

from .views import RegisterView, CreateCircleView

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("circles/", CreateCircleView.as_view()),
]