from rest_framework import serializers

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    class Meta:
        model = OrderItem

        fields = [
            "id",
            "product",
            "product_name",
            "quantity",
            "price",
            "subtotal",
        ]


class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(
        many=True,
        read_only=True
    )

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    class Meta:
        model = Order

        fields = [
            "id",
            "user",
            "username",
            "items",
            "total_amount",
            "delivery_address",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "user",
            "username",
            "items",
            "total_amount",
            "status",
            "created_at",
            "updated_at",
        ]