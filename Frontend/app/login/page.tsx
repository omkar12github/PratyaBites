"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/accounts/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid username or password.");
        return;
      }

      // Store JWT tokens
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      // Store user information
      localStorage.setItem("user", JSON.stringify(data.user));

      // Go to menu after successful login
      router.push("/menu");

    } catch (error) {
      console.error(error);
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-orange-50 px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-orange-600">
            PratyaBites
          </h1>

          <p className="mt-2 text-gray-500">
            Welcome back! Login to continue.
          </p>
        </div>

        <form onSubmit={handleLogin}>

          {/* Username */}
          <div className="mb-5">
            <label className="mb-2 block font-medium text-gray-700">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="mb-2 block font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-orange-600 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <a
            href="/register"
            className="font-semibold text-orange-600 hover:underline"
          >
            Register
          </a>
        </p>

      </div>

    </main>
  );
}