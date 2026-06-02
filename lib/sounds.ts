// Lightweight Web Audio sound engine — synthesized, no asset files.
// Tasteful, low-volume cues for positive moments only (never on every tap).
// All calls are fire-and-forget, guarded, and never throw.
// Respects a user mute flag in localStorage ("armtrack-sound" === "off").

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (localStorage.getItem("armtrack-sound") === "off") return null;
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

// A single sine/triangle "bell" note.
function note(freq: number, start: number, dur: number, gain = 0.12, type: OscillatorType = "sine") {
  const c = getCtx();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t0 = c.currentTime + start;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  } catch {
    /* non-fatal */
  }
}

/** Bright ascending major arpeggio — log saved / success. */
export function playSuccess() {
  // C5 – E5 – G5 – C6
  note(523.25, 0, 0.5, 0.1);
  note(659.25, 0.09, 0.45, 0.09);
  note(783.99, 0.18, 0.45, 0.09);
  note(1046.5, 0.28, 0.6, 0.11);
}

/** Soft single confirmation blip — lighter than success (edit saved). */
export function playBlip() {
  note(880, 0, 0.18, 0.07, "triangle");
  note(1174.7, 0.06, 0.22, 0.06, "triangle");
}

/** Airy filtered-noise whoosh — the celebration throw. */
export function playWhoosh() {
  const c = getCtx();
  if (!c) return;
  try {
    const dur = 0.4;
    const buffer = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 0.8;
    const t0 = c.currentTime;
    filter.frequency.setValueAtTime(400, t0);
    filter.frequency.exponentialRampToValueAtTime(3000, t0 + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(0.08, t0 + 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(c.destination);
    src.start(t0);
    src.stop(t0 + dur);
  } catch {
    /* non-fatal */
  }
}

/** Short percussive impact — the ball "crack". */
export function playImpact() {
  const c = getCtx();
  if (!c) return;
  try {
    const dur = 0.16;
    const buffer = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    }
    const src = c.createBufferSource();
    src.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2200;
    const g = c.createGain();
    const t0 = c.currentTime;
    g.gain.setValueAtTime(0.18, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(c.destination);
    src.start(t0);
    src.stop(t0 + dur);
    // low thump under the crack
    note(120, 0, 0.18, 0.12, "sine");
  } catch {
    /* non-fatal */
  }
}

export function soundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("armtrack-sound") !== "off";
}

export function setSoundEnabled(on: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem("armtrack-sound", on ? "on" : "off");
}
