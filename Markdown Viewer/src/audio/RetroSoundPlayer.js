const DEFAULT_RETRO_SOUND_URL = new URL('../assets/windows95_startup_hifi.mp3', import.meta.url).href;

function createDefaultAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error('Web Audio is not available in this environment');
  }
  return new AudioContextClass();
}

export class RetroSoundPlayer {
  constructor(options = {}) {
    this.url = options.url || DEFAULT_RETRO_SOUND_URL;
    this.volume = options.volume ?? 0.5;
    this.fetchImpl = options.fetchImpl || ((...args) => fetch(...args));
    this.audioContextFactory = options.audioContextFactory || createDefaultAudioContext;
    this.audioContext = null;
    this.audioBufferPromise = null;
    this.activeSource = null;
    this.activeGain = null;
    this.playRequestId = 0;
  }

  getAudioContext() {
    if (!this.audioContext) {
      this.audioContext = this.audioContextFactory();
    }
    return this.audioContext;
  }

  loadAudioBuffer() {
    if (!this.audioBufferPromise) {
      const context = this.getAudioContext();
      this.audioBufferPromise = this.fetchImpl(this.url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load startup sound (${response.status})`);
          }
          return response.arrayBuffer();
        })
        .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
        .catch((error) => {
          // Permit a later test or startup attempt to retry a transient failure.
          this.audioBufferPromise = null;
          throw error;
        });
    }
    return this.audioBufferPromise;
  }

  async play() {
    const requestId = ++this.playRequestId;
    this.stopActiveSource();

    const context = this.getAudioContext();
    const audioBuffer = await this.loadAudioBuffer();
    if (requestId !== this.playRequestId) return false;

    if (context.state === 'suspended') {
      await context.resume();
      if (requestId !== this.playRequestId) return false;
    }

    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = audioBuffer;
    gain.gain.value = this.volume;
    source.connect(gain);
    gain.connect(context.destination);

    source.onended = () => {
      if (this.activeSource === source) {
        this.releaseActiveSource();
      }
    };

    this.activeSource = source;
    this.activeGain = gain;
    source.start(0);
    return true;
  }

  releaseActiveSource() {
    const source = this.activeSource;
    const gain = this.activeGain;
    this.activeSource = null;
    this.activeGain = null;

    try { source?.disconnect(); } catch {}
    try { gain?.disconnect(); } catch {}
  }

  stopActiveSource() {
    const source = this.activeSource;
    if (!source) return;

    source.onended = null;
    try { source.stop(0); } catch {}
    this.releaseActiveSource();
  }

  stop() {
    this.playRequestId += 1;
    this.stopActiveSource();
  }

  async dispose() {
    this.stop();
    this.audioBufferPromise = null;
    const context = this.audioContext;
    this.audioContext = null;
    if (context?.close && context.state !== 'closed') {
      await context.close();
    }
  }
}
