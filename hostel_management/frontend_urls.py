from django.urls import path
from django.views.generic import TemplateView
from django.views.static import serve
from django.conf import settings
import os

def serve_html(request, html_file):
    """Serve HTML files from the static directory"""
    file_path = os.path.join(settings.BASE_DIR, html_file)
    if os.path.exists(file_path):
        return serve(request, html_file, document_root=settings.BASE_DIR)
    else:
        # Return 404 if file doesn't exist
        from django.http import Http404
        raise Http404("File not found")

urlpatterns = [
    # Main pages
    path('', lambda request: serve_html(request, 'home.html'), name='home'),
    
    # Student public pages
    path('student-public.html/login-all.html', lambda request: serve_html(request, 'student-public.html/login-all.html'), name='login'),
    path('student-public.html/register.html', lambda request: serve_html(request, 'student-public.html/register.html'), name='register'),
    path('student-public.html/forgot-password.html', lambda request: serve_html(request, 'student-public.html/forgot-password.html'), name='forgot_password'),
    path('student-public.html/reset-password.html', lambda request: serve_html(request, 'student-public.html/reset-password.html'), name='reset_password'),
    
    # Admin dashboard pages
    path('admin-dashboard/dashboard.html', lambda request: serve_html(request, 'admin-dashboard/dashboard.html'), name='admin_dashboard'),
    path('admin-dashboard/studentManagement.html', lambda request: serve_html(request, 'admin-dashboard/studentManagement.html'), name='admin_student_management'),
    path('admin-dashboard/paymentVerification.html', lambda request: serve_html(request, 'admin-dashboard/paymentVerification.html'), name='admin_payment_verification'),
    path('admin-dashboard/roomManagement.html', lambda request: serve_html(request, 'admin-dashboard/roomManagement.html'), name='admin_room_management'),
    path('admin-dashboard/staffManagement.html', lambda request: serve_html(request, 'admin-dashboard/staffManagement.html'), name='admin_staff_management'),
    path('admin-dashboard/attendancePenalty.html', lambda request: serve_html(request, 'admin-dashboard/attendancePenalty.html'), name='admin_attendance_penalty'),
    path('admin-dashboard/complaintFeedback.html', lambda request: serve_html(request, 'admin-dashboard/complaintFeedback.html'), name='admin_complaint_feedback'),
    path('admin-dashboard/mealFeed.html', lambda request: serve_html(request, 'admin-dashboard/mealFeed.html'), name='admin_meal_feed'),
    path('admin-dashboard/stayExtensionRequests.html', lambda request: serve_html(request, 'admin-dashboard/stayExtensionRequests.html'), name='admin_stay_extension_requests'),
    path('admin-dashboard/notification.html', lambda request: serve_html(request, 'admin-dashboard/notification.html'), name='admin_notification'),
    path('admin-dashboard/profile.html', lambda request: serve_html(request, 'admin-dashboard/profile.html'), name='admin_profile'),
    path('admin-dashboard/settings.html', lambda request: serve_html(request, 'admin-dashboard/settings.html'), name='admin_settings'),
    
    # Student dashboard pre pages
    path('student-dashboard-pre/dashboard-pre.html', lambda request: serve_html(request, 'student-dashboard-pre/dashboard-pre.html'), name='student_dashboard_pre'),
    path('student-dashboard-pre/apply-room.html', lambda request: serve_html(request, 'student-dashboard-pre/apply-room.html'), name='student_apply_room'),
    path('student-dashboard-pre/notifications-pre.html', lambda request: serve_html(request, 'student-dashboard-pre/notifications-pre.html'), name='student_notifications_pre'),
    
    # Student dashboard post pages
    path('student-dashoard-post/dashboard-post.html', lambda request: serve_html(request, 'student-dashoard-post/dashboard-post.html'), name='student_dashboard_post'),
    path('student-dashoard-post/notifications-post.html', lambda request: serve_html(request, 'student-dashoard-post/notifications-post.html'), name='student_notifications_post'),
    path('student-dashoard-post/stay-extension-request.html', lambda request: serve_html(request, 'student-dashoard-post/stay-extension-request.html'), name='student_stay_extension_request'),
    path('student-dashoard-post/submit-complaint.html', lambda request: serve_html(request, 'student-dashoard-post/submit-complaint.html'), name='student_submit_complaint'),
    path('student-dashoard-post/submit-meal-feed.html', lambda request: serve_html(request, 'student-dashoard-post/submit-meal-feed.html'), name='student_submit_meal_feed'),
    path('student-dashoard-post/view-attendance.html', lambda request: serve_html(request, 'student-dashoard-post/view-attendance.html'), name='student_view_attendance'),
    
    # Warden dashboard pages
    path('warden-dashboard/warden.html', lambda request: serve_html(request, 'warden-dashboard/warden.html'), name='warden_dashboard'),
    path('warden-dashboard/roomAllocation.html', lambda request: serve_html(request, 'warden-dashboard/roomAllocation.html'), name='warden_room_allocation'),
    path('warden-dashboard/studentAttendance.html', lambda request: serve_html(request, 'warden-dashboard/studentAttendance.html'), name='warden_student_attendance'),
    path('warden-dashboard/deputyAttendance.html', lambda request: serve_html(request, 'warden-dashboard/deputyAttendance.html'), name='warden_deputy_attendance'),
    path('warden-dashboard/studentComplaintsFeedback.html', lambda request: serve_html(request, 'warden-dashboard/studentComplaintsFeedback.html'), name='warden_student_complaints_feedback'),
    path('warden-dashboard/warden-notification.html', lambda request: serve_html(request, 'warden-dashboard/warden-notification.html'), name='warden_notification'),
    
    # Deputy dashboard pages
    path('deputy-dashboard/deputy-dashboard.html', lambda request: serve_html(request, 'deputy-dashboard/deputy-dashboard.html'), name='deputy_dashboard'),
    path('deputy-dashboard/mark-std-att.html', lambda request: serve_html(request, 'deputy-dashboard/mark-std-att.html'), name='deputy_mark_attendance'),
    path('deputy-dashboard/weekly-meal.html', lambda request: serve_html(request, 'deputy-dashboard/weekly-meal.html'), name='deputy_weekly_meal'),
    path('deputy-dashboard/deputy-notification.html', lambda request: serve_html(request, 'deputy-dashboard/deputy-notification.html'), name='deputy_notification'),
    
    # Mess dashboard pages
    path('mess-dashboard/mess-dashboard.html', lambda request: serve_html(request, 'mess-dashboard/mess-dashboard.html'), name='mess_dashboard'),
    path('mess-dashboard/meal-plan.html', lambda request: serve_html(request, 'mess-dashboard/meal-plan.html'), name='mess_meal_plan'),
    path('mess-dashboard/meal-feedback.html', lambda request: serve_html(request, 'mess-dashboard/meal-feedback.html'), name='mess_meal_feedback'),
    path('mess-dashboard/food-shortage.html', lambda request: serve_html(request, 'mess-dashboard/food-shortage.html'), name='mess_food_shortage'),
    path('mess-dashboard/mess-notification.html', lambda request: serve_html(request, 'mess-dashboard/mess-notification.html'), name='mess_notification'),
]
