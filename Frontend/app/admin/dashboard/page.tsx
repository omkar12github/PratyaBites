"use client";

import { useEffect, useState } from "react";
import { API_URL, apiFetch } from "@/lib/api";

type RecentOrder = {
  id: number;
  username: string;
  total_amount: string;
  status: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
};

type DashboardData = {
  total_orders: number;
  total_sales: string;
  pending_orders: number;
  confirmed_orders: number;
  preparing_orders: number;
  out_for_delivery_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_customers: number;
  total_products: number;
  recent_orders: RecentOrder[];
};

type Customer = {
  id: number;
  username: string;
  email: string;
  phone: string;
  orders_count: number;
  total_spent: string;
  date_joined: string;
};

type Category = {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
};

type Product = {
  id: number;
  category: number;
  category_name: string;
  name: string;
  description: string;
  price: string;
  image: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
};

type OrderItem = {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  price: string;
  subtotal: string;
};

type OrderDetails = {
  id: number;
  user: number;
  username: string;
  customer_email: string;
  customer_phone: string;
  items: OrderItem[];
  total_amount: string;
  delivery_address: string;
  status: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
};

const statusOptions = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

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
  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

function getImageUrl(image: string | null) {
  if (!image) {
    return null;
  }

  if (image.startsWith("http")) {
    return image;
  }

  return `${API_URL}${image}`;
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [customerLoading, setCustomerLoading] =
    useState(true);

  const [productLoading, setProductLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [customerError, setCustomerError] =
    useState("");

  const [productError, setProductError] =
    useState("");

  const [updatingOrder, setUpdatingOrder] =
    useState<number | null>(null);

  const [updatingProduct, setUpdatingProduct] =
    useState<number | null>(null);

  const [message, setMessage] =
    useState("");

  const [showOrderDetails, setShowOrderDetails] =
    useState(false);

  const [selectedOrder, setSelectedOrder] =
    useState<OrderDetails | null>(null);

  const [orderLoading, setOrderLoading] =
    useState(false);

  const [orderError, setOrderError] =
    useState("");

  const [showProductForm, setShowProductForm] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [productName, setProductName] =
    useState("");

  const [productDescription, setProductDescription] =
    useState("");

  const [productPrice, setProductPrice] =
    useState("");

  const [productCategory, setProductCategory] =
    useState("");

  const [productAvailable, setProductAvailable] =
    useState(true);

  const [productImage, setProductImage] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  const [savingProduct, setSavingProduct] =
    useState(false);

  const [showCategoryForm, setShowCategoryForm] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [categoryName, setCategoryName] =
    useState("");

  const [categoryDescription, setCategoryDescription] =
    useState("");

  const [categoryActive, setCategoryActive] =
    useState(true);

  const [savingCategory, setSavingCategory] =
    useState(false);

  const [updatingCategory, setUpdatingCategory] =
    useState<number | null>(null);

  useEffect(() => {
    loadDashboard();
    loadCustomers();
    loadProducts();
    loadCategories();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(
        "/api/orders/dashboard/"
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            data.detail ||
            "Failed to load dashboard."
        );
        return;
      }

      setDashboard(data);
    } catch {
      setError(
        "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadCustomers() {
    try {
      setCustomerLoading(true);
      setCustomerError("");

      const response = await apiFetch(
        "/api/accounts/admin/customers/"
      );

      const data = await response.json();

      if (!response.ok) {
        setCustomerError(
          data.error ||
            data.detail ||
            "Failed to load customers."
        );
        return;
      }

      setCustomers(
        Array.isArray(data)
          ? data
          : data.results || []
      );
    } catch {
      setCustomerError(
        "Unable to load customers."
      );
    } finally {
      setCustomerLoading(false);
    }
  }

  async function loadProducts() {
    try {
      setProductLoading(true);
      setProductError("");

      const response = await apiFetch(
        "/api/admin/products/"
      );

      const data = await response.json();

      if (!response.ok) {
        setProductError(
          data.error ||
            data.detail ||
            "Failed to load products."
        );
        return;
      }

      setProducts(
        Array.isArray(data)
          ? data
          : data.results || []
      );
    } catch {
      setProductError(
        "Unable to load products."
      );
    } finally {
      setProductLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const response = await apiFetch(
        "/api/admin/categories/"
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setCategories(
        Array.isArray(data)
          ? data
          : data.results || []
      );
    } catch {
      return;
    }
  }

  async function openOrderDetails(
    orderId: number
  ) {
    try {
      setOrderLoading(true);
      setShowOrderDetails(true);
      setSelectedOrder(null);
      setOrderError("");
      setMessage("");

      const response = await apiFetch(
        `/api/orders/admin/${orderId}/`
      );

      const data = await response.json();

      console.log(
        "Order details status:",
        response.status
      );

      console.log(
        "Order details response:",
        data
      );

      if (!response.ok) {
        setOrderError(
          data.error ||
            data.detail ||
            "Failed to load order details."
        );
        return;
      }

      setSelectedOrder(data);
    } catch (error) {
      console.error(
        "Order details error:",
        error
      );

      setOrderError(
        "Unable to load order details."
      );
    } finally {
      setOrderLoading(false);
    }
  }

  function closeOrderDetails() {
    setShowOrderDetails(false);
    setSelectedOrder(null);
    setOrderLoading(false);
    setOrderError("");
  }

  async function updateOrderStatus(
    orderId: number,
    newStatus: string
  ) {
    try {
      setUpdatingOrder(orderId);
      setMessage("");

      const response = await apiFetch(
        `/api/orders/admin/${orderId}/status/`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            data.detail ||
            "Failed to update order."
        );
        return;
      }

      setMessage(
        `Order #${orderId} status updated successfully.`
      );

      if (
        selectedOrder &&
        selectedOrder.id === orderId
      ) {
        setSelectedOrder({
          ...selectedOrder,
          status: data.order.status,
          payment_status:
            data.order.payment_status,
        });
      }

      await loadDashboard();
    } catch {
      setMessage(
        "Unable to update order status."
      );
    } finally {
      setUpdatingOrder(null);
    }
  }

  function openAddProduct() {
    setEditingProduct(null);
    setProductName("");
    setProductDescription("");
    setProductPrice("");
    setProductCategory(
      categories.length > 0
        ? String(categories[0].id)
        : ""
    );
    setProductAvailable(true);
    setProductImage(null);
    setImagePreview(null);
    setShowProductForm(true);
  }

  function openEditProduct(
    product: Product
  ) {
    setEditingProduct(product);
    setProductName(product.name);
    setProductDescription(
      product.description
    );
    setProductPrice(product.price);
    setProductCategory(
      String(product.category)
    );
    setProductAvailable(
      product.is_available
    );
    setProductImage(null);
    setImagePreview(
      getImageUrl(product.image)
    );
    setShowProductForm(true);
  }

  function closeProductForm() {
    setShowProductForm(false);
    setEditingProduct(null);
    setProductName("");
    setProductDescription("");
    setProductPrice("");
    setProductCategory("");
    setProductAvailable(true);
    setProductImage(null);
    setImagePreview(null);
  }

  function handleProductImage(
    file: File | null
  ) {
    setProductImage(file);

    if (!file) {
      setImagePreview(
        editingProduct
          ? getImageUrl(editingProduct.image)
          : null
      );
      return;
    }

    setImagePreview(
      URL.createObjectURL(file)
    );
  }

  async function saveProduct() {
    if (!productName.trim()) {
      setMessage(
        "Product name is required."
      );
      return;
    }

    if (!productPrice.trim()) {
      setMessage(
        "Product price is required."
      );
      return;
    }

    if (!productCategory) {
      setMessage(
        "Please select a category."
      );
      return;
    }

    try {
      setSavingProduct(true);
      setMessage("");

      const formData = new FormData();

      formData.append(
        "name",
        productName.trim()
      );

      formData.append(
        "description",
        productDescription.trim()
      );

      formData.append(
        "price",
        productPrice
      );

      formData.append(
        "category",
        productCategory
      );

      formData.append(
        "is_available",
        String(productAvailable)
      );

      if (productImage) {
        formData.append(
          "image",
          productImage
        );
      }

      let response;

      if (editingProduct) {
        response = await apiFetch(
          `/api/admin/products/${editingProduct.id}/`,
          {
            method: "PATCH",
            body: formData,
          }
        );
      } else {
        response = await apiFetch(
          "/api/admin/products/",
          {
            method: "POST",
            body: formData,
          }
        );
      }

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            data.detail ||
            "Failed to save product."
        );
        return;
      }

      setMessage(
        editingProduct
          ? "Product updated successfully."
          : "Product added successfully."
      );

      closeProductForm();

      await loadProducts();
      await loadDashboard();
    } catch {
      setMessage(
        "Unable to save product."
      );
    } finally {
      setSavingProduct(false);
    }
  }

  async function deleteProduct(
    productId: number
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");

      const response = await apiFetch(
        `/api/admin/products/${productId}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();

        setMessage(
          data.error ||
            data.detail ||
            "Failed to delete product."
        );
        return;
      }

      setMessage(
        "Product deleted successfully."
      );

      await loadProducts();
      await loadDashboard();
    } catch {
      setMessage(
        "Unable to delete product."
      );
    }
  }

  async function toggleProductAvailability(
    product: Product
  ) {
    try {
      setUpdatingProduct(product.id);
      setMessage("");

      const response = await apiFetch(
        `/api/admin/products/${product.id}/`,
        {
          method: "PATCH",
          body: JSON.stringify({
            is_available:
              !product.is_available,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            data.detail ||
            "Failed to update product."
        );
        return;
      }

      setMessage(
        "Product availability updated."
      );

      await loadProducts();
    } catch {
      setMessage(
        "Unable to update product."
      );
    } finally {
      setUpdatingProduct(null);
    }
  }

  function openAddCategory() {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryActive(true);
    setShowCategoryForm(true);
  }

  function openEditCategory(
    category: Category
  ) {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(
      category.description
    );
    setCategoryActive(
      category.is_active
    );
    setShowCategoryForm(true);
  }

  function closeCategoryForm() {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryActive(true);
  }

  async function saveCategory() {
    if (!categoryName.trim()) {
      setMessage(
        "Category name is required."
      );
      return;
    }

    try {
      setSavingCategory(true);
      setMessage("");

      const body = {
        name: categoryName.trim(),
        description:
          categoryDescription.trim(),
        is_active: categoryActive,
      };

      let response;

      if (editingCategory) {
        response = await apiFetch(
          `/api/admin/categories/${editingCategory.id}/`,
          {
            method: "PATCH",
            body: JSON.stringify(body),
          }
        );
      } else {
        response = await apiFetch(
          "/api/admin/categories/",
          {
            method: "POST",
            body: JSON.stringify(body),
          }
        );
      }

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            data.detail ||
            "Failed to save category."
        );
        return;
      }

      setMessage(
        editingCategory
          ? "Category updated successfully."
          : "Category added successfully."
      );

      closeCategoryForm();

      await loadCategories();
      await loadProducts();
    } catch {
      setMessage(
        "Unable to save category."
      );
    } finally {
      setSavingCategory(false);
    }
  }

  async function toggleCategory(
    category: Category
  ) {
    try {
      setUpdatingCategory(category.id);
      setMessage("");

      const response = await apiFetch(
        `/api/admin/categories/${category.id}/`,
        {
          method: "PATCH",
          body: JSON.stringify({
            is_active:
              !category.is_active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            data.detail ||
            "Failed to update category."
        );
        return;
      }

      setMessage(
        "Category status updated."
      );

      await loadCategories();
    } catch {
      setMessage(
        "Unable to update category."
      );
    } finally {
      setUpdatingCategory(null);
    }
  }

  async function deleteCategory(
    categoryId: number
  ) {
    const confirmed = window.confirm(
      "Deleting this category may also delete its products. Continue?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");

      const response = await apiFetch(
        `/api/admin/categories/${categoryId}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();

        setMessage(
          data.error ||
            data.detail ||
            "Failed to delete category."
        );
        return;
      }

      setMessage(
        "Category deleted successfully."
      );

      await loadCategories();
      await loadProducts();
      await loadDashboard();
    } catch {
      setMessage(
        "Unable to delete category."
      );
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-gray-600">
            Loading dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (error || !dashboard) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">
            {error || "Dashboard unavailable."}
          </div>

          <button
            onClick={loadDashboard}
            className="mt-4 rounded-lg bg-black px-5 py-2 text-white"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            PratyaBites Admin Dashboard
          </h1>

          <p className="mt-1 text-gray-500">
            Manage orders, customers, products and categories
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-700">
            {message}
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Orders
            </p>
            <p className="mt-2 text-3xl font-bold">
              {dashboard.total_orders}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Sales
            </p>
            <p className="mt-2 text-3xl font-bold">
              ₹{dashboard.total_sales}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Customers
            </p>
            <p className="mt-2 text-3xl font-bold">
              {dashboard.total_customers}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Products
            </p>
            <p className="mt-2 text-3xl font-bold">
              {dashboard.total_products}
            </p>
          </div>

        </section>

        <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Pending Orders
            </p>
            <p className="mt-2 text-2xl font-bold">
              {dashboard.pending_orders}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Confirmed Orders
            </p>
            <p className="mt-2 text-2xl font-bold">
              {dashboard.confirmed_orders}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Preparing
            </p>
            <p className="mt-2 text-2xl font-bold">
              {dashboard.preparing_orders}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Out for Delivery
            </p>
            <p className="mt-2 text-2xl font-bold">
              {dashboard.out_for_delivery_orders}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Delivered
            </p>
            <p className="mt-2 text-2xl font-bold">
              {dashboard.delivered_orders}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Cancelled
            </p>
            <p className="mt-2 text-2xl font-bold">
              {dashboard.cancelled_orders}
            </p>
          </div>

        </section>

        <section className="mb-8 rounded-xl bg-white shadow-sm">

          <div className="border-b border-gray-200 p-6">
            <h2 className="text-xl font-bold">
              Order Management
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage recent customer orders
            </p>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px]">

              <thead className="bg-gray-50">

                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Order
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Payment
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Date
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Action
                  </th>
                </tr>

              </thead>

              <tbody className="divide-y divide-gray-200">

                {dashboard.recent_orders.map(
                  (order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-6 py-4 font-semibold">
                        #{order.id}
                      </td>

                      <td className="px-6 py-4">
                        {order.username}
                      </td>

                      <td className="px-6 py-4">
                        ₹{order.total_amount}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {formatStatus(
                            order.payment_method
                          )}
                        </div>

                        <div className="text-xs text-gray-500">
                          {formatStatus(
                            order.payment_status
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">

                        <select
                          value={order.status}
                          disabled={
                            updatingOrder ===
                            order.id
                          }
                          onChange={(event) =>
                            updateOrderStatus(
                              order.id,
                              event.target.value
                            )
                          }
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                        >
                          {statusOptions.map(
                            (status) => (
                              <option
                                key={status}
                                value={status}
                              >
                                {formatStatus(
                                  status
                                )}
                              </option>
                            )
                          )}
                        </select>

                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(
                          order.created_at
                        )}
                      </td>

                      <td className="px-6 py-4">

                        <button
                          onClick={() =>
                            openOrderDetails(
                              order.id
                            )
                          }
                          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                          View
                        </button>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

        <section className="mb-8 rounded-xl bg-white shadow-sm">

          <div className="border-b border-gray-200 p-6">

            <h2 className="text-xl font-bold">
              Customer Management
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              View registered PratyaBites customers
            </p>

          </div>

          {customerLoading ? (
            <div className="p-6 text-gray-500">
              Loading customers...
            </div>
          ) : customerError ? (
            <div className="p-6">

              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
                {customerError}
              </div>

              <button
                onClick={loadCustomers}
                className="mt-4 rounded-lg bg-black px-5 py-2 text-white"
              >
                Try Again
              </button>

            </div>
          ) : customers.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No customers found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px]">

                <thead className="bg-gray-50">

                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Orders
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Total Spent
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Joined
                    </th>
                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-200">

                  {customers.map(
                    (customer) => (
                      <tr
                        key={customer.id}
                        className="hover:bg-gray-50"
                      >

                        <td className="px-6 py-4 font-semibold">
                          {customer.username}
                        </td>

                        <td className="px-6 py-4">
                          {customer.email}
                        </td>

                        <td className="px-6 py-4">
                          {customer.phone || "-"}
                        </td>

                        <td className="px-6 py-4">
                          {customer.orders_count}
                        </td>

                        <td className="px-6 py-4 font-semibold">
                          ₹{customer.total_spent}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(
                            customer.date_joined
                          )}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

        <section className="mb-8 rounded-xl bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b border-gray-200 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-bold">
                Category Management
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage menu categories
              </p>
            </div>

            <button
              onClick={openAddCategory}
              className="rounded-lg bg-black px-5 py-2.5 font-medium text-white hover:bg-gray-800"
            >
              + Add Category
            </button>

          </div>

          {showCategoryForm && (
            <div className="border-b border-gray-200 bg-gray-50 p-6">

              <div className="mb-5 flex items-center justify-between">

                <h3 className="text-lg font-bold">
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h3>

                <button
                  onClick={closeCategoryForm}
                  className="text-xl text-gray-500 hover:text-black"
                >
                  ×
                </button>

              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Category Name
                  </label>

                  <input
                    type="text"
                    value={categoryName}
                    onChange={(event) =>
                      setCategoryName(
                        event.target.value
                      )
                    }
                    placeholder="Enter category name"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div className="flex items-center gap-3 pt-8">

                  <input
                    type="checkbox"
                    checked={categoryActive}
                    onChange={(event) =>
                      setCategoryActive(
                        event.target.checked
                      )
                    }
                    className="h-4 w-4"
                  />

                  <label className="text-sm font-medium">
                    Active Category
                  </label>

                </div>

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-medium">
                    Description
                  </label>

                  <textarea
                    value={categoryDescription}
                    onChange={(event) =>
                      setCategoryDescription(
                        event.target.value
                      )
                    }
                    rows={3}
                    placeholder="Category description"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
                  />

                </div>

              </div>

              <div className="mt-5 flex gap-3">

                <button
                  onClick={saveCategory}
                  disabled={savingCategory}
                  className="rounded-lg bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
                >
                  {savingCategory
                    ? "Saving..."
                    : editingCategory
                    ? "Update Category"
                    : "Add Category"}
                </button>

                <button
                  onClick={closeCategoryForm}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium"
                >
                  Cancel
                </button>

              </div>

            </div>
          )}

          {categories.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No categories found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[800px]">

                <thead className="bg-gray-50">

                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Name
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Description
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Actions
                    </th>
                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-200">

                  {categories.map(
                    (category) => (
                      <tr
                        key={category.id}
                        className="hover:bg-gray-50"
                      >

                        <td className="px-6 py-4 font-semibold">
                          {category.name}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {category.description ||
                            "No description"}
                        </td>

                        <td className="px-6 py-4">

                          <button
                            onClick={() =>
                              toggleCategory(
                                category
                              )
                            }
                            disabled={
                              updatingCategory ===
                              category.id
                            }
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              category.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {category.is_active
                              ? "Active"
                              : "Inactive"}
                          </button>

                        </td>

                        <td className="px-6 py-4">

                          <div className="flex gap-2">

                            <button
                              onClick={() =>
                                openEditCategory(
                                  category
                                )
                              }
                              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-100"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                deleteCategory(
                                  category.id
                                )
                              }
                              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

        <section className="rounded-xl bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b border-gray-200 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-bold">
                Product Management
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add, edit, delete and manage menu products
              </p>
            </div>

            <button
              onClick={openAddProduct}
              className="rounded-lg bg-black px-5 py-2.5 font-medium text-white hover:bg-gray-800"
            >
              + Add Product
            </button>

          </div>

          {showProductForm && (
            <div className="border-b border-gray-200 bg-gray-50 p-6">

              <div className="mb-5 flex items-center justify-between">

                <h3 className="text-lg font-bold">
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h3>

                <button
                  onClick={closeProductForm}
                  className="text-xl text-gray-500 hover:text-black"
                >
                  ×
                </button>

              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Product Name
                  </label>

                  <input
                    type="text"
                    value={productName}
                    onChange={(event) =>
                      setProductName(
                        event.target.value
                      )
                    }
                    placeholder="Enter product name"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Category
                  </label>

                  <select
                    value={productCategory}
                    onChange={(event) =>
                      setProductCategory(
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      )
                    )}

                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Price
                  </label>

                  <input
                    type="number"
                    value={productPrice}
                    onChange={(event) =>
                      setProductPrice(
                        event.target.value
                      )
                    }
                    placeholder="Enter price"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div className="flex items-center gap-3 pt-8">

                  <input
                    type="checkbox"
                    checked={productAvailable}
                    onChange={(event) =>
                      setProductAvailable(
                        event.target.checked
                      )
                    }
                    className="h-4 w-4"
                  />

                  <label className="text-sm font-medium">
                    Product Available
                  </label>

                </div>

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-medium">
                    Description
                  </label>

                  <textarea
                    value={productDescription}
                    onChange={(event) =>
                      setProductDescription(
                        event.target.value
                      )
                    }
                    rows={3}
                    placeholder="Product description"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
                  />

                </div>

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-medium">
                    Product Image
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      handleProductImage(
                        event.target.files?.[0] ||
                        null
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                  />

                  {imagePreview && (
                    <div className="mt-4">

                      <p className="mb-2 text-sm font-medium">
                        Image Preview
                      </p>

                      <img
                        src={imagePreview}
                        alt={productName}
                        className="h-32 w-32 rounded-xl border border-gray-200 object-cover"
                      />

                    </div>
                  )}

                </div>

              </div>

              <div className="mt-5 flex gap-3">

                <button
                  onClick={saveProduct}
                  disabled={savingProduct}
                  className="rounded-lg bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
                >
                  {savingProduct
                    ? "Saving..."
                    : editingProduct
                    ? "Update Product"
                    : "Add Product"}
                </button>

                <button
                  onClick={closeProductForm}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium"
                >
                  Cancel
                </button>

              </div>

            </div>
          )}

          {productLoading ? (
            <div className="p-6 text-gray-500">
              Loading products...
            </div>
          ) : productError ? (
            <div className="p-6">

              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
                {productError}
              </div>

              <button
                onClick={loadProducts}
                className="mt-4 rounded-lg bg-black px-5 py-2 text-white"
              >
                Try Again
              </button>

            </div>
          ) : products.length === 0 ? (
            <div className="p-10 text-center">

              <div className="text-4xl">
                🍔
              </div>

              <h3 className="mt-3 text-lg font-semibold">
                No products found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Add your first menu product.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px]">

                <thead className="bg-gray-50">

                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Image
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Product
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Category
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Price
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Availability
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Date
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Actions
                    </th>
                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-200">

                  {products.map(
                    (product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50"
                      >

                        <td className="px-6 py-4">

                          {product.image ? (
                            <img
                              src={
                                getImageUrl(
                                  product.image
                                ) || ""
                              }
                              alt={product.name}
                              className="h-16 w-16 rounded-xl border border-gray-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-2xl">
                              🍔
                            </div>
                          )}

                        </td>

                        <td className="px-6 py-4">

                          <div className="font-semibold">
                            {product.name}
                          </div>

                          <div className="max-w-xs truncate text-xs text-gray-500">
                            {product.description ||
                              "No description"}
                          </div>

                        </td>

                        <td className="px-6 py-4">
                          {product.category_name}
                        </td>

                        <td className="px-6 py-4 font-semibold">
                          ₹{product.price}
                        </td>

                        <td className="px-6 py-4">

                          <button
                            onClick={() =>
                              toggleProductAvailability(
                                product
                              )
                            }
                            disabled={
                              updatingProduct ===
                              product.id
                            }
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              product.is_available
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {product.is_available
                              ? "Available"
                              : "Unavailable"}
                          </button>

                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(
                            product.created_at
                          )}
                        </td>

                        <td className="px-6 py-4">

                          <div className="flex gap-2">

                            <button
                              onClick={() =>
                                openEditProduct(
                                  product
                                )
                              }
                              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-100"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                deleteProduct(
                                  product.id
                                )
                              }
                              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>

      {showOrderDetails && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={closeOrderDetails}
        >

          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-6">

              <div>
                <h2 className="text-2xl font-bold">
                  Order Details
                </h2>

                {selectedOrder && (
                  <p className="mt-1 text-sm text-gray-500">
                    Order #{selectedOrder.id}
                  </p>
                )}

              </div>

              <button
                onClick={closeOrderDetails}
                className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-gray-500 hover:bg-gray-100 hover:text-black"
              >
                ×
              </button>

            </div>

            {orderLoading ? (
              <div className="p-12 text-center">

                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

                <p className="mt-4 text-gray-500">
                  Loading order details...
                </p>

              </div>
            ) : orderError ? (
              <div className="p-8">

                <div className="rounded-xl border border-red-200 bg-red-50 p-5">

                  <p className="font-semibold text-red-700">
                    Unable to load order
                  </p>

                  <p className="mt-2 text-sm text-red-600">
                    {orderError}
                  </p>

                </div>

                <div className="mt-5 flex justify-end">

                  <button
                    onClick={closeOrderDetails}
                    className="rounded-lg bg-black px-5 py-2.5 font-medium text-white"
                  >
                    Close
                  </button>

                </div>

              </div>
            ) : selectedOrder ? (
              <div className="space-y-6 p-6">

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                  <div className="rounded-xl bg-gray-50 p-4">

                    <p className="text-xs text-gray-500">
                      Customer
                    </p>

                    <p className="mt-1 font-semibold">
                      {selectedOrder.username}
                    </p>

                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">

                    <p className="text-xs text-gray-500">
                      Email
                    </p>

                    <p className="mt-1 break-all font-semibold">
                      {selectedOrder.customer_email ||
                        "-"}
                    </p>

                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">

                    <p className="text-xs text-gray-500">
                      Phone
                    </p>

                    <p className="mt-1 font-semibold">
                      {selectedOrder.customer_phone ||
                        "-"}
                    </p>

                  </div>

                </div>

                <div className="rounded-xl border p-5">

                  <h3 className="mb-4 text-lg font-bold">
                    Order Items
                  </h3>

                  {selectedOrder.items.length === 0 ? (
                    <p className="text-gray-500">
                      No items found.
                    </p>
                  ) : (
                    <div className="divide-y">

                      {selectedOrder.items.map(
                        (item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-4 py-4"
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
                  )}

                  <div className="mt-4 flex justify-between border-t pt-4">

                    <span className="font-bold">
                      Total
                    </span>

                    <span className="text-xl font-bold">
                      ₹{selectedOrder.total_amount}
                    </span>

                  </div>

                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div className="rounded-xl bg-gray-50 p-5">

                    <p className="text-sm font-semibold">
                      Delivery Address
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                      {selectedOrder.delivery_address ||
                        "No delivery address"}
                    </p>

                  </div>

                  <div className="rounded-xl bg-gray-50 p-5">

                    <p className="text-sm font-semibold">
                      Order Date
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      {formatDateTime(
                        selectedOrder.created_at
                      )}
                    </p>

                  </div>

                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div className="rounded-xl border p-5">

                    <p className="text-sm text-gray-500">
                      Payment Method
                    </p>

                    <p className="mt-1 font-semibold">
                      {formatStatus(
                        selectedOrder.payment_method
                      )}
                    </p>

                    <p className="mt-3 text-sm text-gray-500">
                      Payment Status
                    </p>

                    <p className="mt-1 font-semibold">
                      {formatStatus(
                        selectedOrder.payment_status
                      )}
                    </p>

                  </div>

                  <div className="rounded-xl border p-5">

                    <p className="mb-3 text-sm text-gray-500">
                      Order Status
                    </p>

                    <select
                      value={selectedOrder.status}
                      disabled={
                        updatingOrder ===
                        selectedOrder.id
                      }
                      onChange={(event) =>
                        updateOrderStatus(
                          selectedOrder.id,
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium outline-none focus:border-black"
                    >

                      {statusOptions.map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {formatStatus(
                              status
                            )}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                </div>

              </div>
            ) : (
              <div className="p-10 text-center text-gray-500">
                No order selected.
              </div>
            )}

            <div className="sticky bottom-0 border-t bg-gray-50 p-5 text-right">

              <button
                onClick={closeOrderDetails}
                className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 font-medium hover:bg-gray-100"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}