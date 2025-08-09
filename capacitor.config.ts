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
      launchShowDuration: 10000,
      launchAutoHide: false,
      backgroundColor: "#000000",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#adff2f",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
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
