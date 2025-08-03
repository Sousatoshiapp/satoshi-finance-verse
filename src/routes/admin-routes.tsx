import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminPanel from "@/pages/AdminPanel";

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/panel" element={<AdminPanel />} />
    </Routes>
  );
}
