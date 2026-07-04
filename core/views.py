from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import permissions, status, viewsets
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.generic import TemplateView

from .models import CustomUser, LeaveRequest
from .serializers import (
    EmailVerificationSerializer,
    LeaveRequestSerializer,
    LoginSerializer,
    PasswordChangeSerializer,
    PublicSignupSerializer,
    StaffCreateUserSerializer,
)


def send_user_verification_email(user, request):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    verification_link = request.build_absolute_uri(f'/?uid={uid}&token={token}&action=verify-email')

    send_mail(
        subject='Verify your HRMS account',
        message=(
            f'Hello {user.employee_id},\n\n'
            f'Verify your email using this link: {verification_link}\n\n'
            'If you did not request this account, ignore this email.'
        ),
        from_email=None,
        recipient_list=[user.email],
        fail_silently=False,
    )
    return verification_link

class LeaveRequestViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Employees should only see their own requests; Admin/HR sees all
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return LeaveRequest.objects.all()
        return LeaveRequest.objects.filter(user=user)

    # Automatically attach the logged-in user to the request instance
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class StaffCreateUserView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        serializer = StaffCreateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        verification_link = send_user_verification_email(user, request)

        return Response(
            {
                'message': 'User created successfully. Verification email sent.',
                'user': {
                    'id': user.id,
                    'employee_id': user.employee_id,
                    'email': user.email,
                    'role': user.role,
                    'is_email_verified': user.is_email_verified,
                },
                'temporary_password': user.generated_password,
                'verification_link': verification_link,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class PublicSignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PublicSignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        verification_link = send_user_verification_email(user, request)

        return Response(
            {
                'message': 'Account created successfully. Check your email to verify your account.',
                'user': {
                    'id': user.id,
                    'employee_id': user.employee_id,
                    'email': user.email,
                    'role': user.role,
                    'is_email_verified': user.is_email_verified,
                },
                'verification_link': verification_link,
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        serializer = EmailVerificationSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        uid = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        user_id = force_str(urlsafe_base64_decode(uid))
        user = get_object_or_404(CustomUser, pk=user_id)

        if not default_token_generator.check_token(user, token):
            return Response({'detail': 'Verification link is invalid or has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        user.is_email_verified = True
        user.save(update_fields=['is_email_verified'])
        return Response({'message': 'Email verified successfully.'}, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.must_change_password = False
        user.save(update_fields=['password', 'must_change_password'])

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'message': 'Password updated successfully.',
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(
            {
                'id': user.id,
                'employee_id': user.employee_id,
                'email': user.email,
                'role': user.role,
                'is_email_verified': user.is_email_verified,
                'must_change_password': user.must_change_password,
            },
            status=status.HTTP_200_OK,
        )


class AuthLoginPageView(TemplateView):
    template_name = 'core/login.html'


class AuthSignupPageView(TemplateView):
    template_name = 'core/signup.html'