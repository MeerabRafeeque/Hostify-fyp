"""
Centralized SQL queries for the hostel management system
All SQL queries should be added here and called from other files
"""

from django.db import connection
from django.db.models import Count, Q, Sum, Avg
from datetime import date, timedelta
from .models import (
    Student, Room, Payment, Attendance, Penalty, Meal, 
    Complaint, StayExtensionRequest, Notification, Staff
)


def get_dashboard_stats():
    """Get comprehensive dashboard statistics"""
    today = date.today()
    
    stats = {
        'total_students': Student.objects.filter(is_active=True).count(),
        'total_rooms': Room.objects.count(),
        'available_rooms': Room.objects.filter(is_available=True).count(),
        'occupied_rooms': Room.objects.filter(occupied__gt=0).count(),
        'pending_payments': Payment.objects.filter(status='pending').count(),
        'pending_complaints': Complaint.objects.filter(status='pending').count(),
        'today_meals': Meal.objects.filter(date=today).count(),
        'total_staff': Staff.objects.filter(is_active=True).count(),
        'total_payments_today': Payment.objects.filter(payment_date=today).count(),
        'total_attendance_today': Attendance.objects.filter(date=today).count(),
        'present_today': Attendance.objects.filter(date=today, is_present=True).count(),
        'absent_today': Attendance.objects.filter(date=today, is_present=False).count(),
    }
    
    return stats


def get_student_room_allocation_stats():
    """Get room allocation statistics"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                r.room_type,
                COUNT(r.id) as total_rooms,
                SUM(r.occupied) as total_occupied,
                AVG(r.price_per_month) as avg_price
            FROM rooms r
            GROUP BY r.room_type
        """)
        return cursor.fetchall()


def get_payment_summary_by_month():
    """Get payment summary grouped by month"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                strftime('%Y-%m', payment_date) as month,
                COUNT(*) as total_payments,
                SUM(amount) as total_amount,
                COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified_payments,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments
            FROM payments
            WHERE payment_date >= date('now', '-6 months')
            GROUP BY strftime('%Y-%m', payment_date)
            ORDER BY month DESC
        """)
        return cursor.fetchall()


def get_attendance_summary_by_month():
    """Get attendance summary grouped by month"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                strftime('%Y-%m', date) as month,
                COUNT(*) as total_records,
                COUNT(CASE WHEN is_present = 1 THEN 1 END) as present_count,
                COUNT(CASE WHEN is_present = 0 THEN 1 END) as absent_count,
                ROUND(COUNT(CASE WHEN is_present = 1 THEN 1 END) * 100.0 / COUNT(*), 2) as attendance_percentage
            FROM attendances
            WHERE date >= date('now', '-6 months')
            GROUP BY strftime('%Y-%m', date)
            ORDER BY month DESC
        """)
        return cursor.fetchall()


def get_student_attendance_report(student_id, start_date, end_date):
    """Get detailed attendance report for a specific student"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                a.date,
                a.is_present,
                a.remarks,
                u.first_name || ' ' || u.last_name as marked_by_name
            FROM attendances a
            JOIN students s ON a.student_id = s.id
            LEFT JOIN users u ON a.marked_by_id = u.id
            WHERE s.student_id = %s 
            AND a.date BETWEEN %s AND %s
            ORDER BY a.date DESC
        """, [student_id, start_date, end_date])
        return cursor.fetchall()


def get_room_occupancy_report():
    """Get detailed room occupancy report"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                r.room_number,
                r.room_type,
                r.floor,
                r.capacity,
                r.occupied,
                r.price_per_month,
                r.is_available,
                GROUP_CONCAT(s.student_id) as student_ids,
                GROUP_CONCAT(u.first_name || ' ' || u.last_name) as student_names
            FROM rooms r
            LEFT JOIN students s ON r.id = s.room_id
            LEFT JOIN users u ON s.user_id = u.id
            GROUP BY r.id
            ORDER BY r.room_number
        """)
        return cursor.fetchall()


def get_complaint_summary_by_type():
    """Get complaint summary grouped by type"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                complaint_type,
                COUNT(*) as total_complaints,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count
            FROM complaints
            WHERE created_at >= date('now', '-3 months')
            GROUP BY complaint_type
            ORDER BY total_complaints DESC
        """)
        return cursor.fetchall()


def get_meal_feedback_summary():
    """Get meal feedback summary"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                m.meal_type,
                m.date,
                AVG(mf.rating) as avg_rating,
                COUNT(mf.id) as feedback_count,
                m.menu
            FROM meals m
            LEFT JOIN meal_feedbacks mf ON m.id = mf.meal_id
            WHERE m.date >= date('now', '-1 month')
            GROUP BY m.id
            ORDER BY m.date DESC, m.meal_type
        """)
        return cursor.fetchall()


def get_student_payment_history(student_id):
    """Get payment history for a specific student"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                p.payment_date,
                p.amount,
                p.payment_method,
                p.status,
                p.transaction_id,
                u.first_name || ' ' || u.last_name as verified_by_name,
                p.verified_at
            FROM payments p
            JOIN students s ON p.student_id = s.id
            LEFT JOIN users u ON p.verified_by_id = u.id
            WHERE s.student_id = %s
            ORDER BY p.payment_date DESC
        """, [student_id])
        return cursor.fetchall()


def get_staff_performance_summary():
    """Get staff performance summary"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                s.staff_id,
                u.first_name || ' ' || u.last_name as staff_name,
                s.staff_type,
                s.department,
                COUNT(DISTINCT c.id) as complaints_handled,
                COUNT(DISTINCT p.id) as payments_verified,
                COUNT(DISTINCT a.id) as attendance_marked
            FROM staff s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN complaints c ON s.user_id = c.assigned_to_id
            LEFT JOIN payments p ON s.user_id = p.verified_by_id
            LEFT JOIN attendances a ON s.user_id = a.marked_by_id
            WHERE s.is_active = 1
            GROUP BY s.id
            ORDER BY complaints_handled DESC, payments_verified DESC
        """)
        return cursor.fetchall()


def get_penalty_summary():
    """Get penalty summary"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                penalty_type,
                COUNT(*) as total_penalties,
                SUM(amount) as total_amount,
                COUNT(CASE WHEN is_paid = 1 THEN 1 END) as paid_count,
                COUNT(CASE WHEN is_paid = 0 THEN 1 END) as unpaid_count,
                SUM(CASE WHEN is_paid = 1 THEN amount ELSE 0 END) as paid_amount
            FROM penalties
            WHERE issued_date >= date('now', '-6 months')
            GROUP BY penalty_type
            ORDER BY total_amount DESC
        """)
        return cursor.fetchall()


def get_stay_extension_requests_summary():
    """Get stay extension requests summary"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                status,
                COUNT(*) as total_requests,
                AVG(JULIANDAY(requested_checkout_date) - JULIANDAY(current_checkout_date)) as avg_extension_days
            FROM stay_extension_requests
            WHERE created_at >= date('now', '-3 months')
            GROUP BY status
            ORDER BY total_requests DESC
        """)
        return cursor.fetchall()


def get_notification_summary():
    """Get notification summary"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                notification_type,
                COUNT(*) as total_notifications,
                COUNT(CASE WHEN is_read = 0 THEN 1 END) as unread_count,
                COUNT(CASE WHEN is_read = 1 THEN 1 END) as read_count
            FROM notifications
            WHERE created_at >= date('now', '-1 month')
            GROUP BY notification_type
            ORDER BY total_notifications DESC
        """)
        return cursor.fetchall()


def get_student_search_results(search_term):
    """Search students by various criteria"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                s.student_id,
                u.first_name || ' ' || u.last_name as student_name,
                s.department,
                s.year_of_study,
                r.room_number,
                u.phone,
                s.parent_phone
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN rooms r ON s.room_id = r.id
            WHERE s.is_active = 1
            AND (
                s.student_id LIKE %s 
                OR u.first_name LIKE %s 
                OR u.last_name LIKE %s 
                OR s.department LIKE %s
                OR u.phone LIKE %s
            )
            ORDER BY s.student_id
        """, [f'%{search_term}%'] * 5)
        return cursor.fetchall()


def get_room_search_results(search_term):
    """Search rooms by various criteria"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                r.room_number,
                r.room_type,
                r.floor,
                r.capacity,
                r.occupied,
                r.price_per_month,
                r.is_available,
                GROUP_CONCAT(s.student_id) as student_ids
            FROM rooms r
            LEFT JOIN students s ON r.id = s.room_id
            WHERE (
                r.room_number LIKE %s 
                OR r.room_type LIKE %s
            )
            GROUP BY r.id
            ORDER BY r.room_number
        """, [f'%{search_term}%', f'%{search_term}%'])
        return cursor.fetchall()


def get_payment_verification_queue():
    """Get pending payments for verification"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                p.id,
                s.student_id,
                u.first_name || ' ' || u.last_name as student_name,
                p.amount,
                p.payment_date,
                p.payment_method,
                p.transaction_id,
                p.description
            FROM payments p
            JOIN students s ON p.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE p.status = 'pending'
            ORDER BY p.payment_date DESC
        """)
        return cursor.fetchall()


def get_attendance_marking_queue(date_filter):
    """Get students for attendance marking"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                s.student_id,
                u.first_name || ' ' || u.last_name as student_name,
                s.department,
                r.room_number,
                a.is_present,
                a.remarks
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN rooms r ON s.room_id = r.id
            LEFT JOIN attendances a ON s.id = a.student_id AND a.date = %s
            WHERE s.is_active = 1
            ORDER BY s.student_id
        """, [date_filter])
        return cursor.fetchall()
