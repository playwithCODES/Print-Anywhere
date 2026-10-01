"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

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

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpenSidebar = () => {
      setIsOpen(true);
    };

    window.addEventListener(
      "open-printanywhere-sidebar",
      handleOpenSidebar
    );

    return () => {
      window.removeEventListener(
        "open-printanywhere-sidebar",
        handleOpenSidebar
      );
    };
  }, []);

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* MOBILE BACKDROP */}

      {isOpen && (
        <div
          onClick={closeSidebar}
          className="
            fixed
            inset-0
            z-40
            bg-black/50
            lg:hidden
          "
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          w-64
          flex-col
          border-r
          border-slate-200
          bg-white
          shadow-xl
          transition-transform
          duration-300
          dark:border-slate-800
          dark:bg-slate-900

          lg:translate-x-0

          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* LOGO */}

        <div className="flex h-24 items-center justify-between px-5">
          <Link
            href="/dashboard"
            onClick={closeSidebar}
            className="
              text-2xl
              font-bold
              text-slate-900
              dark:text-white
            "
          >
            Print<span className="text-blue-500">Anywhere</span>
          </Link>

          {/* CLOSE BUTTON */}

          <button
            type="button"
            onClick={closeSidebar}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-2xl
              text-slate-500
              hover:bg-slate-100
              lg:hidden
              dark:text-slate-400
              dark:hover:bg-slate-800
            "
          >
            ×
          </button>
        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 px-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(
                  `${item.href}/`
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`
                    flex
                    items-center
                    gap-4
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-medium
                    transition-all

                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    }
                  `}
                >
                  <span className="w-5 text-center">
                    {item.icon}
                  </span>

                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* BOTTOM */}

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <p className="text-center text-xs text-slate-400">
            PrintAnywhere
          </p>
        </div>
      </aside>
    </>
  );
}