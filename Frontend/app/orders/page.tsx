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
  username: string;
  items: OrderItem[];
  total_amount: string;
  delivery_address: string;
  status: string;
  created_at: string;
};

const statuses = [
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

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await apiFetch("/api/orders/", {
        method: "GET",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            data.error ||
            "Unable to load orders."
        );
        return;
      }

      setOrders(data);
    } catch (error) {
      console.error("Orders error:", error);
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "confirmed":
        return "bg-blue-100 text-blue-700";

      case "preparing":
        return "bg-orange-100 text-orange-700";

      case "out_for_delivery":
        return "bg-purple-100 text-purple-700";

      case "delivered":
        return "bg-green-100 text-green-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIndex = (status: string) => {
    return statuses.findIndex(
      (item) => item.key === status
    );
  };

  return (
    <main className="min-h-screen bg-orange-50">

      <nav className="flex items-center justify-between bg-white px-8 py-5 shadow-sm">

        <div>
          <button
            onClick={() => router.push("/menu")}
            className="text-2xl font-bold text-orange-600"
          >
            PratyaBites
          </button>

          <p className="text-xs text-gray-500">
            Pratya&apos;s Promise, Every Bite.
          </p>
        </div>

        <div className="flex items-center gap-4">

          <button
            onClick={() => router.push("/menu")}
            className="font-medium text-gray-700 hover:text-orange-600"
          >
            Menu
          </button>

          <button
            onClick={() => router.push("/cart")}
            className="font-medium text-gray-700 hover:text-orange-600"
          >
            🛒 Cart
          </button>

        </div>

      </nav>

      <section className="mx-auto max-w-5xl px-6 py-12">

        <div className="mb-8">

          <h1 className="text-3xl font-bold">
            My Orders 📦
          </h1>

          <p className="mt-2 text-gray-500">
            View your previous PratyaBites orders.
          </p>

        </div>

        {loading && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

            <p className="text-gray-500">
              Loading your orders...
            </p>

          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl bg-red-50 p-5 text-red-600">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          orders.length === 0 && (

            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

              <div className="text-6xl">
                📦
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                No orders yet
              </h2>

              <p className="mt-2 text-gray-500">
                Your completed orders will appear here.
              </p>

              <button
                onClick={() => router.push("/menu")}
                className="mt-6 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700"
              >
                Browse Menu
              </button>

            </div>
          )}

        {!loading &&
          !error &&
          orders.length > 0 && (

            <div className="space-y-6">

              {orders.map((order) => {

                const currentStatusIndex =
                  getStatusIndex(order.status);

                return (

                  <div
                    key={order.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm"
                  >

                    <div className="flex flex-col justify-between gap-4 border-b p-6 sm:flex-row sm:items-center">

                      <div>

                        <button
                          onClick={() =>
                            router.push(
                              `/orders/${order.id}`
                            )
                          }
                          className="text-left text-lg font-bold hover:text-orange-600"
                        >
                          Order #{order.id}
                        </button>

                        <p className="mt-1 text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </p>

                      </div>

                      <button
                        onClick={() =>
                          router.push(
                            `/orders/${order.id}`
                          )
                        }
                        className={`w-fit rounded-full px-4 py-2 text-sm font-semibold capitalize ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {order.status.replaceAll(
                          "_",
                          " "
                        )}
                      </button>

                    </div>

                    <div className="border-b p-6">

                      <h3 className="mb-6 text-lg font-bold">
                        Order Status
                      </h3>

                      <div className="space-y-0">

                        {statuses.map((status, index) => {

                          const completed =
                            index <= currentStatusIndex;

                          const active =
                            index === currentStatusIndex;

                          return (

                            <div
                              key={status.key}
                              className="flex items-start"
                            >

                              <div className="flex flex-col items-center">

                                <div
                                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                                    completed
                                      ? "bg-orange-600 text-white"
                                      : "bg-gray-200 text-gray-500"
                                  } ${
                                    active
                                      ? "ring-4 ring-orange-100"
                                      : ""
                                  }`}
                                >
                                  {completed
                                    ? "✓"
                                    : index + 1}
                                </div>

                                {index <
                                  statuses.length - 1 && (

                                  <div
                                    className={`h-10 w-0.5 ${
                                      index <
                                      currentStatusIndex
                                        ? "bg-orange-600"
                                        : "bg-gray-200"
                                    }`}
                                  />

                                )}

                              </div>

                              <div className="ml-4 pt-1">

                                <p
                                  className={`font-semibold ${
                                    completed
                                      ? "text-orange-600"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {status.label}
                                </p>

                                {active && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    Current order status
                                  </p>
                                )}

                              </div>

                            </div>

                          );

                        })}

                      </div>

                    </div>

                    <div className="space-y-4 p-6">

                      {order.items.map((item) => (

                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4"
                        >

                          <div>

                            <h3 className="font-semibold">
                              {item.product_name}
                            </h3>

                            <p className="text-sm text-gray-500">
                              ₹{item.price} × {item.quantity}
                            </p>

                          </div>

                          <p className="font-semibold">
                            ₹{item.subtotal}
                          </p>

                        </div>

                      ))}

                    </div>

                    <div className="border-t bg-gray-50 p-6">

                      <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">

                        <div>

                          <p className="text-sm font-semibold text-gray-700">
                            Delivery Address
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {order.delivery_address}
                          </p>

                        </div>

                        <div className="sm:text-right">

                          <p className="text-sm text-gray-500">
                            Order Total
                          </p>

                          <p className="mt-1 text-xl font-bold text-orange-600">
                            ₹{order.total_amount}
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="border-t p-5">

                      <button
                        onClick={() =>
                          router.push(
                            `/orders/${order.id}`
                          )
                        }
                        className="w-full rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
                      >
                        View Order Details →
                      </button>

                    </div>

                  </div>

                );
              })}

            </div>
          )}

      </section>

    </main>
  );
}