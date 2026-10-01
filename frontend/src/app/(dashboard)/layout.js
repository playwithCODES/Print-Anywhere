"use client";

import { useState } from "react";

import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 transition-colors dark:bg-slate-950">
      <Sidebar
        open={sidebarOpen}
        close={() => setSidebarOpen(false)}
      />

      <div className="ml-0 min-h-screen lg:ml-64">
        <Header
          openMenu={() => setSidebarOpen(true)}
        />

        <main>{children}</main>
      </div>
    </div>
  );
}