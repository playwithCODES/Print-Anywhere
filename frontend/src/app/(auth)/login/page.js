"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import authService from "@/services/auth.service.js";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await authService.login(formData);

      router.replace("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">
              Print
              <span className="text-blue-500">
                Anywhere
              </span>
            </h1>

            <p className="mt-3 text-slate-400">
              Sign in to your account
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium">
                  Email
                </label>

                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium">
                  Password
                </label>

                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-blue-500 hover:text-blue-400"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}