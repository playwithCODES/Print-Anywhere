"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import printerService from "@/services/printer.service.js";

export default function RegisterPrinterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    printerId: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [printerToken, setPrinterToken] = useState("");
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
    setSuccess("");
    setLoading(true);

    try {
      const response =
        await printerService.registerPrinter(
          formData
        );

      setSuccess(
        "Printer registered successfully."
      );

      if (response.printerToken) {
        setPrinterToken(response.printerToken);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to register printer."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="
        min-h-[calc(100vh-5rem)]
        bg-slate-100
        px-4
        py-6
        text-slate-900
        transition-colors

        sm:px-6
        sm:py-8

        lg:px-8
        lg:py-10

        dark:bg-slate-950
        dark:text-white
      "
    >
      <div className="mx-auto w-full max-w-2xl">

        {/* PAGE HEADER */}

        <div className="mb-6 sm:mb-8">
          <h1
            className="
              text-2xl
              font-bold
              tracking-tight
              text-slate-900
              dark:text-white

              sm:text-3xl
            "
          >
            Register Printer
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-slate-500
              dark:text-slate-400

              sm:text-base
            "
          >
            Connect a physical printer to
            PrintAnywhere.
          </p>
        </div>

        {/* FORM CARD */}

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            transition-colors

            sm:p-8

            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <form onSubmit={handleSubmit}>

            {/* PRINTER NAME */}

            <div className="mb-6">
              <label
                htmlFor="name"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                  dark:text-slate-200
                "
              >
                Printer Name
              </label>

              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Office Printer"
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-4
                  py-3
                  text-sm
                  text-slate-900
                  placeholder:text-slate-400
                  outline-none
                  transition

                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-500/20

                  dark:border-slate-700
                  dark:bg-slate-950
                  dark:text-white
                  dark:placeholder:text-slate-500
                "
              />
            </div>

            {/* PRINTER ID */}

            <div className="mb-6">
              <label
                htmlFor="printerId"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                  dark:text-slate-200
                "
              >
                Printer ID / Path
              </label>

              <input
                id="printerId"
                name="printerId"
                value={formData.printerId}
                onChange={handleChange}
                required
                placeholder="\\\\OFFICE-PC\\HP-LaserJet"
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-4
                  py-3
                  text-sm
                  text-slate-900
                  placeholder:text-slate-400
                  outline-none
                  transition

                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-500/20

                  dark:border-slate-700
                  dark:bg-slate-950
                  dark:text-white
                  dark:placeholder:text-slate-500
                "
              />

              <p
                className="
                  mt-2
                  text-xs
                  leading-5
                  text-slate-500
                  dark:text-slate-400
                "
              >
                This identifies the physical printer
                used by the PrintAnywhere agent.
              </p>
            </div>

            {/* ERROR */}

            {error && (
              <div
                className="
                  mb-5
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-700

                  dark:border-red-900
                  dark:bg-red-950/30
                  dark:text-red-400
                "
              >
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div
                className="
                  mb-5
                  rounded-xl
                  border
                  border-green-200
                  bg-green-50
                  px-4
                  py-3
                  text-sm
                  text-green-700

                  dark:border-green-900
                  dark:bg-green-950/30
                  dark:text-green-400
                "
              >
                {success}
              </div>
            )}

            {/* PRINTER TOKEN */}

            {printerToken && (
              <div
                className="
                  mb-6
                  rounded-xl
                  border
                  border-yellow-200
                  bg-yellow-50
                  p-4

                  sm:p-5

                  dark:border-yellow-800
                  dark:bg-yellow-950/20
                "
              >
                <p
                  className="
                    font-semibold
                    text-yellow-700
                    dark:text-yellow-400
                  "
                >
                  Printer Agent Token
                </p>

                <div
                  className="
                    mt-3
                    overflow-x-auto
                    rounded-lg
                    bg-white
                    p-3

                    dark:bg-slate-950
                  "
                >
                  <p
                    className="
                      break-all
                      font-mono
                      text-xs
                      text-slate-700
                      dark:text-slate-300
                    "
                  >
                    {printerToken}
                  </p>
                </div>

                <p
                  className="
                    mt-3
                    text-xs
                    leading-5
                    text-yellow-700
                    dark:text-yellow-500
                  "
                >
                  Save this token securely. It is shown
                  only after printer registration.
                </p>
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                rounded-xl
                bg-blue-600
                px-4
                py-3
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition

                hover:bg-blue-700
                active:scale-[0.98]

                disabled:cursor-not-allowed
                disabled:opacity-50

                sm:text-base
              "
            >
              {loading
                ? "Registering..."
                : "Register Printer"}
            </button>

          </form>
        </div>

        {/* BACK LINK */}

        <button
          type="button"
          onClick={() => router.push("/printers")}
          className="
            mt-5
            w-full
            text-center
            text-sm
            font-medium
            text-slate-500
            transition
            hover:text-blue-600

            dark:text-slate-400
            dark:hover:text-blue-400
          "
        >
          ← Back to My Printers
        </button>

      </div>
    </main>
  );
}