"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import authService from "@/services/auth.service.js";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
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
      await authService.register(formData);

      /*
       * Backend registration does not return a JWT.
       * Therefore login immediately after registration.
       */
      await authService.login({
        email: formData.email,
        password: formData.password,
      });

      router.replace("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">
              Print
              <span className="text-blue-500">
                Anywhere
              </span>
            </h1>

            <p className="mt-3 text-slate-400">
              Create your account
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium">
                  Name
                </label>

                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  placeholder="Your name"
                />
              </div>

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
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  placeholder="you@example.com"
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
                  minLength={6}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  placeholder="Create a password"
                />
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-500"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}