"use client";

export default function AccountInfo({
  user,
}) {
  return (
    <div className="mb-6 rounded-2xl bg-white p-6 shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Account
      </p>

      <p className="mt-2 font-semibold text-slate-900">
        {user?.name || "User"}
      </p>

      <p className="text-sm text-slate-500">
        {user?.email || "No email"}
      </p>
    </div>
  );
}