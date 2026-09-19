from django.urls import path

from .views import (
    OrderView,
    AdminDashboardView,
    AdminOrderStatusView,
    AdminOrderDetailView,
)

urlpatterns = [
    path(
        "",
        OrderView.as_view(),
        name="orders"
    ),
    path(
        "dashboard/",
        AdminDashboardView.as_view(),
        name="admin-dashboard"
    ),
    path(
        "admin/<int:pk>/status/",
        AdminOrderStatusView.as_view(),
        name="admin-order-status"
    ),
    path(
        "admin/<int:pk>/",
        AdminOrderDetailView.as_view(),
        name="admin-order-detail"
    ),
    path(
        "<int:pk>/",
        OrderView.as_view(),
        name="order-detail"
    ),
]