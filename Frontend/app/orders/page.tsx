"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

type User = {
  username: string;
  email?: string;
  phone?: string;
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
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
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

export default function OrdersPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);
  const [cancellingOrder, setCancellingOrder] =
    useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Unable to read user:", error);
      }
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(
        "/api/orders/",
        {
          method: "GET",
        }
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
      setError("Unable to load your orders.");
    } finally {
      setLoading(false);
    }
  }

  async function cancelOrder(orderId: number) {
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
      setMessage("Unable to cancel order.");
    } finally {
      setCancellingOrder(null);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    setUser(null);

    router.push("/login");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <nav className="border-b border-gray-100 bg-white px-4 py-4 shadow-sm sm:px-8">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-2xl font-bold text-orange-600">
              PratyaBites
            </h1>
            <p className="text-xs text-gray-500">
              Pratya&apos;s Promise, Every Bite.
            </p>
          </div>
        </nav>

        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="text-5xl">📦</div>
            <p className="mt-4 text-gray-500">
              Loading your orders...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 px-4 py-4 shadow-sm backdrop-blur sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="text-left"
            >
              <h1 className="text-2xl font-bold text-orange-600">
                PratyaBites
              </h1>

              <p className="text-xs text-gray-500">
                Pratya&apos;s Promise, Every Bite.
              </p>
            </button>

            <button
              onClick={() => router.push("/menu")}
              className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
            >
              Back to Menu
            </button>
          </div>
        </nav>

        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
            {error}
          </div>

          <button
            onClick={loadOrders}
            className="mt-4 rounded-xl bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 px-4 py-4 shadow-sm backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <button
            onClick={() => router.push("/")}
            className="text-left"
          >
            <h1 className="text-2xl font-bold text-orange-600">
              PratyaBites
            </h1>

            <p className="text-xs text-gray-500">
              Pratya&apos;s Promise, Every Bite.
            </p>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            <button
              onClick={() => router.push("/")}
              className="hover:text-orange-600"
            >
              Home
            </button>

            <button
              onClick={() => router.push("/menu")}
              className="hover:text-orange-600"
            >
              Menu
            </button>

            <button
              onClick={() => router.push("/cart")}
              className="hover:text-orange-600"
            >
              Cart
            </button>

            <button
              onClick={() => router.push("/orders")}
              className="font-semibold text-orange-600"
            >
              My Orders
            </button>

            {user && (
              <button
                onClick={() => router.push("/profile")}
                className="hover:text-orange-600"
              >
                Profile
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => router.push("/cart")}
              className="rounded-lg px-2 py-2 font-medium hover:bg-orange-50 hover:text-orange-600 sm:px-3"
            >
              🛒
              <span className="hidden sm:inline">
                {" "}Cart
              </span>
            </button>

            <button
              onClick={() => router.push("/profile")}
              className="rounded-lg px-3 py-2 font-medium hover:bg-orange-50 hover:text-orange-600"
            >
              👤
              <span className="hidden sm:inline">
                {" "}Profile
              </span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="hidden font-medium text-gray-700 lg:block">
                  Hi, {user.username}
                </span>

                <button
                  onClick={handleLogout}
                  className="rounded-full bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 sm:px-5"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="rounded-full bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700 sm:px-5"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <section className="bg-orange-50 px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => router.push("/menu")}
            className="mb-5 text-sm font-medium text-orange-600 hover:underline"
          >
            ← Continue Shopping
          </button>

          <h1 className="text-4xl font-extrabold">
            My Orders
          </h1>

          <p className="mt-2 text-gray-600">
            View and manage your orders.
          </p>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-5xl">
          {message && (
            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-700">
              {message}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="rounded-2xl bg-white px-6 py-20 text-center shadow-sm">
              <div className="text-7xl">📦</div>

              <h2 className="mt-6 text-2xl font-bold">
                No orders yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-gray-500">
                Your placed orders will appear here.
              </p>

              <button
                onClick={() => router.push("/menu")}
                className="mt-7 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const status =
                  order.status
                    .trim()
                    .toLowerCase();

                return (
                  <div
                    key={order.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm"
                  >
                    <div className="p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <button
                            onClick={() =>
                              router.push(
                                `/orders/${order.id}`
                              )
                            }
                            className="text-xl font-bold hover:text-orange-600"
                          >
                            Order #{order.id}
                          </button>

                          <p className="mt-1 text-sm text-gray-500">
                            {formatDate(
                              order.created_at
                            )}
                          </p>
                        </div>

                        <span
                          className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
                            status
                          )}`}
                        >
                          {formatStatus(status)}
                        </span>
                      </div>

                      <div className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-3">
                        <div>
                          <p className="text-sm text-gray-500">
                            Items
                          </p>

                          <p className="mt-1 font-semibold">
                            {order.items.reduce(
                              (total, item) =>
                                total +
                                item.quantity,
                              0
                            )}{" "}
                            items
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">
                            Payment
                          </p>

                          <p className="mt-1 font-semibold">
                            {formatStatus(
                              order.payment_method
                            )}
                          </p>

                          <p className="text-xs text-gray-500">
                            {formatStatus(
                              order.payment_status
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">
                            Total
                          </p>

                          <p className="mt-1 text-xl font-bold text-orange-600">
                            ₹{order.total_amount}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 rounded-xl bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">
                          Delivery Address
                        </p>

                        <p className="mt-1 whitespace-pre-wrap text-sm font-medium">
                          {order.delivery_address}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <button
                          onClick={() =>
                            router.push(
                              `/orders/${order.id}`
                            )
                          }
                          className="flex-1 rounded-xl border border-orange-500 px-5 py-3 font-semibold text-orange-600 hover:bg-orange-50"
                        >
                          View Order Details
                        </button>

                        {(status === "pending" ||
                          status === "confirmed") && (
                          <button
                            onClick={() =>
                              cancelOrder(order.id)
                            }
                            disabled={
                              cancellingOrder ===
                              order.id
                            }
                            className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                );
              })}
            </div>
          )}
        </div>
      </section>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white p-5">
              <div>
                <h2 className="text-xl font-bold">
                  Order #{selectedOrder.id}
                </h2>

                <p className="text-sm text-gray-500">
                  {formatDate(
                    selectedOrder.created_at
                  )}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="rounded-full px-3 py-2 text-2xl text-gray-500 hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
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

                <span className="text-2xl font-bold text-orange-600">
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
                  className="w-full rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
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

      <footer className="bg-gray-950 px-8 py-10 text-center text-white">
        <h2 className="text-2xl font-bold text-orange-500">
          PratyaBites
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Pratya&apos;s Promise, Every Bite.
        </p>

        <p className="mt-6 text-sm text-gray-500">
          © 2026 PratyaBites. All rights reserved.
        </p>
      </footer>
    </main>
  );
}