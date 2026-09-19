import razorpay

from django.conf import settings
from django.db import transaction

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from cart.models import Cart
from orders.models import Order, OrderItem

from .models import Payment


class CreatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        delivery_address = request.data.get("delivery_address")

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
                    "unavailable_products": unavailable_items
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        total_amount = sum(
            item.product.price * item.quantity
            for item in cart_items
        )

        if total_amount <= 0:
            return Response(
                {
                    "error": "Invalid order amount."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not settings.RAZORPAY_KEY_ID:
            return Response(
                {
                    "error": "Razorpay Key ID is not configured."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        if not settings.RAZORPAY_KEY_SECRET:
            return Response(
                {
                    "error": "Razorpay Key Secret is not configured."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        amount_in_paise = int(
            total_amount * 100
        )

        client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET
            )
        )

        try:
            with transaction.atomic():
                order = Order.objects.create(
                    user=request.user,
                    total_amount=total_amount,
                    delivery_address=delivery_address,
                    status="pending",
                    payment_method="razorpay",
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

                razorpay_order = client.order.create(
                    {
                        "amount": amount_in_paise,
                        "currency": "INR",
                        "receipt": f"order_{order.id}",
                    }
                )

                payment = Payment.objects.create(
                    order=order,
                    user=request.user,
                    razorpay_order_id=razorpay_order["id"],
                    amount=total_amount,
                    currency="INR",
                    status="created"
                )

        except Exception as error:
            return Response(
                {
                    "error": "Unable to create payment.",
                    "details": str(error)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {
                "message": "Payment order created successfully.",
                "order_id": order.id,
                "razorpay_order_id": payment.razorpay_order_id,
                "amount": amount_in_paise,
                "currency": "INR",
                "key_id": settings.RAZORPAY_KEY_ID,
            },
            status=status.HTTP_201_CREATED
        )


class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id")
        razorpay_order_id = request.data.get(
            "razorpay_order_id"
        )
        razorpay_payment_id = request.data.get(
            "razorpay_payment_id"
        )
        razorpay_signature = request.data.get(
            "razorpay_signature"
        )

        if not all(
            [
                order_id,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            ]
        ):
            return Response(
                {
                    "error": "Payment verification data is incomplete."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            order = Order.objects.get(
                id=order_id,
                user=request.user
            )
        except Order.DoesNotExist:
            return Response(
                {
                    "error": "Order not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            payment = Payment.objects.get(
                order=order,
                user=request.user
            )
        except Payment.DoesNotExist:
            return Response(
                {
                    "error": "Payment record not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if payment.razorpay_order_id != razorpay_order_id:
            return Response(
                {
                    "error": "Invalid Razorpay order ID."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if payment.status == "captured":
            return Response(
                {
                    "message": "Payment already verified.",
                    "order_id": order.id,
                    "payment_status": "paid",
                },
                status=status.HTTP_200_OK
            )

        if order.payment_status == "paid":
            return Response(
                {
                    "message": "Payment already verified.",
                    "order_id": order.id,
                    "payment_status": "paid",
                },
                status=status.HTTP_200_OK
            )

        if not settings.RAZORPAY_KEY_ID:
            return Response(
                {
                    "error": "Razorpay Key ID is not configured."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        if not settings.RAZORPAY_KEY_SECRET:
            return Response(
                {
                    "error": "Razorpay Key Secret is not configured."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET
            )
        )

        try:
            client.utility.verify_payment_signature(
                {
                    "razorpay_order_id": razorpay_order_id,
                    "razorpay_payment_id": razorpay_payment_id,
                    "razorpay_signature": razorpay_signature,
                }
            )
        except Exception:
            payment.status = "failed"

            payment.save(
                update_fields=[
                    "status",
                    "updated_at"
                ]
            )

            return Response(
                {
                    "error": "Payment verification failed."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            razorpay_payment = client.payment.fetch(
                razorpay_payment_id
            )
        except Exception:
            payment.status = "failed"

            payment.save(
                update_fields=[
                    "status",
                    "updated_at"
                ]
            )

            return Response(
                {
                    "error": "Unable to verify payment with Razorpay."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        razorpay_payment_order_id = razorpay_payment.get(
            "order_id"
        )

        razorpay_payment_amount = razorpay_payment.get(
            "amount"
        )

        razorpay_payment_currency = razorpay_payment.get(
            "currency"
        )

        expected_amount = int(
            payment.amount * 100
        )

        if razorpay_payment_order_id != payment.razorpay_order_id:
            payment.status = "failed"

            payment.save(
                update_fields=[
                    "status",
                    "updated_at"
                ]
            )

            return Response(
                {
                    "error": "Payment does not belong to this order."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if razorpay_payment_amount != expected_amount:
            payment.status = "failed"

            payment.save(
                update_fields=[
                    "status",
                    "updated_at"
                ]
            )

            return Response(
                {
                    "error": "Payment amount does not match the order."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if razorpay_payment_currency != payment.currency:
            payment.status = "failed"

            payment.save(
                update_fields=[
                    "status",
                    "updated_at"
                ]
            )

            return Response(
                {
                    "error": "Payment currency does not match the order."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if razorpay_payment.get("status") not in [
            "authorized",
            "captured"
        ]:
            payment.status = "failed"

            payment.save(
                update_fields=[
                    "status",
                    "updated_at"
                ]
            )

            return Response(
                {
                    "error": "Razorpay payment is not successful."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            payment.razorpay_payment_id = (
                razorpay_payment_id
            )

            payment.razorpay_signature = (
                razorpay_signature
            )

            payment.status = "captured"

            payment.save()

            order.payment_status = "paid"

            order.save(
                update_fields=[
                    "payment_status"
                ]
            )

            cart = Cart.objects.filter(
                user=request.user
            ).first()

            if cart:
                cart.items.all().delete()

        return Response(
            {
                "message": "Payment verified successfully.",
                "order_id": order.id,
                "payment_status": "paid",
            },
            status=status.HTTP_200_OK
        )


class PaymentFailureView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id")

        if not order_id:
            return Response(
                {
                    "error": "Order ID is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            order = Order.objects.get(
                id=order_id,
                user=request.user
            )
        except Order.DoesNotExist:
            return Response(
                {
                    "error": "Order not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            payment = Payment.objects.get(
                order=order,
                user=request.user
            )
        except Payment.DoesNotExist:
            return Response(
                {
                    "error": "Payment record not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if payment.status == "captured" or order.payment_status == "paid":
            return Response(
                {
                    "message": "Payment was already successful.",
                    "order_id": order.id,
                    "payment_status": "paid",
                },
                status=status.HTTP_200_OK
            )

        payment.status = "failed"

        payment.save(
            update_fields=[
                "status",
                "updated_at"
            ]
        )

        order.status = "cancelled"

        order.payment_status = "failed"

        order.save(
            update_fields=[
                "status",
                "payment_status"
            ]
        )

        return Response(
            {
                "message": "Payment marked as failed.",
                "order_id": order.id,
                "payment_status": "failed",
            },
            status=status.HTTP_200_OK
        )