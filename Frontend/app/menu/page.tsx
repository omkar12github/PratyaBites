"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function MenuPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [cartMessage, setCartMessage] = useState("");
  const [addingProduct, setAddingProduct] = useState<number | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
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
            fetch("http://127.0.0.1:8000/api/categories/"),
            fetch("http://127.0.0.1:8000/api/products/"),
          ]);

        if (!categoryResponse.ok || !productResponse.ok) {
          throw new Error("Failed to load menu");
        }

        const categoryData = await categoryResponse.json();
        const productData = await productResponse.json();

        setCategories(categoryData);
        setProducts(productData);
      } catch (error) {
        console.error("Menu loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    setUser(null);

    router.push("/login");
  };

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => {
          const category = categories.find(
            (cat) => cat.id === product.category
          );

          return category?.name === selectedCategory;
        });

  const handleAddToCart = async (productId: number) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setAddingProduct(productId);
      setCartMessage("");

      const response = await fetch(
        "http://127.0.0.1:8000/api/cart/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
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

      console.log("Cart updated:", data);

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

      <nav className="flex items-center justify-between bg-white px-8 py-5 shadow-sm">

        <div>
          <h1 className="text-2xl font-bold text-orange-600">
            PratyaBites
          </h1>

          <p className="text-xs text-gray-500">
            Pratya&apos;s Promise, Every Bite.
          </p>
        </div>

        <div className="hidden gap-8 md:flex">

          <a
            href="/"
            className="hover:text-orange-600"
          >
            Home
          </a>

          <a
            href="/menu"
            className="font-semibold text-orange-600"
          >
            Menu
          </a>

          <a
            href="#"
            className="hover:text-orange-600"
          >
            Offers
          </a>

          <a
            href="#"
            className="hover:text-orange-600"
          >
            About
          </a>

          <a
            href="#"
            className="hover:text-orange-600"
          >
            Contact
          </a>

        </div>

        <div className="flex items-center gap-4">

          <button
            onClick={() => router.push("/cart")}
            className="font-medium hover:text-orange-600"
          >
            🛒 Cart
          </button>

          {user && (
            <button
              onClick={() => router.push("/orders")}
              className="hidden font-medium hover:text-orange-600 sm:block"
            >
              📦 My Orders
            </button>
          )}

          {user ? (

            <div className="flex items-center gap-4">

              <span className="hidden font-medium text-gray-700 sm:block">
                Hi, {user.username}
              </span>

              <button
                onClick={handleLogout}
                className="rounded-full bg-gray-900 px-5 py-2 text-white hover:bg-gray-800"
              >
                Logout
              </button>

            </div>

          ) : (

            <button
              onClick={() => router.push("/login")}
              className="rounded-full bg-orange-600 px-5 py-2 text-white hover:bg-orange-700"
            >
              Login
            </button>

          )}

        </div>

      </nav>

      <section className="bg-orange-50 px-8 py-16 text-center">

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

      <section className="px-8 py-8">

        <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto pb-2">

          <button
            onClick={() => setSelectedCategory("All")}
            className={`whitespace-nowrap rounded-full px-5 py-2.5 font-medium transition ${
              selectedCategory === "All"
                ? "bg-orange-600 text-white"
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
                  ? "bg-orange-600 text-white"
                  : "bg-white text-gray-700 shadow-sm hover:bg-orange-50"
              }`}
            >
              {category.name}
            </button>

          ))}

        </div>

      </section>

      <section className="px-8 pb-20">

        <div className="mx-auto max-w-7xl">

          <div className="mb-8">

            <h2 className="text-2xl font-bold">

              {selectedCategory === "All"
                ? "All Items"
                : selectedCategory}

            </h2>

            <p className="text-sm text-gray-500">
              Choose your favourite food.
            </p>

          </div>

          {loading && (

            <div className="py-20 text-center">

              <p className="text-gray-500">
                Loading menu...
              </p>

            </div>

          )}

          {!loading && filteredProducts.length > 0 && (

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

              {filteredProducts.map((product) => (

                <div
                  key={product.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >

                  <div className="relative flex h-48 items-center justify-center bg-orange-100 text-7xl">

                    {product.image ? (

                      <img
                        src={`http://127.0.0.1:8000${product.image}`}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />

                    ) : (

                      "🍕"

                    )}

                  </div>

                  <div className="p-5">

                    <div className="flex items-start justify-between gap-3">

                      <h3 className="font-bold">
                        {product.name}
                      </h3>

                      <span className="font-bold text-orange-600">
                        ₹{product.price}
                      </span>

                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                      {product.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between">

                      <span className="text-sm">
                        ⭐ 4.8
                      </span>

                      <button
                        onClick={() =>
                          handleAddToCart(product.id)
                        }
                        disabled={
                          addingProduct === product.id
                        }
                        className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {addingProduct === product.id
                          ? "Adding..."
                          : "Add to Cart"}
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

          {!loading && filteredProducts.length === 0 && (

            <div className="py-20 text-center">

              <p className="text-gray-500">
                No food items found.
              </p>

            </div>

          )}

        </div>

      </section>

      {cartMessage && (

        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-lg">
          {cartMessage}
        </div>

      )}

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