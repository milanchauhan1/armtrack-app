import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.armtrack.app',
  appName: 'ArmTrack',
  webDir: 'out',
  server: {
    // Load live Vercel deployment — keeps auth, API routes, and Supabase working
    url: 'https://armtrack.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
