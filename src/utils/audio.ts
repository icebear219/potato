/**
 * Cute retro synthesized sound effects for kindergarten kids!
 * Using standard Web Audio API so it runs client-side without any asset files.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a simple beep sound (ideal for 3, 2, 1 countdown)
 */
export function playCountdownBeep(freq = 600, duration = 0.15) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Cute pitch drop-off for a friendlier count sound
    osc.frequency.exponentialRampToValueAtTime(freq - 100, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
}

/**
 * Play a cute double bubble pop click for button interactions
 */
export function playCutePop() {
  try {
    const ctx = getAudioContext();
    
    // First tiny pop
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(400, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
    gain1.gain.setValueAtTime(0.1, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.08);

    // Second tiny pop slightly delayed
    setTimeout(() => {
      try {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(500, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.08);
        gain2.gain.setValueAtTime(0.08, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.08);
      } catch {}
    }, 40);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
}

/**
 * Play a retro camera shutter click sound (white noise + envelope)
 */
export function playCameraShutter() {
  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * 0.15; // 150ms sound
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Fill buffer with white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Filter to make it sound more like a shutter click
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 1.0;

    const gain = ctx.createGain();
    
    // Fast envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01); // Quick attack
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12); // Short decay

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noiseSource.start();
    noiseSource.stop(ctx.currentTime + 0.15);

    // Add an overlapping cute high-pitched tone for feedback
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.02);
    oscGain.gain.setValueAtTime(0, ctx.currentTime);
    oscGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.03);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.warn('Shutter sound failed:', e);
  }
}

/**
 * Adorable success chime (pleasant major scale kindergarten melody)
 */
export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const notes = [
      { f: 523.25, d: 0.1, t: 0.0 }, // C5
      { f: 659.25, d: 0.1, t: 0.12 }, // E5
      { f: 783.99, d: 0.12, t: 0.24 }, // G5
      { f: 1046.50, d: 0.25, t: 0.36 } // C6
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, now + note.t);
      
      gain.gain.setValueAtTime(0.0, now + note.t);
      gain.gain.linearRampToValueAtTime(0.08, now + note.t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + note.t);
      osc.stop(now + note.t + note.d);
    });
  } catch (e) {
    console.warn('Success chime failed:', e);
  }
}
