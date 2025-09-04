from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'students', views.StudentViewSet)
router.register(r'rooms', views.RoomViewSet)
router.register(r'payments', views.PaymentViewSet)
router.register(r'attendance', views.AttendanceViewSet)
router.register(r'penalties', views.PenaltyViewSet)
router.register(r'meals', views.MealViewSet)
router.register(r'meal-feedback', views.MealFeedbackViewSet)
router.register(r'complaints', views.ComplaintViewSet)
router.register(r'stay-extension-requests', views.StayExtensionRequestViewSet)
router.register(r'notifications', views.NotificationViewSet)
router.register(r'staff', views.StaffViewSet)
router.register(r'food-shortages', views.FoodShortageViewSet)
router.register(r'system-settings', views.SystemSettingsViewSet)
router.register(r'deputy-dashboard', views.DeputyDashboardViewSet, basename='deputy-dashboard')
router.register(r'room-applications', views.RoomApplicationViewSet, basename='room-applications')

# The API URLs are now determined automatically by the router
urlpatterns = [
    # Auth URLs should come before router URLs to avoid conflicts
    path('auth/', include([
        path('register/', views.AuthViewSet.as_view({'post': 'register'}), name='register'),
        path('login/', views.AuthViewSet.as_view({'post': 'login'}), name='login'),
        path('logout/', views.AuthViewSet.as_view({'post': 'logout'}), name='logout'),
    ])),
    # Dashboard URLs
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    path('deputy-dashboard/', views.DeputyDashboardView.as_view(), name='deputy-dashboard'),
    path('mess-dashboard/', views.MessDashboardView.as_view(), name='mess-dashboard'),
    path('student-pre-dashboard/', views.StudentPreDashboardView.as_view(), name='student-pre-dashboard'),
    path('student-post-dashboard/', views.StudentPostDashboardView.as_view(), name='student-post-dashboard'),
    path('warden-dashboard/', views.WardenDashboardView.as_view(), name='warden-dashboard'),
    # Router URLs should come last
    path('', include(router.urls)),
]
