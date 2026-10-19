// ============================================================================
// src/systems/AudioSystem.js
// Sistem Audio & Haptic v3: Gamelan Berlapis + SFX Ketuk Bonang/Kenong/Kendang
// ============================================================================

export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmInterval = null;
    // Nada tangga nada Slendro Nusantara (Hz)
    this.slendroScale = [261.63, 293.66, 349.23, 392.00, 440.00, 523.25];
  }

  unlock() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  triggerHaptic(style = 'light') {
    if (window.Capacitor?.Plugins?.Haptics) {
      try {
        window.Capacitor.Plugins.Haptics.impact({ style: style.toUpperCase() });
        return;
      } catch (e) {}
    }
    if (navigator.vibrate) {
      navigator.vibrate(style === 'heavy' ? 40 : 12);
    }
  }

  playTone(freq, duration = 0.14, type = 'sine', gainVal = 0.12) {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  // SFX tombol memakai ketuk bonang/kenong/kendang berlapis (Bagian 4.1)
  playGamelanClick(variant = 'bonang') {
    if (variant === 'kendang') {
      this.playTone(145, 0.09, 'triangle', 0.15);
      setTimeout(() => this.playTone(392.0, 0.14, 'sine', 0.08), 30);
    } else {
      // Ketuk bonang + gaung kenong halus
      this.playTone(523.25, 0.11, 'sine', 0.1);
      this.playTone(1046.5, 0.06, 'triangle', 0.04);
      setTimeout(() => this.playTone(659.25, 0.15, 'sine', 0.065), 32);
    }
    this.triggerHaptic('light');
  }

  // SFX transisi Gerbang Bentar Membuka (Bagian 2.2)
  playGapuraTransition() {
    this.playTone(130.81, 0.35, 'triangle', 0.14);
    setTimeout(() => this.playTone(293.66, 0.25, 'sine', 0.09), 90);
    setTimeout(() => this.playTone(440.0, 0.3, 'sine', 0.09), 180);
  }

  playPunch(comboStep = 1) {
    const baseFreq = comboStep === 3 ? 110 : comboStep === 2 ? 150 : 185;
    this.playTone(baseFreq, 0.11, 'triangle', 0.18);
    this.triggerHaptic(comboStep === 3 ? 'heavy' : 'light');
  }

  playSkillSurya() {
    this.playTone(220, 0.18, 'sawtooth', 0.16);
    setTimeout(() => this.playTone(440, 0.25, 'triangle', 0.16), 70);
    this.triggerHaptic('heavy');
  }

  playCoinGobog() {
    this.playTone(587.33, 0.09, 'sine', 0.12);
    setTimeout(() => this.playTone(880, 0.16, 'sine', 0.14), 60);
  }

  playQuizFeedback(isCorrect) {
    if (isCorrect) {
      this.playTone(523.25, 0.12, 'sine', 0.15);
      setTimeout(() => this.playTone(659.25, 0.14, 'sine', 0.15), 90);
      setTimeout(() => this.playTone(783.99, 0.22, 'sine', 0.16), 180);
    } else {
      this.playTone(220, 0.18, 'sawtooth', 0.12);
      setTimeout(() => this.playTone(174.61, 0.24, 'sawtooth', 0.12), 120);
    }
  }

  playGongBoss() {
    this.playTone(98.0, 0.85, 'sine', 0.24);
    this.triggerHaptic('heavy');
  }

  startGamelanLoop() {
    if (this.bgmInterval) return;
    let step = 0;
    this.bgmInterval = setInterval(() => {
      if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
      const note = this.slendroScale[step % this.slendroScale.length];
      this.playTone(note, 0.32, 'sine', 0.035);
      if (step % 4 === 0) {
        this.playTone(130.81, 0.55, 'sine', 0.05);
      }
      step++;
    }, 520);
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}
