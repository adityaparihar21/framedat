/**
 * Apple & Google Gemini style refined audio engine for framedat intro.
 * Features ultra-subtle haptic micro-taps and soft warm ambient harmonics.
 */

class IntroSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.25; // Subtle master volume level
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.25, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Soft warm ambient harmonic pad (Apple Keynote / Google Gemini style)
   */
  public playWarmAmbientPad(durationSec: number = 7.0) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(130.81, now); // C3 (warm chord)
      osc2.frequency.setValueAtTime(196.00, now); // G3

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 1.2);
      gain.gain.linearRampToValueAtTime(0.03, now + durationSec - 1.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + durationSec);
      osc2.stop(now + durationSec);
    } catch {}
  }

  /**
   * Apple Taptic Engine / macOS style micro-click haptic tap
   */
  public playHapticTap() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.008);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.008);
    } catch {}
  }

  /**
   * Refined glass bell chime for title reveal (Apple product intro style)
   */
  public playSubtleChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => { // C5, E5, G5 triad
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.001, now + i * 0.06);
        gain.gain.linearRampToValueAtTime(0.04, now + i * 0.06 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.8);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.8);
      });
    } catch {}
  }

  /**
   * Soft organic transition swell (No harsh risers or noise)
   */
  public playSoftTransitionSwell() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.5);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.03, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  }

  public close() {
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {}
      this.ctx = null;
    }
  }
}

export const introSound = new IntroSoundEngine();
