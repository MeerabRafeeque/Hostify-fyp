import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hostify.settings')
django.setup()

from hostel_management.models import User

print("Cleaning up duplicate users...\n")

# Find and remove duplicates
emails_to_check = ['admin@hostify.com', 'warden@hostify.com', 'mess@hostify.com', 'student@hostify.com', 'student_post@hostify.com']

for email in emails_to_check:
    users = User.objects.filter(email=email)
    if users.count() > 1:
        print(f"Found {users.count()} users with email {email}")
        
        # Keep the first one, delete the rest
        first_user = users.first()
        duplicates = users.exclude(id=first_user.id)
        
        print(f"  Keeping: {first_user.username} (ID: {first_user.id})")
        for dup in duplicates:
            print(f"  Deleting: {dup.username} (ID: {dup.id})")
            dup.delete()
    else:
        print(f"✓ No duplicates for {email}")

print("\n" + "="*50)
print("FINAL USER LIST:")
print("="*50)

# Show all users
for user in User.objects.all():
    print(f"Username: {user.username}, Email: {user.email}, Role: {user.role}, Active: {user.is_active}")

# Clean up
os.remove('cleanup_duplicates.py')
