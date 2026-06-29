import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'app.armtrack.app',
  appName: 'ArmTrack',
  webDir: 'out',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#000000',
  },
  plugins: {
    Keyboard: {
      // Don't resize the WebView when the keyboard opens — it just overlays the
      // bottom, so the screen stays fixed and only the keyboard slides up.
      resize: KeyboardResize.None,
    },
    SplashScreen: {
      // Keep the splash up until the web app mounts and calls hide() itself —
      // otherwise it auto-hides before the WebView finishes its cold start
      // (~3s on first launch) and the user sees a black screen in the gap.
      launchAutoHide: false,
      backgroundColor: '#000000',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false,
      launchFadeOutDuration: 300,
    },
  },
};

export default config;
