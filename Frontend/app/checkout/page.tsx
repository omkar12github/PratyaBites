"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

type Address = {
  id: number;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

const emptyAddress = {
  full_name: "",
  phone: "",
  address_line: "",
  city: "",
  state: "",
  pincode: "",
  is_default: false,
};

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] =
    useState<number | null>(null);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] =
    useState<number | null>(null);
  const [newAddress, setNewAddress] = useState(emptyAddress);

  const [loading, setLoading] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [deletingAddressId, setDeletingAddressId] =
    useState<number | null>(null);
  const [settingDefaultId, setSettingDefaultId] =
    useState<number | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [error, setError] = useState("");
  const [addressMessage, setAddressMessage] = useState("");

  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [onlinePayment, setOnlinePayment] = useState(false);

  const formatAddress = (item: Address) => {
    return `${item.full_name}
${item.phone}
${item.address_line}
${item.city}, ${item.state} - ${item.pincode}`;
  };

  const selectAddress = (item: Address) => {
    setSelectedAddressId(item.id);
    setAddress(formatAddress(item));
    setError("");
    setAddressMessage("");
  };

  const loadAddresses = async () => {
    const response = await apiFetch(
      "/api/accounts/addresses/",
      {
        method: "GET",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail ||
          data.error ||
          "Unable to load addresses."
      );
    }

    const loadedAddresses = Array.isArray(data)
      ? data
      : [];

    setAddresses(loadedAddresses);

    return loadedAddresses;
  };

  const loadCheckout = async () => {
    try {
      setLoading(true);
      setError("");

      const [cartResponse, addressResponse] =
        await Promise.all([
          apiFetch("/api/cart/", {
            method: "GET",
          }),
          apiFetch("/api/accounts/addresses/", {
            method: "GET",
          }),
        ]);

      const cartData = await cartResponse.json();
      const addressData = await addressResponse.json();

      if (!cartResponse.ok) {
        setError(
          cartData.detail ||
            cartData.error ||
            "Unable to load cart."
        );
        return;
      }

      if (!addressResponse.ok) {
        setError(
          addressData.detail ||
            addressData.error ||
            "Unable to load addresses."
        );
        return;
      }

      setCart(cartData);

      const loadedAddresses = Array.isArray(addressData)
        ? addressData
        : [];

      setAddresses(loadedAddresses);

      if (loadedAddresses.length > 0) {
        const defaultAddress =
          loadedAddresses.find(
            (item: Address) => item.is_default
          ) || loadedAddresses[0];

        selectAddress(defaultAddress);
      }
    } catch (error) {
      console.error("Checkout loading error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCheckout();
  }, []);

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

      if (existingScript) {
        existingScript.addEventListener(
          "load",
          () => resolve(true)
        );

        existingScript.addEventListener(
          "error",
          () => resolve(false)
        );

        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const handleNewAddressChange = (
    field: keyof typeof emptyAddress,
    value: string | boolean
  ) => {
    setNewAddress((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const openAddressForm = () => {
    setNewAddress(emptyAddress);
    setEditingAddressId(null);
    setAddressMessage("");
    setError("");
    setShowAddressForm(true);
  };

  const openEditAddressForm = (item: Address) => {
    setNewAddress({
      full_name: item.full_name,
      phone: item.phone,
      address_line: item.address_line,
      city: item.city,
      state: item.state,
      pincode: item.pincode,
      is_default: item.is_default,
    });

    setEditingAddressId(item.id);
    setAddressMessage("");
    setError("");
    setShowAddressForm(true);
  };

  const cancelAddressForm = () => {
    setNewAddress(emptyAddress);
    setEditingAddressId(null);
    setShowAddressForm(false);
    setAddressMessage("");
    setError("");
  };

  const validateAddress = () => {
    if (!newAddress.full_name.trim()) {
      setError("Please enter the full name.");
      return false;
    }

    if (!newAddress.phone.trim()) {
      setError("Please enter the phone number.");
      return false;
    }

    if (!newAddress.address_line.trim()) {
      setError("Please enter the address.");
      return false;
    }

    if (!newAddress.city.trim()) {
      setError("Please enter the city.");
      return false;
    }

    if (!newAddress.state.trim()) {
      setError("Please enter the state.");
      return false;
    }

    if (!newAddress.pincode.trim()) {
      setError("Please enter the pincode.");
      return false;
    }

    if (!/^\d{6}$/.test(newAddress.pincode.trim())) {
      setError("Please enter a valid 6-digit pincode.");
      return false;
    }

    return true;
  };

  const saveAddress = async () => {
    setError("");
    setAddressMessage("");

    if (!validateAddress()) {
      return;
    }

    try {
      setSavingAddress(true);

      const url = editingAddressId
        ? `/api/accounts/addresses/${editingAddressId}/`
        : "/api/accounts/addresses/";

      const method = editingAddressId
        ? "PATCH"
        : "POST";

      const response = await apiFetch(url, {
        method,
        body: JSON.stringify({
          ...newAddress,
          full_name: newAddress.full_name.trim(),
          phone: newAddress.phone.trim(),
          address_line:
            newAddress.address_line.trim(),
          city: newAddress.city.trim(),
          state: newAddress.state.trim(),
          pincode: newAddress.pincode.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            data.error ||
            "Unable to save address."
        );
        return;
      }

      const updatedAddresses =
        await loadAddresses();

      let savedAddress: Address | undefined;

      if (editingAddressId) {
        savedAddress = updatedAddresses.find(
          (item: Address) =>
            item.id === editingAddressId
        );
      } else if (data?.id) {
        savedAddress = updatedAddresses.find(
          (item: Address) => item.id === data.id
        );
      }

      if (!savedAddress) {
        savedAddress = updatedAddresses.find(
          (item: Address) =>
            item.full_name ===
              newAddress.full_name.trim() &&
            item.phone ===
              newAddress.phone.trim() &&
            item.pincode ===
              newAddress.pincode.trim()
        );
      }

      if (savedAddress) {
        selectAddress(savedAddress);
      }

      setNewAddress(emptyAddress);
      setEditingAddressId(null);
      setShowAddressForm(false);

      setAddressMessage(
        editingAddressId
          ? "Address updated and selected successfully."
          : "Address added and selected successfully."
      );
    } catch (error) {
      console.error("Save address error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to connect to server."
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const deleteAddress = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingAddressId(id);
      setError("");
      setAddressMessage("");

      const response = await apiFetch(
        `/api/accounts/addresses/${id}/`,
        {
          method: "DELETE",
        }
      );

      let data: {
        detail?: string;
        error?: string;
      } = {};

      const responseText = await response.text();

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = {};
        }
      }

      if (!response.ok) {
        setError(
          data.detail ||
            data.error ||
            "Unable to delete address."
        );
        return;
      }

      const updatedAddresses =
        await loadAddresses();

      if (selectedAddressId === id) {
        if (updatedAddresses.length > 0) {
          const defaultAddress =
            updatedAddresses.find(
              (item: Address) => item.is_default
            ) || updatedAddresses[0];

          selectAddress(defaultAddress);
        } else {
          setSelectedAddressId(null);
          setAddress("");
        }
      }

      setAddressMessage(
        "Address deleted successfully."
      );
    } catch (error) {
      console.error("Delete address error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to connect to server."
      );
    } finally {
      setDeletingAddressId(null);
    }
  };

  const setDefaultAddress = async (id: number) => {
    try {
      setSettingDefaultId(id);
      setError("");
      setAddressMessage("");

      const response = await apiFetch(
        `/api/accounts/addresses/${id}/`,
        {
          method: "PATCH",
          body: JSON.stringify({
            is_default: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            data.error ||
            "Unable to set default address."
        );
        return;
      }

      const updatedAddresses =
        await loadAddresses();

      const selectedAddress =
        updatedAddresses.find(
          (item: Address) => item.id === id
        );

      if (selectedAddress) {
        selectAddress(selectedAddress);
      }

      setAddressMessage(
        "Default address updated successfully."
      );
    } catch (error) {
      console.error(
        "Default address error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to connect to server."
      );
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleCashOnDelivery = async () => {
    if (!cart || cart.items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const response = await apiFetch(
      "/api/orders/",
      {
        method: "POST",
        body: JSON.stringify({
          delivery_address: address.trim(),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (
        data.unavailable_products &&
        data.unavailable_products.length > 0
      ) {
        setError(
          `Unavailable products: ${data.unavailable_products.join(
            ", "
          )}`
        );
      } else {
        setError(
          data.detail ||
            data.error ||
            "Unable to place order."
        );
      }

      return;
    }

    setOrderId(data.order.id);
    setSuccess(true);
    setCart(null);
  };

  const handleOnlinePayment = async () => {
    if (!cart || cart.items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const scriptLoaded =
      await loadRazorpayScript();

    if (!scriptLoaded) {
      setError(
        "Unable to load Razorpay. Please check your internet connection and try again."
      );
      return;
    }

    const createResponse = await apiFetch(
      "/api/payments/create/",
      {
        method: "POST",
        body: JSON.stringify({
          delivery_address: address.trim(),
        }),
      }
    );

    const createData =
      await createResponse.json();

    if (!createResponse.ok) {
      if (
        createData.unavailable_products &&
        createData.unavailable_products.length > 0
      ) {
        setError(
          `Unavailable products: ${createData.unavailable_products.join(
            ", "
          )}`
        );
      } else {
        setError(
          createData.detail ||
            createData.error ||
            "Unable to create payment."
        );
      }

      return;
    }

    const userData = localStorage.getItem("user");

    let user: {
      username?: string;
      email?: string;
      phone?: string;
    } = {};

    if (userData) {
      try {
        user = JSON.parse(userData);
      } catch {
        user = {};
      }
    }

    const options = {
      key: createData.key_id,
      amount: createData.amount,
      currency: createData.currency,
      name: "PratyaBites",
      description: "Food Order",
      order_id: createData.razorpay_order_id,

      prefill: {
        name: user.username || "",
        email: user.email || "",
        contact: user.phone || "",
      },

      notes: {
        order_id: String(createData.order_id),
      },

      theme: {
        color: "#ea580c",
      },

      handler: async function (
        response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }
      ) {
        try {
          setPlacingOrder(true);
          setError("");

          const verifyResponse =
            await apiFetch(
              "/api/payments/verify/",
              {
                method: "POST",
                body: JSON.stringify({
                  order_id:
                    createData.order_id,
                  razorpay_order_id:
                    response.razorpay_order_id,
                  razorpay_payment_id:
                    response.razorpay_payment_id,
                  razorpay_signature:
                    response.razorpay_signature,
                }),
              }
            );

          const verifyData =
            await verifyResponse.json();

          if (!verifyResponse.ok) {
            setError(
              verifyData.detail ||
                verifyData.error ||
                "Payment verification failed."
            );
            return;
          }

          setOrderId(createData.order_id);
          setOnlinePayment(true);
          setSuccess(true);
          setCart(null);
        } catch (error) {
          console.error(
            "Payment verification error:",
            error
          );

          setError(
            "Payment was completed, but verification failed. Please contact support."
          );
        } finally {
          setPlacingOrder(false);
        }
      },

      modal: {
        ondismiss: async () => {
          try {
            await apiFetch(
              "/api/payments/failure/",
              {
                method: "POST",
                body: JSON.stringify({
                  order_id:
                    createData.order_id,
                }),
              }
            );
          } catch (error) {
            console.error(
              "Payment dismissal error:",
              error
            );
          }

          setPlacingOrder(false);
          setError(
            "Payment was cancelled."
          );
        },
      },
    };

    const razorpay =
      new window.Razorpay(options);

    razorpay.on(
      "payment.failed",
      async (response: any) => {
        console.error(
          "Razorpay payment failed:",
          response
        );

        try {
          await apiFetch(
            "/api/payments/failure/",
            {
              method: "POST",
              body: JSON.stringify({
                order_id:
                  createData.order_id,
              }),
            }
          );
        } catch (error) {
          console.error(
            "Payment failure update error:",
            error
          );
        }

        setPlacingOrder(false);

        setError(
          response?.error?.description ||
            "Payment failed. Please try again."
        );
      }
    );

    razorpay.open();
  };

  const handlePlaceOrder = async () => {
    setError("");

    if (!cart || cart.items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!selectedAddressId && !address.trim()) {
      setError(
        "Please select a saved address or enter a delivery address."
      );
      return;
    }

    if (!address.trim()) {
      setError("Please select a delivery address.");
      return;
    }

    try {
      setPlacingOrder(true);

      if (paymentMethod === "cod") {
        await handleCashOnDelivery();
      } else if (paymentMethod === "razorpay") {
        await handleOnlinePayment();
      } else {
        setError("Please select a payment method.");
      }
    } catch (error) {
      console.error(
        "Place order error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to connect to the server."
      );
    } finally {
      if (paymentMethod === "cod") {
        setPlacingOrder(false);
      }
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50">
        <div className="text-center">
          <div className="text-5xl">🍽️</div>

          <p className="mt-4 text-gray-500">
            Loading checkout...
          </p>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50 px-6">
        <div className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow-lg">
          <div className="text-6xl">🎉</div>

          <h1 className="mt-5 text-3xl font-bold">
            Order Placed Successfully!
          </h1>

          <p className="mt-3 text-gray-500">
            Thank you for ordering from PratyaBites.
          </p>

          {orderId && (
            <div className="mt-6 rounded-xl bg-orange-50 p-4">
              <p className="text-sm text-gray-500">
                Your Order
              </p>

              <p className="mt-1 text-2xl font-bold text-orange-600">
                #{orderId}
              </p>
            </div>
          )}

          <div className="mt-4 rounded-xl bg-green-50 p-4">
            <p className="font-semibold text-green-700">
              Payment Method
            </p>

            <p className="mt-1 text-green-600">
              {onlinePayment
                ? "Online Payment"
                : "Cash on Delivery"}
            </p>

            {onlinePayment && (
              <p className="mt-1 text-sm text-green-600">
                Payment verified successfully.
              </p>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() =>
                router.push(`/orders/${orderId}`)
              }
              className="rounded-xl bg-orange-600 px-7 py-3 font-semibold text-white transition hover:bg-orange-700"
            >
              View Order
            </button>

            <button
              onClick={() => router.push("/orders")}
              className="rounded-xl border border-gray-300 px-7 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              My Orders
            </button>

            <button
              onClick={() => router.push("/menu")}
              className="rounded-xl border border-orange-600 px-7 py-3 font-semibold text-orange-600 transition hover:bg-orange-50"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-orange-50">
        <header className="bg-white px-8 py-6 shadow-sm">
          <h1 className="text-2xl font-bold text-orange-600">
            PratyaBites
          </h1>

          <p className="text-xs text-gray-500">
            Pratya&apos;s Promise, Every Bite.
          </p>
        </header>

        <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
          <div className="text-6xl">🛒</div>

          <h2 className="mt-5 text-2xl font-bold">
            Your cart is empty
          </h2>

          <p className="mt-2 text-gray-500">
            Add some delicious food before checking out.
          </p>

          <button
            onClick={() => router.push("/menu")}
            className="mt-6 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700"
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
          onClick={() => router.push("/cart")}
          className="font-medium text-orange-600 transition hover:text-orange-700"
        >
          ← Back to Cart
        </button>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div>
          <h2 className="text-3xl font-bold">
            Checkout
          </h2>

          <p className="mt-2 text-gray-500">
            Review your order and confirm your delivery details.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-xl font-bold">
                    Delivery Address
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Select or manage your delivery address.
                  </p>
                </div>

                <button
                  onClick={openAddressForm}
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
                >
                  + Add New Address
                </button>
              </div>

              {showAddressForm && (
                <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-bold">
                        {editingAddressId
                          ? "Edit Address"
                          : "Add New Address"}
                      </h4>

                      <p className="mt-1 text-sm text-gray-500">
                        {editingAddressId
                          ? "Update your saved delivery address."
                          : "Enter your delivery details."}
                      </p>
                    </div>

                    <button
                      onClick={cancelAddressForm}
                      className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Full Name
                      </label>

                      <input
                        type="text"
                        value={newAddress.full_name}
                        onChange={(e) =>
                          handleNewAddressChange(
                            "full_name",
                            e.target.value
                          )
                        }
                        placeholder="Enter full name"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Phone
                      </label>

                      <input
                        type="tel"
                        value={newAddress.phone}
                        onChange={(e) =>
                          handleNewAddressChange(
                            "phone",
                            e.target.value
                          )
                        }
                        placeholder="Enter phone number"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium">
                        Address
                      </label>

                      <textarea
                        value={newAddress.address_line}
                        onChange={(e) =>
                          handleNewAddressChange(
                            "address_line",
                            e.target.value
                          )
                        }
                        placeholder="House/Flat, Street, Area"
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        City
                      </label>

                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) =>
                          handleNewAddressChange(
                            "city",
                            e.target.value
                          )
                        }
                        placeholder="Enter city"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        State
                      </label>

                      <input
                        type="text"
                        value={newAddress.state}
                        onChange={(e) =>
                          handleNewAddressChange(
                            "state",
                            e.target.value
                          )
                        }
                        placeholder="Enter state"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Pincode
                      </label>

                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={newAddress.pincode}
                        onChange={(e) =>
                          handleNewAddressChange(
                            "pincode",
                            e.target.value.replace(
                              /\D/g,
                              ""
                            )
                          )
                        }
                        placeholder="6-digit pincode"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                  </div>

                  <label className="mt-4 flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newAddress.is_default}
                      onChange={(e) =>
                        handleNewAddressChange(
                          "is_default",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 accent-orange-600"
                    />

                    <span className="text-sm font-medium">
                      Set as default address
                    </span>
                  </label>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={saveAddress}
                      disabled={savingAddress}
                      className="rounded-lg bg-orange-600 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingAddress
                        ? "Saving..."
                        : editingAddressId
                        ? "Update Address"
                        : "Save Address"}
                    </button>

                    <button
                      onClick={cancelAddressForm}
                      disabled={savingAddress}
                      className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {addresses.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {addresses.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-xl border p-4 transition ${
                        selectedAddressId === item.id
                          ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <button
                        onClick={() => selectAddress(item)}
                        className="w-full text-left"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold">
                                {item.full_name}
                              </h4>

                              {item.is_default && (
                                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                                  Default
                                </span>
                              )}

                              {selectedAddressId ===
                                item.id && (
                                <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                                  Selected
                                </span>
                              )}
                            </div>

                            <p className="mt-2 text-sm text-gray-600">
                              📞 {item.phone}
                            </p>

                            <p className="mt-2 text-sm text-gray-700">
                              {item.address_line}
                            </p>

                            <p className="text-sm text-gray-700">
                              {item.city}, {item.state} -{" "}
                              {item.pincode}
                            </p>
                          </div>

                          <div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                              selectedAddressId === item.id
                                ? "border-orange-500 bg-orange-500"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedAddressId ===
                              item.id && (
                              <span className="text-xs font-bold text-white">
                                ✓
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200 pt-4">
                        <button
                          onClick={() =>
                            openEditAddressForm(item)
                          }
                          disabled={
                            savingAddress ||
                            deletingAddressId !== null ||
                            settingDefaultId !== null
                          }
                          className="rounded-lg border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 disabled:opacity-50"
                        >
                          ✏️ Edit
                        </button>

                        {!item.is_default && (
                          <button
                            onClick={() =>
                              setDefaultAddress(item.id)
                            }
                            disabled={
                              settingDefaultId !== null ||
                              deletingAddressId !== null ||
                              savingAddress
                            }
                            className="rounded-lg border border-green-500 px-4 py-2 text-sm font-semibold text-green-600 transition hover:bg-green-50 disabled:opacity-50"
                          >
                            {settingDefaultId === item.id
                              ? "Setting..."
                              : "⭐ Set Default"}
                          </button>
                        )}

                        <button
                          onClick={() =>
                            deleteAddress(item.id)
                          }
                          disabled={
                            deletingAddressId !== null ||
                            settingDefaultId !== null ||
                            savingAddress
                          }
                          className="rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingAddressId === item.id
                            ? "Deleting..."
                            : "🗑️ Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !showAddressForm && (
                  <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-8 text-center">
                    <div className="text-4xl">🏠</div>

                    <p className="mt-3 font-semibold">
                      No saved addresses
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Add your first delivery address.
                    </p>

                    <button
                      onClick={openAddressForm}
                      className="mt-4 rounded-lg bg-orange-600 px-5 py-2 font-semibold text-white transition hover:bg-orange-700"
                    >
                      Add Address
                    </button>
                  </div>
                )
              )}

              <div className="mt-6">
                <label className="font-semibold">
                  Delivery Address
                </label>

                <textarea
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setSelectedAddressId(null);
                  }}
                  placeholder="Enter your complete delivery address..."
                  rows={5}
                  className="mt-3 w-full rounded-xl border border-gray-300 p-4 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

                <p className="mt-2 text-xs text-gray-500">
                  You can edit the selected address before placing
                  your order.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold">
                Payment Method
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Select your preferred payment method.
              </p>

              <div className="mt-5 space-y-4">
                <label
                  className={`block cursor-pointer rounded-xl border-2 p-5 transition ${
                    paymentMethod === "cod"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                      className="h-5 w-5 accent-orange-600"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          💵
                        </span>

                        <p className="font-semibold">
                          Cash on Delivery
                        </p>
                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        Pay when your order is delivered.
                      </p>
                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Available
                    </span>
                  </div>
                </label>

                <label
                  className={`block cursor-pointer rounded-xl border-2 p-5 transition ${
                    paymentMethod === "razorpay"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={
                        paymentMethod === "razorpay"
                      }
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                      className="h-5 w-5 accent-orange-600"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          💳
                        </span>

                        <p className="font-semibold">
                          Online Payment
                        </p>
                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        Pay securely using Razorpay.
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      Razorpay
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {addressMessage && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                ✓ {addressMessage}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                <div className="flex gap-3">
                  <span>⚠️</span>

                  <p>{error}</p>
                </div>
              </div>
            )}
          </div>

          <div className="h-fit rounded-2xl bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <h3 className="text-xl font-bold">
              Order Summary
            </h3>

            <div className="mt-6 space-y-5">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {item.product_name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      ₹{item.product_price} ×{" "}
                      {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 font-semibold">
                    ₹{item.subtotal}
                  </p>
                </div>
              ))}
            </div>

            <div className="my-6 border-t" />

            <div className="flex justify-between text-sm text-gray-500">
              <span>Items</span>

              <span>
                {cart.items.reduce(
                  (total, item) =>
                    total + item.quantity,
                  0
                )}
              </span>
            </div>

            <div className="mt-3 flex justify-between text-sm text-gray-500">
              <span>Delivery</span>

              <span className="font-medium text-green-600">
                Free
              </span>
            </div>

            <div className="my-5 border-t" />

            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>

              <span className="text-orange-600">
                ₹{cart.total_price}
              </span>
            </div>

            <div className="mt-5 rounded-xl bg-orange-50 p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {paymentMethod === "cod"
                    ? "💵"
                    : "💳"}
                </span>

                <div>
                  <p className="text-sm font-semibold text-orange-700">
                    {paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : "Online Payment"}
                  </p>

                  <p className="mt-1 text-xs text-orange-600">
                    {paymentMethod === "cod"
                      ? "Pay when your order arrives."
                      : "Secure payment through Razorpay."}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="mt-6 w-full rounded-xl bg-orange-600 py-3.5 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {placingOrder
                ? paymentMethod === "razorpay"
                  ? "Opening Payment..."
                  : "Placing Order..."
                : paymentMethod === "razorpay"
                ? `Pay ₹${cart.total_price}`
                : `Place Order • ₹${cart.total_price}`}
            </button>

            <p className="mt-4 text-center text-xs text-gray-400">
              By placing your order, you confirm that your
              delivery details are correct.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}