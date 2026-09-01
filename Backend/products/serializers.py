from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'description',
            'is_active',
        ]


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )

    class Meta:
        model = Product
        fields = [
            'id',
            'category',
            'category_name',
            'name',
            'description',
            'price',
            'image',
            'is_available',
            'created_at',
            'updated_at',
        ]