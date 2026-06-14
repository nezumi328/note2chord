// Singleton Web Audio engine — low-latency playback with buffer caching

class AudioEngine {
  private ctx: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private loading = new Map<string, Promise<AudioBuffer>>();

  private async getCtx(): Promise<AudioContext> {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }
    return this.ctx;
  }

  async load(url: string): Promise<AudioBuffer> {
    if (this.buffers.has(url)) return this.buffers.get(url)!;
    if (this.loading.has(url)) return this.loading.get(url)!;

    const promise = (async () => {
      const ctx = await this.getCtx();
      const res = await fetch(url);
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.buffers.set(url, audioBuffer);
      this.loading.delete(url);
      return audioBuffer;
    })();

    this.loading.set(url, promise);
    return promise;
  }

  async play(url: string): Promise<void> {
    const ctx = await this.getCtx();
    const buffer = await this.load(url);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  }

  // Schedule playback at a precise Web Audio time
  schedulePlay(buffer: AudioBuffer, when: number): void {
    if (!this.ctx) return;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.ctx.destination);
    source.start(when);
  }

  get currentTime(): number {
    return this.ctx?.currentTime ?? 0;
  }

  async ensureStarted(): Promise<AudioContext> {
    return this.getCtx();
  }
}

export const audioEngine = new AudioEngine();
