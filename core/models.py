import secrets
import string

from django.conf import settings
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models


class CustomUserManager(BaseUserManager):
    def _generate_employee_id(self):
        alphabet = string.digits
        while True:
            employee_id = f"EMP{''.join(secrets.choice(alphabet) for _ in range(6))}"
            if not self.model.objects.filter(employee_id=employee_id).exists():
                return employee_id

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set.')

        email = self.normalize_email(email)
        extra_fields.setdefault('employee_id', self._generate_employee_id())
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_email_verified', True)
        extra_fields.setdefault('role', CustomUser.RoleChoices.HR)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    class RoleChoices(models.TextChoices):
        EMPLOYEE = 'EMPLOYEE', 'Employee'
        HR = 'HR', 'HR'

    employee_id = models.CharField(max_length=20, unique=True, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=RoleChoices.choices, default=RoleChoices.EMPLOYEE)
    is_email_verified = models.BooleanField(default=False)
    must_change_password = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def save(self, *args, **kwargs):
        if not self.employee_id:
            self.employee_id = type(self).objects._generate_employee_id()
        self.email = self.__class__.objects.normalize_email(self.email)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.employee_id} - {self.email}'


class LeaveRequest(models.Model):
    LEAVE_TYPES = [('PAID', 'Paid'), ('SICK', 'Sick'), ('UNPAID', 'Unpaid')]
    STATUS_CHOICES = [('PENDING', 'Pending'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    leave_type = models.CharField(max_length=10, choices=LEAVE_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    remarks = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')