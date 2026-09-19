from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = [
        "product",
        "quantity",
        "price",
        "subtotal",
    ]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "user",
        "total_amount",
        "status",
        "payment_method",
        "payment_status",
        "created_at",
    ]

    list_filter = [
        "status",
        "payment_method",
        "payment_status",
        "created_at",
    ]

    search_fields = [
        "user__username",
        "user__email",
        "delivery_address",
    ]

    readonly_fields = [
        "user",
        "total_amount",
        "delivery_address",
        "created_at",
    ]

    inlines = [
        OrderItemInline,
    ]

    ordering = [
        "-created_at"
    ]