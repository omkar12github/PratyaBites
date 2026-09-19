from django.urls import path

from .views import (
    CreatePaymentView,
    VerifyPaymentView,
    PaymentFailureView,
)


urlpatterns = [
    path(
        "create/",
        CreatePaymentView.as_view(),
        name="create-payment"
    ),
    path(
        "verify/",
        VerifyPaymentView.as_view(),
        name="verify-payment"
    ),
    path(
        "failure/",
        PaymentFailureView.as_view(),
        name="payment-failure"
    ),
]