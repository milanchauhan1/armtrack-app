'use client';

import { useEffect, useState } from 'react';
import { Share, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'armtrack-install-dismissed';
const VISIT_COUNT_KEY = 'armtrack-visit-count';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isDismissed(): boolean {
  try {
    const ts = localStorage.getItem(DISMISSED_KEY);
    if (!ts) return false;
    return Date.now() - parseInt(ts, 10) < DISMISS_DURATION_MS;
  } catch {
    return false;
  }
}

function isIOS(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  );
}

function isInStandaloneMode(): boolean {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode() || isDismissed()) return;

    // Track visit count for iOS prompt
    try {
      const visits = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10) + 1;
      localStorage.setItem(VISIT_COUNT_KEY, String(visits));
      if (isIOS() && visits >= 2) {
        setShowIOS(true);
        setTimeout(() => setVisible(true), 1500);
      }
    } catch {}

    // Listen for Android/Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAndroid(true);
      setTimeout(() => setVisible(true), 1500);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {}
    setTimeout(() => {
      setShowAndroid(false);
      setShowIOS(false);
    }, 400);
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowAndroid(false);
      setVisible(false);
    }
  }

  if (!showAndroid && !showIOS) return null;

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-50 transition-all duration-400"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(120%)',
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        style={{
          backgroundColor: '#111111',
          border: '1px solid #222222',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* ArmTrack wordmark */}
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700, letterSpacing: '-0.5px' }}>AT</span>
            </div>
            <div>
              <p style={{ color: '#fff', fontSize: '14px', fontWeight: 600, margin: 0 }}>ArmTrack</p>
              {showIOS ? (
                <p style={{ color: '#888', fontSize: '12px', margin: 0, lineHeight: '1.4' }}>
                  Tap{' '}
                  <Share size={11} style={{ display: 'inline', verticalAlign: 'middle', marginBottom: '1px' }} />{' '}
                  then &ldquo;Add to Home Screen&rdquo;
                </p>
              ) : (
                <p style={{ color: '#888', fontSize: '12px', margin: 0, lineHeight: '1.4' }}>
                  Add to your home screen for the best experience
                </p>
              )}
            </div>
          </div>
          <button
            onClick={dismiss}
            style={{ color: '#555', padding: '2px', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>

        {showAndroid && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={install}
              style={{
                flex: 1,
                backgroundColor: '#3B82F6',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Install App
            </button>
            <button
              onClick={dismiss}
              style={{
                flex: 1,
                backgroundColor: '#222',
                color: '#888',
                border: 'none',
                borderRadius: '10px',
                padding: '10px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Not now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
