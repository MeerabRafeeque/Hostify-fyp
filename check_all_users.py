import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hostify.settings')
django.setup()

from hostel_management.models import User

# Define required users
required_users = [
    {
        'username': 'admin',
        'email': 'admin@hostify.com',
        'password': 'admin123',
        'first_name': 'Admin',
        'last_name': 'User',
        'role': 'admin'
    },
    {
        'username': 'warden',
        'email': 'warden@hostify.com',
        'password': 'warden123',
        'first_name': 'Warden',
        'last_name': 'User',
        'role': 'warden'
    },
    {
        'username': 'mess',
        'email': 'mess@hostify.com',
        'password': 'mess123',
        'first_name': 'Mess',
        'last_name': 'Staff',
        'role': 'mess'
    },
    {
        'username': 'student',
        'email': 'student@hostify.com',
        'password': 'student123',
        'first_name': 'Student',
        'last_name': 'User',
        'role': 'student'
    },
    {
        'username': 'student_post',
        'email': 'student_post@hostify.com',
        'password': 'student123',
        'first_name': 'Student',
        'last_name': 'Post',
        'role': 'student'
    }
]

print("Checking and creating required users...\n")

for user_data in required_users:
    username = user_data['username']
    email = user_data['email']
    
    # Check if user exists
    existing_user = User.objects.filter(username=username).first()
    
    if existing_user:
        print(f"✓ {username} exists:")
        print(f"  Email: {existing_user.email}")
        print(f"  Role: {existing_user.role}")
        print(f"  Active: {existing_user.is_active}")
        
        # Update email if different
        if existing_user.email != email:
            existing_user.email = email
            existing_user.save()
            print(f"  Updated email to: {email}")
    else:
        print(f"✗ {username} not found. Creating...")
        
        # Create user
        new_user = User.objects.create_user(
            username=username,
            email=email,
            password=user_data['password'],
            first_name=user_data['first_name'],
            last_name=user_data['last_name'],
            role=user_data['role'],
            is_active=True
        )
        print(f"  ✓ Created {username} with email: {email}")

print("\n" + "="*50)
print("LOGIN CREDENTIALS:")
print("="*50)

for user_data in required_users:
    print(f"\n{user_data['role'].upper()}:")
    print(f"  Email: {user_data['email']}")
    print(f"  Password: {user_data['password']}")
    print(f"  Role: {user_data['role']}")

# Clean up
os.remove('check_admin_user.py')
os.remove('check_all_users.py')
