"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type OrderItem = {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  price: string;
  subtotal: string;
};

type Order = {
  id: number;
  user: number;
  username: string;
  items: OrderItem[];
  total_amount: string;
  delivery_address: string;
  status: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const orderId = params.id;

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(
        `/api/orders/${orderId}/`,
        {
          method: "GET",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            data.error ||
            "Unable to load order."
        );
        return;
      }

      setOrder(data);
    } catch (error) {
      console.error("Order loading error:", error);
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!order) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(true);
      setError("");

      const response = await apiFetch(
        `/api/orders/${order.id}/`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            data.error ||
            "Unable to cancel order."
        );
        return;
      }

      setOrder(data.order);
    } catch (error) {
      console.error("Cancel order error:", error);
      setError("Unable to connect to server.");
    } finally {
      setCancelling(false);
    }
  };

  const normalizedStatus =
    order?.status?.trim().toLowerCase() || "";

  const statusSteps = [
    {
      key: "pending",
      label: "Order Placed",
    },
    {
      key: "confirmed",
      label: "Confirmed",
    },
    {
      key: "preparing",
      label: "Preparing",
    },
    {
      key: "out_for_delivery",
      label: "Out for Delivery",
    },
    {
      key: "delivered",
      label: "Delivered",
    },
  ];

  const statusOrder = [
    "pending",
    "confirmed",
    "preparing",
    "out_for_delivery",
    "delivered",
  ];

  const currentStatusIndex =
    statusOrder.indexOf(normalizedStatus);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50">
        <p className="text-gray-500">
          Loading order...
        </p>
      </main>
    );
  }

  if (error && !order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50 px-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <p className="text-red-600">
            {error}
          </p>

          <button
            onClick={() => router.push("/orders")}
            className="mt-5 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white"
          >
            Back to My Orders
          </button>
        </div>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  const paymentMethod =
    order.payment_method === "cod"
      ? "Cash on Delivery"
      : order.payment_method;

  const paymentStatus =
    order.payment_status === "pending"
      ? "Pending"
      : order.payment_status === "paid"
        ? "Paid"
        : order.payment_status;

  return (
    <main className="min-h-screen bg-orange-50">
      <header className="flex items-center justify-between bg-white px-8 py-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-orange-600">
            PratyaBites
          </h1>

          <p className="text-xs text-gray-500">
            Pratya&apos;s Promise, Every Bite.
          </p>
        </div>

        <button
          onClick={() => router.push("/orders")}
          className="font-medium text-orange-600 hover:text-orange-700"
        >
          ← Back to My Orders
        </button>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-bold">
                Order #{order.id}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {new Date(
                  order.created_at
                ).toLocaleString()}
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
                normalizedStatus === "cancelled"
                  ? "bg-red-100 text-red-700"
                  : normalizedStatus === "delivered"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
              }`}
            >
              {normalizedStatus
                .replaceAll("_", " ")
                .replace(
                  /\b\w/g,
                  (char) => char.toUpperCase()
                )}
            </span>
          </div>

          {normalizedStatus === "cancelled" ? (
            <div className="mt-8 rounded-xl bg-red-50 p-5">
              <h3 className="font-bold text-red-700">
                Order Cancelled
              </h3>

              <p className="mt-1 text-sm text-red-600">
                This order has been cancelled.
              </p>
            </div>
          ) : (
            <div className="mt-10">
              <div className="flex items-start justify-between">
                {statusSteps.map(
                  (step, index) => {
                    const completed =
                      currentStatusIndex >= index;

                    return (
                      <div
                        key={step.key}
                        className="flex flex-1 flex-col items-center"
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                            completed
                              ? "bg-orange-600 text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {index + 1}
                        </div>

                        <p
                          className={`mt-2 text-center text-xs font-semibold ${
                            completed
                              ? "text-orange-600"
                              : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          <div className="mt-10 border-t pt-8">
            <h3 className="text-xl font-bold">
              Ordered Items
            </h3>

            <div className="mt-5 space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 p-4"
                >
                  <div>
                    <h4 className="font-semibold">
                      {item.product_name}
                    </h4>

                    <p className="mt-1 text-sm text-gray-500">
                      ₹{item.price} ×{" "}
                      {item.quantity}
                    </p>
                  </div>

                  <p className="font-bold">
                    ₹{item.subtotal}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between border-t pt-5 text-lg font-bold">
              <span>Total Amount</span>

              <span className="text-orange-600">
                ₹{order.total_amount}
              </span>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-orange-50 p-5">
            <h3 className="text-lg font-bold">
              Payment
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">
                  Payment Method
                </p>

                <p className="mt-1 font-bold text-gray-800">
                  💵 {paymentMethod}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Payment Status
                </p>

                <p className="mt-1 font-bold text-orange-600">
                  {paymentStatus}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">
              Delivery Address
            </h3>

            <div className="mt-4 rounded-xl bg-gray-50 p-5">
              <p className="whitespace-pre-line leading-7 text-gray-700">
                {order.delivery_address}
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {(normalizedStatus === "pending" ||
            normalizedStatus === "confirmed") && (
            <div className="mt-8">
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelling
                  ? "Cancelling..."
                  : "Cancel Order"}
              </button>

              <p className="mt-2 text-sm text-gray-500">
                You can cancel this order while it
                is pending or confirmed.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}