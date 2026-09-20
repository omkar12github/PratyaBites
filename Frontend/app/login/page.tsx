"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type LoginResponse = {
  access?: string;
  refresh?: string;
  user?: {
    id?: number;
    username?: string;
    email?: string;
    phone?: string;
    is_staff?: boolean;
    is_superuser?: boolean;
  };
  error?: string;
  detail?: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiFetch(
        "/api/accounts/login/",
        {
          method: "POST",
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      );

      const data: LoginResponse =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            data.detail ||
            "Invalid username or password."
        );
        return;
      }

      if (!data.access || !data.refresh) {
        setError(
          "Login response is missing authentication tokens."
        );
        return;
      }

      localStorage.setItem(
        "access_token",
        data.access
      );

      localStorage.setItem(
        "refresh_token",
        data.refresh
      );

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      router.push("/menu");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Unable to connect to server. Make sure Django is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-orange-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        {/* Header */}
        <div className="mb-8 text-center">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-3xl font-bold text-orange-600"
          >
            PratyaBites
          </button>

          <p className="mt-2 text-gray-500">
            Welcome back! Login to continue.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>

          {/* Username */}
          <div className="mb-5">
            <label
              htmlFor="username"
              className="mb-2 block font-medium text-gray-700"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              placeholder="Enter your username"
              autoComplete="username"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {/* Password */}
          <div className="mb-5">
            <label
              htmlFor="password"
              className="mb-2 block font-medium text-gray-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-20 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-orange-600 hover:text-orange-700"
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-orange-600 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        {/* Register */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() =>
              router.push("/register")
            }
            className="font-semibold text-orange-600 hover:underline"
          >
            Register
          </button>
        </p>

        {/* Back to Home */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-4 w-full text-center text-sm text-gray-500 hover:text-orange-600"
        >
          ← Back to Home
        </button>

      </div>
    </main>
  );
}