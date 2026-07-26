import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hostelhub.app',
  appName: 'HostelHub',
  webDir: 'dist/frontend-user/browser',
  server: {
    androidScheme: 'https'
  }
};

export default config;
