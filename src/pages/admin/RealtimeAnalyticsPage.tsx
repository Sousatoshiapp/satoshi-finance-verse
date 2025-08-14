import React from 'react';
import { AdminAuthProtection } from '@/components/admin-auth-protection';
import { AdminSidebar } from '@/components/features/admin/admin-sidebar';
import { RealTimeAnalyticsDashboard } from '@/components/features/admin/realtime-analytics-dashboard';
import { useAnalyticsRouteTracking, useAnalyticsFeatureTracking } from '@/hooks/use-phase4-analytics';

export default function RealtimeAnalyticsPage() {
  // Track analytics for this admin page
  useAnalyticsRouteTracking();
  useAnalyticsFeatureTracking('admin_realtime_analytics');

  return (
    <AdminAuthProtection>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <RealTimeAnalyticsDashboard />
        </main>
      </div>
    </AdminAuthProtection>
  );
}