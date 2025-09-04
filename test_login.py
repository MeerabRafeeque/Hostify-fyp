import os
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hostify.settings')
django.setup()

from hostel_management.models import User

# Test login credentials
test_credentials = [
    {
        'username': 'admin@hostify.com',
        'password': 'admin123',
        'role': 'admin'
    },
    {
        'username': 'warden@hostify.com',
        'password': 'warden123',
        'role': 'warden'
    },
    {
        'username': 'mess@hostify.com',
        'password': 'mess123',
        'role': 'mess_staff'
    }
]

print("Testing login functionality...\n")

for cred in test_credentials:
    print(f"Testing login for {cred['username']}...")
    
    # Check if user exists in database
    try:
        user = User.objects.get(email=cred['username'])
        print(f"  ✓ User exists in database")
        print(f"  ✓ Username: {user.username}")
        print(f"  ✓ Role: {user.role}")
        print(f"  ✓ Active: {user.is_active}")
        
        # Test password
        if user.check_password(cred['password']):
            print(f"  ✓ Password is correct")
        else:
            print(f"  ✗ Password is incorrect")
            
    except User.DoesNotExist:
        print(f"  ✗ User not found in database")
    
    print()

print("="*50)
print("LOGIN INSTRUCTIONS:")
print("="*50)
print("1. Go to: http://127.0.0.1:8000/student-public.html/login-all.html")
print("2. Use these credentials:")
print()
print("ADMIN:")
print("  Email: admin@hostify.com")
print("  Password: admin123")
print("  Role: admin")
print()
print("WARDEN:")
print("  Email: warden@hostify.com")
print("  Password: warden123")
print("  Role: warden")
print()
print("MESS STAFF:")
print("  Email: mess@hostify.com")
print("  Password: mess123")
print("  Role: mess_staff")
print()
print("STUDENT:")
print("  Email: student@hostify.com")
print("  Password: student123")
print("  Role: student")

# Clean up
os.remove('test_login.py')
