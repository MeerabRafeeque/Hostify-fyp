import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hostify.settings')
django.setup()

from hostel_management.models import User
from django.contrib.auth import authenticate
from hostel_management.serializers import LoginSerializer

print("="*60)
print("LOGIN DEBUGGING")
print("="*60)

# Test credentials
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

for cred in test_credentials:
    print(f"\nTesting: {cred['username']}")
    print("-" * 40)
    
    # Check if user exists
    try:
        user = User.objects.get(email=cred['username'])
        print(f"✓ User found: {user.username}")
        print(f"  Email: {user.email}")
        print(f"  Role: {user.role}")
        print(f"  Active: {user.is_active}")
        print(f"  Password set: {user.has_usable_password()}")
        
        # Test password directly
        if user.check_password(cred['password']):
            print(f"✓ Password is correct")
        else:
            print(f"✗ Password is incorrect")
            
        # Test authentication
        auth_user = authenticate(username=user.username, password=cred['password'])
        if auth_user:
            print(f"✓ Authentication successful")
        else:
            print(f"✗ Authentication failed")
            
        # Test serializer
        serializer = LoginSerializer(data={
            'username': cred['username'],
            'password': cred['password'],
            'role': cred['role']
        })
        
        if serializer.is_valid():
            print(f"✓ Serializer validation passed")
            validated_user = serializer.validated_data['user']
            print(f"  Validated user: {validated_user.username}")
        else:
            print(f"✗ Serializer validation failed:")
            for field, errors in serializer.errors.items():
                print(f"  {field}: {errors}")
                
    except User.DoesNotExist:
        print(f"✗ User not found")
    except Exception as e:
        print(f"✗ Error: {str(e)}")

print("\n" + "="*60)
print("CHECKING USERNAMES vs EMAILS")
print("="*60)

# Check if we should use username or email for login
users = User.objects.filter(username__in=['admin', 'warden', 'mess_staff', 'student'])
for user in users:
    print(f"Username: '{user.username}' | Email: '{user.email}' | Role: '{user.role}'")

print("\n" + "="*60)
print("RECOMMENDED LOGIN CREDENTIALS")
print("="*60)

print("Try these credentials:")
print("\nADMIN:")
print("  Email: admin@hostify.com")
print("  Password: admin123")
print("  Role: admin")
print("\nWARDEN:")
print("  Email: warden@hostify.com")
print("  Password: warden123")
print("  Role: warden")
print("\nMESS STAFF:")
print("  Email: mess@hostify.com")
print("  Password: mess123")
print("  Role: mess_staff")

# Clean up
os.remove('debug_login.py')
