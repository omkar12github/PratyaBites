from django.db import transaction

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

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

        with transaction.atomic():

            total_amount = 0

            for item in cart_items:
                total_amount += (
                    item.product.price * item.quantity
                )

            order = Order.objects.create(
                user=request.user,
                total_amount=total_amount,
                delivery_address=delivery_address,
                status="pending"
            )

            for item in cart_items:

                price = item.product.price

                subtotal = (
                    price * item.quantity
                )

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