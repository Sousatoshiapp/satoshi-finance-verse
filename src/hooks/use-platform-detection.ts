import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

export type PlatformType = 'web' | 'ios' | 'android';
export type EnvironmentMode = 'development' | 'staging' | 'production';

export interface PlatformInfo {
  platform: PlatformType;
  isNative: boolean;
  isWeb: boolean;
  mode: EnvironmentMode;
}

export const usePlatformDetection = (): PlatformInfo => {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>({
    platform: 'web',
    isNative: false,
    isWeb: true,
    mode: (import.meta.env.MODE as EnvironmentMode) || 'development'
  });

  useEffect(() => {
    const detectPlatform = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          const info = await Device.getInfo();
          const platform = info.platform as PlatformType;
          
          setPlatformInfo({
            platform,
            isNative: true,
            isWeb: false,
            mode: (import.meta.env.MODE as EnvironmentMode) || 'production'
          });
        } else {
          setPlatformInfo({
            platform: 'web',
            isNative: false,
            isWeb: true,
            mode: (import.meta.env.MODE as EnvironmentMode) || 'development'
          });
        }
      } catch (error) {
        console.warn('Platform detection failed, defaulting to web:', error);
      }
    };

    detectPlatform();
  }, []);

  return platformInfo;
};
