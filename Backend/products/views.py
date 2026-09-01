from rest_framework import generics
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer


class ProductListView(generics.ListCreateAPIView):
    queryset = Product.objects.filter(
        is_available=True
    )
    serializer_class = ProductSerializer