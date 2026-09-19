from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class CategoryListView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]

    queryset = Category.objects.filter(
        is_active=True
    )

    serializer_class = CategorySerializer


class ProductListView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]

    queryset = Product.objects.all().order_by(
        "-created_at"
    )

    serializer_class = ProductSerializer


class AdminProductView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    queryset = Product.objects.all().order_by(
        "-created_at"
    )

    serializer_class = ProductSerializer

    def get(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {"error": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().get(
            request,
            *args,
            **kwargs
        )

    def post(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {"error": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().post(
            request,
            *args,
            **kwargs
        )


class AdminProductDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    permission_classes = [IsAuthenticated]

    queryset = Product.objects.all()

    serializer_class = ProductSerializer

    def check_admin(self, request):
        if not request.user.is_staff:
            return Response(
                {"error": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        return None

    def get(self, request, *args, **kwargs):
        error = self.check_admin(request)

        if error:
            return error

        return super().get(
            request,
            *args,
            **kwargs
        )

    def patch(self, request, *args, **kwargs):
        error = self.check_admin(request)

        if error:
            return error

        return super().patch(
            request,
            *args,
            **kwargs
        )

    def delete(self, request, *args, **kwargs):
        error = self.check_admin(request)

        if error:
            return error

        return super().delete(
            request,
            *args,
            **kwargs
        )


class AdminCategoryView(
    generics.ListCreateAPIView
):
    permission_classes = [IsAuthenticated]

    queryset = Category.objects.all().order_by(
        "name"
    )

    serializer_class = CategorySerializer

    def get(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {"error": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().get(
            request,
            *args,
            **kwargs
        )

    def post(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {"error": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().post(
            request,
            *args,
            **kwargs
        )


class AdminCategoryDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    permission_classes = [IsAuthenticated]

    queryset = Category.objects.all()

    serializer_class = CategorySerializer

    def check_admin(self, request):
        if not request.user.is_staff:
            return Response(
                {"error": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        return None

    def get(self, request, *args, **kwargs):
        error = self.check_admin(request)

        if error:
            return error

        return super().get(
            request,
            *args,
            **kwargs
        )

    def patch(self, request, *args, **kwargs):
        error = self.check_admin(request)

        if error:
            return error

        return super().patch(
            request,
            *args,
            **kwargs
        )

    def delete(self, request, *args, **kwargs):
        error = self.check_admin(request)

        if error:
            return error

        return super().delete(
            request,
            *args,
            **kwargs
        )