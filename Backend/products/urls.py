from django.urls import path

from .views import (
    CategoryListView,
    ProductListView,
    AdminProductView,
    AdminProductDetailView,
    AdminCategoryView,
    AdminCategoryDetailView,
)

urlpatterns = [
    path(
        "categories/",
        CategoryListView.as_view(),
        name="category-list"
    ),
    path(
        "products/",
        ProductListView.as_view(),
        name="product-list"
    ),
    path(
        "admin/products/",
        AdminProductView.as_view(),
        name="admin-product-list"
    ),
    path(
        "admin/products/<int:pk>/",
        AdminProductDetailView.as_view(),
        name="admin-product-detail"
    ),
    path(
        "admin/categories/",
        AdminCategoryView.as_view(),
        name="admin-category-list"
    ),
    path(
        "admin/categories/<int:pk>/",
        AdminCategoryDetailView.as_view(),
        name="admin-category-detail"
    ),
]