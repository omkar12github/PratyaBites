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
    const response = await apiFetch("/api/accounts/profile/", {
      method: "GET",
    });

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

    setAddresses(data);
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
    try {
      setSavingProfile(true);
      setProfileMessage("");
      setError("");

      const response = await apiFetch(
        "/api/accounts/profile/",
        {
          method: "PATCH",
          body: JSON.stringify({
            email,
            phone,
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

      setUser(data.user);

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setProfileMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error("Profile update error:", error);

      setError("Unable to connect to server.");
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

  const saveAddress = async () => {
    try {
      setSavingAddress(true);
      setAddressMessage("");
      setError("");

      const url = editingAddressId
        ? `/api/accounts/addresses/${editingAddressId}/`
        : "/api/accounts/addresses/";

      const method = editingAddressId
        ? "PATCH"
        : "POST";

      const response = await apiFetch(url, {
        method,
        body: JSON.stringify(address),
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

      setError("Unable to connect to server.");
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
  };

  const deleteAddress = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await apiFetch(
        `/api/accounts/addresses/${id}/`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

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

      setError("Unable to connect to server.");
    }
  };

  const setDefaultAddress = async (id: number) => {
    try {
      setError("");

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
        "Default address updated."
      );
    } catch (error) {
      console.error(
        "Default address error:",
        error
      );

      setError("Unable to connect to server.");
    }
  };

  const cancelAddressForm = () => {
    setAddress(emptyAddress);
    setEditingAddressId(null);
    setShowAddressForm(false);
    setAddressMessage("");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Loading profile...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-red-600">
            Unable to load profile.
          </p>

          <button
            onClick={() => router.push("/login")}
            className="mt-4 bg-orange-500 text-white px-5 py-2 rounded-lg"
          >
            Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">
              My Profile
            </h1>

            <p className="text-gray-500 mt-1">
              Manage your account and delivery addresses
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/checkout")}
              className="bg-orange-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-orange-600"
            >
              ← Back to Checkout
            </button>

            <button
              onClick={() => router.push("/menu")}
              className="border border-orange-500 text-orange-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-orange-50"
            >
              Menu
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-5">
            Personal Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>

              <input
                type="text"
                value={user.username}
                disabled
                className="w-full border rounded-lg px-4 py-3 bg-gray-100 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {profileMessage && (
              <p className="text-green-600 font-medium">
                {profileMessage}
              </p>
            )}

            <button
              onClick={updateProfile}
              disabled={savingProfile}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50"
            >
              {savingProfile
                ? "Saving..."
                : "Save Profile"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex flex-col gap-4 mb-5 sm:flex-row sm:justify-between sm:items-center">
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
                }}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600"
              >
                + Add Address
              </button>
            )}
          </div>

          {addressMessage && (
            <p className="text-green-600 font-medium mb-4">
              {addressMessage}
            </p>
          )}

          {showAddressForm && (
            <div className="border rounded-xl p-5 mb-6 bg-gray-50">
              <h3 className="text-lg font-bold mb-4">
                {editingAddressId
                  ? "Edit Address"
                  : "Add New Address"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="border rounded-lg px-4 py-3"
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
                  className="border rounded-lg px-4 py-3"
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
                  className="border rounded-lg px-4 py-3 md:col-span-2"
                  rows={3}
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
                  className="border rounded-lg px-4 py-3"
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
                  className="border rounded-lg px-4 py-3"
                />

                <input
                  type="text"
                  placeholder="Pincode"
                  value={address.pincode}
                  onChange={(e) =>
                    handleAddressChange(
                      "pincode",
                      e.target.value
                    )
                  }
                  className="border rounded-lg px-4 py-3"
                />
              </div>

              <label className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  checked={address.is_default}
                  onChange={(e) =>
                    handleAddressChange(
                      "is_default",
                      e.target.checked
                    )
                  }
                />

                <span className="text-sm">
                  Set as default address
                </span>
              </label>

              <div className="flex flex-wrap gap-3 mt-5">
                <button
                  onClick={saveAddress}
                  disabled={savingAddress}
                  className="bg-orange-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50"
                >
                  {savingAddress
                    ? "Saving..."
                    : editingAddressId
                    ? "Update Address"
                    : "Save Address"}
                </button>

                <button
                  onClick={cancelAddressForm}
                  className="border px-5 py-2 rounded-lg font-semibold hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={() => router.push("/checkout")}
                  className="border border-orange-500 text-orange-600 px-5 py-2 rounded-lg font-semibold hover:bg-orange-50"
                >
                  ← Back to Checkout
                </button>
              </div>
            </div>
          )}

          {addresses.length === 0 ? (
            <div className="border rounded-xl p-8 text-center">
              <p className="text-gray-500">
                No saved addresses yet.
              </p>

              {!showAddressForm && (
                <button
                  onClick={() => {
                    setAddress(emptyAddress);
                    setShowAddressForm(true);
                  }}
                  className="mt-4 text-orange-600 font-semibold hover:underline"
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
                  className="border rounded-xl p-5"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg">
                          {item.full_name}
                        </h3>

                        {item.is_default && (
                          <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 mt-2">
                        {item.phone}
                      </p>

                      <p className="text-gray-700 mt-2">
                        {item.address_line}
                      </p>

                      <p className="text-gray-700">
                        {item.city}, {item.state} -{" "}
                        {item.pincode}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-5">
                    <button
                      onClick={() =>
                        editAddress(item)
                      }
                      className="border border-orange-500 text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50"
                    >
                      Edit
                    </button>

                    {!item.is_default && (
                      <button
                        onClick={() =>
                          setDefaultAddress(item.id)
                        }
                        className="border border-green-500 text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50"
                      >
                        Set Default
                      </button>
                    )}

                    <button
                      onClick={() =>
                        deleteAddress(item.id)
                      }
                      className="border border-red-500 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50"
                    >
                      Delete
                    </button>

                    <button
                      onClick={() =>
                        router.push("/checkout")
                      }
                      className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50"
                    >
                      ← Checkout
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}