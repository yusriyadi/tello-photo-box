let audioContext;

function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }

    audioContext = new AudioContextClass();
  }

  return audioContext;
}

export async function primeSound() {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  if (context.state === "suspended") {
    await context.resume();
  }
}

export async function playCountdownTick() {
  await playTone(880, 0.08, "square", 0.03);
}

export async function playShutter() {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  if (context.state === "suspended") {
    await context.resume();
  }

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(220, now);
  oscillator.frequency.exponentialRampToValueAtTime(110, now + 0.12);

  filter.type = "highpass";
  filter.frequency.setValueAtTime(1400, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.18);
}

async function playTone(frequency, duration, type, volume) {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  if (context.state === "suspended") {
    await context.resume();
  }

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}
