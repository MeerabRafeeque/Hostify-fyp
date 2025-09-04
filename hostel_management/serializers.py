from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import (
    User, Student, Room, Payment, Attendance, Penalty, Meal, 
    MealFeedback, Complaint, StayExtensionRequest, Notification, 
    Staff, FoodShortage, SystemSettings
)


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 
                 'phone', 'address', 'profile_picture', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password', 'first_name', 
                 'last_name', 'role', 'phone', 'address']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField()
    password = serializers.CharField()
    role = serializers.CharField(required=False)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        role = attrs.get('role')

        if username and password:
            # Try to find user by email first, then by username
            try:
                user = User.objects.get(email=username)
                actual_username = user.username
            except User.DoesNotExist:
                try:
                    user = User.objects.get(username=username)
                    actual_username = user.username
                except User.DoesNotExist:
                    raise serializers.ValidationError('Invalid credentials')
            
            # Authenticate using the actual username
            authenticated_user = authenticate(username=actual_username, password=password)
            if not authenticated_user:
                raise serializers.ValidationError('Invalid credentials')
            if not authenticated_user.is_active:
                raise serializers.ValidationError('User account is disabled')
            
            # Validate role if provided (case-insensitive comparison)
            if role and authenticated_user.role.lower() != role.lower():
                raise serializers.ValidationError(f'Invalid role for this user. Expected: {authenticated_user.role}, Got: {role}')
            
            attrs['user'] = authenticated_user
        else:
            raise serializers.ValidationError('Must include username and password')

        return attrs


class StudentSerializer(serializers.ModelSerializer):
    """Serializer for Student model"""
    user = UserSerializer(read_only=True)
    
    # Fields for creating/updating student
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)
    phone = serializers.CharField(write_only=True, required=False)
    address = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Student
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class RoomSerializer(serializers.ModelSerializer):
    """Serializer for Room model"""
    class Meta:
        model = Room
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model"""
    student = StudentSerializer(read_only=True)
    verified_by = UserSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'verified_by', 'verified_at']


class AttendanceSerializer(serializers.ModelSerializer):
    """Serializer for Attendance model"""
    student = StudentSerializer(read_only=True)
    marked_by = UserSerializer(read_only=True)
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_id = serializers.CharField(source='student.student_id', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'marked_by', 'summary']


class PenaltySerializer(serializers.ModelSerializer):
    """Serializer for Penalty model"""
    student = StudentSerializer(read_only=True)
    issued_by = UserSerializer(read_only=True)

    class Meta:
        model = Penalty
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'issued_by', 'issued_date']


class MealSerializer(serializers.ModelSerializer):
    """Serializer for Meal model"""
    prepared_by = UserSerializer(read_only=True)

    class Meta:
        model = Meal
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'prepared_by']


class MealFeedbackSerializer(serializers.ModelSerializer):
    """Serializer for MealFeedback model"""
    student = StudentSerializer(read_only=True)
    meal = MealSerializer(read_only=True)

    class Meta:
        model = MealFeedback
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class ComplaintSerializer(serializers.ModelSerializer):
    """Serializer for Complaint model"""
    student = StudentSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)

    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class StayExtensionRequestSerializer(serializers.ModelSerializer):
    """Serializer for StayExtensionRequest model"""
    student = StudentSerializer(read_only=True)
    approved_by = UserSerializer(read_only=True)

    class Meta:
        model = StayExtensionRequest
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'approved_by', 'approved_at']


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    recipient = UserSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class StaffSerializer(serializers.ModelSerializer):
    """Serializer for Staff model"""
    user = UserSerializer(read_only=True)

    class Meta:
        model = Staff
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class FoodShortageSerializer(serializers.ModelSerializer):
    """Serializer for FoodShortage model"""
    meal = MealSerializer(read_only=True)
    reported_by = UserSerializer(read_only=True)
    resolved_by = UserSerializer(read_only=True)

    class Meta:
        model = FoodShortage
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'resolved_by', 'resolved_at']


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics"""
    total_students = serializers.IntegerField()
    total_rooms = serializers.IntegerField()
    available_rooms = serializers.IntegerField()
    occupied_rooms = serializers.IntegerField()
    pending_payments = serializers.IntegerField()
    pending_complaints = serializers.IntegerField()
    pending_extension_requests = serializers.IntegerField()
    today_meals = serializers.IntegerField()
    total_staff = serializers.IntegerField()
    recent_notifications = serializers.ListField()


class RoomApplicationSerializer(serializers.Serializer):
    """Serializer for room application"""
    student_id = serializers.CharField()
    room_type = serializers.CharField()
    preferred_floor = serializers.IntegerField(required=False)
    special_requirements = serializers.CharField(required=False)


class BulkAttendanceSerializer(serializers.Serializer):
    """Serializer for bulk attendance marking"""
    date = serializers.DateField()
    attendances = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )

    def validate_attendances(self, value):
        """Validate attendance data structure"""
        for attendance in value:
            required_fields = ['student', 'morning_shift', 'evening_shift', 'night_shift']
            for field in required_fields:
                if field not in attendance:
                    raise serializers.ValidationError(f"Missing required field: {field}")
            
            # Validate student ID is an integer
            try:
                int(attendance['student'])
            except (ValueError, TypeError):
                raise serializers.ValidationError("Student ID must be an integer")
            
            # Validate shift values
            valid_shifts = ['Present', 'Absent', 'Holiday', 'Leave', 'Null']
            for shift_field in ['morning_shift', 'evening_shift', 'night_shift']:
                if attendance[shift_field] not in valid_shifts:
                    raise serializers.ValidationError(f"Invalid {shift_field} value. Must be one of: {valid_shifts}")
        
        return value


class PaymentVerificationSerializer(serializers.Serializer):
    """Serializer for payment verification"""
    payment_id = serializers.IntegerField()
    status = serializers.CharField()
    reject_reason = serializers.CharField(required=False)


class SystemSettingsSerializer(serializers.ModelSerializer):
    """Serializer for SystemSettings model"""
    class Meta:
        model = SystemSettings
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
