"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import authService from "@/services/auth.service.js";
import ThemeToggle from "../ThemeToggle.jsx";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "▣",
  },
  {
    name: "Print Document",
    href: "/print",
    icon: "🖨️",
  },
  {
    name: "Print History",
    href: "/history",
    icon: "◷",
  },
  {
    name: "My Printers",
    href: "/printers",
    icon: "🖨️",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: "⚙",
  },
];

export default function Header() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);

  const name = "User";
  const role = "user";
  const initial = name.charAt(0).toUpperCase();

  const handleLogout = () => {
    authService.logout();
    router.replace("/login");
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <header
        className="
          sticky
          top-0
          z-30
          flex
          min-h-20
          items-center
          justify-between
          border-b
          border-slate-200
          bg-white
          px-4
          py-3
          dark:border-slate-800
          dark:bg-slate-950

          sm:px-6
          lg:h-24
          lg:px-8
        "
      >
        {/* LEFT */}

        <div className="flex items-center gap-3">

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-slate-100
              text-2xl
              text-slate-700
              shadow-sm
              transition
              active:scale-95

              lg:hidden

              dark:bg-slate-800
              dark:text-slate-200
            "
            aria-label="Open menu"
          >
            ☰
          </button>

          {/* TITLE */}

          <div>
            <h1
              className="
                text-lg
                font-bold
                text-slate-900
                dark:text-white

                sm:text-xl
                lg:text-2xl
              "
            >
              Print<span className="text-blue-500">Anywhere</span>
            </h1>

            <p
              className="
                hidden
                text-sm
                text-slate-500
                dark:text-slate-400

                sm:block
              "
            >
              Manage your remote printing activity
            </p>
          </div>
        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-2 sm:gap-4 lg:gap-5">

          <ThemeToggle />

          <div className="hidden text-right sm:block">
            <p className="font-semibold text-slate-900 dark:text-white">
              {name}
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {role}
            </p>
          </div>

          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-blue-600
              text-sm
              font-bold
              text-white

              sm:h-10
              sm:w-10
            "
          >
            {initial}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="
              rounded-lg
              bg-red-600
              px-3
              py-2
              text-xs
              font-semibold
              text-white
              transition
              hover:bg-red-700

              sm:px-4
              sm:text-sm
            "
          >
            Logout
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}

      {menuOpen && (
        <>
          {/* BACKDROP */}

          <div
            className="
              fixed
              inset-0
              z-40
              bg-black/50
              lg:hidden
            "
            onClick={closeMenu}
          />

          {/* DRAWER */}

          <aside
            className="
              fixed
              left-0
              top-0
              z-50
              h-screen
              w-72
              border-r
              border-slate-200
              bg-white
              shadow-2xl
              dark:border-slate-800
              dark:bg-slate-900
              lg:hidden
            "
          >
            {/* DRAWER HEADER */}

            <div
              className="
                flex
                h-24
                items-center
                justify-between
                border-b
                border-slate-200
                px-5
                dark:border-slate-800
              "
            >
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="
                  text-2xl
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                Print<span className="text-blue-500">Anywhere</span>
              </Link>

              <button
                type="button"
                onClick={closeMenu}
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-lg
                  text-2xl
                  text-slate-500
                  hover:bg-slate-100
                  dark:text-slate-400
                  dark:hover:bg-slate-800
                "
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

            {/* MENU */}

            <nav className="p-4">
              <div className="space-y-2">
                {menuItems.map((item) => {
                  const currentPath =
                    window.location.pathname;

                  const isActive =
                    currentPath === item.href ||
                    currentPath.startsWith(
                      `${item.href}/`
                    );

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className={`
                        flex
                        items-center
                        gap-4
                        rounded-xl
                        px-4
                        py-3
                        text-sm
                        font-medium
                        transition

                        ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        }
                      `}
                    >
                      <span className="w-5 text-center">
                        {item.icon}
                      </span>

                      <span>
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}