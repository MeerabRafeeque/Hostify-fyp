from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class User(AbstractUser):
    """Custom User model with role-based authentication"""
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('admin', 'Admin'),
        ('warden', 'Warden'),
        ('deputy_rt', 'Deputy RT'),
        ('mess_staff', 'Mess Staff'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'


class Student(models.Model):
    """Student model with additional hostel-specific information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    student_id = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=100)
    year_of_study = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    parent_name = models.CharField(max_length=100)
    parent_phone = models.CharField(max_length=15)
    emergency_contact = models.CharField(max_length=15)
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    medical_conditions = models.TextField(blank=True, null=True)
    room = models.ForeignKey('Room', on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    check_in_date = models.DateField(null=True, blank=True)
    check_out_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'students'

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.student_id}"


class Room(models.Model):
    """Room model for hostel accommodation"""
    ROOM_TYPE_CHOICES = [
        ('single', 'Single Room'),
        ('double', 'Double Room'),
        ('triple', 'Triple Room'),
    ]
    
    room_number = models.CharField(max_length=10, unique=True)
    room_type = models.CharField(max_length=10, choices=ROOM_TYPE_CHOICES)
    floor = models.IntegerField()
    capacity = models.IntegerField(default=1)
    occupied = models.IntegerField(default=0)
    price_per_month = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rooms'

    def __str__(self):
        return f"Room {self.room_number} - {self.room_type}"

    @property
    def is_full(self):
        return self.occupied >= self.capacity


class Payment(models.Model):
    """Payment model for room fees and other charges"""
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('bank_transfer', 'Bank Transfer'),
        ('credit_card', 'Credit Card'),
        ('mobile_payment', 'Mobile Payment'),
        ('cash', 'Cash'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField()
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    screenshot = models.ImageField(upload_to='payment_screenshots/', blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    reject_reason = models.TextField(blank=True, null=True)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_payments')
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payments'

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.amount} - {self.status}"


class Attendance(models.Model):
    """Attendance model for tracking student attendance with shifts"""
    SHIFT_CHOICES = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Holiday', 'Holiday'),
        ('Leave', 'Leave'),
        ('Null', 'Null'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    is_present = models.BooleanField(default=False)
    morning_shift = models.CharField(max_length=10, choices=SHIFT_CHOICES, default='Null')
    evening_shift = models.CharField(max_length=10, choices=SHIFT_CHOICES, default='Null')
    night_shift = models.CharField(max_length=10, choices=SHIFT_CHOICES, default='Null')
    summary = models.CharField(max_length=10, choices=SHIFT_CHOICES, default='Null')
    marked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='marked_attendances')
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'attendances'
        unique_together = ['student', 'date']

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.date} - {'Present' if self.is_present else 'Absent'}"

    def calculate_summary(self):
        """Calculate daily summary based on shifts"""
        morning = self.morning_shift
        evening = self.evening_shift
        night = self.night_shift
        
        # If both morning and evening are present, summary is present
        if morning == 'Present' and evening == 'Present':
            return 'Present'
        # If both morning and evening are absent, summary is absent
        elif morning == 'Absent' and evening == 'Absent':
            return 'Absent'
        # If both morning and evening are holiday, summary is holiday
        elif morning == 'Holiday' and evening == 'Holiday':
            return 'Holiday'
        # If both morning and evening are leave, summary is leave
        elif morning == 'Leave' and evening == 'Leave':
            return 'Leave'
        # Mixed shifts - default to present if at least one is present
        elif morning == 'Present' or evening == 'Present':
            return 'Present'
        else:
            return 'Absent'


class Penalty(models.Model):
    """Penalty model for attendance violations"""
    PENALTY_TYPE_CHOICES = [
        ('warning', 'Warning'),
        ('fine', 'Fine'),
        ('suspension', 'Suspension'),
        ('expulsion', 'Expulsion'),
        ('night_shift', 'Night Shift'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='penalties')
    penalty_type = models.CharField(max_length=20, choices=PENALTY_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reason = models.TextField()
    issued_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='issued_penalties')
    issued_date = models.DateTimeField(auto_now_add=True)
    is_paid = models.BooleanField(default=False)
    paid_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'penalties'

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.penalty_type} - {self.amount}"


class Meal(models.Model):
    """Meal model for mess menu management"""
    MEAL_TYPE_CHOICES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
    ]
    
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPE_CHOICES)
    date = models.DateField()
    menu = models.TextField()
    prepared_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='prepared_meals')
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'meals'
        unique_together = ['meal_type', 'date']

    def __str__(self):
        return f"{self.meal_type} - {self.date}"


class MealFeedback(models.Model):
    """Meal feedback model for student feedback on meals"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='meal_feedbacks')
    meal = models.ForeignKey(Meal, on_delete=models.CASCADE, related_name='feedbacks')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    feedback_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'meal_feedbacks'
        unique_together = ['student', 'meal']

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.meal.meal_type} - {self.rating}"


class Complaint(models.Model):
    """Complaint model for student complaints and feedback"""
    COMPLAINT_TYPE_CHOICES = [
        ('maintenance', 'Maintenance'),
        ('food', 'Food'),
        ('noise', 'Noise'),
        ('security', 'Security'),
        ('other', 'Other'),
    ]
    
    COMPLAINT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('rejected', 'Rejected'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='complaints')
    complaint_type = models.CharField(max_length=20, choices=COMPLAINT_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=COMPLAINT_STATUS_CHOICES, default='pending')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_complaints')
    resolution = models.TextField(blank=True, null=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'complaints'

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.title} - {self.status}"


class StayExtensionRequest(models.Model):
    """Stay extension request model for students wanting to extend their stay"""
    REQUEST_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='stay_extension_requests')
    current_checkout_date = models.DateField()
    requested_checkout_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=REQUEST_STATUS_CHOICES, default='pending')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_extensions')
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'stay_extension_requests'

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.current_checkout_date} to {self.requested_checkout_date}"


class Notification(models.Model):
    """Notification model for system notifications"""
    NOTIFICATION_TYPE_CHOICES = [
        ('payment', 'Payment'),
        ('attendance', 'Attendance'),
        ('complaint', 'Complaint'),
        ('meal', 'Meal'),
        ('general', 'General'),
    ]
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    related_object_id = models.IntegerField(null=True, blank=True)
    related_object_type = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.recipient.username} - {self.title}"


class Staff(models.Model):
    """Staff model for hostel staff management"""
    STAFF_TYPE_CHOICES = [
        ('warden', 'Warden'),
        ('deputy_rt', 'Deputy RT'),
        ('mess_staff', 'Mess Staff'),
        ('maintenance', 'Maintenance'),
        ('security', 'Security'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    staff_id = models.CharField(max_length=20, unique=True)
    staff_type = models.CharField(max_length=20, choices=STAFF_TYPE_CHOICES)
    department = models.CharField(max_length=100)
    hire_date = models.DateField()
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'staff'

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.staff_type}"


class FoodShortage(models.Model):
    """Food shortage model for mess management"""
    SHORTAGE_STATUS_CHOICES = [
        ('reported', 'Reported'),
        ('resolved', 'Resolved'),
        ('cancelled', 'Cancelled'),
    ]
    
    meal = models.ForeignKey(Meal, on_delete=models.CASCADE, related_name='food_shortages')
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_shortages')
    shortage_type = models.CharField(max_length=100)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=SHORTAGE_STATUS_CHOICES, default='reported')
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_shortages')
    resolution_notes = models.TextField(blank=True, null=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'food_shortages'

    def __str__(self):
        return f"{self.meal.meal_type} - {self.shortage_type} - {self.status}"


class SystemSettings(models.Model):
    """System settings model for hostel configuration"""
    hostel_name = models.CharField(max_length=200, default='Hostify Hostel')
    hostel_address = models.TextField(default='Hostel Address')
    contact_number = models.CharField(max_length=20, default='+92-300-0000000')
    email = models.EmailField(default='admin@hostify.com')
    website = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'system_settings'
        verbose_name_plural = 'System Settings'

    def __str__(self):
        return f"System Settings - {self.hostel_name}"

    @classmethod
    def get_settings(cls):
        """Get or create system settings"""
        settings, created = cls.objects.get_or_create(
            id=1,
            defaults={
                'hostel_name': 'Hostify Hostel',
                'hostel_address': 'Hostel Address',
                'contact_number': '+92-300-0000000',
                'email': 'admin@hostify.com'
            }
        )
        return settings
