# Hostify - Hostel Management System

A comprehensive hostel management system built with Django and modern web technologies. This system provides role-based access for students, administrators, wardens, deputy RTs, and mess staff to manage various aspects of hostel operations.

## Features

### 🏠 Core Features
- **User Management**: Role-based authentication and authorization
- **Room Management**: Room allocation, availability tracking, and room applications
- **Payment System**: Payment verification, tracking, and management
- **Attendance Tracking**: Student attendance monitoring and reporting
- **Complaint Management**: Student complaints and feedback system
- **Meal Management**: Mess menu planning and feedback collection
- **Stay Extension**: Request and approval system for extended stays
- **Notification System**: Real-time notifications for all users

### 👥 Role-Based Access
- **Students**: Room applications, payment submission, attendance viewing, complaint submission
- **Admin**: Complete system management, user oversight, payment verification
- **Warden**: Room allocation, student management, attendance oversight
- **Deputy RT**: Attendance marking, student support, meal coordination
- **Mess Staff**: Meal planning, food shortage reporting, feedback management

## Technology Stack

- **Backend**: Django 4.2.7, Django REST Framework
- **Database**: SQLite (production-ready for PostgreSQL/MySQL)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Authentication**: Django Session Authentication
- **File Handling**: Django File Storage for images and documents

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd hostify
```

### Step 2: Create Virtual Environment
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Run Setup Script
```bash
python setup.py
```

This script will:
- Run Django migrations
- Create a superuser account
- Create sample data for testing
- Collect static files

### Step 5: Start the Development Server
```bash
python manage.py runserver
```

The application will be available at `http://127.0.0.1:8000/`

## Default Login Credentials

After running the setup script, you can use these credentials:

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| Admin | admin | admin123 | Full system access |
| Warden | warden | warden123 | Hostel management |
| Deputy RT | deputy | deputy123 | Student affairs |
| Mess Staff | mess_staff | mess123 | Mess management |
| Student 1 | student1 | student123 | Student access |
| Student 2 | student2 | student123 | Student access |

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout

### Core Resources
- `GET /api/dashboard/` - Dashboard statistics
- `GET/POST /api/users/` - User management
- `GET/POST /api/students/` - Student management
- `GET/POST /api/rooms/` - Room management
- `GET/POST /api/payments/` - Payment management
- `GET/POST /api/attendance/` - Attendance management
- `GET/POST /api/complaints/` - Complaint management
- `GET/POST /api/meals/` - Meal management
- `GET/POST /api/notifications/` - Notification system

## Database Models

### Core Models
- **User**: Custom user model with role-based authentication
- **Student**: Student profiles with academic and personal information
- **Room**: Room information and availability tracking
- **Payment**: Payment records and verification status
- **Attendance**: Student attendance tracking
- **Complaint**: Student complaints and resolution tracking
- **Meal**: Mess menu and meal planning
- **Notification**: System-wide notification system

### Supporting Models
- **Staff**: Staff member profiles and roles
- **Penalty**: Attendance violation penalties
- **MealFeedback**: Student feedback on meals
- **StayExtensionRequest**: Room extension requests
- **FoodShortage**: Mess food shortage reporting

## Key Features Implementation

### 1. Role-Based Access Control
The system implements comprehensive role-based access control where each user type has specific permissions and access to different parts of the system.

### 2. Real-time Notifications
Notifications are automatically generated for various events like payment verification, complaint assignments, and stay extension approvals.

### 3. Payment Verification System
Admins can verify student payments with support for multiple payment methods and screenshot uploads.

### 4. Attendance Management
Deputy RTs can mark attendance for multiple students at once with bulk operations support.

### 5. Room Allocation System
Students can apply for rooms, and wardens can allocate rooms based on availability and student preferences.

## Development Guidelines

### Code Organization
- All SQL queries are centralized in `dashboard_queries.py`
- API endpoints follow RESTful conventions
- Frontend JavaScript files are organized by functionality
- Models include comprehensive validation and business logic

### Security Features
- CSRF protection enabled
- Session-based authentication
- Input validation and sanitization
- Role-based permission checks

### Error Handling
- Comprehensive error handling in API endpoints
- User-friendly error messages
- Proper HTTP status codes
- Logging for debugging

## Deployment

### Production Setup
1. Update `settings.py` for production environment
2. Set `DEBUG = False`
3. Configure database (PostgreSQL recommended)
4. Set up static file serving
5. Configure environment variables
6. Set up SSL certificate

### Environment Variables
```bash
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=postgresql://user:password@localhost/dbname
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.

## Changelog

### Version 1.0.0
- Initial release
- Complete hostel management system
- Role-based access control
- Payment verification system
- Attendance tracking
- Complaint management
- Meal management
- Notification system
