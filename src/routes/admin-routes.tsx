import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminPanel from "@/pages/AdminPanel";
import AdminDistrictPowers from "@/pages/AdminDistrictPowers";
import AdminDistrictPowerLogs from "@/pages/AdminDistrictPowerLogs";

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/panel" element={<AdminPanel />} />
      <Route path="/admin/districts/powers" element={<AdminDistrictPowers />} />
      <Route path="/admin/districts/power-logs" element={<AdminDistrictPowerLogs />} />
    </Routes>
  );
}
