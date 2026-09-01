from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),

    path(
        "api/",
        include("products.urls")
    ),

    path(
        "api/cart/",
        include("cart.urls")
    ),

    path(
        "api/accounts/",
        include("accounts.urls")
    ),

    path(
        "api/orders/",
        include("orders.urls")
    ),
]