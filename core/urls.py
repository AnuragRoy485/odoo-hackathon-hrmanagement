from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import ChangePasswordView, LeaveRequestViewSet, LoginView, MeView, StaffCreateUserView, VerifyEmailView

router = DefaultRouter()
router.register(r'leave-requests', LeaveRequestViewSet, basename='leave-request')

urlpatterns = [
    path('auth/register/', StaffCreateUserView.as_view(), name='staff-register-user'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('auth/me/', MeView.as_view(), name='me'),
]

urlpatterns += router.urls