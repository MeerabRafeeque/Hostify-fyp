from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login, logout
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from datetime import date, timedelta

from .models import (
    User, Student, Room, Payment, Attendance, Penalty, Meal, 
    MealFeedback, Complaint, StayExtensionRequest, Notification, 
    Staff, FoodShortage, SystemSettings
)
from .serializers import (
    UserSerializer, UserRegistrationSerializer, LoginSerializer,
    StudentSerializer, RoomSerializer, PaymentSerializer, AttendanceSerializer,
    PenaltySerializer, MealSerializer, MealFeedbackSerializer, ComplaintSerializer,
    StayExtensionRequestSerializer, NotificationSerializer, StaffSerializer,
    FoodShortageSerializer, DashboardStatsSerializer, RoomApplicationSerializer,
    BulkAttendanceSerializer, PaymentVerificationSerializer, SystemSettingsSerializer
)


class RoleBasedPermission(permissions.BasePermission):
    """Custom permission class for role-based access control"""
    
    def has_permission(self, request, view):
        # Allow all authenticated users for basic operations
        if not request.user.is_authenticated:
            return False
        
        # Get allowed roles from view
        allowed_roles = getattr(view, 'allowed_roles', [])
        
        # If no specific roles are defined, allow all authenticated users
        if not allowed_roles:
            return True
        
        # Check if user's role is in allowed roles
        return request.user.role in allowed_roles


class AuthViewSet(viewsets.ViewSet):
    """Authentication views"""
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        """User registration"""
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User registered successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def login(self, request):
        """User login"""
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        """User logout"""
        logout(request)
        return Response({'message': 'Logout successful'})


class DashboardView(APIView):
    """Dashboard statistics view"""
    permission_classes = [RoleBasedPermission]
    allowed_roles = ['admin', 'warden', 'deputy_rt', 'mess_staff', 'student']

    def get(self, request):
        """Get dashboard statistics"""
        today = date.today()
        
        # Calculate occupied rooms (rooms with at least one student)
        occupied_rooms = Room.objects.filter(occupied__gt=0).count()
        
        # Calculate pending extension requests
        pending_extension_requests = StayExtensionRequest.objects.filter(status='pending').count()
        
        stats = {
            'total_students': Student.objects.filter(is_active=True).count(),
            'total_rooms': Room.objects.count(),
            'available_rooms': Room.objects.filter(is_available=True).count(),
            'occupied_rooms': occupied_rooms,
            'pending_payments': Payment.objects.filter(status='pending').count(),
            'pending_complaints': Complaint.objects.filter(status='pending').count(),
            'pending_extension_requests': pending_extension_requests,
            'today_meals': Meal.objects.filter(date=today).count(),
            'total_staff': Staff.objects.filter(is_active=True).count(),
            'recent_notifications': list(
                Notification.objects.filter(recipient=request.user, is_read=False)
                .values('id', 'title', 'created_at')[:5]
            )
        }
        
        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data)


class UserViewSet(viewsets.ModelViewSet):
    """User management views"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [RoleBasedPermission]
    allowed_roles = ['admin', 'warden']

    def get_queryset(self):
        """Filter users based on role"""
        queryset = User.objects.all()
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        return queryset


class StudentViewSet(viewsets.ModelViewSet):
    """Student management views"""
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [RoleBasedPermission]
    allowed_roles = ['admin', 'warden', 'deputy_rt', 'student']

    def get_queryset(self):
        """Filter students based on various criteria"""
        queryset = Student.objects.all()
        
        # Filter by department
        department = self.request.query_params.get('department', None)
        if department:
            queryset = queryset.filter(department__icontains=department)
        
        # Filter by year
        year = self.request.query_params.get('year', None)
        if year:
            queryset = queryset.filter(year_of_study=year)
        
        return queryset

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current student's data"""
        if request.user.role != 'student':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            student = Student.objects.get(user=request.user)
            serializer = self.get_serializer(student)
            return Response(serializer.data)
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

    def perform_create(self, serializer):
        """Create student and associated user"""
        user_data = {
            'username': serializer.validated_data.get('email'),
            'email': serializer.validated_data.get('email'),
            'first_name': serializer.validated_data.get('first_name'),
            'last_name': serializer.validated_data.get('last_name'),
            'phone': serializer.validated_data.get('phone'),
            'address': serializer.validated_data.get('address'),
            'role': 'student'
        }
        
        # Create user
        user = User.objects.create_user(**user_data)
        
        # Create student profile
        student_data = {
            'user': user,
            'department': serializer.validated_data.get('department'),
            'year_of_study': serializer.validated_data.get('year_of_study'),
            'parent_name': serializer.validated_data.get('parent_name'),
            'is_active': True
        }
        
        serializer.save(**student_data)

    def perform_destroy(self, instance):
        """Delete student and notify deputy RT"""
        student_name = f"{instance.user.first_name} {instance.user.last_name}"
        
        # Notify deputy RT before deletion
        try:
            deputy_rt_users = User.objects.filter(role='deputy_rt')
            for deputy in deputy_rt_users:
                Notification.objects.create(
                    recipient=deputy,
                    notification_type='student_action',
                    title='Student Removed',
                    message=f'Student {student_name} has been removed from the system by admin.'
                )
        except Exception as e:
            print(f"Error notifying deputy RT: {e}")
        
        # Delete the student and user
        user = instance.user
        instance.delete()
        user.delete()

    @action(detail=True, methods=['post'])
    def allocate_room(self, request, pk=None):
        """Allocate room to student"""
        student = self.get_object()
        room_id = request.data.get('room_id')
        
        # Check if student has verified payment
        latest_payment = Payment.objects.filter(student=student).order_by('-created_at').first()
        if not latest_payment or latest_payment.status != 'verified':
            return Response({'error': 'Student must have verified payment before room assignment'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            room = Room.objects.get(id=room_id, is_available=True)
            if room.occupied >= room.capacity:
                return Response({'error': 'Room is full'}, status=status.HTTP_400_BAD_REQUEST)
            
            student.room = room
            student.check_in_date = date.today()
            student.save()
            
            room.occupied += 1
            if room.occupied >= room.capacity:
                room.is_available = False
            room.save()
            
            # Create notification for student about room assignment
            Notification.objects.create(
                recipient=student.user,
                notification_type='room_assigned',
                title='Room Assigned',
                message=f'You have been assigned to room {room.room_number}. Please log out and log back in to access your full dashboard.'
            )
            
            return Response({'message': 'Room allocated successfully'})
        except Room.DoesNotExist:
            return Response({'error': 'Room not found or not available'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def deallocate_room(self, request, pk=None):
        """Deallocate room from student"""
        student = self.get_object()
        
        if not student.room:
            return Response({'error': 'Student has no room assigned'}, status=status.HTTP_400_BAD_REQUEST)
        
        room = student.room
        student.room = None
        student.check_in_date = None
        student.save()
        
        room.occupied -= 1
        if room.occupied < room.capacity:
            room.is_available = True
        room.save()
        
        # Create notification for student about room deallocation
        Notification.objects.create(
            recipient=student.user,
            notification_type='room_deallocated',
            title='Room Deallocated',
            message=f'Your room {room.room_number} has been deallocated.'
        )
        
        return Response({'message': 'Room deallocated successfully'})


class RoomViewSet(viewsets.ModelViewSet):
    """Room management views"""
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [RoleBasedPermission]
    allowed_roles = ['admin', 'warden']

    def get_queryset(self):
        """Filter rooms based on various criteria"""
        queryset = Room.objects.all()
        
        # Filter by room type
        room_type = self.request.query_params.get('room_type', None)
        if room_type:
            queryset = queryset.filter(room_type=room_type)
        
        # Filter by availability
        available = self.request.query_params.get('available', None)
        if available is not None:
            if available.lower() == 'true':
                queryset = queryset.filter(is_available=True)
            else:
                queryset = queryset.filter(is_available=False)
        
        return queryset


class PaymentViewSet(viewsets.ModelViewSet):
    """Payment management views"""
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [RoleBasedPermission]
    allowed_roles = ['admin', 'warden']

    def get_queryset(self):
        """Filter payments based on various criteria"""
        queryset = Payment.objects.all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by student
        student_id = self.request.query_params.get('student_id', None)
        if student_id:
            queryset = queryset.filter(student__student_id=student_id)
        
        return queryset

    @action(detail=True, methods=['post'])
    def verify_payment(self, request, pk=None):
        """Verify or reject payment"""
        payment = self.get_object()
        status = request.data.get('status')
        reject_reason = request.data.get('reject_reason', '')
        
        if status not in ['verified', 'rejected']:
            return Response({'error': 'Invalid status. Must be "verified" or "rejected"'}, status=status.HTTP_400_BAD_REQUEST)
        
        payment.status = status
        
        if status == 'verified':
            payment.verified_by = request.user
            payment.verified_at = timezone.now()
            payment.reject_reason = None  # Clear any previous rejection reason
            
            # Create notification for student
            Notification.objects.create(
                recipient=payment.student.user,
                notification_type='payment_verified',
                title='Payment Verified',
                message=f'Your payment of PKR {payment.amount} has been verified successfully. You can now apply for room assignment.'
            )
        elif status == 'rejected':
            if not reject_reason:
                return Response({'error': 'Rejection reason is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            payment.reject_reason = reject_reason
            payment.verified_by = None
            payment.verified_at = None
            
            # Create notification for student
            Notification.objects.create(
                recipient=payment.student.user,
                notification_type='payment_rejected',
                title='Payment Rejected',
                message=f'Your payment of PKR {payment.amount} has been rejected. Reason: {reject_reason}. Please submit a new payment.'
            )
        
        payment.save()
        return Response({'message': f'Payment {status} successfully'})

    @action(detail=False, methods=['post'])
    def verify_payment_by_student_id(self, request):
        """Verify payment by student ID"""
        student_id = request.data.get('student_id')
        status = request.data.get('status', 'verified')
        
        try:
            payment = Payment.objects.filter(student__student_id=student_id).latest('created_at')
            payment.status = status
            if status == 'verified':
                payment.verified_by = request.user
                payment.verified_at = timezone.now()
            payment.save()
            
            return Response({'message': f'Payment {status} successfully'})
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)


class AttendanceViewSet(viewsets.ModelViewSet):
    """Attendance management views"""
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [RoleBasedPermission]
    allowed_roles = ['admin', 'warden', 'deputy_rt']

    def get_queryset(self):
        """Filter attendance based on various criteria"""
        queryset = Attendance.objects.all()
        
        # Filter by date
        date_filter = self.request.query_params.get('date', None)
        if date_filter:
            queryset = queryset.filter(date=date_filter)
        
        # Filter by student
        student_id = self.request.query_params.get('student_id', None)
        if student_id:
            queryset = queryset.filter(student__student_id=student_id)
        
        return queryset

    @action(detail=False, methods=['post'])
    def bulk_mark_attendance(self, request):
        """Bulk mark attendance for multiple students with shift logic"""
        serializer = BulkAttendanceSerializer(data=request.data)
        if serializer.is_valid():
            date = serializer.validated_data['date']
            attendances = serializer.validated_data['attendances']
            
            created_count = 0
            updated_count = 0
            
            for attendance_data in attendances:
                student_id = attendance_data['student']
                try:
                    student = Student.objects.get(id=student_id)
                    
                    morning_shift = attendance_data.get('morning_shift', 'Null')
                    evening_shift = attendance_data.get('evening_shift', 'Null')
                    night_shift = attendance_data.get('night_shift', 'Null')
                    
                    # Apply shift logic: if morning & evening are present, night should be null
                    if morning_shift == 'Present' and evening_shift == 'Present':
                        night_shift = 'Null'
                    
                    # Calculate summary
                    summary = self._calculate_summary(morning_shift, evening_shift, night_shift)
                    
                    # Check if attendance already exists for this student and date
                    attendance, created = Attendance.objects.get_or_create(
                        student=student,
                        date=date,
                        defaults={
                            'marked_by': request.user,
                            'remarks': attendance_data.get('remarks', ''),
                            'morning_shift': morning_shift,
                            'evening_shift': evening_shift,
                            'night_shift': night_shift,
                            'summary': summary
                        }
                    )
                    
                    if not created:
                        # Update existing attendance
                        attendance.remarks = attendance_data.get('remarks', '')
                        attendance.morning_shift = morning_shift
                        attendance.evening_shift = evening_shift
                        attendance.night_shift = night_shift
                        attendance.summary = summary
                        attendance.save()
                        updated_count += 1
                    else:
                        created_count += 1
                    
                    # Handle night shift penalty logic
                    self._handle_night_shift_penalty(student, date, night_shift, request.user)
                        
                except Student.DoesNotExist:
                    continue
            
            return Response({
                'message': f'Attendance marked successfully. Created: {created_count}, Updated: {updated_count}',
                'created': created_count,
                'updated': updated_count
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _calculate_summary(self, morning_shift, evening_shift, night_shift):
        """Calculate daily summary based on shifts"""
        # If both morning and evening are present, summary is present
        if morning_shift == 'Present' and evening_shift == 'Present':
            return 'Present'
        # If both morning and evening are absent, summary is absent
        elif morning_shift == 'Absent' and evening_shift == 'Absent':
            return 'Absent'
        # If both morning and evening are holiday, summary is holiday
        elif morning_shift == 'Holiday' and evening_shift == 'Holiday':
            return 'Holiday'
        # If both morning and evening are leave, summary is leave
        elif morning_shift == 'Leave' and evening_shift == 'Leave':
            return 'Leave'
        # Mixed shifts - default to present if at least one is present
        elif morning_shift == 'Present' or evening_shift == 'Present':
            return 'Present'
        else:
            return 'Absent'
    
    def _handle_night_shift_penalty(self, student, date, night_shift, marked_by):
        """Handle night shift penalty creation/deletion"""
        if night_shift == 'Present':
            # Create penalty for night shift presence
            Penalty.objects.get_or_create(
                student=student,
                penalty_type='night_shift',
                defaults={
                    'amount': 500,
                    'reason': 'Present during night shift (after 8 PM)',
                    'issued_by': marked_by
                }
            )
        elif night_shift == 'Null':
            # Remove penalty if night shift is null
            Penalty.objects.filter(
                student=student,
                penalty_type='night_shift'
            ).delete()


class PenaltyViewSet(viewsets.ModelViewSet):
    """Penalty management views"""
    queryset = Penalty.objects.all()
    serializer_class = PenaltySerializer
    permission_classes = [RoleBasedPermission]
    allowed_roles = ['admin', 'warden', 'deputy_rt']

    def perform_create(self, serializer):
        """Create penalty and send notification"""
        penalty = serializer.save(issued_by=self.request.user)
        
        # Create notification for student
        Notification.objects.create(
            recipient=penalty.student.user,
            notification_type='penalty',
            title=f'{penalty.penalty_type.title()} Issued',
            message=f'You have been issued a {penalty.penalty_type} penalty. Reason: {penalty.reason}'
        )


class MealViewSet(viewsets.ModelViewSet):
    """Meal management views"""
    queryset = Meal.objects.all()
    serializer_class = MealSerializer
    permission_classes = [RoleBasedPermission]
    allowed_roles = ['admin', 'warden', 'deputy_rt', 'mess_staff', 'student']

    def perform_create(self, serializer):
        """Create meal and set prepared_by"""
        serializer.save(prepared_by=self.request.user)

    def get_queryset(self):
        """Filter meals based on various criteria"""
        queryset = Meal.objects.all()
        
        # Filter by meal type
        meal_type = self.request.query_params.get('meal_type', None)
        if meal_type:
            queryset = queryset.filter(meal_type=meal_type)
        
        # Filter by date
        date_filter = self.request.query_params.get('date', None)
        if date_filter:
            queryset = queryset.filter(date=date_filter)
        
        return queryset


class MealFeedbackViewSet(viewsets.ModelViewSet):
    """Meal feedback views"""
    queryset = MealFeedback.objects.all()
    serializer_class = MealFeedbackSerializer
    permission_classes = [RoleBasedPermission]
    allowed_roles = ['admin', 'warden', 'deputy_rt', 'mess_staff', 'student']


class ComplaintViewSet(viewsets.ModelViewSet):
    """Complaint management views"""
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    permission_classes = [RoleBasedPermission]
    allowed_roles = ['admin', 'warden', 'student']

    def get_queryset(self):
        """Filter complaints based on various criteria"""
        queryset = Complaint.objects.all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by complaint type
        complaint_type = self.request.query_params.get('complaint_type', None)
        if complaint_type:
            queryset = queryset.filter(complaint_type=complaint_type)
        
        return queryset


class StayExtensionRequestViewSet(viewsets.ModelViewSet):
    """Stay extension request views"""
    queryset = StayExtensionRequest.objects.all()
    serializer_class = StayExtensionRequestSerializer
    permission_classes = [RoleBasedPermission]
    allowed_roles = ['admin', 'warden', 'student']

    def get_queryset(self):
        """Filter requests based on various criteria"""
        queryset = StayExtensionRequest.objects.all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset

    @action(detail=True, methods=['post'])
    def approve_request(self, request, pk=None):
        """Approve stay extension request"""
        extension_request = self.get_object()
        
        # Check if student is in 7th or 8th semester (year 4 or 5)
        if extension_request.student.year_of_study < 4:
            return Response({
                'message': 'Stay extension can only be approved for students in 7th or 8th semester (4th or 5th year)'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        extension_request.status = 'approved'
        extension_request.approved_by = request.user
        extension_request.approved_at = timezone.now()
        extension_request.save()
        
        # Create notification for student
        Notification.objects.create(
            recipient=extension_request.student.user,
            notification_type='extension',
            title='Stay Extension Approved',
            message=f'Your stay extension request has been approved until {extension_request.requested_checkout_date}'
        )
        
        return Response({'message': 'Stay extension request approved'})

    @action(detail=True, methods=['post'])
    def reject_request(self, request, pk=None):
        """Reject stay extension request"""
        extension_request = self.get_object()
        rejection_reason = request.data.get('rejection_reason', '')
        
        extension_request.status = 'rejected'
        extension_request.rejection_reason = rejection_reason
        extension_request.save()
        
        # Create notification for student
        Notification.objects.create(
            recipient=extension_request.student.user,
            notification_type='extension',
            title='Stay Extension Rejected',
            message=f'Your stay extension request has been rejected. Reason: {rejection_reason}'
        )
        
        return Response({'message': 'Stay extension request rejected'})


class NotificationViewSet(viewsets.ModelViewSet):
    """Notification views"""
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [RoleBasedPermission]
    allowed_roles = ['admin', 'warden', 'deputy_rt', 'mess_staff', 'student']

    def get_queryset(self):
        """Get notifications for current user"""
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=False, methods=['get'])
    def admin(self, request):
        """Get admin-specific notifications"""
        if request.user.role != 'admin':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        notifications = []
        
        # Get pending payment notifications
        pending_payments = Payment.objects.filter(status='pending').select_related('student__user')
        for payment in pending_payments:
            notifications.append({
                'id': f'payment_{payment.id}',
                'notification_type': 'payment',
                'title': 'New Payment Receipt',
                'message': f'Payment received from {payment.student.user.first_name} {payment.student.user.last_name}',
                'student_name': f'{payment.student.user.first_name} {payment.student.user.last_name}',
                'student_id': payment.student.student_id,
                'amount': payment.amount,
                'payment_method': payment.payment_method,
                'description': payment.description,
                'status': payment.status,
                'created_at': payment.created_at.isoformat()
            })
        
        # Get food shortage notifications
        food_shortages = FoodShortage.objects.filter(status='pending').select_related('meal', 'reported_by')
        for shortage in food_shortages:
            notifications.append({
                'id': f'shortage_{shortage.id}',
                'notification_type': 'food_shortage',
                'title': 'Food Shortage Alert',
                'message': f'Food shortage reported for {shortage.meal.meal_type} on {shortage.meal.date}: {shortage.description}',
                'created_at': shortage.created_at.isoformat()
            })
        
        # Get inactive student notifications (students who haven't applied for room after 7 days)
        from datetime import timedelta
        seven_days_ago = timezone.now() - timedelta(days=7)
        inactive_students = Student.objects.filter(
            is_active=True,
            room__isnull=True,
            user__date_joined__lt=seven_days_ago
        ).select_related('user')
        
        for student in inactive_students:
            notifications.append({
                'id': f'inactive_{student.id}',
                'notification_type': 'inactive_student',
                'title': 'Inactive Student',
                'message': f'Student {student.user.first_name} {student.user.last_name} has not applied for room after 7 days of login',
                'student_name': f'{student.user.first_name} {student.user.last_name}',
                'student_id': student.student_id,
                'created_at': student.user.date_joined.isoformat()
            })
        
        # Sort by creation date (newest first)
        notifications.sort(key=lambda x: x['created_at'], reverse=True)
        
        return Response(notifications)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all notifications as read"""
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'All notifications marked as read'})

    @action(detail=False, methods=['post'])
    def notify_deputy_rt(self, request):
        """Notify deputy RT about student actions"""
        if request.user.role != 'admin':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        student_id = request.data.get('student_id')
        student_name = request.data.get('student_name')
        action = request.data.get('action')
        
        try:
            # Find deputy RT users
            deputy_rt_users = User.objects.filter(role='deputy_rt')
            
            for deputy in deputy_rt_users:
                Notification.objects.create(
                    recipient=deputy,
                    notification_type='student_action',
                    title=f'Student {action.title()}',
                    message=f'Student {student_name} has been {action} from the system by admin.'
                )
            
            return Response({'message': 'Deputy RT notified successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StaffViewSet(viewsets.ModelViewSet):
    """Staff management views"""
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer
    permission_classes = [RoleBasedPermission]
    allowed_roles = ['admin', 'warden']

    def get_queryset(self):
        """Filter staff based on various criteria"""
        queryset = Staff.objects.all()
        
        # Filter by staff type
        staff_type = self.request.query_params.get('staff_type', None)
        if staff_type:
            queryset = queryset.filter(staff_type=staff_type)
        
        return queryset


class FoodShortageViewSet(viewsets.ModelViewSet):
    """Food shortage views"""
    queryset = FoodShortage.objects.all()
    serializer_class = FoodShortageSerializer
    permission_classes = [RoleBasedPermission]
    allowed_roles = ['admin', 'warden', 'mess_staff']

    def perform_create(self, serializer):
        """Create food shortage and send notification"""
        shortage = serializer.save(reported_by=self.request.user)
        
        # Create notification for mess staff
        mess_staff = User.objects.filter(role='mess_staff')
        for staff in mess_staff:
            Notification.objects.create(
                recipient=staff,
                notification_type='food_shortage',
                title='Food Shortage Reported',
                message=f'Food shortage reported for {shortage.meal.meal_type} on {shortage.meal.date}'
            )

    @action(detail=False, methods=['post'])
    def acknowledge(self, request):
        """Acknowledge food shortage"""
        acknowledged = request.data.get('acknowledged', False)
        notification_id = request.data.get('notification_id')
        
        if acknowledged:
            if notification_id and notification_id.startswith('shortage_'):
                shortage_id = notification_id.split('_')[1]
                try:
                    shortage = FoodShortage.objects.get(id=shortage_id, status='pending')
                    shortage.status = 'acknowledged'
                    shortage.resolved_by = request.user
                    shortage.resolved_at = timezone.now()
                    shortage.save()
                    
                    # Create notification for mess staff
                    mess_staff = User.objects.filter(role='mess_staff')
                    for staff in mess_staff:
                        Notification.objects.create(
                            recipient=staff,
                            notification_type='food_shortage_acknowledged',
                            title='Food Shortage Acknowledged',
                            message=f'Admin has acknowledged the food shortage for {shortage.meal.meal_type} on {shortage.meal.date}'
                        )
                    
                    return Response({'message': 'Food shortage acknowledged successfully'})
                except FoodShortage.DoesNotExist:
                    return Response({'error': 'Food shortage not found'}, status=status.HTTP_404_NOT_FOUND)
            else:
                # Mark all pending food shortages as acknowledged
                FoodShortage.objects.filter(status='pending').update(
                    status='acknowledged',
                    resolved_by=request.user,
                    resolved_at=timezone.now()
                )
                return Response({'message': 'All food shortages acknowledged successfully'})
        
        return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)


class DeputyDashboardView(APIView):
    """Deputy RT Dashboard statistics view"""
    permission_classes = [RoleBasedPermission]
    allowed_roles = ['deputy_rt']

    def get(self, request):
        """Get deputy dashboard statistics"""
        if request.user.role != 'deputy_rt':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        today = date.today()
        
        # Get students assigned to rooms (for attendance marking)
        total_students = Student.objects.filter(room__isnull=False, is_active=True).count()
        
        # Get latest meal update
        latest_meal = Meal.objects.order_by('-updated_at').first()
        meal_menu_last_updated = latest_meal.updated_at if latest_meal else None
        
        # Get meal feedback count
        meal_feedback_count = MealFeedback.objects.count()
        
        # Get unread notifications count
        notifications_count = Notification.objects.filter(
            recipient=request.user, 
            is_read=False
        ).count()
        
        # Get new students added in last 7 days
        from datetime import timedelta
        seven_days_ago = timezone.now() - timedelta(days=7)
        new_students_count = Student.objects.filter(
            created_at__gte=seven_days_ago,
            is_active=True
        ).count()
        
        stats = {
            'total_students': total_students,
            'meal_menu_last_updated': meal_menu_last_updated,
            'meal_feedback_count': meal_feedback_count,
            'notifications_count': notifications_count,
            'new_students_count': new_students_count
        }
        
        return Response(stats)


class DeputyDashboardViewSet(viewsets.ViewSet):
    """Deputy RT Dashboard views"""
    permission_classes = [RoleBasedPermission]
    allowed_roles = ['deputy_rt']

    @action(detail=False, methods=['get'])
    def new_students(self, request):
        """Get new students added by admin"""
        if request.user.role != 'deputy_rt':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get new students added in last 7 days
        from datetime import timedelta
        seven_days_ago = timezone.now() - timedelta(days=7)
        new_students = Student.objects.filter(
            created_at__gte=seven_days_ago,
            is_active=True
        ).select_related('user')
        
        serializer = StudentSerializer(new_students, many=True)
        return Response({'new_students': serializer.data})


class SystemSettingsViewSet(viewsets.ModelViewSet):
    """System settings views"""
    queryset = SystemSettings.objects.all()
    serializer_class = SystemSettingsSerializer
    permission_classes = [RoleBasedPermission]
    allowed_roles = ['admin', 'warden']

    def get_queryset(self):
        """Get system settings"""
        return SystemSettings.objects.all()

    def list(self, request, *args, **kwargs):
        """Get current system settings"""
        settings = SystemSettings.get_settings()
        serializer = self.get_serializer(settings)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        """Update system settings"""
        settings = SystemSettings.get_settings()
        serializer = self.get_serializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'System settings updated successfully',
                'settings': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MessDashboardView(APIView):
    """Mess Dashboard statistics view"""
    permission_classes = [RoleBasedPermission]
    allowed_roles = ['mess_staff']

    def get(self, request):
        """Get mess dashboard statistics"""
        if request.user.role != 'mess_staff':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        today = date.today()
        
        # Get total feedback count
        total_feedback = MealFeedback.objects.count()
        
        # Get food shortage reports count
        food_shortage_reports = FoodShortage.objects.filter(reported_by=request.user).count()
        
        # Check if meal plan is updated (has meals for current week)
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        meal_plan_updated = Meal.objects.filter(
            date__range=[week_start, week_end]
        ).exists()
        
        stats = {
            'total_feedback': total_feedback,
            'food_shortage_reports': food_shortage_reports,
            'meal_plan_updated': meal_plan_updated
        }
        
        return Response(stats)


class StudentPreDashboardView(APIView):
    """Student Pre-Dashboard view"""
    permission_classes = [RoleBasedPermission]
    allowed_roles = ['student']

    def get(self, request):
        """Get student pre-dashboard data"""
        if request.user.role != 'student':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            student = Student.objects.get(user=request.user)
            
            # Get latest payment
            latest_payment = Payment.objects.filter(student=student).order_by('-created_at').first()
            
            # Calculate days left for room application
            registration_date = request.user.date_joined.date()
            deadline = registration_date + timedelta(days=7)
            days_left = max(0, (deadline - date.today()).days)
            
            data = {
                'student': {
                    'id': student.id,
                    'student_id': student.student_id,
                    'room': student.room.room_number if student.room else None,
                    'check_in_date': student.check_in_date,
                    'is_active': student.is_active
                },
                'user': {
                    'id': request.user.id,
                    'username': request.user.username,
                    'email': request.user.email,
                    'first_name': request.user.first_name,
                    'last_name': request.user.last_name,
                    'date_joined': request.user.date_joined,
                    'role': request.user.role
                },
                'payments': [{
                    'id': latest_payment.id,
                    'amount': latest_payment.amount,
                    'payment_method': latest_payment.payment_method,
                    'status': latest_payment.status,
                    'created_at': latest_payment.created_at,
                    'verified_at': latest_payment.verified_at,
                    'reject_reason': latest_payment.reject_reason
                }] if latest_payment else [],
                'days_left': days_left,
                'deadline': deadline.isoformat()
            }
            
            return Response(data)
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)


class StudentPostDashboardView(APIView):
    """Student Post-Dashboard statistics view"""
    permission_classes = [RoleBasedPermission]
    allowed_roles = ['student']

    def get(self, request):
        """Get student post-dashboard data"""
        if request.user.role != 'student':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            student = Student.objects.get(user=request.user)
            
            # Check if student has room assigned
            if not student.room:
                return Response({'error': 'No room assigned'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get latest payment
            latest_payment = Payment.objects.filter(student=student).order_by('-created_at').first()
            
            # Get recent notifications
            recent_notifications = Notification.objects.filter(
                recipient=request.user
            ).order_by('-created_at')[:5]
            
            # Get meal plan update info
            latest_meal_update = Meal.objects.order_by('-updated_at').first()
            
            data = {
                'student': {
                    'id': student.id,
                    'student_id': student.student_id,
                    'room': {
                        'room_number': student.room.room_number,
                        'room_type': student.room.room_type,
                        'floor': student.room.floor
                    },
                    'check_in_date': student.check_in_date,
                    'is_active': student.is_active
                },
                'user': {
                    'id': request.user.id,
                    'username': request.user.username,
                    'email': request.user.email,
                    'first_name': request.user.first_name,
                    'last_name': request.user.last_name,
                    'role': request.user.role
                },
                'payment': {
                    'id': latest_payment.id,
                    'amount': latest_payment.amount,
                    'payment_method': latest_payment.payment_method,
                    'status': latest_payment.status,
                    'created_at': latest_payment.created_at,
                    'verified_at': latest_payment.verified_at
                } if latest_payment else None,
                'recent_notifications': [
                    {
                        'id': notif.id,
                        'title': notif.title,
                        'message': notif.message,
                        'notification_type': notif.notification_type,
                        'created_at': notif.created_at,
                        'is_read': notif.is_read
                    } for notif in recent_notifications
                ],
                'meal_plan_updated': latest_meal_update.updated_at if latest_meal_update else None
            }
            
            return Response(data)
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)


class WardenDashboardView(APIView):
    """Warden Dashboard statistics view"""
    permission_classes = [RoleBasedPermission]
    allowed_roles = ['warden']

    def get(self, request):
        """Get warden dashboard data"""
        if request.user.role != 'warden':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Get current complaints that need warden response
            current_complaints = Complaint.objects.filter(
                status__in=['pending', 'in_progress']
            ).count()
            
            # Get current room allocations (students with assigned rooms)
            current_room_allocations = Student.objects.filter(
                room__isnull=False,
                is_active=True
            ).count()
            
            # Get recent notifications for warden
            recent_notifications = Notification.objects.filter(
                recipient=request.user
            ).order_by('-created_at')[:5]
            
            data = {
                'current_complaints': current_complaints,
                'current_room_allocations': current_room_allocations,
                'recent_notifications': [
                    {
                        'id': notif.id,
                        'title': notif.title,
                        'message': notif.message,
                        'notification_type': notif.notification_type,
                        'created_at': notif.created_at,
                        'is_read': notif.is_read
                    } for notif in recent_notifications
                ]
            }
            
            return Response(data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class RoomApplicationViewSet(viewsets.ModelViewSet):
    """Room application views"""
    queryset = Payment.objects.all()  # Using Payment model for room applications
    serializer_class = PaymentSerializer
    permission_classes = [RoleBasedPermission]
    allowed_roles = ['admin', 'warden', 'student']

    def perform_create(self, serializer):
        """Create room application (payment)"""
        try:
            student = Student.objects.get(user=self.request.user)
            
            # Set payment amount based on room type
            room_type = self.request.data.get('room_type')
            if room_type == 'single':
                amount = 15000
            elif room_type == 'shared':
                amount = 7000
            else:
                amount = 7000  # Default to dormitory
            
            # Create payment record
            payment = serializer.save(
                student=student,
                amount=amount,
                payment_method=self.request.data.get('payment_method'),
                description=f"Room application for {room_type} room",
                status='pending'
            )
            
            # Create notification for admin
            admin_users = User.objects.filter(role='admin')
            for admin in admin_users:
                Notification.objects.create(
                    recipient=admin,
                    notification_type='payment',
                    title='New Room Application',
                    message=f'Student {student.user.get_full_name()} has submitted a room application with payment of PKR {amount}'
                )
            
            # Create notification for student
            Notification.objects.create(
                recipient=student.user,
                notification_type='registration_success',
                title='Application Submitted',
                message='Your room application has been submitted successfully. Payment will be verified by admin.'
            )
            
            return Response({'message': 'Room application submitted successfully'})
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
