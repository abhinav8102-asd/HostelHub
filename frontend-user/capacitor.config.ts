import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hostelhub.app',
  appName: 'HostelHub',
  webDir: 'dist/frontend-user/browser',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: "#0a0f1a",
      androidSplashResourceName: "splash",
      showSpinner: false
    }
  }
};

export default config;
