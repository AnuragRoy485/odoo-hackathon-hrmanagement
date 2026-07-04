from rest_framework import viewsets, permissions
from .models import LeaveRequest
from .serializers import LeaveRequestSerializer

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