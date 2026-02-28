import React from "react";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-5">
        <h2 className="text-xl font-bold mb-6">SecureFlow</h2>
        <nav className="space-y-3">
          <p className="cursor-pointer hover:text-blue-500">Overview</p>
          <p className="cursor-pointer hover:text-blue-500">Activity</p>
          <p className="cursor-pointer hover:text-blue-500">Settings</p>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-6">
          Dashboard
        </h1>

        {/* cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Active Users</p>
            <h2 className="text-2xl font-bold">124</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Threat Alerts</p>
            <h2 className="text-2xl font-bold">7</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">System Health</p>
            <h2 className="text-2xl font-bold">98%</h2>
          </div>
        </div>

      </main>
    </div>
  );
}