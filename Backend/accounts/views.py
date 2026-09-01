from django.contrib.auth import authenticate

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


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
                {"error": "Username already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "Email already exists."},
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