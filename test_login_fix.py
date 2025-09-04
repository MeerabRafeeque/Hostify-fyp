import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hostify.settings')
django.setup()

from hostel_management.serializers import LoginSerializer

print("="*60)
print("TESTING LOGIN FIX")
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
    
    serializer = LoginSerializer(data=cred)
    
    if serializer.is_valid():
        print(f"✓ Login successful!")
        user = serializer.validated_data['user']
        print(f"  User: {user.username}")
        print(f"  Role: {user.role}")
        print(f"  Email: {user.email}")
    else:
        print(f"✗ Login failed:")
        for field, errors in serializer.errors.items():
            print(f"  {field}: {errors}")

print("\n" + "="*60)
print("LOGIN SHOULD NOW WORK!")
print("="*60)
print("Try logging in with:")
print("\nADMIN:")
print("  Email: admin@hostify.com")
print("  Password: admin123")
print("  Role: admin")

# Clean up
os.remove('test_login_fix.py')
