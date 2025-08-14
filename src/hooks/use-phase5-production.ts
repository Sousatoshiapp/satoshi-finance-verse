import { useEffect } from 'react';
import { productionHardening } from '@/lib/production-hardening';
import { gracefulDegradation } from '@/lib/graceful-degradation';
import { pwaOptimization } from '@/lib/pwa-optimization';
import { offlineCapabilities } from '@/lib/offline-capabilities';

export const usePhase5Production = () => {
  useEffect(() => {
    const initializeProductionSystems = async () => {
      try {
        // Initialize all production hardening systems in parallel
        await Promise.allSettled([
          productionHardening.initialize(),
          pwaOptimization.initialize(),
          gracefulDegradation.startMonitoring(),
        ]);

        // Setup PWA install prompt
        pwaOptimization.setupInstallPrompt();
        
        // Track PWA usage
        pwaOptimization.trackPWAUsage();

        console.log('✅ Phase 5: Production Hardening - All systems initialized');
      } catch (error) {
        console.error('Failed to initialize production systems:', error);
      }
    };

    initializeProductionSystems();

    // Cleanup on unmount
    return () => {
      gracefulDegradation.stopMonitoring();
    };
  }, []);

  return {
    isOnline: !offlineCapabilities.isOffline(),
    pendingSync: offlineCapabilities.getPendingOperationsCount(),
    installStatus: pwaOptimization.getInstallationStatus(),
    systemHealth: gracefulDegradation.getServiceStatus()
  };
};