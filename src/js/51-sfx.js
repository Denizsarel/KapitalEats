/* ---------------- SES (WebAudio, dosyasız) ----------------
   Tüm sesler sentez: damga, bildirim, bozuk para, hata, motor. HUD'daki 🔊 ile açılır kapanır. */
const Sfx = {
  ctx:null, on:true, engineNodes:null,
  load(){ try{ this.on = localStorage.getItem(CONFIG.soundKey) !== 'off'; }catch(e){} },
  toggle(){ this.on = !this.on; try{ localStorage.setItem(CONFIG.soundKey, this.on?'on':'off'); }catch(e){} if(!this.on) this.engineStop(); else { this.init(); this.ding(); } return this.on; },
  init(){ if(this.ctx) return this.ctx; const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return null; this.ctx = new AC(); return this.ctx; },
  ready(){ if(!this.on) return null; const c = this.init(); if(!c) return null; if(c.state === 'suspended') c.resume(); return c; },
  tone(freq, dur, type='sine', gain=0.08, when=0, slideTo=null){
    const c = this.ready(); if(!c) return;
    const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(freq, c.currentTime + when);
    if(slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + when + dur);
    g.gain.setValueAtTime(0.0001, c.currentTime + when); g.gain.exponentialRampToValueAtTime(gain, c.currentTime + when + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + when + dur);
    o.connect(g).connect(c.destination); o.start(c.currentTime + when); o.stop(c.currentTime + when + dur + 0.05);
  },
  noise(dur, gain=0.2, when=0){
    const c = this.ready(); if(!c) return;
    const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate); const d = buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i] = (Math.random()*2-1) * (1 - i/d.length);
    const src = c.createBufferSource(); src.buffer = buf; const g = c.createGain(); g.gain.value = gain; const f = c.createBiquadFilter(); f.type='lowpass'; f.frequency.value = 900;
    src.connect(f).connect(g).connect(c.destination); src.start(c.currentTime + when);
  },
  stamp(){ this.noise(0.12, 0.35); this.tone(90, 0.18, 'square', 0.12, 0, 45); },
  ding(){ this.tone(880, 0.12, 'sine', 0.07); this.tone(1320, 0.18, 'sine', 0.06, 0.1); },
  coin(){ this.tone(988, 0.08, 'square', 0.05); this.tone(1319, 0.16, 'square', 0.05, 0.08); },
  buzz(){ this.tone(140, 0.28, 'sawtooth', 0.09, 0, 70); },
  tada(){ [523,659,784,1047].forEach((f,i)=>this.tone(f, 0.18, 'triangle', 0.07, i*0.09)); },
  click(){ this.tone(600, 0.04, 'square', 0.03); },
  engineStart(){
    const c = this.ready(); if(!c || this.engineNodes) return;
    const o = c.createOscillator(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain(), f = c.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.value = 70; lfo.frequency.value = 11; lg.gain.value = 9; lfo.connect(lg).connect(o.frequency);
    f.type = 'lowpass'; f.frequency.value = 500; g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(0.045, c.currentTime + 0.4);
    o.connect(f).connect(g).connect(c.destination); o.start(); lfo.start(); this.engineNodes = {o,g,lfo};
  },
  engineStop(){ const n = this.engineNodes; if(!n || !this.ctx) return; const t = this.ctx.currentTime; n.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3); n.o.stop(t + 0.35); n.lfo.stop(t + 0.35); this.engineNodes = null; }
};
Sfx.load();
document.addEventListener('pointerdown', () => { if(Sfx.on) Sfx.init(); }, { once:true });

