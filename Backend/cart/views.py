from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cart, CartItem
from .serializers import CartSerializer
from products.models import Product


class CartView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        unavailable_items = cart.items.filter(
            product__is_available=False
        )

        if unavailable_items.exists():
            unavailable_items.delete()

        serializer = CartSerializer(cart)

        return Response(serializer.data)

    def post(self, request):
        product_id = request.data.get("product")
        quantity = request.data.get("quantity", 1)

        if not product_id:
            return Response(
                {"error": "Product ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {"error": "Quantity must be a number."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity < 1:
            return Response(
                {"error": "Quantity must be at least 1."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            product = Product.objects.get(
                id=product_id
            )
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if not product.is_available:
            return Response(
                {
                    "error": (
                        "This product is currently "
                        "unavailable."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        unavailable_items = cart.items.filter(
            product__is_available=False
        )

        if unavailable_items.exists():
            unavailable_items.delete()

        cart_item, item_created = CartItem.objects.get_or_create(
            cart=cart,
            product=product
        )

        if item_created:
            cart_item.quantity = quantity
        else:
            cart_item.quantity += quantity

        cart_item.save()

        serializer = CartSerializer(cart)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class CartItemView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):

        try:
            cart_item = CartItem.objects.get(
                id=item_id,
                cart__user=request.user
            )
        except CartItem.DoesNotExist:
            return Response(
                {"error": "Cart item not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if not cart_item.product.is_available:
            cart_item.delete()

            cart = Cart.objects.get(
                user=request.user
            )

            return Response(
                {
                    "error": (
                        "This product is currently "
                        "unavailable and was removed "
                        "from your cart."
                    ),
                    "cart": CartSerializer(cart).data
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        quantity = request.data.get("quantity")

        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {"error": "Quantity must be a number."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity < 1:
            cart_item.delete()

            cart = Cart.objects.get(
                user=request.user
            )

            return Response(
                CartSerializer(cart).data
            )

        cart_item.quantity = quantity
        cart_item.save()

        cart = Cart.objects.get(
            user=request.user
        )

        return Response(
            CartSerializer(cart).data
        )

    def delete(self, request, item_id):

        try:
            cart_item = CartItem.objects.get(
                id=item_id,
                cart__user=request.user
            )
        except CartItem.DoesNotExist:
            return Response(
                {"error": "Cart item not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        cart_item.delete()

        cart = Cart.objects.get(
            user=request.user
        )

        return Response(
            CartSerializer(cart).data
        )