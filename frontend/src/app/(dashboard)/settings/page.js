"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [user] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error(
        "Failed to read user:",
        error
      );

      return null;
    }
  });

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
      <div className="mx-auto w-full max-w-4xl">

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
            Settings
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
            Manage your account information.
          </p>
        </div>

        {/* ACCOUNT INFORMATION */}

        <section
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
          <div className="mb-6 sm:mb-8">
            <h2
              className="
                text-lg
                font-bold
                text-slate-900
                dark:text-white

                sm:text-xl
              "
            >
              Account Information
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
                dark:text-slate-400
              "
            >
              Your current PrintAnywhere account details.
            </p>
          </div>

          <div>

            {/* NAME */}

            <div
              className="
                border-b
                border-slate-200
                py-5
                pt-0
                dark:border-slate-800
              "
            >
              <p
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-wide
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Name
              </p>

              <p
                className="
                  mt-2
                  break-words
                  text-base
                  font-semibold
                  text-slate-900
                  dark:text-white

                  sm:text-lg
                "
              >
                {user?.name || "User"}
              </p>
            </div>

            {/* EMAIL */}

            <div
              className="
                border-b
                border-slate-200
                py-5
                dark:border-slate-800
              "
            >
              <p
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-wide
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Email
              </p>

              <p
                className="
                  mt-2
                  break-all
                  text-base
                  font-semibold
                  text-slate-900
                  dark:text-white

                  sm:text-lg
                "
              >
                {user?.email || "-"}
              </p>
            </div>

            {/* ROLE */}

            <div className="pt-5">
              <p
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-wide
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Role
              </p>

              <span
                className="
                  mt-2
                  inline-flex
                  rounded-full
                  bg-blue-100
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  capitalize
                  text-blue-700

                  dark:bg-blue-950
                  dark:text-blue-400

                  sm:text-sm
                "
              >
                {user?.role || "user"}
              </span>
            </div>

          </div>
        </section>

        {/* APPEARANCE */}

        <section
          className="
            mt-5
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            transition-colors

            sm:mt-6
            sm:p-8

            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <h2
            className="
              text-lg
              font-bold
              text-slate-900
              dark:text-white

              sm:text-xl
            "
          >
            Appearance
          </h2>

          <p
            className="
              mt-1
              text-sm
              leading-6
              text-slate-500
              dark:text-slate-400
            "
          >
            Change the appearance of PrintAnywhere
            using the theme button in the header.
          </p>

          <div
            className="
              mt-5
              flex
              items-center
              justify-between
              gap-4
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              p-4

              dark:border-slate-800
              dark:bg-slate-950
            "
          >
            <div className="min-w-0">
              <p
                className="
                  font-medium
                  text-slate-900
                  dark:text-white
                "
              >
                Theme
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-slate-500
                  dark:text-slate-400

                  sm:text-sm
                "
              >
                Use the moon/sun button in the
                top-right corner.
              </p>
            </div>

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-white
                text-xl
                shadow-sm

                dark:bg-slate-900
              "
            >
              🌗
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}