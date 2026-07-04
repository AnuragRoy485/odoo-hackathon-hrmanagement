from django.db import models
from django.contrib.auth.models import User

class LeaveRequest(models.Model):
    LEAVE_TYPES = [('PAID', 'Paid'), ('SICK', 'Sick'), ('UNPAID', 'Unpaid')] #
    STATUS_CHOICES = [('PENDING', 'Pending'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected')] #
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    leave_type = models.CharField(max_length=10, choices=LEAVE_TYPES) #
    start_date = models.DateField() #
    end_date = models.DateField() #
    remarks = models.TextField(blank=True) #
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING') #