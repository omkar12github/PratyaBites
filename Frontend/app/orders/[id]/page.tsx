"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
];

const statusLabels: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const orderId = params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/orders/${orderId}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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
      console.error("Order details error:", error);
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

  const getCurrentStatusIndex = () => {
    if (!order) {
      return -1;
    }

    return statuses.indexOf(order.status);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-orange-50">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <p className="text-gray-500">
            Loading order details...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-orange-50">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="rounded-2xl bg-red-50 p-6 text-red-600">
            {error}
          </div>

          <button
            onClick={() => router.push("/orders")}
            className="mt-6 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700"
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

  const currentStatusIndex = getCurrentStatusIndex();

  return (
    <main className="min-h-screen bg-orange-50">

      <nav className="flex items-center justify-between bg-white px-8 py-5 shadow-sm">

        <div>
          <button
            onClick={() => router.push("/")}
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

        <button
          onClick={() => router.push("/orders")}
          className="mb-6 font-medium text-orange-600 hover:text-orange-700"
        >
          ← Back to My Orders
        </button>

        <div className="rounded-2xl bg-white shadow-sm">

          <div className="flex flex-col justify-between gap-4 border-b p-6 sm:flex-row sm:items-center">

            <div>
              <h1 className="text-2xl font-bold">
                Order #{order.id}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                {formatDate(order.created_at)}
              </p>
            </div>

            <span className="w-fit rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold capitalize text-orange-700">
              {order.status.replaceAll("_", " ")}
            </span>

          </div>

          <div className="border-b p-6">

            <h2 className="mb-6 text-xl font-bold">
              Order Status
            </h2>

            <div className="space-y-0">

              {statuses.map((status, index) => {

                const completed =
                  index <= currentStatusIndex;

                const current =
                  index === currentStatusIndex;

                return (
                  <div
                    key={status}
                    className="flex items-start"
                  >

                    <div className="flex flex-col items-center">

                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
                          completed
                            ? "bg-orange-600 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {completed ? "✓" : index + 1}
                      </div>

                      {index < statuses.length - 1 && (
                        <div
                          className={`h-12 w-0.5 ${
                            index < currentStatusIndex
                              ? "bg-orange-600"
                              : "bg-gray-200"
                          }`}
                        />
                      )}

                    </div>

                    <div className="ml-4 pb-6">

                      <p
                        className={`font-semibold ${
                          completed
                            ? "text-orange-600"
                            : "text-gray-500"
                        }`}
                      >
                        {statusLabels[status]}
                      </p>

                      {current && (
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

          <div className="border-b p-6">

            <h2 className="mb-5 text-xl font-bold">
              Ordered Items
            </h2>

            <div className="space-y-5">

              {order.items.map((item) => (

                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4"
                >

                  <div>
                    <h3 className="font-semibold">
                      {item.product_name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold">
                    ₹{item.subtotal}
                  </p>

                </div>

              ))}

            </div>

          </div>

          <div className="border-b bg-gray-50 p-6">

            <h2 className="text-xl font-bold">
              Delivery Address
            </h2>

            <p className="mt-2 text-gray-600">
              {order.delivery_address}
            </p>

          </div>

          <div className="flex items-center justify-between p-6">

            <p className="text-lg font-semibold">
              Total Amount
            </p>

            <p className="text-2xl font-bold text-orange-600">
              ₹{order.total_amount}
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}