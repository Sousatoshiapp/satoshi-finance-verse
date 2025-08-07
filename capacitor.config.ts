import { CapacitorConfig } from '@capacitor/cli';

const getServerUrl = () => {
  const mode = process.env.NODE_ENV || 'development';
  
  switch (mode) {
    case 'production':
      return 'https://app.sousatoshi.com.br';
    case 'staging':
      return 'https://https://app.sousatoshi.com.br';
    default:
      return 'https://https://app.sousatoshi.com.br';
  }
};

const config: CapacitorConfig = {
  appId: process.env.CAPACITOR_APP_ID || 'Satoshi.Satoshi-Finance-Game',
  appName: process.env.CAPACITOR_APP_NAME || 'satoshi-finance-verse',
  webDir: 'dist',
  server: {
    url: getServerUrl(),
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 10000,
      launchAutoHide: false,
      backgroundColor: "##000000",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
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
