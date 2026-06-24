import {
  LIVE_INPUT_SAMPLE_RATE,
  LIVE_OUTPUT_SAMPLE_RATE,
} from '@/constants/live';

export function float32ToPcm16(float32Array: Float32Array): Int16Array {
  const pcm16 = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const sample = Math.max(-1, Math.min(1, float32Array[i] ?? 0));
    pcm16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return pcm16;
}

export function pcm16ToFloat32(pcm16: Int16Array): Float32Array {
  const float32 = new Float32Array(pcm16.length);
  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = (pcm16[i] ?? 0) / 0x8000;
  }
  return float32;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i] ?? 0);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function downsampleTo16kHz(
  input: Float32Array,
  inputSampleRate: number,
): Float32Array {
  if (inputSampleRate === LIVE_INPUT_SAMPLE_RATE) {
    return input;
  }

  const ratio = inputSampleRate / LIVE_INPUT_SAMPLE_RATE;
  const outputLength = Math.floor(input.length / ratio);
  const output = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const sourceIndex = Math.floor(i * ratio);
    output[i] = input[sourceIndex] ?? 0;
  }

  return output;
}

export function createAudioPlaybackQueue(outputSampleRate = LIVE_OUTPUT_SAMPLE_RATE) {
  let audioContext: AudioContext | null = null;
  let nextStartTime = 0;
  const sources: AudioBufferSourceNode[] = [];

  function ensureContext(): AudioContext {
    if (!audioContext) {
      audioContext = new AudioContext({ sampleRate: outputSampleRate });
      nextStartTime = audioContext.currentTime;
    }
    return audioContext;
  }

  function enqueuePcm16Base64(base64: string) {
    const ctx = ensureContext();
    const pcm16 = new Int16Array(base64ToArrayBuffer(base64));
    const float32 = pcm16ToFloat32(pcm16);
    const buffer = ctx.createBuffer(1, float32.length, outputSampleRate);
    buffer.getChannelData(0).set(float32);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const startAt = Math.max(ctx.currentTime, nextStartTime);
    source.start(startAt);
    nextStartTime = startAt + buffer.duration;
    sources.push(source);

    source.onended = () => {
      const index = sources.indexOf(source);
      if (index >= 0) sources.splice(index, 1);
    };
  }

  function stopAll() {
    for (const source of sources) {
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
    }
    sources.length = 0;
    if (audioContext) {
      nextStartTime = audioContext.currentTime;
    }
  }

  async function resume() {
    const ctx = ensureContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  function close() {
    stopAll();
    void audioContext?.close();
    audioContext = null;
    nextStartTime = 0;
  }

  return { enqueuePcm16Base64, stopAll, resume, close };
}

export type AudioPlaybackQueue = ReturnType<typeof createAudioPlaybackQueue>;

export function createMicCapture(onAudioChunk: (base64Pcm: string) => void) {
  let stream: MediaStream | null = null;
  let audioContext: AudioContext | null = null;
  let processor: ScriptProcessorNode | null = null;
  let source: MediaStreamAudioSourceNode | null = null;

  async function start() {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    audioContext = new AudioContext();
    const inputSampleRate = audioContext.sampleRate;
    source = audioContext.createMediaStreamSource(stream);
    processor = audioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      const downsampled = downsampleTo16kHz(input, inputSampleRate);
      const pcm16 = float32ToPcm16(downsampled);
      onAudioChunk(arrayBufferToBase64(pcm16.buffer as ArrayBuffer));
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
  }

  function stop() {
    processor?.disconnect();
    source?.disconnect();
    processor = null;
    source = null;
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
    void audioContext?.close();
    audioContext = null;
  }

  return { start, stop };
}

export type MicCapture = ReturnType<typeof createMicCapture>;
