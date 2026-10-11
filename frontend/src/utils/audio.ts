// Web Audio API Sound Synthesizer for Family Feud Game Show

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playDing() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Bright 2-tone game show bell chime
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(880, now); // A5
    osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.08); // A6 ping

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, now); // E6 harmonic
    osc2.frequency.exponentialRampToValueAtTime(2640, now + 0.1);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.85);
    osc2.stop(now + 0.85);
  } catch (e) {
    console.warn('Audio playback error', e);
  }
}

export function playBuzz() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Abrasive classic low dual-sawtooth Family Feud strike buzzer
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(125, now);
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(133, now); // Detuned buzz
    osc3.type = 'square';
    osc3.frequency.setValueAtTime(62.5, now); // Low thud

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.45, now + 0.02);
    gain.gain.setValueAtTime(0.45, now + 0.45);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc1.connect(gain);
    osc2.connect(gain);
    osc3.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    osc1.stop(now + 0.7);
    osc2.stop(now + 0.7);
    osc3.stop(now + 0.7);
  } catch (e) {
    console.warn('Audio playback error', e);
  }
}

export function playStrike3Horn() {
  try {
    // 3 rapid aggressive buzz pulses
    playBuzz();
    setTimeout(() => playBuzz(), 280);
    setTimeout(() => playBuzz(), 560);
  } catch (e) {
    console.warn('Audio playback error', e);
  }
}

export function playFaceOffBell() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const playSingleDong = (time: number, freq: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.35, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.75);
    };

    playSingleDong(now, 587.33); // D5
    playSingleDong(now + 0.15, 880.00); // A5
  } catch (e) {
    console.warn('Audio playback error', e);
  }
}

export function playWinFanfare() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Ascending celebratory fanfare: C4, E4, G4, C5, high flourish
    const notes = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 659.25, d: 0.12, t: 0.12 },
      { f: 783.99, d: 0.12, t: 0.24 },
      { f: 1046.50, d: 0.45, t: 0.36 },
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);

      gain.gain.setValueAtTime(0.001, now + n.t);
      gain.gain.linearRampToValueAtTime(0.35, now + n.t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.t);
      osc.stop(now + n.t + n.d + 0.05);
    });
  } catch (e) {
    console.warn('Audio playback error', e);
  }
}

export function playSfx(sound: 'ding' | 'buzz' | 'strike3' | 'bell' | 'fanfare') {
  switch (sound) {
    case 'ding':
      playDing();
      break;
    case 'buzz':
      playBuzz();
      break;
    case 'strike3':
      playStrike3Horn();
      break;
    case 'bell':
      playFaceOffBell();
      break;
    case 'fanfare':
      playWinFanfare();
      break;
  }
}
