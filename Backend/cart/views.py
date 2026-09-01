from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cart, CartItem
from .serializers import CartSerializer
from products.models import Product


class CartView(APIView):

    permission_classes = [IsAuthenticated]

    # GET CART
    def get(self, request):
        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        serializer = CartSerializer(cart)

        return Response(serializer.data)

    # ADD PRODUCT
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
                id=product_id,
                is_available=True
            )
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

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

    # UPDATE QUANTITY
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

    # REMOVE ITEM
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