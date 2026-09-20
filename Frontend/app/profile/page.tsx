"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

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

type User = {
  id: number;
  username: string;
  email: string;
  phone: string;
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

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [addressMessage, setAddressMessage] = useState("");
  const [error, setError] = useState("");

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] =
    useState<number | null>(null);

  const [address, setAddress] = useState(emptyAddress);

  const fetchProfile = async () => {
    const response = await apiFetch(
      "/api/accounts/profile/",
      {
        method: "GET",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail ||
          data.error ||
          "Unable to load profile."
      );
    }

    setUser(data);
    setEmail(data.email);
    setPhone(data.phone || "");
  };

  const fetchAddresses = async () => {
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

    setAddresses(
      Array.isArray(data) ? data : []
    );
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchProfile(),
        fetchAddresses(),
      ]);
    } catch (error) {
      console.error("Profile error:", error);

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
    loadData();
  }, []);

  const updateProfile = async () => {
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setSavingProfile(true);
      setProfileMessage("");
      setError("");

      const response = await apiFetch(
        "/api/accounts/profile/",
        {
          method: "PATCH",
          body: JSON.stringify({
            email: email.trim(),
            phone: phone.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            data.error ||
            "Unable to update profile."
        );
        return;
      }

      const updatedUser = data.user || data;

      setUser(updatedUser);

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setEmail(updatedUser.email || "");
      setPhone(updatedUser.phone || "");

      setProfileMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error("Profile update error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to connect to server."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddressChange = (
    field: keyof typeof emptyAddress,
    value: string | boolean
  ) => {
    setAddress((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const validateAddress = () => {
    if (!address.full_name.trim()) {
      setError("Full name is required.");
      return false;
    }

    if (!address.phone.trim()) {
      setError("Phone number is required.");
      return false;
    }

    if (!address.address_line.trim()) {
      setError("Address is required.");
      return false;
    }

    if (!address.city.trim()) {
      setError("City is required.");
      return false;
    }

    if (!address.state.trim()) {
      setError("State is required.");
      return false;
    }

    if (!/^\d{6}$/.test(address.pincode.trim())) {
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
          ...address,
          full_name: address.full_name.trim(),
          phone: address.phone.trim(),
          address_line:
            address.address_line.trim(),
          city: address.city.trim(),
          state: address.state.trim(),
          pincode: address.pincode.trim(),
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

      await fetchAddresses();

      setAddress(emptyAddress);
      setEditingAddressId(null);
      setShowAddressForm(false);

      setAddressMessage(
        editingAddressId
          ? "Address updated successfully."
          : "Address added successfully."
      );
    } catch (error) {
      console.error("Address save error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to connect to server."
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const editAddress = (item: Address) => {
    setAddress({
      full_name: item.full_name,
      phone: item.phone,
      address_line: item.address_line,
      city: item.city,
      state: item.state,
      pincode: item.pincode,
      is_default: item.is_default,
    });

    setEditingAddressId(item.id);
    setShowAddressForm(true);
    setAddressMessage("");
    setError("");
  };

  const deleteAddress = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) {
      return;
    }

    try {
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

      await fetchAddresses();

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
    }
  };

  const setDefaultAddress = async (id: number) => {
    try {
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

      await fetchAddresses();

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
    }
  };

  const cancelAddressForm = () => {
    setAddress(emptyAddress);
    setEditingAddressId(null);
    setShowAddressForm(false);
    setAddressMessage("");
    setError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    setUser(null);

    router.push("/login");
  };

  const Navigation = () => (
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
            className="hover:text-orange-600"
          >
            My Orders
          </button>

          <button
            onClick={() => router.push("/profile")}
            className="font-semibold text-orange-600"
          >
            Profile
          </button>
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
            onClick={() => router.push("/orders")}
            className="hidden rounded-lg px-3 py-2 font-medium hover:bg-orange-50 hover:text-orange-600 sm:block"
          >
            📦 My Orders
          </button>

          <button
            onClick={() => router.push("/profile")}
            className="rounded-lg px-3 py-2 font-medium text-orange-600 hover:bg-orange-50"
          >
            👤
            <span className="hidden sm:inline">
              {" "}Profile
            </span>
          </button>

          {user && (
            <span className="hidden font-medium text-gray-700 lg:block">
              Hi, {user.username}
            </span>
          )}

          <button
            onClick={handleLogout}
            className="rounded-full bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 sm:px-5"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="flex min-h-[70vh] items-center justify-center">
          <p className="text-lg text-gray-600">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="rounded-xl bg-white p-8 text-center shadow">
            <p className="text-red-600">
              Unable to load profile.
            </p>

            <button
              onClick={() => router.push("/login")}
              className="mt-5 rounded-lg bg-orange-500 px-5 py-2 text-white hover:bg-orange-600"
            >
              Login
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            My Profile
          </h1>

          <p className="mt-1 text-gray-500">
            Manage your account and delivery addresses
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-5 text-xl font-bold">
            Personal Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Username
              </label>

              <input
                type="text"
                value={user.username}
                disabled
                className="w-full rounded-lg border bg-gray-100 px-4 py-3 text-gray-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                className="w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {profileMessage && (
              <p className="font-medium text-green-600">
                {profileMessage}
              </p>
            )}

            <button
              onClick={updateProfile}
              disabled={savingProfile}
              className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {savingProfile
                ? "Saving..."
                : "Save Profile"}
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold">
              Delivery Addresses
            </h2>

            {!showAddressForm && (
              <button
                onClick={() => {
                  setAddress(emptyAddress);
                  setEditingAddressId(null);
                  setShowAddressForm(true);
                  setAddressMessage("");
                  setError("");
                }}
                className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600"
              >
                + Add Address
              </button>
            )}
          </div>

          {addressMessage && (
            <p className="mb-4 font-medium text-green-600">
              {addressMessage}
            </p>
          )}

          {showAddressForm && (
            <div className="mb-6 rounded-xl border bg-gray-50 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">
                  {editingAddressId
                    ? "Edit Address"
                    : "Add New Address"}
                </h3>

                <button
                  onClick={cancelAddressForm}
                  className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={address.full_name}
                  onChange={(e) =>
                    handleAddressChange(
                      "full_name",
                      e.target.value
                    )
                  }
                  className="rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />

                <input
                  type="tel"
                  placeholder="Phone"
                  value={address.phone}
                  onChange={(e) =>
                    handleAddressChange(
                      "phone",
                      e.target.value
                    )
                  }
                  className="rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />

                <textarea
                  placeholder="Address"
                  value={address.address_line}
                  onChange={(e) =>
                    handleAddressChange(
                      "address_line",
                      e.target.value
                    )
                  }
                  rows={3}
                  className="rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 md:col-span-2"
                />

                <input
                  type="text"
                  placeholder="City"
                  value={address.city}
                  onChange={(e) =>
                    handleAddressChange(
                      "city",
                      e.target.value
                    )
                  }
                  className="rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />

                <input
                  type="text"
                  placeholder="State"
                  value={address.state}
                  onChange={(e) =>
                    handleAddressChange(
                      "state",
                      e.target.value
                    )
                  }
                  className="rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />

                <input
                  type="text"
                  placeholder="Pincode"
                  inputMode="numeric"
                  maxLength={6}
                  value={address.pincode}
                  onChange={(e) =>
                    handleAddressChange(
                      "pincode",
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  className="rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <label className="mt-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={address.is_default}
                  onChange={(e) =>
                    handleAddressChange(
                      "is_default",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 accent-orange-600"
                />

                <span className="text-sm">
                  Set as default address
                </span>
              </label>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={saveAddress}
                  disabled={savingAddress}
                  className="rounded-lg bg-orange-500 px-5 py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
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
                  className="rounded-lg border px-5 py-2 font-semibold hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {addresses.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <div className="text-4xl">🏠</div>

              <p className="mt-3 text-gray-500">
                No saved addresses yet.
              </p>

              {!showAddressForm && (
                <button
                  onClick={() => {
                    setAddress(emptyAddress);
                    setShowAddressForm(true);
                  }}
                  className="mt-4 font-semibold text-orange-600 hover:underline"
                >
                  Add your first address
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border p-5"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold">
                        {item.full_name}
                      </h3>

                      {item.is_default && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Default
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-gray-600">
                      📞 {item.phone}
                    </p>

                    <p className="mt-2 text-gray-700">
                      {item.address_line}
                    </p>

                    <p className="text-gray-700">
                      {item.city}, {item.state} -{" "}
                      {item.pincode}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        editAddress(item)
                      }
                      className="rounded-lg border border-orange-500 px-4 py-2 font-semibold text-orange-600 hover:bg-orange-50"
                    >
                      Edit
                    </button>

                    {!item.is_default && (
                      <button
                        onClick={() =>
                          setDefaultAddress(item.id)
                        }
                        className="rounded-lg border border-green-500 px-4 py-2 font-semibold text-green-600 hover:bg-green-50"
                      >
                        Set Default
                      </button>
                    )}

                    <button
                      onClick={() =>
                        deleteAddress(item.id)
                      }
                      className="rounded-lg border border-red-500 px-4 py-2 font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>

                    <button
                      onClick={() =>
                        router.push("/checkout")
                      }
                      className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Checkout →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => router.push("/orders")}
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            📦 My Orders
          </button>

          <button
            onClick={() => router.push("/menu")}
            className="rounded-lg border border-orange-500 bg-white px-5 py-3 font-semibold text-orange-600 hover:bg-orange-50"
          >
            🍽️ Browse Menu
          </button>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white hover:bg-gray-800"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}