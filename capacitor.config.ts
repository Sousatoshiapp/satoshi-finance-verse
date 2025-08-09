import { CapacitorConfig } from '@capacitor/cli';

const getServerUrl = () => {
  const mode = process.env.NODE_ENV || 'development';
  
  switch (mode) {
    case 'production':
      return 'https://app.sousatoshi.com.br';
    case 'staging':
      return 'https://app.sousatoshi.com.br';
    default:
      return 'https://app.sousatoshi.com.br';
  }
};

const config: CapacitorConfig = {
  appId: process.env.CAPACITOR_APP_ID || 'Satoshi.Satoshi-Finance-Game',
  appName: process.env.CAPACITOR_APP_NAME || 'Satoshi Finance Game',
  webDir: 'dist',
  server: {
    url: getServerUrl(),
    cleartext: true
  },
  ios: {
    scheme: "Satoshi Finance Game"
  },
  android: {
    scheme: "Satoshi Finance Game"
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#000000",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
