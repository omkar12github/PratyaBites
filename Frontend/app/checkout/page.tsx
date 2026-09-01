"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<Cart | null>(null);

  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);

  const [placingOrder, setPlacingOrder] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);

  const [orderId, setOrderId] = useState<number | null>(null);


  // ==========================================================
  // LOAD CART
  // ==========================================================

  useEffect(() => {
    const loadCart = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/cart/",
          {
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
            "Unable to load cart."
          );
          return;
        }

        setCart(data);

      } catch (error) {
        console.error(error);
        setError("Unable to connect to server.");
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [router]);


  // ==========================================================
  // PLACE ORDER
  // ==========================================================

  const handlePlaceOrder = async () => {
    setError("");

    if (!address.trim()) {
      setError("Please enter your delivery address.");
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setPlacingOrder(true);

      const response = await fetch(
        "http://127.0.0.1:8000/api/orders/",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            delivery_address: address.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
          data.error ||
          "Unable to place order."
        );
        return;
      }

      console.log("Order created:", data);

      setOrderId(data.order.id);

      setSuccess(true);

      setCart(null);

    } catch (error) {
      console.error("Order error:", error);

      setError(
        "Unable to connect to the server."
      );

    } finally {
      setPlacingOrder(false);
    }
  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50">
        <p className="text-gray-500">
          Loading checkout...
        </p>
      </main>
    );
  }


  // ==========================================================
  // SUCCESS
  // ==========================================================

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50 px-6">

        <div className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow-lg">

          <div className="text-6xl">
            🎉
          </div>

          <h1 className="mt-5 text-3xl font-bold">
            Order Placed!
          </h1>

          <p className="mt-3 text-gray-500">
            Thank you for ordering from PratyaBites.
          </p>

          {orderId && (
            <p className="mt-4 font-semibold text-orange-600">
              Order #{orderId}
            </p>
          )}

          <button
            onClick={() => router.push("/menu")}
            className="mt-8 rounded-xl bg-orange-600 px-7 py-3 font-semibold text-white hover:bg-orange-700"
          >
            Continue Shopping
          </button>

        </div>

      </main>
    );
  }


  // ==========================================================
  // EMPTY CART
  // ==========================================================

  if (!cart || cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-orange-50">

        <header className="bg-white px-8 py-6 shadow-sm">

          <h1 className="text-2xl font-bold text-orange-600">
            PratyaBites
          </h1>

        </header>

        <section className="flex min-h-[70vh] flex-col items-center justify-center">

          <div className="text-6xl">
            🛒
          </div>

          <h2 className="mt-5 text-2xl font-bold">
            Your cart is empty
          </h2>

          <button
            onClick={() => router.push("/menu")}
            className="mt-6 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white"
          >
            Browse Menu
          </button>

        </section>

      </main>
    );
  }


  // ==========================================================
  // CHECKOUT PAGE
  // ==========================================================

  return (
    <main className="min-h-screen bg-orange-50">

      {/* Header */}

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
          onClick={() => router.push("/cart")}
          className="font-medium text-orange-600 hover:text-orange-700"
        >
          ← Back to Cart
        </button>

      </header>


      {/* Checkout */}

      <section className="mx-auto max-w-6xl px-6 py-12">

        <h2 className="text-3xl font-bold">
          Checkout
        </h2>

        <p className="mt-2 text-gray-500">
          Enter your delivery details and place your order.
        </p>


        <div className="mt-8 grid gap-8 lg:grid-cols-3">

          {/* Delivery Address */}

          <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">

            <h3 className="text-xl font-bold">
              Delivery Address
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Where should we deliver your order?
            </p>


            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your complete delivery address..."
              rows={6}
              className="mt-5 w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-orange-500"
            />


            {error && (
              <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

          </div>


          {/* Order Summary */}

          <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">

            <h3 className="text-xl font-bold">
              Order Summary
            </h3>


            <div className="mt-6 space-y-4">

              {cart.items.map((item) => (

                <div
                  key={item.id}
                  className="flex justify-between gap-4"
                >

                  <div>

                    <p className="font-medium">
                      {item.product_name}
                    </p>

                    <p className="text-sm text-gray-500">
                      ₹{item.product_price} × {item.quantity}
                    </p>

                  </div>

                  <p className="font-semibold">
                    ₹{item.subtotal}
                  </p>

                </div>

              ))}

            </div>


            <div className="my-6 border-t" />


            <div className="flex justify-between text-lg font-bold">

              <span>
                Total
              </span>

              <span className="text-orange-600">
                ₹{cart.total_price}
              </span>

            </div>


            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="mt-6 w-full rounded-xl bg-orange-600 py-3 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {placingOrder
                ? "Placing Order..."
                : "Place Order"}

            </button>

          </div>

        </div>

      </section>

    </main>
  );
}