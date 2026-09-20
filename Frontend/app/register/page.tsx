"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type RegisterResponse = {
  message?: string;
  error?: string;
  detail?: string;
  username?: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiFetch(
        "/api/accounts/register/",
        {
          method: "POST",
          body: JSON.stringify({
            username: username.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password,
            confirm_password: confirmPassword,
          }),
        }
      );

      const data: RegisterResponse =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            data.detail ||
            "Unable to create account."
        );
        return;
      }

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        "Unable to connect to server. Make sure Django is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-orange-50 px-4 py-10">
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
            Create your account to get started.
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister}>

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

          {/* Email */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="mb-2 block font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {/* Phone */}
          <div className="mb-5">
            <label
              htmlFor="phone"
              className="mb-2 block font-medium text-gray-700"
            >
              Phone Number
            </label>

            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
              placeholder="Enter your phone number"
              autoComplete="tel"
              maxLength={15}
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
                placeholder="Create a password"
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className="mb-5">
            <label
              htmlFor="confirmPassword"
              className="mb-2 block font-medium text-gray-700"
            >
              Confirm Password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-20 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (previous) => !previous
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-orange-600 hover:text-orange-700"
              >
                {showConfirmPassword
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

          {/* Success */}
          {success && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600">
              {success}
            </div>
          )}

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-orange-600 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="font-semibold text-orange-600 hover:underline"
          >
            Login
          </button>
        </p>

        {/* Home Link */}
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