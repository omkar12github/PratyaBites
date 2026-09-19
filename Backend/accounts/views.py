from django.contrib.auth import authenticate
from django.db import transaction

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken

from orders.models import Order

from .models import User, Address


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        phone = request.data.get("phone", "")

        if not username or not email or not password:
            return Response(
                {
                    "error": "Username, email and password are required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {
                    "error": "Username already exists."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {
                    "error": "Email already exists."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            phone=phone
        )

        return Response(
            {
                "message": "Registration successful.",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "phone": user.phone,
                }
            },
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {
                    "error": "Username and password are required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(
            username=username,
            password=password
        )

        if user is None:
            return Response(
                {
                    "error": "Invalid username or password."
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Login successful.",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "phone": user.phone,
                },
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_200_OK
        )


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "phone": user.phone,
            }
        )

    def patch(self, request):
        user = request.user

        email = request.data.get("email")
        phone = request.data.get("phone")

        if email is not None:
            if User.objects.filter(
                email=email
            ).exclude(id=user.id).exists():
                return Response(
                    {
                        "error": "Email already exists."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.email = email

        if phone is not None:
            user.phone = phone

        user.save()

        return Response(
            {
                "message": "Profile updated successfully.",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "phone": user.phone,
                }
            }
        )


class AddressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        addresses = Address.objects.filter(
            user=request.user
        ).order_by(
            "-is_default",
            "-created_at"
        )

        data = []

        for address in addresses:
            data.append(
                {
                    "id": address.id,
                    "full_name": address.full_name,
                    "phone": address.phone,
                    "address_line": address.address_line,
                    "city": address.city,
                    "state": address.state,
                    "pincode": address.pincode,
                    "is_default": address.is_default,
                }
            )

        return Response(data)

    def post(self, request):
        required_fields = [
            "full_name",
            "phone",
            "address_line",
            "city",
            "state",
            "pincode",
        ]

        for field in required_fields:
            if not request.data.get(field):
                return Response(
                    {
                        "error": f"{field} is required."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        is_default = request.data.get(
            "is_default",
            False
        )

        with transaction.atomic():
            if is_default:
                Address.objects.filter(
                    user=request.user
                ).update(
                    is_default=False
                )

            address = Address.objects.create(
                user=request.user,
                full_name=request.data.get(
                    "full_name"
                ),
                phone=request.data.get(
                    "phone"
                ),
                address_line=request.data.get(
                    "address_line"
                ),
                city=request.data.get(
                    "city"
                ),
                state=request.data.get(
                    "state"
                ),
                pincode=request.data.get(
                    "pincode"
                ),
                is_default=is_default,
            )

        return Response(
            {
                "message": "Address added successfully.",
                "address": {
                    "id": address.id,
                    "full_name": address.full_name,
                    "phone": address.phone,
                    "address_line": address.address_line,
                    "city": address.city,
                    "state": address.state,
                    "pincode": address.pincode,
                    "is_default": address.is_default,
                }
            },
            status=status.HTTP_201_CREATED
        )


class AddressDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_address(self, request, pk):
        try:
            return Address.objects.get(
                id=pk,
                user=request.user
            )
        except Address.DoesNotExist:
            return None

    def patch(self, request, pk):
        address = self.get_address(
            request,
            pk
        )

        if address is None:
            return Response(
                {
                    "error": "Address not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        fields = [
            "full_name",
            "phone",
            "address_line",
            "city",
            "state",
            "pincode",
        ]

        for field in fields:
            if field in request.data:
                setattr(
                    address,
                    field,
                    request.data.get(field)
                )

        if request.data.get(
            "is_default"
        ) is True:
            Address.objects.filter(
                user=request.user
            ).update(
                is_default=False
            )

            address.is_default = True

        elif request.data.get(
            "is_default"
        ) is False:
            address.is_default = False

        address.save()

        return Response(
            {
                "message": "Address updated successfully.",
                "address": {
                    "id": address.id,
                    "full_name": address.full_name,
                    "phone": address.phone,
                    "address_line": address.address_line,
                    "city": address.city,
                    "state": address.state,
                    "pincode": address.pincode,
                    "is_default": address.is_default,
                }
            }
        )

    def delete(self, request, pk):
        address = self.get_address(
            request,
            pk
        )

        if address is None:
            return Response(
                {
                    "error": "Address not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        was_default = address.is_default

        address.delete()

        if was_default:
            next_address = Address.objects.filter(
                user=request.user
            ).order_by(
                "-created_at"
            ).first()

            if next_address:
                next_address.is_default = True
                next_address.save(
                    update_fields=["is_default"]
                )

        return Response(
            {
                "message": "Address deleted successfully."
            }
        )


class AdminCustomerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response(
                {
                    "error": "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        customers = User.objects.filter(
            is_staff=False
        ).order_by(
            "-date_joined"
        )

        data = []

        for customer in customers:
            orders = Order.objects.filter(
                user=customer
            )

            total_spent = sum(
                order.total_amount
                for order in orders
                if order.status != "cancelled"
            )

            data.append(
                {
                    "id": customer.id,
                    "username": customer.username,
                    "email": customer.email,
                    "phone": customer.phone,
                    "orders_count": orders.count(),
                    "total_spent": str(
                        total_spent
                    ),
                    "date_joined": customer.date_joined,
                }
            )

        return Response(data)