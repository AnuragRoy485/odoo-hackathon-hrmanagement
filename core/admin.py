from django.contrib import admin

from .models import CustomUser, LeaveRequest


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
	list_display = ('employee_id', 'email', 'role', 'is_email_verified', 'is_staff', 'is_active')
	list_filter = ('role', 'is_email_verified', 'is_staff', 'is_active')
	search_fields = ('employee_id', 'email')
	ordering = ('employee_id',)
	readonly_fields = ('date_joined',)
	fieldsets = (
		(None, {'fields': ('employee_id', 'email', 'password')}),
		('Profile', {'fields': ('role', 'is_email_verified', 'must_change_password')}),
		('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
		('Important dates', {'fields': ('last_login', 'date_joined')}),
	)


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
	list_display = ('user', 'leave_type', 'start_date', 'end_date', 'status')
	list_filter = ('leave_type', 'status')
	search_fields = ('user__email', 'user__employee_id')
