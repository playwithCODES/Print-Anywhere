"use client";

import {
  useState,
} from "react";

export default function AgentLogin({
  onConnected,
}) {
  const [mode, setMode] =
    useState("login");

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      password: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const switchMode = (
    nextMode
  ) => {
    setMode(nextMode);
    setError("");
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (
        !window.printerAgent
      ) {
        throw new Error(
          "Printer Agent is not available"
        );
      }

      let response;

      if (mode === "login") {
        response =
          await window.printerAgent.login(
            formData.email,
            formData.password
          );
      } else {
        response =
          await window.printerAgent.register(
            formData.name,
            formData.email,
            formData.password
          );
      }

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Request failed"
        );
      }

      onConnected(
        response.data
      );
    } catch (error) {
      console.error(
        "Agent authentication failed:",
        error
      );

      setError(
        error.response?.data
          ?.message ||
          error.message ||
          "Request failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-7">
          <h1 className="text-3xl font-bold text-slate-900">
            Print
            <span className="text-blue-600">
              Anywhere
            </span>
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Printer Agent
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() =>
              switchMode("login")
            }
            className={`rounded-md px-4 py-2 text-sm font-semibold ${
              mode === "login"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() =>
              switchMode("register")
            }
            className={`rounded-md px-4 py-2 text-sm font-semibold ${
              mode === "register"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Register
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {mode === "register" && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Name
              </label>

              <input
                type="text"
                name="name"
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
                placeholder="Enter your name"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={
                formData.email
              }
              onChange={
                handleChange
              }
              placeholder="Enter your email"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={
                formData.password
              }
              onChange={
                handleChange
              }
              placeholder="Enter your password"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Connect Printer Agent"
                : "Create Account"}
          </button>
        </form>
      </div>
    </main>
  );
}