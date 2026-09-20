"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type CartItem = {
  id: number;
  product: number;
  product_name: string;
  product_price: string;
  quantity: number;
  subtotal: string;
};

type Cart = {
  id: number;
  items: CartItem[];
  total_price: string;
};

type User = {
  username: string;
  email?: string;
  phone?: string;
};

export default function CartPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState<number | null>(null);
  const [error, setError] = useState("");

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

  const getCart = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/api/cart/", {
        method: "GET",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            data.error ||
            "Unable to load cart."
        );
        return;
      }

      setCart(data);
    } catch (error) {
      console.error("Cart error:", error);
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCart();
  }, []);

  const updateQuantity = async (
    item: CartItem,
    quantity: number
  ) => {
    if (quantity < 1) {
      return;
    }

    try {
      setUpdatingItem(item.id);
      setError("");

      const response = await apiFetch(
        `/api/cart/item/${item.id}/`,
        {
          method: "PATCH",
          body: JSON.stringify({
            quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            data.error ||
            "Unable to update cart."
        );
        return;
      }

      setCart(data);
    } catch (error) {
      console.error("Quantity update error:", error);
      setError("Unable to connect to server.");
    } finally {
      setUpdatingItem(null);
    }
  };

  const increaseQuantity = async (item: CartItem) => {
    await updateQuantity(
      item,
      item.quantity + 1
    );
  };

  const decreaseQuantity = async (item: CartItem) => {
    if (item.quantity <= 1) {
      return;
    }

    await updateQuantity(
      item,
      item.quantity - 1
    );
  };

  const removeItem = async (itemId: number) => {
    try {
      setUpdatingItem(itemId);
      setError("");

      const response = await apiFetch(
        `/api/cart/item/${itemId}/`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            data.error ||
            "Unable to remove item."
        );
        return;
      }

      setCart(data);
    } catch (error) {
      console.error("Remove item error:", error);
      setError("Unable to connect to server.");
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    setUser(null);

    router.push("/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl">🛒</div>

          <p className="mt-4 text-gray-500">
            Loading cart...
          </p>
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
              className="font-semibold text-orange-600"
            >
              Cart
            </button>

            {user && (
              <>
                <button
                  onClick={() => router.push("/orders")}
                  className="hover:text-orange-600"
                >
                  My Orders
                </button>

                <button
                  onClick={() => router.push("/profile")}
                  className="hover:text-orange-600"
                >
                  Profile
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => router.push("/menu")}
              className="rounded-lg px-2 py-2 font-medium hover:bg-orange-50 hover:text-orange-600 sm:px-3"
            >
              🍔
              <span className="hidden sm:inline">
                {" "}Menu
              </span>
            </button>

            {user && (
              <>
                <button
                  onClick={() => router.push("/orders")}
                  className="hidden rounded-lg px-3 py-2 font-medium hover:bg-orange-50 hover:text-orange-600 sm:block"
                >
                  📦 My Orders
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
              </>
            )}

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

      <section className="bg-orange-50 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <button
            onClick={() => router.push("/menu")}
            className="mb-5 text-sm font-medium text-orange-600 hover:underline"
          >
            ← Continue Shopping
          </button>

          <h1 className="text-4xl font-extrabold">
            Your Cart 🛒
          </h1>

          <p className="mt-2 text-gray-600">
            Review your items before checkout.
          </p>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!cart || cart.items.length === 0 ? (
            <div className="rounded-2xl bg-white px-6 py-20 text-center shadow-sm">
              <div className="text-7xl">🛒</div>

              <h2 className="mt-6 text-2xl font-bold">
                Your cart is empty
              </h2>

              <p className="mx-auto mt-2 max-w-md text-gray-500">
                Add some delicious food to your cart and
                come back here to checkout.
              </p>

              <button
                onClick={() => router.push("/menu")}
                className="mt-7 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <h2 className="text-lg font-bold">
                          {item.product_name}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          ₹{item.product_price} per item
                        </p>

                        <p className="mt-2 font-semibold text-orange-600">
                          ₹{item.subtotal}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-5 sm:justify-end">
                        <div className="flex items-center overflow-hidden rounded-xl border border-gray-200">
                          <button
                            onClick={() =>
                              decreaseQuantity(item)
                            }
                            disabled={
                              updatingItem === item.id ||
                              item.quantity <= 1
                            }
                            className="px-4 py-2 text-lg font-bold hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            −
                          </button>

                          <span className="min-w-12 border-x border-gray-200 px-4 py-2 text-center font-semibold">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              increaseQuantity(item)
                            }
                            disabled={
                              updatingItem === item.id
                            }
                            className="px-4 py-2 text-lg font-bold hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            removeItem(item.id)
                          }
                          disabled={
                            updatingItem === item.id
                          }
                          className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-fit rounded-2xl bg-white p-6 shadow-sm lg:sticky lg:top-28">
                <h2 className="text-xl font-bold">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between text-gray-600">
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

                  <div className="flex justify-between text-gray-600">
                    <span>
                      Subtotal
                    </span>

                    <span>
                      ₹{cart.total_price}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>
                      Delivery
                    </span>

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
                        ₹{cart.total_price}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/checkout")}
                  className="mt-7 w-full rounded-xl bg-orange-600 px-5 py-4 font-bold text-white transition hover:bg-orange-700 active:scale-[0.99]"
                >
                  Proceed to Checkout →
                </button>

                <button
                  onClick={() => router.push("/menu")}
                  className="mt-3 w-full rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
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