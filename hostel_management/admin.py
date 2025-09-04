from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, Student, Room, Payment, Attendance, Penalty, Meal, 
    MealFeedback, Complaint, StayExtensionRequest, Notification, 
    Staff, FoodShortage
)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """Custom admin for User model"""
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'created_at']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Hostel Information', {'fields': ('role', 'phone', 'address', 'profile_picture')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Hostel Information', {'fields': ('role', 'phone', 'address')}),
    )


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    """Admin for Student model"""
    list_display = ['student_id', 'user', 'department', 'year_of_study', 'room', 'is_active', 'check_in_date']
    list_filter = ['department', 'year_of_study', 'is_active', 'check_in_date']
    search_fields = ['student_id', 'user__username', 'user__first_name', 'user__last_name']
    ordering = ['student_id']
    
    fieldsets = (
        ('Student Information', {
            'fields': ('user', 'student_id', 'department', 'year_of_study')
        }),
        ('Contact Information', {
            'fields': ('parent_name', 'parent_phone', 'emergency_contact')
        }),
        ('Medical Information', {
            'fields': ('blood_group', 'medical_conditions')
        }),
        ('Room Information', {
            'fields': ('room', 'check_in_date', 'check_out_date')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    """Admin for Room model"""
    list_display = ['room_number', 'room_type', 'floor', 'capacity', 'occupied', 'price_per_month', 'is_available']
    list_filter = ['room_type', 'floor', 'is_available']
    search_fields = ['room_number']
    ordering = ['room_number']
    
    fieldsets = (
        ('Room Information', {
            'fields': ('room_number', 'room_type', 'floor', 'capacity')
        }),
        ('Status', {
            'fields': ('occupied', 'is_available')
        }),
        ('Financial', {
            'fields': ('price_per_month',)
        }),
        ('Description', {
            'fields': ('description',)
        }),
    )


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin for Payment model"""
    list_display = ['id', 'student', 'amount', 'payment_date', 'payment_method', 'status', 'verified_by']
    list_filter = ['status', 'payment_method', 'payment_date']
    search_fields = ['student__student_id', 'student__user__first_name', 'transaction_id']
    ordering = ['-payment_date']
    
    fieldsets = (
        ('Payment Information', {
            'fields': ('student', 'amount', 'payment_date', 'payment_method', 'transaction_id')
        }),
        ('Documentation', {
            'fields': ('screenshot', 'description')
        }),
        ('Verification', {
            'fields': ('status', 'verified_by', 'verified_at', 'reject_reason')
        }),
    )
    readonly_fields = ['verified_at']


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    """Admin for Attendance model"""
    list_display = ['student', 'date', 'is_present', 'marked_by']
    list_filter = ['is_present', 'date', 'marked_by']
    search_fields = ['student__student_id', 'student__user__first_name']
    ordering = ['-date']
    
    fieldsets = (
        ('Attendance Information', {
            'fields': ('student', 'date', 'is_present')
        }),
        ('Details', {
            'fields': ('marked_by', 'remarks')
        }),
    )


@admin.register(Penalty)
class PenaltyAdmin(admin.ModelAdmin):
    """Admin for Penalty model"""
    list_display = ['student', 'penalty_type', 'amount', 'issued_by', 'issued_date', 'is_paid']
    list_filter = ['penalty_type', 'is_paid', 'issued_date']
    search_fields = ['student__student_id', 'student__user__first_name']
    ordering = ['-issued_date']
    
    fieldsets = (
        ('Penalty Information', {
            'fields': ('student', 'penalty_type', 'amount', 'reason')
        }),
        ('Status', {
            'fields': ('issued_by', 'issued_date', 'is_paid', 'paid_date')
        }),
    )
    readonly_fields = ['issued_date']


@admin.register(Meal)
class MealAdmin(admin.ModelAdmin):
    """Admin for Meal model"""
    list_display = ['meal_type', 'date', 'prepared_by', 'is_available']
    list_filter = ['meal_type', 'date', 'is_available']
    search_fields = ['menu']
    ordering = ['-date', 'meal_type']
    
    fieldsets = (
        ('Meal Information', {
            'fields': ('meal_type', 'date', 'menu')
        }),
        ('Status', {
            'fields': ('prepared_by', 'is_available')
        }),
    )


@admin.register(MealFeedback)
class MealFeedbackAdmin(admin.ModelAdmin):
    """Admin for MealFeedback model"""
    list_display = ['student', 'meal', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['student__student_id', 'student__user__first_name', 'feedback_text']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Feedback Information', {
            'fields': ('student', 'meal', 'rating', 'feedback_text')
        }),
    )
    readonly_fields = ['created_at']


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    """Admin for Complaint model"""
    list_display = ['student', 'complaint_type', 'title', 'status', 'assigned_to', 'created_at']
    list_filter = ['complaint_type', 'status', 'created_at']
    search_fields = ['student__student_id', 'title', 'description']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Complaint Information', {
            'fields': ('student', 'complaint_type', 'title', 'description')
        }),
        ('Status', {
            'fields': ('status', 'assigned_to', 'resolution', 'resolved_at')
        }),
    )
    readonly_fields = ['created_at', 'updated_at']


@admin.register(StayExtensionRequest)
class StayExtensionRequestAdmin(admin.ModelAdmin):
    """Admin for StayExtensionRequest model"""
    list_display = ['student', 'current_checkout_date', 'requested_checkout_date', 'status', 'approved_by']
    list_filter = ['status', 'current_checkout_date', 'requested_checkout_date']
    search_fields = ['student__student_id', 'student__user__first_name', 'reason']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Request Information', {
            'fields': ('student', 'current_checkout_date', 'requested_checkout_date', 'reason')
        }),
        ('Status', {
            'fields': ('status', 'approved_by', 'approved_at', 'rejection_reason')
        }),
    )
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin for Notification model"""
    list_display = ['recipient', 'notification_type', 'title', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['recipient__username', 'title', 'message']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Notification Information', {
            'fields': ('recipient', 'notification_type', 'title', 'message')
        }),
        ('Status', {
            'fields': ('is_read', 'related_object_id', 'related_object_type')
        }),
    )
    readonly_fields = ['created_at']


@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    """Admin for Staff model"""
    list_display = ['staff_id', 'user', 'staff_type', 'department', 'hire_date', 'is_active']
    list_filter = ['staff_type', 'department', 'is_active', 'hire_date']
    search_fields = ['staff_id', 'user__username', 'user__first_name', 'user__last_name']
    ordering = ['staff_id']
    
    fieldsets = (
        ('Staff Information', {
            'fields': ('user', 'staff_id', 'staff_type', 'department')
        }),
        ('Employment', {
            'fields': ('hire_date', 'salary', 'is_active')
        }),
    )


@admin.register(FoodShortage)
class FoodShortageAdmin(admin.ModelAdmin):
    """Admin for FoodShortage model"""
    list_display = ['meal', 'shortage_type', 'reported_by', 'status', 'resolved_by']
    list_filter = ['status', 'shortage_type', 'created_at']
    search_fields = ['shortage_type', 'description', 'resolution_notes']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Shortage Information', {
            'fields': ('meal', 'shortage_type', 'description')
        }),
        ('Status', {
            'fields': ('status', 'reported_by', 'resolved_by', 'resolved_at', 'resolution_notes')
        }),
    )
    readonly_fields = ['created_at', 'updated_at']
