from django.contrib.auth import get_user_model
from django.db import transaction

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from products.models import Product

from .models import Order, OrderItem
from .serializers import OrderSerializer
from cart.models import Cart


class OrderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        if pk is not None:
            try:
                order = Order.objects.get(
                    id=pk,
                    user=request.user
                )
            except Order.DoesNotExist:
                return Response(
                    {
                        "error": "Order not found."
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = OrderSerializer(order)

            return Response(serializer.data)

        orders = Order.objects.filter(
            user=request.user
        ).order_by("-created_at")

        serializer = OrderSerializer(
            orders,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):
        delivery_address = request.data.get(
            "delivery_address"
        )

        if not delivery_address:
            return Response(
                {
                    "error": "Delivery address is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            cart = Cart.objects.get(
                user=request.user
            )
        except Cart.DoesNotExist:
            return Response(
                {
                    "error": "Cart not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        cart_items = cart.items.select_related(
            "product"
        )

        if not cart_items.exists():
            return Response(
                {
                    "error": "Your cart is empty."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        unavailable_items = []

        for item in cart_items:
            if not item.product.is_available:
                unavailable_items.append(
                    item.product.name
                )

        if unavailable_items:
            return Response(
                {
                    "error": (
                        "Some products in your cart "
                        "are no longer available."
                    ),
                    "unavailable_products": (
                        unavailable_items
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            total_amount = 0

            for item in cart_items:
                total_amount += (
                    item.product.price *
                    item.quantity
                )

            order = Order.objects.create(
                user=request.user,
                total_amount=total_amount,
                delivery_address=delivery_address,
                status="pending",
                payment_method="cod",
                payment_status="pending"
            )

            for item in cart_items:
                price = item.product.price
                subtotal = price * item.quantity

                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price=price,
                    subtotal=subtotal
                )

            cart_items.delete()

        serializer = OrderSerializer(order)

        return Response(
            {
                "message": "Order placed successfully.",
                "order": serializer.data
            },
            status=status.HTTP_201_CREATED
        )

    def patch(self, request, pk=None):
        if pk is None:
            return Response(
                {
                    "error": "Order ID is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            order = Order.objects.get(
                id=pk,
                user=request.user
            )
        except Order.DoesNotExist:
            return Response(
                {
                    "error": "Order not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if order.status not in [
            "pending",
            "confirmed"
        ]:
            return Response(
                {
                    "error": (
                        "This order can no longer "
                        "be cancelled."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = "cancelled"

        order.save(
            update_fields=["status"]
        )

        serializer = OrderSerializer(order)

        return Response(
            {
                "message": (
                    "Order cancelled successfully."
                ),
                "order": serializer.data
            },
            status=status.HTTP_200_OK
        )


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response(
                {
                    "error": "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        User = get_user_model()

        total_orders = Order.objects.count()

        total_sales = sum(
            order.total_amount
            for order in Order.objects.filter(
                status="delivered"
            )
        )

        pending_orders = Order.objects.filter(
            status="pending"
        ).count()

        confirmed_orders = Order.objects.filter(
            status="confirmed"
        ).count()

        preparing_orders = Order.objects.filter(
            status="preparing"
        ).count()

        out_for_delivery_orders = Order.objects.filter(
            status="out_for_delivery"
        ).count()

        delivered_orders = Order.objects.filter(
            status="delivered"
        ).count()

        cancelled_orders = Order.objects.filter(
            status="cancelled"
        ).count()

        total_customers = User.objects.filter(
            is_staff=False
        ).count()

        total_products = Product.objects.count()

        recent_orders = Order.objects.select_related(
            "user"
        ).order_by("-created_at")[:10]

        recent_orders_data = []

        for order in recent_orders:
            recent_orders_data.append(
                {
                    "id": order.id,
                    "username": order.user.username,
                    "total_amount": str(
                        order.total_amount
                    ),
                    "status": order.status,
                    "payment_method": order.payment_method,
                    "payment_status": order.payment_status,
                    "created_at": order.created_at,
                }
            )

        return Response(
            {
                "total_orders": total_orders,
                "total_sales": str(total_sales),
                "pending_orders": pending_orders,
                "confirmed_orders": confirmed_orders,
                "preparing_orders": preparing_orders,
                "out_for_delivery_orders": (
                    out_for_delivery_orders
                ),
                "delivered_orders": delivered_orders,
                "cancelled_orders": cancelled_orders,
                "total_customers": total_customers,
                "total_products": total_products,
                "recent_orders": recent_orders_data,
            }
        )


class AdminOrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        if not request.user.is_staff:
            return Response(
                {
                    "error": "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if pk is None:
            return Response(
                {
                    "error": "Order ID is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            order = (
                Order.objects
                .select_related("user")
                .prefetch_related(
                    "items__product"
                )
                .get(id=pk)
            )

        except Order.DoesNotExist:
            return Response(
                {
                    "error": "Order not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = OrderSerializer(order)

        data = serializer.data

        data["customer_email"] = (
            order.user.email or ""
        )

        data["customer_phone"] = getattr(
            order.user,
            "phone",
            ""
        ) or ""

        return Response(
            data,
            status=status.HTTP_200_OK
        )


class AdminOrderStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk=None):
        if not request.user.is_staff:
            return Response(
                {
                    "error": "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if pk is None:
            return Response(
                {
                    "error": "Order ID is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            order = Order.objects.get(
                id=pk
            )
        except Order.DoesNotExist:
            return Response(
                {
                    "error": "Order not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        new_status = request.data.get(
            "status"
        )

        valid_statuses = [
            "pending",
            "confirmed",
            "preparing",
            "out_for_delivery",
            "delivered",
            "cancelled",
        ]

        if new_status not in valid_statuses:
            return Response(
                {
                    "error": "Invalid order status."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = new_status
        order.save()

        serializer = OrderSerializer(order)

        return Response(
            {
                "message": (
                    "Order status updated successfully."
                ),
                "order": serializer.data
            },
            status=status.HTTP_200_OK
        )