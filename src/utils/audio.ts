// ============================================================================
// WHAT IF...? Sound Design Engine
// Cohesive, playful, cartoon-absurd Web Audio synthesis system
// Zero external assets • Balanced volume • Dynamic variation • No harsh clipping
// ============================================================================

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let masterCompressor: DynamicsCompressorNode | null = null;
let noiseBufferCache: AudioBuffer | null = null;

const STORAGE_KEY = "what_if_sound_enabled";

// Retrieve sound setting with fallback to true
function getInitialSoundState(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== null ? saved === "true" : true;
  } catch {
    return true;
  }
}

let soundEnabled = getInitialSoundState();

// Rate limiting & concurrency protection to prevent volume buildup during rapid clicks
let activeVoiceCount = 0;
const MAX_CONCURRENT_VOICES = 6;
let lastSoundTime = 0;

// Initialize or resume AudioContext
function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (AudioContextClass) {
      audioCtx = new AudioContextClass();

      // Master Compressor prevents distortion or harsh volume peaks
      masterCompressor = audioCtx.createDynamicsCompressor();
      masterCompressor.threshold.setValueAtTime(-14, audioCtx.currentTime);
      masterCompressor.knee.setValueAtTime(25, audioCtx.currentTime);
      masterCompressor.ratio.setValueAtTime(10, audioCtx.currentTime);
      masterCompressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
      masterCompressor.release.setValueAtTime(0.2, audioCtx.currentTime);

      // Master Gain for pleasant overall volume
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.75, audioCtx.currentTime);

      masterCompressor.connect(masterGain);
      masterGain.connect(audioCtx.destination);
    }
  }

  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

// ============================================================================
// AUDIO ASSET LOADER: Exact Viral Evil Baby Laugh Sound Effect
// Preloads /sounds/fail_laugh.mp3 into an AudioBuffer for zero-latency playback.
// Falls back seamlessly to HTML5 Audio or procedural synthesis if offline.
// ============================================================================

let failLaughBuffer: AudioBuffer | null = null;
let isPreloadingFailLaugh = false;

async function preloadFailLaugh(ctx: AudioContext) {
  if (failLaughBuffer || isPreloadingFailLaugh || typeof window === "undefined") return;
  isPreloadingFailLaugh = true;
  try {
    const res = await fetch("/sounds/fail_laugh.mp3");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.arrayBuffer();
    failLaughBuffer = await ctx.decodeAudioData(data);
  } catch (err) {
    console.warn("Preloading fail laugh audio buffer failed, will use HTML5 Audio fallback:", err);
  } finally {
    isPreloadingFailLaugh = false;
  }
}

// Ensure audio context is ready on first user interaction (browser autoplay compliance)
if (typeof window !== "undefined") {
  const unlockAudio = () => {
    const ctx = getContext();
    if (ctx) {
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      preloadFailLaugh(ctx);
    }
    window.removeEventListener("pointerdown", unlockAudio);
    window.removeEventListener("keydown", unlockAudio);
  };
  window.addEventListener("pointerdown", unlockAudio, { passive: true });
  window.addEventListener("keydown", unlockAudio, { passive: true });
}

// Generate shared soft noise buffer for organic tactile whooshes & clicks
function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (!noiseBufferCache || noiseBufferCache.sampleRate !== ctx.sampleRate) {
    const bufferSize = ctx.sampleRate * 1.5; // 1.5 seconds of noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    // Pinkish/softened noise for warmer acoustic quality
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    noiseBufferCache = buffer;
  }
  return noiseBufferCache;
}

// Helper to connect a node to the master chain with concurrency tracking
function connectToMaster(ctx: AudioContext, node: AudioNode, durationSeconds: number) {
  if (!masterCompressor) {
    node.connect(ctx.destination);
  } else {
    node.connect(masterCompressor);
  }

  activeVoiceCount++;
  setTimeout(() => {
    activeVoiceCount = Math.max(0, activeVoiceCount - 1);
  }, Math.min(durationSeconds * 1000 + 50, 4000));
}

export function toggleSound(): boolean {
  soundEnabled = !soundEnabled;
  try {
    localStorage.setItem(STORAGE_KEY, String(soundEnabled));
  } catch {}

  if (soundEnabled) {
    playButtonPress("toggle_on");
  }
  return soundEnabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

// Random micro-detune factor (e.g. 0.96 to 1.04) so repeated sounds don't feel robotic
function microDetune(range = 0.04): number {
  return 1 + (Math.random() * 2 - 1) * range;
}

// ============================================================================
// 1. WHAT IF...? SIGNATURE RECURRING SONIC MOTIF
// The thematic connective tissue across the whole universe
// Base Motif: Inquisitive upward step-leap with quirky question-mark inflection
// ============================================================================

export type MotifVariant =
  | "wake"            // Machine waking up on landing page start
  | "spiral_round_1"  // Curious
  | "spiral_round_2"  // Suspicious
  | "spiral_round_3"  // Overthinking
  | "spiral_round_4"  // Ridiculous
  | "spiral_round_5"  // Unhinged
  | "spiral_to_game"  // Uh-oh transition to experiments
  | "launch_game";    // High-energy sandbox entrance

export function playWhatIfMotif(variant: MotifVariant = "wake") {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx || activeVoiceCount >= MAX_CONCURRENT_VOICES + 2) return;

  const now = ctx.currentTime;
  const detune = microDetune(0.02);

  try {
    if (variant === "wake") {
      // Machine waking up: warm inquisitive 3-note bubble-chime
      // Notes: G4 -> C5 -> E5 with soft rising harmonic filter
      const notes = [392 * detune, 523.25 * detune, 659.25 * detune];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.07);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(600, now + i * 0.07);
        filter.frequency.exponentialRampToValueAtTime(2400, now + i * 0.07 + 0.15);

        gain.gain.setValueAtTime(0.001, now + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.16, now + i * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.28);

        osc.connect(filter);
        filter.connect(gain);
        connectToMaster(ctx, gain, 0.35 + i * 0.07);

        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.3);
      });
    } else if (variant === "spiral_round_1") {
      // Curious motif: light, bouncy, clean
      const notes = [440 * detune, 554.37 * detune, 659.25 * detune];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.14, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.22);

        osc.connect(gain);
        connectToMaster(ctx, gain, 0.28);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.23);
      });
    } else if (variant === "spiral_round_2") {
      // Suspicious motif: slightly bent skeptical interval (diminished 5th dip)
      const notes = [440 * detune, 622.25 * detune, 587.33 * detune];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq * 0.97, now + i * 0.08);
        osc.frequency.exponentialRampToValueAtTime(freq, now + i * 0.08 + 0.04);

        gain.gain.setValueAtTime(0.14, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);

        osc.connect(gain);
        connectToMaster(ctx, gain, 0.3);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.26);
      });
    } else if (variant === "spiral_round_3") {
      // Overthinking motif: rapid, warbly, slightly paranoid vibrato
      const notes = [493.88 * detune, 587.33 * detune, 739.99 * detune, 659.25 * detune];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.05);
        // micro vibrato
        osc.frequency.linearRampToValueAtTime(freq * 1.03, now + i * 0.05 + 0.06);
        osc.frequency.linearRampToValueAtTime(freq * 0.98, now + i * 0.05 + 0.14);

        gain.gain.setValueAtTime(0.13, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.2);

        osc.connect(gain);
        connectToMaster(ctx, gain, 0.25);

        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.21);
      });
    } else if (variant === "spiral_round_4") {
      // Ridiculous motif: cartoon rubber boing pitch slides
      const notes = [370 * detune, 520 * detune, 780 * detune];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq * 0.75, now + i * 0.07);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + i * 0.07 + 0.08);
        osc.frequency.exponentialRampToValueAtTime(freq, now + i * 0.07 + 0.16);

        gain.gain.setValueAtTime(0.14, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.22);

        osc.connect(gain);
        connectToMaster(ctx, gain, 0.28);

        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.24);
      });
    } else if (variant === "spiral_round_5") {
      // Unhinged motif: chaotic double-bounce with rubbery pitch jump
      const freqs = [330, 495, 310, 680, 520].map(f => f * detune);
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i % 2 === 0 ? "sawtooth" : "triangle";
        osc.frequency.setValueAtTime(freq * 1.4, now + i * 0.045);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.8, now + i * 0.045 + 0.07);

        // Lowpass filter to keep sawtooth pleasant
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1400, now + i * 0.045);

        gain.gain.setValueAtTime(0.11, now + i * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.045 + 0.15);

        osc.connect(filter);
        filter.connect(gain);
        connectToMaster(ctx, gain, 0.2);

        osc.start(now + i * 0.045);
        osc.stop(now + i * 0.045 + 0.16);
      });
    } else if (variant === "spiral_to_game") {
      // The "uh-oh, something has gone wrong" transition sound!
      // Motif tries to be confident, then trips over its own feet and deflates
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();

      // Confident start
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(440 * detune, now);
      osc1.frequency.setValueAtTime(554.37 * detune, now + 0.08);
      // Awkward sudden wobble and tumble
      osc1.frequency.setValueAtTime(466.16 * detune, now + 0.17);
      osc1.frequency.exponentialRampToValueAtTime(110 * detune, now + 0.45);

      gain1.gain.setValueAtTime(0.16, now);
      gain1.gain.setValueAtTime(0.18, now + 0.15);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

      // Comedic rubber boing undertone
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(220 * detune, now + 0.18);
      osc2.frequency.exponentialRampToValueAtTime(95 * detune, now + 0.46);

      gain2.gain.setValueAtTime(0.15, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

      osc1.connect(gain1);
      osc2.connect(gain2);
      connectToMaster(ctx, gain1, 0.5);
      connectToMaster(ctx, gain2, 0.5);

      osc1.start(now);
      osc1.stop(now + 0.49);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.49);
    } else if (variant === "launch_game") {
      // Energetic, quirky launch fanfare
      const notes = [330, 440, 554.37, 659.25, 880].map(f => f * detune);
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + i * 0.04);

        gain.gain.setValueAtTime(0.15, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.22);

        osc.connect(gain);
        connectToMaster(ctx, gain, 0.28);

        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.23);
      });
    }
  } catch {}
}

// ============================================================================
// 2. OVERTHINKING THOUGHT SELECTION
// "Yep. You chose that thought. Now we're going deeper."
// Progressively escalates from curious -> suspicious -> unhinged
// ============================================================================

export function playThoughtSelect(roundNumber: number = 1) {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx || activeVoiceCount >= MAX_CONCURRENT_VOICES) return;

  const now = ctx.currentTime;
  const detune = microDetune(0.03);

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (roundNumber <= 1) {
      // Round 1: Curious rounded pop ("Yep.")
      osc.type = "sine";
      osc.frequency.setValueAtTime(440 * detune, now);
      osc.frequency.exponentialRampToValueAtTime(720 * detune, now + 0.03);
      osc.frequency.exponentialRampToValueAtTime(520 * detune, now + 0.09);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    } else if (roundNumber === 2) {
      // Round 2: Suspicious bent pop ("Wait...")
      osc.type = "triangle";
      osc.frequency.setValueAtTime(580 * detune, now);
      osc.frequency.exponentialRampToValueAtTime(420 * detune, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(490 * detune, now + 0.11);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    } else if (roundNumber === 3) {
      // Round 3: Strange warble ("Here we go...")
      osc.type = "triangle";
      osc.frequency.setValueAtTime(650 * detune, now);
      osc.frequency.exponentialRampToValueAtTime(320 * detune, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(580 * detune, now + 0.13);

      gain.gain.setValueAtTime(0.19, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    } else if (roundNumber === 4) {
      // Round 4: Ridiculous cartoon boing ("Uh oh")
      osc.type = "sawtooth";
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1200, now);

      osc.frequency.setValueAtTime(320 * detune, now);
      osc.frequency.exponentialRampToValueAtTime(840 * detune, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(260 * detune, now + 0.16);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

      osc.connect(filter);
      filter.connect(gain);
      connectToMaster(ctx, gain, 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
      return;
    } else {
      // Round 5: Completely unhinged double blip
      osc.type = "square";
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(900, now);

      osc.frequency.setValueAtTime(780 * detune, now);
      osc.frequency.exponentialRampToValueAtTime(220 * detune, now + 0.06);
      osc.frequency.setValueAtTime(880 * detune, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(180 * detune, now + 0.18);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

      osc.connect(filter);
      filter.connect(gain);
      connectToMaster(ctx, gain, 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
      return;
    }

    osc.connect(gain);
    connectToMaster(ctx, gain, 0.15);
    osc.start(now);
    osc.stop(now + 0.15);
  } catch {}
}

// ============================================================================
// 3. BUTTON THAT DOES NOTHING — SPECIAL SOUND
// Completely different from any other button in the site!
// Communicates: "Something happened... but absolutely nothing happened."
// Tiny mechanical disappointment, subtle micro-sigh, weak plastic click
// Escalates comedically across click count without being loud or irritating
// ============================================================================

export function playUselessButtonClick(clickCount: number = 0) {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx || activeVoiceCount >= MAX_CONCURRENT_VOICES + 1) return;

  const now = ctx.currentTime;
  const detune = microDetune(0.06);

  try {
    // 1. Tactile tiny mechanical clunk (damped noise pulse through bandpass)
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";

    // Center frequency shifts slightly based on click count:
    // early clicks: crisp hollow plastic
    // higher clicks: softer, weaker, more pathetic
    const centerFreq = Math.max(220, 520 - Math.min(clickCount, 50) * 5) * detune;
    filter.frequency.setValueAtTime(centerFreq, now);
    filter.Q.setValueAtTime(5, now);

    const noiseGain = ctx.createGain();
    const noiseLevel = Math.max(0.08, 0.2 - Math.min(clickCount, 60) * 0.002);
    noiseGain.gain.setValueAtTime(noiseLevel, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    noise.connect(filter);
    filter.connect(noiseGain);
    connectToMaster(ctx, noiseGain, 0.06);

    noise.start(now);
    noise.stop(now + 0.05);

    // 2. The "deliberately underwhelming mechanical disappointment" tone
    const osc = ctx.createOscillator();
    const toneGain = ctx.createGain();

    if (clickCount < 6) {
      // Early clicks (1-5): Tiny satisfying muted clunk
      osc.type = "sine";
      osc.frequency.setValueAtTime(220 * detune, now);
      osc.frequency.exponentialRampToValueAtTime(95 * detune, now + 0.045);

      toneGain.gain.setValueAtTime(0.16, now);
      toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    } else if (clickCount < 18) {
      // Clicks (6-17): Slightly weaker clunk with a soft two-note disappointment drop
      osc.type = "triangle";
      osc.frequency.setValueAtTime(180 * detune, now);
      osc.frequency.setValueAtTime(140 * detune, now + 0.025);
      osc.frequency.exponentialRampToValueAtTime(80 * detune, now + 0.06);

      toneGain.gain.setValueAtTime(0.13, now);
      toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
    } else if (clickCount < 45) {
      // Clicks (18-44): Increasingly pathetic little "poot" that sounds like it gave up
      osc.type = "sine";
      osc.frequency.setValueAtTime(150 * detune, now);
      osc.frequency.exponentialRampToValueAtTime(65 * detune, now + 0.05);

      toneGain.gain.setValueAtTime(0.1, now);
      toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    } else {
      // Clicks 45+: Ridiculous tiny dry failure sound / dying micro-boop ("...really?")
      osc.type = "triangle";
      const microPitch = (110 + (clickCount % 7) * 8) * detune;
      osc.frequency.setValueAtTime(microPitch, now);
      osc.frequency.linearRampToValueAtTime(microPitch * 0.7, now + 0.04);

      toneGain.gain.setValueAtTime(0.09, now);
      toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    }

    osc.connect(toneGain);
    connectToMaster(ctx, toneGain, 0.08);

    osc.start(now);
    osc.stop(now + 0.07);
  } catch {}
}

// ============================================================================
// 4. CATCH THE CHAIR — EVASIVE "NOPE!" SOUNDS
// Short comedic whooshes / slips that vary and become increasingly ridiculous
// ============================================================================

export function playChairDodge(attemptCount: number = 1) {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx || activeVoiceCount >= MAX_CONCURRENT_VOICES) return;

  const now = ctx.currentTime;
  const detune = microDetune(0.05);

  try {
    // Airy whoosh element
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";

    const baseFreq = Math.min(1800, 600 + attemptCount * 120) * detune;
    filter.frequency.setValueAtTime(baseFreq * 0.6, now);
    filter.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.06);
    filter.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.14);
    filter.Q.setValueAtTime(3.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.linearRampToValueAtTime(0.12, now + 0.04);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    noise.connect(filter);
    filter.connect(noiseGain);
    connectToMaster(ctx, noiseGain, 0.16);
    noise.start(now);
    noise.stop(now + 0.16);

    // Comedic "NOPE" pitch slide tone
    const osc = ctx.createOscillator();
    const toneGain = ctx.createGain();
    osc.type = attemptCount > 5 ? "triangle" : "sine";

    if (attemptCount <= 3) {
      // Early attempts: quick evasive slide-whoop
      osc.frequency.setValueAtTime(260 * detune, now);
      osc.frequency.exponentialRampToValueAtTime(560 * detune, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(220 * detune, now + 0.12);
      toneGain.gain.setValueAtTime(0.14, now);
      toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    } else if (attemptCount <= 7) {
      // Faster, slipperier cartoon slide
      osc.frequency.setValueAtTime(380 * detune, now);
      osc.frequency.exponentialRampToValueAtTime(920 * detune, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(340 * detune, now + 0.1);
      toneGain.gain.setValueAtTime(0.15, now);
      toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    } else {
      // Extremely ridiculous cartoon zip ("ZRRRT-NOPE!")
      osc.frequency.setValueAtTime(450 * detune, now);
      osc.frequency.exponentialRampToValueAtTime(1400 * detune, now + 0.03);
      osc.frequency.exponentialRampToValueAtTime(400 * detune, now + 0.08);
      toneGain.gain.setValueAtTime(0.16, now);
      toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    }

    osc.connect(toneGain);
    connectToMaster(ctx, toneGain, 0.14);
    osc.start(now);
    osc.stop(now + 0.14);
  } catch {}
}

// ============================================================================
// 5. IMPOSSIBLE CHECKBOX — ELASTIC "ZIP" / YOINK
// Playful tiny elastic escapes that vary with each jump
// ============================================================================

export function playCheckboxEscape(attemptCount: number = 1) {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx || activeVoiceCount >= MAX_CONCURRENT_VOICES) return;

  const now = ctx.currentTime;
  const detune = microDetune(0.05);

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Elastic rubber twang / cartoon zip
    osc.type = "triangle";
    const startFreq = (500 + (attemptCount % 5) * 60) * detune;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 2.1, now + 0.035);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.7, now + 0.09);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    connectToMaster(ctx, gain, 0.12);

    osc.start(now);
    osc.stop(now + 0.11);
  } catch {}
}

// ============================================================================
// 6. USELESS DRIVING SIMULATOR — CONTRADICTORY SOUNDS
// Reinforces the comedy: "You have controls, but they do nothing useful."
// ============================================================================

// Subtle sputtering engine that cuts out or putts absurdly
export function playCarAccelerator(speedModifier = 1) {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const detune = microDetune(0.04);

  try {
    // Sputtering putt-putt oscillator
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    // Pitch starts low and gives a tiny eager rev before stuttering
    const basePitch = Math.max(65, 85 * speedModifier) * detune;
    osc.frequency.setValueAtTime(basePitch, now);
    osc.frequency.linearRampToValueAtTime(basePitch * 1.8, now + 0.12);
    osc.frequency.linearRampToValueAtTime(basePitch * 0.9, now + 0.22);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(550, now);
    filter.frequency.linearRampToValueAtTime(950, now + 0.12);
    filter.frequency.linearRampToValueAtTime(450, now + 0.22);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(filter);
    filter.connect(gain);
    connectToMaster(ctx, gain, 0.26);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch {}
}

// Comedic squeak for brake
export function playCarBrake() {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const detune = microDetune(0.05);

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // High cartoon rubber bicycle brake squeak
    osc.type = "sine";
    osc.frequency.setValueAtTime(980 * detune, now);
    osc.frequency.exponentialRampToValueAtTime(1450 * detune, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(620 * detune, now + 0.14);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    connectToMaster(ctx, gain, 0.17);

    osc.start(now);
    osc.stop(now + 0.16);
  } catch {}
}

// Plastic toy steering wheel click (clicking away merrily while car ignores it)
export function playCarSteer(direction: "left" | "right" = "left") {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const detune = microDetune(0.04);

  try {
    // Rapid double mechanical tick
    const pitch = direction === "left" ? 340 : 380;
    [0, 0.035].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime((pitch + i * 40) * detune, now + offset);
      osc.frequency.exponentialRampToValueAtTime(150 * detune, now + offset + 0.025);

      gain.gain.setValueAtTime(0.12, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.03);

      osc.connect(gain);
      connectToMaster(ctx, gain, 0.05 + offset);

      osc.start(now + offset);
      osc.stop(now + offset + 0.032);
    });
  } catch {}
}

// ============================================================================
// 7. VIRAL EVIL BABY LAUGHTER FAIL SOUND ("Oh haha... HEHEHEHE! NYA-HAHAHAHA!")
// Plays the uploaded hilarious evil baby laughing sound effect.
// Instant zero-latency trigger with Web Audio API, HTML5 Audio element fallback,
// and procedural synthesis safety net.
// ============================================================================

export function playMockingLaughter() {
  if (!soundEnabled) return;
  const ctx = getContext();

  // 1. Primary: Instant playback using pre-decoded Web Audio API AudioBuffer
  if (ctx && failLaughBuffer) {
    try {
      const source = ctx.createBufferSource();
      source.buffer = failLaughBuffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.95, ctx.currentTime);
      source.connect(gain);
      connectToMaster(ctx, gain, failLaughBuffer.duration);
      source.start();
      return;
    } catch (e) {
      console.warn("BufferSource playback error, falling back:", e);
    }
  }

  // 2. Secondary: Instant HTML5 Audio playback (with audio overlap cloning)
  if (typeof window !== "undefined") {
    try {
      const audio = new Audio("/sounds/fail_laugh.mp3");
      audio.volume = 0.95;
      audio.play().then(() => {
        if (ctx && !failLaughBuffer) {
          preloadFailLaugh(ctx);
        }
      }).catch(() => {
        if (ctx) playProceduralMockingLaughter(ctx);
      });
      return;
    } catch {
      // Fall through to procedural
    }
  }

  // 3. Fallback: Procedural high-resonance laugh synthesizer
  if (ctx) {
    playProceduralMockingLaughter(ctx);
  }
}

function playProceduralMockingLaughter(ctx: AudioContext) {
  const now = ctx.currentTime;
  const detune = microDetune(0.04);
  const variant = Math.random() > 0.5 ? "wheezy" : "snorty";

  try {
    // ------------------------------------------------------------------------
    // Part 1: The Suppressed "PFFFT!" (Trying not to laugh, then failing instantly)
    // ------------------------------------------------------------------------
    const pfftNoise = ctx.createBufferSource();
    pfftNoise.buffer = getNoiseBuffer(ctx);
    const pfftFilter = ctx.createBiquadFilter();
    pfftFilter.type = "bandpass";
    pfftFilter.frequency.setValueAtTime(1600 * detune, now);
    pfftFilter.Q.setValueAtTime(4.5, now);

    const pfftGain = ctx.createGain();
    pfftGain.gain.setValueAtTime(0.001, now);
    pfftGain.gain.linearRampToValueAtTime(0.18, now + 0.03);
    pfftGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    pfftNoise.connect(pfftFilter);
    pfftFilter.connect(pfftGain);
    connectToMaster(ctx, pfftGain, 0.2);
    pfftNoise.start(now);
    pfftNoise.stop(now + 0.17);

    // ------------------------------------------------------------------------
    // Part 2: The Explosive Point-and-Mock Taunts ("HA! HA! HA! HA!")
    // Punchy, vocal "Ah/Ha" formants pointing directly at the user
    // ------------------------------------------------------------------------
    const taunts = [
      { time: 0.18, dur: 0.14, pitch: 920 * detune, vol: 0.28 },
      { time: 0.34, dur: 0.15, pitch: 1140 * detune, vol: 0.32 }, // louder & higher pitch!
      { time: 0.51, dur: 0.16, pitch: 860 * detune, vol: 0.29 },
      { time: 0.69, dur: 0.15, pitch: 1040 * detune, vol: 0.30 },
    ];

    taunts.forEach((t, idx) => {
      const osc = ctx.createOscillator();
      const vocalFormant = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = idx % 2 === 0 ? "sawtooth" : "triangle";

      // Vowel formant bandpass (Ah / Haw human laugh resonance)
      vocalFormant.type = "bandpass";
      vocalFormant.frequency.setValueAtTime(1450 * detune, now + t.time);
      vocalFormant.Q.setValueAtTime(3.8, now + t.time);

      // Comedic downward drop inside each mocking laugh syllable
      osc.frequency.setValueAtTime(t.pitch * 1.08, now + t.time);
      osc.frequency.linearRampToValueAtTime(t.pitch * 1.16, now + t.time + 0.03);
      osc.frequency.exponentialRampToValueAtTime(t.pitch * 0.78, now + t.time + t.dur);

      gain.gain.setValueAtTime(0.001, now + t.time);
      gain.gain.linearRampToValueAtTime(t.vol, now + t.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t.time + t.dur);

      osc.connect(vocalFormant);
      vocalFormant.connect(gain);
      connectToMaster(ctx, gain, t.time + t.dur + 0.05);

      osc.start(now + t.time);
      osc.stop(now + t.time + t.dur);
    });

    // ------------------------------------------------------------------------
    // Part 3: The Hilarious Asthmatic "WHEEEEEZE" (Laughing so hard they can't breathe)
    // ------------------------------------------------------------------------
    const wheezeStart = 0.88;
    const wheezeDur = variant === "wheezy" ? 0.48 : 0.36;

    // Breath whistling hiss
    const wheezeNoise = ctx.createBufferSource();
    wheezeNoise.buffer = getNoiseBuffer(ctx);
    const wheezeFilter = ctx.createBiquadFilter();
    wheezeFilter.type = "bandpass";
    wheezeFilter.frequency.setValueAtTime(2850 * detune, now + wheezeStart);
    wheezeFilter.Q.setValueAtTime(7.5, now + wheezeStart);

    const wheezeGain = ctx.createGain();
    wheezeGain.gain.setValueAtTime(0.001, now + wheezeStart);
    wheezeGain.gain.linearRampToValueAtTime(0.20, now + wheezeStart + 0.08);
    wheezeGain.gain.setValueAtTime(0.18, now + wheezeStart + wheezeDur - 0.06);
    wheezeGain.gain.exponentialRampToValueAtTime(0.001, now + wheezeStart + wheezeDur);

    wheezeNoise.connect(wheezeFilter);
    wheezeFilter.connect(wheezeGain);
    connectToMaster(ctx, wheezeGain, wheezeStart + wheezeDur + 0.05);
    wheezeNoise.start(now + wheezeStart);
    wheezeNoise.stop(now + wheezeStart + wheezeDur);

    // Whistling harmonic tone inside the wheeze
    const whistleOsc = ctx.createOscillator();
    const whistleGain = ctx.createGain();
    whistleOsc.type = "sine";
    whistleOsc.frequency.setValueAtTime(2950 * detune, now + wheezeStart);
    whistleOsc.frequency.linearRampToValueAtTime(3200 * detune, now + wheezeStart + wheezeDur * 0.5);
    whistleOsc.frequency.linearRampToValueAtTime(2700 * detune, now + wheezeStart + wheezeDur);

    whistleGain.gain.setValueAtTime(0.001, now + wheezeStart);
    whistleGain.gain.linearRampToValueAtTime(0.09, now + wheezeStart + 0.06);
    whistleGain.gain.exponentialRampToValueAtTime(0.001, now + wheezeStart + wheezeDur);

    whistleOsc.connect(whistleGain);
    connectToMaster(ctx, whistleGain, wheezeStart + wheezeDur + 0.05);
    whistleOsc.start(now + wheezeStart);
    whistleOsc.stop(now + wheezeStart + wheezeDur);

    // ------------------------------------------------------------------------
    // Part 4: The Uncontrollable Pig Snort ("*snort-snort*")
    // Rapid flutter modulation on a resonant nasal formant
    // ------------------------------------------------------------------------
    const snortStart = wheezeStart + wheezeDur - 0.08;
    const snortDur = 0.22;

    const snortOsc = ctx.createOscillator();
    const snortMod = ctx.createOscillator();
    const snortModGain = ctx.createGain();
    const snortFilter = ctx.createBiquadFilter();
    const snortGain = ctx.createGain();

    snortOsc.type = "sawtooth";
    snortOsc.frequency.setValueAtTime(420 * detune, now + snortStart);
    snortOsc.frequency.linearRampToValueAtTime(740 * detune, now + snortStart + 0.1);
    snortOsc.frequency.linearRampToValueAtTime(380 * detune, now + snortStart + snortDur);

    // Fast 26Hz flutter mimicking uvular/palatal vibration during a snort
    snortMod.frequency.setValueAtTime(26, now + snortStart);
    snortModGain.gain.setValueAtTime(140, now + snortStart);
    snortMod.connect(snortOsc.frequency);

    snortFilter.type = "bandpass";
    snortFilter.frequency.setValueAtTime(850 * detune, now + snortStart);
    snortFilter.Q.setValueAtTime(4.2, now + snortStart);

    snortGain.gain.setValueAtTime(0.001, now + snortStart);
    snortGain.gain.linearRampToValueAtTime(0.19, now + snortStart + 0.04);
    snortGain.gain.exponentialRampToValueAtTime(0.001, now + snortStart + snortDur);

    snortOsc.connect(snortFilter);
    snortFilter.connect(snortGain);
    connectToMaster(ctx, snortGain, snortStart + snortDur + 0.05);

    snortMod.start(now + snortStart);
    snortOsc.start(now + snortStart);
    snortMod.stop(now + snortStart + snortDur);
    snortOsc.stop(now + snortStart + snortDur);

    // ------------------------------------------------------------------------
    // Part 5: The Rolling Belly Cackle ("A-HA-HA-HA-HA-HA-ha-ha-ha!")
    // Rapid cascading chuckles tumbling down as the laugher loses all composure
    // ------------------------------------------------------------------------
    const cackleStart = snortStart + snortDur + 0.02;
    const chuckles = 9;
    const baseFreq = 960 * detune;

    for (let i = 0; i < chuckles; i++) {
      const cTime = cackleStart + i * 0.062;
      const cDur = 0.072;
      const pitchDrop = Math.max(0.55, 1.0 - i * 0.05 + (i % 2 === 1 ? 0.06 : -0.04));
      const freq = baseFreq * pitchDrop;

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = i % 3 === 0 ? "sawtooth" : "triangle";

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(Math.max(1100, freq * 1.5), now + cTime);
      filter.Q.setValueAtTime(3.6, now + cTime);

      osc.frequency.setValueAtTime(freq * 1.12, now + cTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.82, now + cTime + cDur);

      const vol = Math.max(0.06, 0.25 - i * 0.02);
      gain.gain.setValueAtTime(0.001, now + cTime);
      gain.gain.linearRampToValueAtTime(vol, now + cTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, now + cTime + cDur);

      osc.connect(filter);
      filter.connect(gain);
      connectToMaster(ctx, gain, cTime + cDur + 0.05);

      osc.start(now + cTime);
      osc.stop(now + cTime + cDur);
    }

    // ------------------------------------------------------------------------
    // Part 6: Exhausted Gasp / Breath ("...whew!... *snicker*")
    // ------------------------------------------------------------------------
    const outroStart = cackleStart + chuckles * 0.062 + 0.04;
    const outroBreath = ctx.createBufferSource();
    outroBreath.buffer = getNoiseBuffer(ctx);
    const oFilter = ctx.createBiquadFilter();
    oFilter.type = "bandpass";
    oFilter.frequency.setValueAtTime(1400, now + outroStart);
    oFilter.Q.setValueAtTime(2.4, now + outroStart);

    const oGain = ctx.createGain();
    oGain.gain.setValueAtTime(0.001, now + outroStart);
    oGain.gain.linearRampToValueAtTime(0.12, now + outroStart + 0.03);
    oGain.gain.exponentialRampToValueAtTime(0.001, now + outroStart + 0.22);

    outroBreath.connect(oFilter);
    oFilter.connect(oGain);
    connectToMaster(ctx, oGain, outroStart + 0.25);
    outroBreath.start(now + outroStart);
    outroBreath.stop(now + outroStart + 0.23);
  } catch {}
}

// Dedicated ending sound for the Button That Does Nothing (unchanged)
export function playUselessButtonEnding() {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const detune = microDetune(0.03);

  try {
    const steps = [
      { freq: 233.08 * detune, time: 0, dur: 0.12 },
      { freq: 207.65 * detune, time: 0.11, dur: 0.12 },
      { freq: 174.61 * detune, time: 0.21, dur: 0.28 },
    ];

    steps.forEach((step, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";

      osc.frequency.setValueAtTime(step.freq, now + step.time);
      if (i === 2) {
        osc.frequency.exponentialRampToValueAtTime(110 * detune, now + step.time + step.dur);
      }

      gain.gain.setValueAtTime(0.15, now + step.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + step.time + step.dur);

      osc.connect(gain);
      connectToMaster(ctx, gain, step.time + step.dur + 0.05);

      osc.start(now + step.time);
      osc.stop(now + step.time + step.dur);
    });

    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(320, now + 0.28);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, now + 0.28);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    noise.connect(filter);
    filter.connect(noiseGain);
    connectToMaster(ctx, noiseGain, 0.45);
    noise.start(now + 0.28);
    noise.stop(now + 0.43);
  } catch {}
}

export function playComedicFailure() {
  playMockingLaughter();
}

// ============================================================================
// 8. RIDICULOUSLY OVERDRAMATIC VICTORY FANFARE
// Triumphant mock-heroic flourish for achieving something completely meaningless
// ============================================================================

export function playAbsurdVictory() {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const detune = microDetune(0.02);

  try {
    // Ridiculously heroic mock brass fanfare
    // C5 -> E5 -> G5 -> C6 (high triumphant hold)
    const notes = [
      { freq: 523.25 * detune, time: 0, dur: 0.1 },
      { freq: 659.25 * detune, time: 0.09, dur: 0.1 },
      { freq: 783.99 * detune, time: 0.18, dur: 0.14 },
      { freq: 1046.5 * detune, time: 0.32, dur: 0.45 },
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0.18, now + note.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

      osc.connect(gain);
      connectToMaster(ctx, gain, note.time + note.dur + 0.05);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur);
    });

    // Harmonizing lower octave for epic mock-majesty
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = "sine";
    bassOsc.frequency.setValueAtTime(261.63 * detune, now + 0.32);
    bassGain.gain.setValueAtTime(0.16, now + 0.32);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.77);

    bassOsc.connect(bassGain);
    connectToMaster(ctx, bassGain, 0.8);
    bassOsc.start(now + 0.32);
    bassOsc.stop(now + 0.78);
  } catch {}
}

// ============================================================================
// 9. STANDARD PLAYFUL BUTTON & INTERACTIVE CONTROLS
// Tactile, rounded, bubbly pops with subtle micro-detuning
// ============================================================================

export type ButtonSoundType = "primary" | "secondary" | "subtle" | "toggle_on";

export function playButtonPress(type: ButtonSoundType = "primary") {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx || activeVoiceCount >= MAX_CONCURRENT_VOICES) return;

  const now = ctx.currentTime;
  const detune = microDetune(0.04);

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === "primary") {
      // Bouncy, tactile bubble pop
      osc.type = "sine";
      osc.frequency.setValueAtTime(540 * detune, now);
      osc.frequency.exponentialRampToValueAtTime(280 * detune, now + 0.05);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    } else if (type === "secondary") {
      // Softer hollow wood-tap
      osc.type = "triangle";
      osc.frequency.setValueAtTime(420 * detune, now);
      osc.frequency.exponentialRampToValueAtTime(210 * detune, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    } else if (type === "toggle_on") {
      // Pleasant two-tone chime when unmuting
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(660, now + 0.06);
      gain2.gain.setValueAtTime(0.14, now + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      osc2.connect(gain2);
      connectToMaster(ctx, gain, 0.12);
      connectToMaster(ctx, gain2, 0.2);

      osc.start(now);
      osc.stop(now + 0.11);
      osc2.start(now + 0.06);
      osc2.stop(now + 0.19);
      return;
    } else {
      // Subtle click
      osc.type = "sine";
      osc.frequency.setValueAtTime(360 * detune, now);
      osc.frequency.exponentialRampToValueAtTime(220 * detune, now + 0.03);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    }

    osc.connect(gain);
    connectToMaster(ctx, gain, 0.06);
    osc.start(now);
    osc.stop(now + 0.06);
  } catch {}
}

// ============================================================================
// 10. SUSPENSE ROULETTE TICK (For the Climax Reveal)
// ============================================================================

export function playSuspenseTick() {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const detune = microDetune(0.06);

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime((480 + Math.random() * 140) * detune, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.03);

    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    connectToMaster(ctx, gain, 0.04);
    osc.start(now);
    osc.stop(now + 0.035);
  } catch {}
}

// ============================================================================
// 11. CLASSIC CRISP CLICK SOUND
// The satisfying, snappy, clean click preferred for selecting possibilities
// ============================================================================
export function playClickSound() {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    connectToMaster(ctx, gain, 0.05);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch {}
}

export const playWhoosh = () => playChairDodge(1);
export const playBuzzer = () => playComedicFailure();
export const playSuccessFanfare = () => playAbsurdVictory();
export const playSuspenseRoulette = () => playSuspenseTick();
export const playEngineRev = () => playCarAccelerator();
export const playTireSqueal = () => playCarBrake();
