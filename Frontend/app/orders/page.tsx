"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

function formatStatus(status: string) {
  return status
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

function formatDate(date: string) {
  return new Date(date).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

function getStatusClass(status: string) {
  if (status === "pending") {
    return "bg-yellow-100 text-yellow-700";
  }

  if (status === "confirmed") {
    return "bg-blue-100 text-blue-700";
  }

  if (status === "preparing") {
    return "bg-purple-100 text-purple-700";
  }

  if (status === "out_for_delivery") {
    return "bg-orange-100 text-orange-700";
  }

  if (status === "delivered") {
    return "bg-green-100 text-green-700";
  }

  if (status === "cancelled") {
    return "bg-red-100 text-red-700";
  }

  return "bg-gray-100 text-gray-700";
}

function getStatusSteps() {
  return [
    {
      status: "pending",
      title: "Order Placed",
      description:
        "Your order has been received.",
    },
    {
      status: "confirmed",
      title: "Order Confirmed",
      description:
        "Your order has been confirmed.",
    },
    {
      status: "preparing",
      title: "Preparing",
      description:
        "Your food is being prepared.",
    },
    {
      status: "out_for_delivery",
      title: "Out for Delivery",
      description:
        "Your order is on the way.",
    },
    {
      status: "delivered",
      title: "Delivered",
      description:
        "Your order has been delivered.",
    },
  ];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(
    []
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [cancellingOrder, setCancellingOrder] =
    useState<number | null>(null);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(
        "/api/orders/"
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            data.detail ||
            "Failed to load orders."
        );
        return;
      }

      setOrders(
        Array.isArray(data)
          ? data
          : data.results || []
      );
    } catch {
      setError(
        "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  }

  async function cancelOrder(
    orderId: number
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingOrder(orderId);
      setMessage("");

      const response = await apiFetch(
        `/api/orders/${orderId}/`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: "cancelled",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            data.detail ||
            "Unable to cancel order."
        );
        return;
      }

      setMessage(
        "Order cancelled successfully."
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: "cancelled",
              }
            : order
        )
      );

      if (
        selectedOrder &&
        selectedOrder.id === orderId
      ) {
        setSelectedOrder({
          ...selectedOrder,
          status: "cancelled",
        });
      }
    } catch {
      setMessage(
        "Unable to cancel order."
      );
    } finally {
      setCancellingOrder(null);
    }
  }

  function openOrder(order: Order) {
    setSelectedOrder(order);
  }

  function closeOrder() {
    setSelectedOrder(null);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-gray-500">
            Loading your orders...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-5xl">

          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">
            {error}
          </div>

          <button
            onClick={loadOrders}
            className="mt-4 rounded-lg bg-black px-5 py-3 font-medium text-white"
          >
            Try Again
          </button>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-5xl">

        <div className="mb-8">

          <Link
            href="/menu"
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            ← Back to Menu
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            My Orders
          </h1>

          <p className="mt-1 text-gray-500">
            View and manage your orders
          </p>

        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-700">
            {message}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

            <div className="text-5xl">
              🛒
            </div>

            <h2 className="mt-4 text-xl font-bold">
              No orders yet
            </h2>

            <p className="mt-2 text-gray-500">
              You haven't placed any orders yet.
            </p>

            <Link
              href="/menu"
              className="mt-6 inline-block rounded-lg bg-black px-6 py-3 font-medium text-white"
            >
              Browse Menu
            </Link>

          </div>
        ) : (
          <div className="space-y-5">

            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl bg-white p-5 shadow-sm sm:p-6"
              >

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <h2 className="text-lg font-bold">
                      Order #{order.id}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {formatDate(
                        order.created_at
                      )}
                    </p>

                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${getStatusClass(
                      order.status
                    )}`}
                  >
                    {formatStatus(
                      order.status
                    )}
                  </span>

                </div>

                <div className="mt-5 border-t pt-5">

                  <div className="space-y-3">

                    {order.items.map(
                      (item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4"
                        >

                          <div>

                            <p className="font-medium">
                              {item.product_name}
                            </p>

                            <p className="text-sm text-gray-500">
                              ₹{item.price} ×{" "}
                              {item.quantity}
                            </p>

                          </div>

                          <p className="font-semibold">
                            ₹{item.subtotal}
                          </p>

                        </div>
                      )
                    )}

                  </div>

                </div>

                <div className="mt-5 flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-sm text-gray-500">
                      Total Amount
                    </p>

                    <p className="text-xl font-bold">
                      ₹{order.total_amount}
                    </p>

                  </div>

                  <div className="flex flex-wrap gap-3">

                    <button
                      onClick={() =>
                        openOrder(order)
                      }
                      className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium hover:bg-gray-100"
                    >
                      View Details
                    </button>

                    {(order.status ===
                      "pending" ||
                      order.status ===
                        "confirmed") && (
                      <button
                        onClick={() =>
                          cancelOrder(
                            order.id
                          )
                        }
                        disabled={
                          cancellingOrder ===
                          order.id
                        }
                        className="rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {cancellingOrder ===
                        order.id
                          ? "Cancelling..."
                          : "Cancel Order"}
                      </button>
                    )}

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeOrder}
        >

          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-6">

              <div>

                <h2 className="text-2xl font-bold">
                  Order #{selectedOrder.id}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {formatDate(
                    selectedOrder.created_at
                  )}
                </p>

              </div>

              <button
                onClick={closeOrder}
                className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-gray-500 hover:bg-gray-100 hover:text-black"
              >
                ×
              </button>

            </div>

            <div className="space-y-6 p-6">

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="rounded-xl bg-gray-50 p-4">

                  <p className="text-sm text-gray-500">
                    Order Status
                  </p>

                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${getStatusClass(
                      selectedOrder.status
                    )}`}
                  >
                    {formatStatus(
                      selectedOrder.status
                    )}
                  </span>

                </div>

                <div className="rounded-xl bg-gray-50 p-4">

                  <p className="text-sm text-gray-500">
                    Payment
                  </p>

                  <p className="mt-2 font-semibold">
                    {formatStatus(
                      selectedOrder.payment_method
                    )}
                  </p>

                  <p className="text-sm text-gray-500">
                    {formatStatus(
                      selectedOrder.payment_status
                    )}
                  </p>

                </div>

              </div>

              <div>
                <h3 className="mb-5 text-lg font-bold">
                  Order Tracking
                </h3>

                {selectedOrder.status ===
                "cancelled" ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                        ✕
                      </div>

                      <div>

                        <p className="font-bold text-red-700">
                          Order Cancelled
                        </p>

                        <p className="text-sm text-red-600">
                          This order has been cancelled.
                        </p>

                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="space-y-0">

                    {getStatusSteps().map(
                      (step, index) => {
                        const steps =
                          getStatusSteps();

                        const currentIndex =
                          steps.findIndex(
                            (item) =>
                              item.status ===
                              selectedOrder.status
                          );

                        const completed =
                          index <=
                          currentIndex;

                        const current =
                          index ===
                          currentIndex;

                        return (
                          <div
                            key={step.status}
                            className="flex"
                          >

                            <div className="mr-4 flex flex-col items-center">

                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${
                                  completed
                                    ? "bg-black text-white"
                                    : "bg-gray-200 text-gray-500"
                                }`}
                              >
                                {completed
                                  ? "✓"
                                  : index + 1}
                              </div>

                              {index <
                                steps.length -
                                  1 && (
                                <div
                                  className={`h-12 w-0.5 ${
                                    index <
                                    currentIndex
                                      ? "bg-black"
                                      : "bg-gray-200"
                                  }`}
                                />
                              )}

                            </div>

                            <div className="pb-6">

                              <p
                                className={`font-semibold ${
                                  current
                                    ? "text-black"
                                    : completed
                                    ? "text-gray-800"
                                    : "text-gray-400"
                                }`}
                              >
                                {step.title}
                              </p>

                              <p
                                className={`mt-1 text-sm ${
                                  completed
                                    ? "text-gray-500"
                                    : "text-gray-400"
                                }`}
                              >
                                {step.description}
                              </p>

                              {current && (
                                <span className="mt-2 inline-block rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                                  Current Status
                                </span>
                              )}

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>
                )}

              </div>

              <div>

                <h3 className="mb-4 text-lg font-bold">
                  Items
                </h3>

                <div className="divide-y rounded-xl border">

                  {selectedOrder.items.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4"
                      >

                        <div>

                          <p className="font-semibold">
                            {item.product_name}
                          </p>

                          <p className="text-sm text-gray-500">
                            ₹{item.price} ×{" "}
                            {item.quantity}
                          </p>

                        </div>

                        <p className="font-semibold">
                          ₹{item.subtotal}
                        </p>

                      </div>
                    )
                  )}

                </div>

              </div>

              <div className="rounded-xl bg-gray-50 p-5">

                <p className="text-sm text-gray-500">
                  Delivery Address
                </p>

                <p className="mt-2 whitespace-pre-wrap font-medium">
                  {selectedOrder.delivery_address}
                </p>

              </div>

              <div className="flex items-center justify-between border-t pt-5">

                <span className="text-lg font-bold">
                  Total
                </span>

                <span className="text-2xl font-bold">
                  ₹{selectedOrder.total_amount}
                </span>

              </div>

              {(selectedOrder.status ===
                "pending" ||
                selectedOrder.status ===
                  "confirmed") && (
                <button
                  onClick={() =>
                    cancelOrder(
                      selectedOrder.id
                    )
                  }
                  disabled={
                    cancellingOrder ===
                    selectedOrder.id
                  }
                  className="w-full rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {cancellingOrder ===
                  selectedOrder.id
                    ? "Cancelling..."
                    : "Cancel Order"}
                </button>
              )}

            </div>

          </div>

        </div>
      )}

    </main>
  );
}