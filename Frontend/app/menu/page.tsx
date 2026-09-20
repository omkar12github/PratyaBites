"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL, apiFetch } from "@/lib/api";

type Category = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  category: number;
  name: string;
  description: string;
  price: string;
  image: string | null;
  is_available: boolean;
};

type User = {
  username: string;
  email?: string;
  phone?: string;
};

function getImageUrl(image: string | null) {
  if (!image) {
    return null;
  }

  if (image.startsWith("http")) {
    return image;
  }

  return `${API_URL}${image}`;
}

export default function MenuPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [cartMessage, setCartMessage] = useState("");
  const [addingProduct, setAddingProduct] = useState<number | null>(null);

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
    const loadMenu = async () => {
      try {
        setLoading(true);

        const [categoryResponse, productResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/categories/`),
            fetch(`${API_URL}/api/products/`),
          ]);

        if (!categoryResponse.ok || !productResponse.ok) {
          throw new Error("Failed to load menu");
        }

        const categoryData = await categoryResponse.json();
        const productData = await productResponse.json();

        setCategories(
          Array.isArray(categoryData)
            ? categoryData
            : categoryData.results || []
        );

        setProducts(
          Array.isArray(productData)
            ? productData
            : productData.results || []
        );
      } catch (error) {
        console.error("Menu loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  useEffect(() => {
    if (!cartMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setCartMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [cartMessage]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    setUser(null);

    router.push("/login");
  };

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const category = categories.find(
        (cat) => cat.id === product.category
      );

      const matchesCategory =
        selectedCategory === "All" ||
        category?.name === selectedCategory;

      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        category?.name.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [
    products,
    categories,
    selectedCategory,
    searchQuery,
  ]);

  const handleAddToCart = async (productId: number) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setAddingProduct(productId);
      setCartMessage("");

      const response = await apiFetch(
        "/api/cart/",
        {
          method: "POST",
          body: JSON.stringify({
            product: productId,
            quantity: 1,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Cart error:", data);

        setCartMessage(
          data.detail ||
            data.error ||
            "Unable to add item to cart."
        );

        return;
      }

      setCartMessage("Item added to cart! 🛒");
    } catch (error) {
      console.error("Add to cart error:", error);

      setCartMessage(
        "Unable to connect to the server."
      );
    } finally {
      setAddingProduct(null);
    }
  };

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
              className="font-semibold text-orange-600"
            >
              Menu
            </button>

            <button
              onClick={() => router.push("/cart")}
              className="hover:text-orange-600"
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

            <button
              onClick={() => {
                document
                  .getElementById("about")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
              className="hover:text-orange-600"
            >
              About
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

      <section className="bg-orange-50 px-4 py-14 text-center sm:px-8 sm:py-16">
        <p className="font-semibold text-orange-600">
          🌱 100% Pure Vegetarian
        </p>

        <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">
          Our Menu
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-gray-600">
          Fresh, delicious vegetarian fast food made with care.
        </p>
      </section>

      <section className="px-4 pt-8 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              🔎
            </span>

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search for burger, pizza, sandwich..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-12 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button
              onClick={() =>
                setSelectedCategory("All")
              }
              className={`whitespace-nowrap rounded-full px-5 py-2.5 font-medium transition ${
                selectedCategory === "All"
                  ? "bg-orange-600 text-white shadow-sm"
                  : "bg-white text-gray-700 shadow-sm hover:bg-orange-50"
              }`}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() =>
                  setSelectedCategory(category.name)
                }
                className={`whitespace-nowrap rounded-full px-5 py-2.5 font-medium transition ${
                  selectedCategory === category.name
                    ? "bg-orange-600 text-white shadow-sm"
                    : "bg-white text-gray-700 shadow-sm hover:bg-orange-50"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {selectedCategory === "All"
                  ? "All Items"
                  : selectedCategory}
              </h2>

              <p className="text-sm text-gray-500">
                {searchQuery
                  ? `Search results for "${searchQuery}"`
                  : "Choose your favourite food."}
              </p>
            </div>

            {!loading && (
              <p className="text-sm font-medium text-gray-500">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "item"
                  : "items"}
              </p>
            )}
          </div>

          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm"
                  >
                    <div className="h-48 animate-pulse bg-gray-200" />

                    <div className="space-y-3 p-5">
                      <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />

                      <div className="h-4 w-full animate-pulse rounded bg-gray-200" />

                      <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />

                      <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {!loading && filteredProducts.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProducts.map((product) => {
                const imageUrl = getImageUrl(
                  product.image
                );

                return (
                  <div
                    key={product.id}
                    className="group overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative h-52 overflow-hidden bg-orange-100">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
                            !product.is_available
                              ? "grayscale"
                              : ""
                          }`}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-7xl">
                          🍕
                        </div>
                      )}

                      <div className="absolute left-3 top-3">
                        {product.is_available ? (
                          <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                            Available
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-1 font-bold text-gray-900">
                          {product.name}
                        </h3>

                        <span className="whitespace-nowrap font-bold text-orange-600">
                          ₹{product.price}
                        </span>
                      </div>

                      <p className="mt-2 line-clamp-2 min-h-10 text-sm text-gray-500">
                        {product.description ||
                          "Delicious vegetarian food made fresh for you."}
                      </p>

                      <button
                        onClick={() =>
                          handleAddToCart(product.id)
                        }
                        disabled={
                          !product.is_available ||
                          addingProduct === product.id
                        }
                        className={`mt-5 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                          !product.is_available
                            ? "cursor-not-allowed bg-gray-200 text-gray-500"
                            : "bg-orange-600 text-white hover:bg-orange-700 active:scale-[0.98]"
                        }`}
                      >
                        {!product.is_available
                          ? "Currently Unavailable"
                          : addingProduct === product.id
                          ? "Adding..."
                          : "Add to Cart 🛒"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="rounded-2xl bg-white px-6 py-20 text-center shadow-sm">
              <div className="text-6xl">
                🔎
              </div>

              <h3 className="mt-5 text-xl font-bold">
                No food items found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Try another search term or select a different category.
              </p>

              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-5 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700"
              >
                View All Items
              </button>
            </div>
          )}
        </div>
      </section>

      {cartMessage && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-xl">
          {cartMessage}
        </div>
      )}

      <footer
        id="about"
        className="bg-gray-950 px-8 py-10 text-center text-white"
      >
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