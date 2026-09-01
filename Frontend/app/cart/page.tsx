"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface CartItem {
  id: number;
  product: number;
  product_name: string;
  product_price: string;
  quantity: number;
  subtotal: string;
}

interface Cart {
  id: number;
  items: CartItem[];
  total_price: string;
}

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const getCart = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await apiFetch("/api/cart/", {
        method: "GET",
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        return;
      }

      setCart(data);
    } catch (error) {
      console.error("Cart error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCart();
  }, []);

  const increaseQuantity = async (item: CartItem) => {
    await updateQuantity(item.id, item.quantity + 1);
  };

  const decreaseQuantity = async (item: CartItem) => {
    if (item.quantity === 1) {
      await removeItem(item.id);
      return;
    }

    await updateQuantity(item.id, item.quantity - 1);
  };

  const updateQuantity = async (
    itemId: number,
    quantity: number
  ) => {
    try {
      const response = await apiFetch(
        `/api/cart/item/${itemId}/`,
        {
          method: "PATCH",
          body: JSON.stringify({
            quantity: quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        return;
      }

      setCart(data);
    } catch (error) {
      console.error("Update quantity error:", error);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      const response = await apiFetch(
        `/api/cart/item/${itemId}/`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        return;
      }

      setCart(data);
    } catch (error) {
      console.error("Remove item error:", error);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50">
        <p className="text-gray-500">
          Loading cart...
        </p>
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
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
            onClick={() => router.push("/menu")}
            className="font-medium text-orange-600 hover:text-orange-700"
          >
            ← Continue Shopping
          </button>

        </header>

        <section className="flex min-h-[60vh] flex-col items-center justify-center">

          <div className="text-6xl">
            🛒
          </div>

          <h2 className="mt-4 text-2xl font-bold">
            Your cart is empty
          </h2>

          <p className="mt-2 text-gray-500">
            Add some delicious food to your cart.
          </p>

          <button
            onClick={() => router.push("/menu")}
            className="mt-6 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700"
          >
            Browse Menu
          </button>

        </section>

      </main>
    );
  }

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
          onClick={() => router.push("/menu")}
          className="font-medium text-orange-600 hover:text-orange-700"
        >
          ← Continue Shopping
        </button>

      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">

        <h2 className="text-3xl font-bold">
          Your Cart 🛒
        </h2>

        <p className="mt-2 text-gray-500">
          Review your selected items.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">

          <div className="space-y-4 lg:col-span-2">

            {cart.items.map((item) => (

              <div
                key={item.id}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >

                <div className="flex items-center justify-between">

                  <div>

                    <h3 className="text-lg font-bold">
                      {item.product_name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      ₹{item.product_price} × {item.quantity}
                    </p>

                  </div>

                  <p className="font-bold text-orange-600">
                    ₹{item.subtotal}
                  </p>

                </div>

                <div className="mt-5 flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <button
                      onClick={() => decreaseQuantity(item)}
                      className="h-9 w-9 rounded-lg border border-gray-300 font-bold hover:bg-gray-100"
                    >
                      −
                    </button>

                    <span className="w-6 text-center font-semibold">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => increaseQuantity(item)}
                      className="h-9 w-9 rounded-lg bg-orange-600 font-bold text-white hover:bg-orange-700"
                    >
                      +
                    </button>

                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-sm font-semibold text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>

                </div>

              </div>

            ))}

          </div>

          <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">

            <h3 className="text-xl font-bold">
              Order Summary
            </h3>

            <div className="mt-6 flex justify-between text-gray-600">

              <span>
                Items
              </span>

              <span>
                {cart.items.reduce(
                  (total, item) =>
                    total + item.quantity,
                  0
                )}
              </span>

            </div>

            <div className="my-5 border-t" />

            <div className="flex justify-between text-lg font-bold">

              <span>
                Total
              </span>

              <span className="text-orange-600">
                ₹{cart.total_price}
              </span>

            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="mt-6 w-full rounded-xl bg-orange-600 py-3 font-semibold text-white hover:bg-orange-700"
            >
              Proceed to Checkout
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}