'use client';

import { useEffect, useState } from 'react';
import { Upload, PlusSquare, CheckCircle, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const INSTALL_SHOWN_KEY = 'armtrack-install-shown';
const ANDROID_DISMISSED_KEY = 'armtrack-install-dismissed';
const ANDROID_DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isIOSInstallShown(): boolean {
  try {
    return localStorage.getItem(INSTALL_SHOWN_KEY) === 'true';
  } catch {
    return false;
  }
}

function isAndroidDismissed(): boolean {
  try {
    const ts = localStorage.getItem(ANDROID_DISMISSED_KEY);
    if (!ts) return false;
    return Date.now() - parseInt(ts, 10) < ANDROID_DISMISS_DURATION_MS;
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

// ── iOS Step-by-step modal ────────────────────────────────────────────────────

function IOSGuide({ onDismiss }: { onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  const steps = [
    {
      icon: <Upload size={20} color="#3B82F6" strokeWidth={2} />,
      text: 'Tap the Share button at the bottom of your browser',
    },
    {
      icon: <PlusSquare size={20} color="#3B82F6" strokeWidth={2} />,
      text: "Scroll down and tap 'Add to Home Screen'",
    },
    {
      icon: <CheckCircle size={20} color="#3B82F6" strokeWidth={2} />,
      text: "Tap 'Add' in the top right corner",
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onDismiss}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          backgroundColor: '#000000',
          border: '1px solid #222222',
          borderRadius: '20px 20px 0 0',
          padding: '24px 20px 36px',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#3B82F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}>AT</span>
              </div>
              <p
                style={{
                  color: '#ffffff',
                  fontSize: '17px',
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: '-0.2px',
                }}
              >
                Add ArmTrack to your Home Screen
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            style={{
              color: '#555',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              flexShrink: 0,
              marginTop: '2px',
            }}
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ color: '#3B82F6', fontSize: '12px', fontWeight: 700 }}>{i + 1}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '4px' }}>
                {step.icon}
                <p style={{ color: '#cccccc', fontSize: '14px', margin: 0, lineHeight: 1.4 }}>
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tip */}
        <p
          style={{
            color: '#555555',
            fontSize: '12px',
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          The Share button looks like a box with an arrow pointing up.
        </p>

        {/* Got it */}
        <button
          onClick={onDismiss}
          style={{
            width: '100%',
            backgroundColor: '#3B82F6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '14px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

// ── Android install banner ─────────────────────────────────────────────────────

function AndroidBanner({
  onInstall,
  onDismiss,
}: {
  onInstall: () => void;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 88,
        left: 16,
        right: 16,
        zIndex: 50,
        transform: visible ? 'translateY(0)' : 'translateY(120%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.4s ease',
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
              <p style={{ color: '#888', fontSize: '12px', margin: 0, lineHeight: '1.4' }}>
                Add to your home screen for the best experience
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            style={{ color: '#555', padding: '2px', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onInstall}
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
            onClick={onDismiss}
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
      </div>
    </div>
  );
}

// ── Root component ─────────────────────────────────────────────────────────────

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) return;

    // iOS: show guide on first visit
    if (isIOS() && !isIOSInstallShown()) {
      setShowIOS(true);
    }

    // Android/Chrome: listen for native install prompt
    if (!isAndroidDismissed()) {
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setShowAndroid(true);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  function dismissIOS() {
    setShowIOS(false);
    try {
      localStorage.setItem(INSTALL_SHOWN_KEY, 'true');
    } catch {}
  }

  function dismissAndroid() {
    setShowAndroid(false);
    try {
      localStorage.setItem(ANDROID_DISMISSED_KEY, String(Date.now()));
    } catch {}
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowAndroid(false);
    }
  }

  return (
    <>
      {showIOS && <IOSGuide onDismiss={dismissIOS} />}
      {showAndroid && <AndroidBanner onInstall={install} onDismiss={dismissAndroid} />}
    </>
  );
}
