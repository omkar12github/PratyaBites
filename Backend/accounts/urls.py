from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    LoginView,
    ProfileView,
    ChangePasswordView,
    AddressView,
    AddressDetailView,
    AdminCustomerView,
)


urlpatterns = [
    path(
        "register/",
        RegisterView.as_view(),
        name="register"
    ),
    path(
        "login/",
        LoginView.as_view(),
        name="login"
    ),
    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh"
    ),
    path(
        "profile/",
        ProfileView.as_view(),
        name="profile"
    ),
    path(
        "change-password/",
        ChangePasswordView.as_view(),
        name="change-password"
    ),
    path(
        "addresses/",
        AddressView.as_view(),
        name="addresses"
    ),
    path(
        "addresses/<int:pk>/",
        AddressDetailView.as_view(),
        name="address-detail"
    ),
    path(
        "admin/customers/",
        AdminCustomerView.as_view(),
        name="admin-customers"
    ),
]