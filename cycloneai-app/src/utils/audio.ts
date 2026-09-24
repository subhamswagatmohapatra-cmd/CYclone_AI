/**
 * Web Audio API synthesizer for disaster alerts, radar pings, and siren testing.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playRadarPingSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.error('Audio playback failed', e);
  }
}

export function playAlertWarningSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Two high-pitch warble pulses
    [0, 0.18, 0.36].forEach((delay, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(idx % 2 === 0 ? 950 : 750, now + delay);

      gain.gain.setValueAtTime(0.12, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.14);
    });
  } catch (e) {
    console.error('Audio playback failed', e);
  }
}

export function playDisasterSirenLoop(durationSec: number = 4) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return () => {};

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const now = ctx.currentTime;

    // Siren sweep from 450Hz to 850Hz back and forth
    const cycles = Math.floor(durationSec / 1.5);
    for (let i = 0; i < cycles; i++) {
      const t = now + i * 1.5;
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.linearRampToValueAtTime(850, t + 0.75);
      osc.frequency.linearRampToValueAtTime(450, t + 1.5);
    }

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.15, now + durationSec - 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durationSec);

    return () => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (err) {}
    };
  } catch (e) {
    console.error('Siren audio error', e);
    return () => {};
  }
}

export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.12, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.35);
    });
  } catch (e) {
    console.error('Audio chime error', e);
  }
}

export function playPhoneRingTone(): () => void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return () => {};

    // Standard North American / Indian telephone ring: 440 Hz + 480 Hz
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(440, ctx.currentTime);
    osc2.frequency.setValueAtTime(480, ctx.currentTime);

    gain.gain.setValueAtTime(0.09, ctx.currentTime);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();

    return () => {
      try {
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        setTimeout(() => {
          try {
            osc1.stop();
            osc2.stop();
            osc1.disconnect();
            osc2.disconnect();
          } catch (err) {}
        }, 60);
      } catch (e) {}
    };
  } catch (e) {
    console.error('Phone ring sound error', e);
    return () => {};
  }
}

