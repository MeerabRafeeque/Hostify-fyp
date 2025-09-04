#!/usr/bin/env python
"""
Setup script for Hostify Django project
This script helps initialize the project and create initial data
"""

import os
import sys
import django
from django.core.management import execute_from_command_line
from django.contrib.auth import get_user_model

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hostify.settings')

# Setup Django
django.setup()

from hostel_management.models import User, Student, Room, Staff
from hostel_management.dashboard_queries import get_dashboard_stats

def create_superuser():
    """Create a superuser for admin access"""
    User = get_user_model()
    
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser(
            username='admin',
            email='admin@hostify.com',
            password='admin123',
            first_name='Admin',
            last_name='User',
            role='admin'
        )
        print("✅ Superuser created: admin/admin123")
    else:
        print("ℹ️  Superuser already exists")

def create_sample_data():
    """Create sample data for testing"""
    User = get_user_model()
    
    # Create sample users
    sample_users = [
        {
            'username': 'warden',
            'email': 'warden@hostify.com',
            'password': 'warden123',
            'first_name': 'John',
            'last_name': 'Warden',
            'role': 'warden'
        },
        {
            'username': 'deputy',
            'email': 'deputy@hostify.com',
            'password': 'deputy123',
            'first_name': 'Jane',
            'last_name': 'Deputy',
            'role': 'deputy_rt'
        },
        {
            'username': 'mess_staff',
            'email': 'mess@hostify.com',
            'password': 'mess123',
            'first_name': 'Mike',
            'last_name': 'Mess',
            'role': 'mess_staff'
        },
        {
            'username': 'student1',
            'email': 'student1@hostify.com',
            'password': 'student123',
            'first_name': 'Alice',
            'last_name': 'Student',
            'role': 'student'
        },
        {
            'username': 'student2',
            'email': 'student2@hostify.com',
            'password': 'student123',
            'first_name': 'Bob',
            'last_name': 'Student',
            'role': 'student'
        }
    ]
    
    for user_data in sample_users:
        if not User.objects.filter(username=user_data['username']).exists():
            user = User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                role=user_data['role']
            )
            print(f"✅ User created: {user_data['username']}/{user_data['password']}")
        else:
            print(f"ℹ️  User already exists: {user_data['username']}")
    
    # Create sample rooms
    sample_rooms = [
        {'room_number': '101', 'room_type': 'single', 'floor': 1, 'capacity': 1, 'price_per_month': 15000},
        {'room_number': '102', 'room_type': 'single', 'floor': 1, 'capacity': 1, 'price_per_month': 15000},
        {'room_number': '201', 'room_type': 'double', 'floor': 2, 'capacity': 2, 'price_per_month': 7000},
        {'room_number': '202', 'room_type': 'double', 'floor': 2, 'capacity': 2, 'price_per_month': 7000},
        {'room_number': '301', 'room_type': 'triple', 'floor': 3, 'capacity': 3, 'price_per_month': 5000},
        {'room_number': '302', 'room_type': 'triple', 'floor': 3, 'capacity': 3, 'price_per_month': 5000},
    ]
    
    for room_data in sample_rooms:
        if not Room.objects.filter(room_number=room_data['room_number']).exists():
            room = Room.objects.create(**room_data)
            print(f"✅ Room created: {room_data['room_number']}")
        else:
            print(f"ℹ️  Room already exists: {room_data['room_number']}")
    
    # Create sample students
    student1 = User.objects.get(username='student1')
    student2 = User.objects.get(username='student2')
    
    if not Student.objects.filter(user=student1).exists():
        Student.objects.create(
            user=student1,
            student_id='STU001',
            department='Computer Science',
            year_of_study=2,
            parent_name='Mr. Student',
            parent_phone='1234567890',
            emergency_contact='0987654321',
            blood_group='O+',
            room=Room.objects.get(room_number='101')
        )
        print("✅ Student profile created for student1")
    
    if not Student.objects.filter(user=student2).exists():
        Student.objects.create(
            user=student2,
            student_id='STU002',
            department='Electrical Engineering',
            year_of_study=3,
            parent_name='Mrs. Student',
            parent_phone='1122334455',
            emergency_contact='5544332211',
            blood_group='A+',
            room=Room.objects.get(room_number='201')
        )
        print("✅ Student profile created for student2")
    
    # Create sample staff
    warden_user = User.objects.get(username='warden')
    deputy_user = User.objects.get(username='deputy')
    mess_user = User.objects.get(username='mess_staff')
    
    from datetime import date
    
    if not Staff.objects.filter(user=warden_user).exists():
        Staff.objects.create(
            user=warden_user,
            staff_id='WARD001',
            staff_type='warden',
            department='Hostel Management',
            hire_date=date(2020, 1, 1),
            salary=50000
        )
        print("✅ Staff profile created for warden")
    
    if not Staff.objects.filter(user=deputy_user).exists():
        Staff.objects.create(
            user=deputy_user,
            staff_id='DEP001',
            staff_type='deputy_rt',
            department='Student Affairs',
            hire_date=date(2021, 3, 1),
            salary=40000
        )
        print("✅ Staff profile created for deputy")
    
    if not Staff.objects.filter(user=mess_user).exists():
        Staff.objects.create(
            user=mess_user,
            staff_id='MESS001',
            staff_type='mess_staff',
            department='Mess Management',
            hire_date=date(2022, 6, 1),
            salary=30000
        )
        print("✅ Staff profile created for mess staff")

def run_migrations():
    """Run Django migrations"""
    print("🔄 Running migrations...")
    execute_from_command_line(['manage.py', 'makemigrations'])
    execute_from_command_line(['manage.py', 'migrate'])
    print("✅ Migrations completed")

def collect_static():
    """Collect static files"""
    print("🔄 Collecting static files...")
    execute_from_command_line(['manage.py', 'collectstatic', '--noinput'])
    print("✅ Static files collected")

def main():
    """Main setup function"""
    print("🚀 Setting up Hostify Django project...")
    
    # Run migrations
    run_migrations()
    
    # Create superuser
    create_superuser()
    
    # Create sample data
    create_sample_data()
    
    # Collect static files
    collect_static()
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Login Credentials:")
    print("Admin: admin/admin123")
    print("Warden: warden/warden123")
    print("Deputy: deputy/deputy123")
    print("Mess Staff: mess_staff/mess123")
    print("Student 1: student1/student123")
    print("Student 2: student2/student123")
    print("\n🚀 To start the server, run: python manage.py runserver")

if __name__ == '__main__':
    main()
