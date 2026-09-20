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

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();

  const orderId = params.id;

  const [user, setUser] = useState<User | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
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
    if (!orderId) {
      return;
    }

    loadOrder();
  }, [orderId]);

  async function loadOrder() {
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
          data.error ||
            data.detail ||
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
  }

  async function cancelOrder() {
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
      setMessage("");

      const response = await apiFetch(
        `/api/orders/${order.id}/`,
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

      setOrder((currentOrder) =>
        currentOrder
          ? {
              ...currentOrder,
              status: "cancelled",
            }
          : currentOrder
      );

      setMessage(
        "Order cancelled successfully."
      );
    } catch (error) {
      console.error("Cancel order error:", error);
      setMessage("Unable to cancel order.");
    } finally {
      setCancelling(false);
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
              Loading order...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-gray-50">
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

            <button
              onClick={() => router.push("/orders")}
              className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
            >
              My Orders
            </button>
          </div>
        </nav>

        <section className="px-4 py-16 sm:px-8">
          <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-sm">
            <div className="text-6xl">📦</div>

            <h2 className="mt-5 text-2xl font-bold">
              Order Not Found
            </h2>

            <p className="mt-2 text-gray-500">
              {error ||
                "The requested order could not be found."}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => router.push("/orders")}
                className="rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700"
              >
                My Orders
              </button>

              <button
                onClick={() => router.push("/menu")}
                className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Browse Menu
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const status = order.status
    .trim()
    .toLowerCase();

  const canCancel =
    status === "pending" ||
    status === "confirmed";

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

      <section className="bg-orange-50 px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => router.push("/orders")}
            className="mb-5 text-sm font-medium text-orange-600 hover:underline"
          >
            ← Back to My Orders
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-extrabold">
                Order #{order.id}
              </h1>

              <p className="mt-2 text-gray-600">
                Placed on{" "}
                {formatDate(order.created_at)}
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-5 py-2.5 text-sm font-semibold ${getStatusClass(
                status
              )}`}
            >
              {formatStatus(status)}
            </span>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-5xl">
          {message && (
            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-700">
              {message}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
            <div className="space-y-6">
              <div className="rounded-2xl bg-white shadow-sm">
                <div className="border-b px-6 py-5">
                  <h2 className="text-xl font-bold">
                    Order Items
                  </h2>
                </div>

                <div className="divide-y">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 p-6"
                    >
                      <div>
                        <h3 className="font-semibold">
                          {item.product_name}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          ₹{item.price} ×{" "}
                          {item.quantity}
                        </p>
                      </div>

                      <p className="font-bold text-gray-900">
                        ₹{item.subtotal}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">
                  Delivery Address
                </h2>

                <div className="mt-4 rounded-xl bg-gray-50 p-5">
                  <p className="whitespace-pre-wrap font-medium text-gray-700">
                    {order.delivery_address}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">
                  Payment Information
                </h2>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500">
                      Payment Method
                    </p>

                    <p className="mt-1 font-semibold">
                      {formatStatus(
                        order.payment_method
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Payment Status
                    </p>

                    <p
                      className={`mt-1 font-semibold ${
                        order.payment_status ===
                        "paid"
                          ? "text-green-600"
                          : order.payment_status ===
                            "failed"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {formatStatus(
                        order.payment_status
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm lg:sticky lg:top-28">
              <h2 className="text-xl font-bold">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Items</span>

                  <span>
                    {order.items.reduce(
                      (total, item) =>
                        total + item.quantity,
                      0
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>

                  <span>
                    ₹{order.total_amount}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>

                  <span className="font-medium text-green-600">
                    Free
                  </span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">
                      Total
                    </span>

                    <span className="text-2xl font-bold text-orange-600">
                      ₹{order.total_amount}
                    </span>
                  </div>
                </div>
              </div>

              {canCancel && (
                <button
                  onClick={cancelOrder}
                  disabled={cancelling}
                  className="mt-7 w-full rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cancelling
                    ? "Cancelling..."
                    : "Cancel Order"}
                </button>
              )}

              <button
                onClick={() => router.push("/orders")}
                className="mt-3 w-full rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                ← My Orders
              </button>

              <button
                onClick={() => router.push("/menu")}
                className="mt-3 w-full rounded-xl border border-orange-500 px-5 py-3 font-semibold text-orange-600 hover:bg-orange-50"
              >
                Continue Shopping
              </button>
            </aside>
          </div>
        </div>
      </section>

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