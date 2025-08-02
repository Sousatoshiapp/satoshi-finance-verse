import { CapacitorConfig } from '@capacitor/cli';

const getServerUrl = () => {
  const mode = process.env.NODE_ENV || 'development';
  
  switch (mode) {
    case 'production':
      return 'https://app.satoshifinance.com';
    case 'staging':
      return 'https://staging.satoshifinance.com';
    default:
      return 'https://d2e8a781-1b9b-4d86-a980-5a42d9bce352.lovableproject.com?forceHideBadge=true';
  }
};

const config: CapacitorConfig = {
  appId: process.env.CAPACITOR_APP_ID || 'app.lovable.d2e8a7811b9b4d86a9805a42d9bce352',
  appName: process.env.CAPACITOR_APP_NAME || 'satoshi-finance-verse',
  webDir: 'dist',
  server: {
    url: getServerUrl(),
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
  },
};

export default config;
