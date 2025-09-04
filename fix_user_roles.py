import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hostify.settings')
django.setup()

from hostel_management.models import User

# Fix user roles to match model choices
users_to_fix = [
    {
        'username': 'mess',
        'correct_role': 'mess_staff'
    }
]

print("Fixing user roles...\n")

for user_data in users_to_fix:
    username = user_data['username']
    correct_role = user_data['correct_role']
    
    try:
        user = User.objects.get(username=username)
        if user.role != correct_role:
            print(f"Fixing {username}: {user.role} -> {correct_role}")
            user.role = correct_role
            user.save()
        else:
            print(f"✓ {username} already has correct role: {user.role}")
    except User.DoesNotExist:
        print(f"✗ User {username} not found")

print("\n" + "="*50)
print("UPDATED LOGIN CREDENTIALS:")
print("="*50)

# Show all users with their roles
users = User.objects.filter(username__in=['admin', 'warden', 'mess', 'student', 'student_post'])
for user in users:
    print(f"\n{user.role.upper()}:")
    print(f"  Email: {user.email}")
    print(f"  Password: admin123" if user.username == 'admin' else f"  Password: {user.username}123")
    print(f"  Role: {user.role}")

# Clean up
os.remove('fix_user_roles.py')
