import secrets
import string

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import CustomUser, LeaveRequest

class LeaveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = '__all__'
        read_only_fields = ['user', 'status']


class StaffCreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = ['employee_id', 'email', 'password', 'role']
        extra_kwargs = {
            'employee_id': {'required': False},
        }

    def validate_password(self, value):
        if value:
            validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        if not password:
            alphabet = string.ascii_letters + string.digits + '!@#$%^&*()_+-='
            password = ''.join(secrets.choice(alphabet) for _ in range(14))

        user = CustomUser.objects.create_user(password=password, **validated_data)
        user.must_change_password = True
        user.save(update_fields=['must_change_password'])
        user.generated_password = password
        return user


class PublicSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'confirm_password']

    def validate_email(self, value):
        normalized_email = value.strip().lower()
        if CustomUser.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return normalized_email

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})

        validate_password(attrs['password'])
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            role=CustomUser.RoleChoices.EMPLOYEE,
        )
        user.must_change_password = False
        user.save(update_fields=['must_change_password'])
        return user


class LoginSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        data = super().validate(attrs)

        if not self.user.is_email_verified:
            raise AuthenticationFailed('Email address has not been verified yet.')

        data['user'] = {
            'id': self.user.id,
            'employee_id': self.user.employee_id,
            'email': self.user.email,
            'role': self.user.role,
            'must_change_password': self.user.must_change_password,
        }
        data['redirect_url'] = '/dashboard'
        return data


class EmailVerificationSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        user = self.context['request'].user
        if not user.check_password(attrs['current_password']):
            raise serializers.ValidationError({'current_password': 'Current password is incorrect.'})
        return attrs