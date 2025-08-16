
/* Helper: spawn floating hearts */
function spawnHeart() {
  const hearts = document.getElementById('hearts');
  const h = document.createElement('div');
  h.className = 'heart';
  const left = 8 + Math.random() * 84;
  h.style.left = left + '%';
  const size = 16 + Math.random() * 26;
  h.style.width = size + 'px'; h.style.height = size + 'px';
  const dur = 4 + Math.random() * 4;
  h.style.animation = `floatUp ${dur}s linear forwards`;
  hearts.appendChild(h);
  setTimeout(()=> { h.remove(); }, (dur+0.6)*1000);
}

/* Confetti burst function (small colored squares) */
function addConfetti(n=120) {
  const stage = document.getElementById('stage');
  const c = document.createElement('canvas');
  c.style.position = 'absolute'; c.style.inset = '0'; c.style.pointerEvents = 'none';
  stage.appendChild(c);
  const ctx = c.getContext('2d');
  function resize(){ c.width = stage.clientWidth; c.height = stage.clientHeight; }
  resize(); window.addEventListener('resize', resize);
  const pieces = [];
  for(let i=0;i<n;i++){ pieces.push({x:Math.random()*c.width,y:-Math.random()*c.height,s:4+Math.random()*8,v:1+Math.random()*3,a:Math.random()*Math.PI,c:`hsl(${Math.random()*360},80%,60%)`}); }
  let raf;
  function loop(){
    ctx.clearRect(0,0,c.width,c.height);
    for(let i=pieces.length-1;i>=0;i--){
      const p = pieces[i]; p.y+=p.v; p.a+=0.03;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s); ctx.restore();
      if(p.y>c.height+30) pieces.splice(i,1);
    }
    if(pieces.length) raf = requestAnimationFrame(loop); else { cancelAnimationFrame(raf); setTimeout(()=> c.remove(),400); }
  }
  loop();
}

/* Small WebAudio melody (soft) */
let audioCtx, masterGain;
function initAudio(){ if(audioCtx) return; audioCtx = new (window.AudioContext || window.webkitAudioContext)(); masterGain = audioCtx.createGain(); masterGain.gain.value = 0.9; masterGain.connect(audioCtx.destination); }
function playNote(freq, t, dur){ const o = audioCtx.createOscillator(); const g = audioCtx.createGain(); o.type='sine'; o.frequency.value=freq; o.connect(g); g.connect(masterGain); g.gain.setValueAtTime(0.001, t); g.gain.exponentialRampToValueAtTime(0.35, t+0.01); g.gain.exponentialRampToValueAtTime(0.0001, t+dur); o.start(t); o.stop(t+dur+0.02); }
function playMelody(){
  initAudio();
  const now = audioCtx.currentTime;
  const beat = 0.34;
  const notes = [392,392,440,392,523,494, 392,392,440,392,587,523];
  let t = now;
  for(let i=0;i<notes.length;i++){ playNote(notes[i], t, beat*0.9); t += beat; }
}

/* Sequence logic */
const clickHere = document.getElementById('clickHere');
const candles = document.querySelectorAll('.flame');
const p1 = document.getElementById('p1'), p2 = document.getElementById('p2');
const contentArea = document.getElementById('contentArea');
const note = document.getElementById('note');

clickHere.addEventListener('click', async () => {
  // Start audio on user interaction (required by mobile browsers)
  try { playMelody(); } catch(e){ initAudio(); playMelody(); }
  // Light candles (already blinking). Show small hearts & confetti.
  for(let i=0;i<6;i++){ setTimeout(spawnHeart, i*300); }
  addConfetti(120);
  clickHere.disabled = true; clickHere.textContent = 'Lighting...';

  // After short time, extinguish (simulate blow) and reveal photos
  setTimeout(()=> {
    // extinguish flames with stagger
    candles.forEach((f,i)=> setTimeout(()=> { f.style.transition='opacity .9s'; f.style.opacity = '0'; f.classList.remove('blink'); }, i*120));
    // small 'blow' audio (low notes)
    if(audioCtx){ const now = audioCtx.currentTime; playNote(220, now, 0.12); playNote(180, now+0.08, 0.12); playNote(160, now+0.16, 0.12); }
    addConfetti(260);
  }, 2300);

  // After flames out, reveal content area with smooth transitions
  setTimeout(()=> {
    contentArea.style.display = 'block';
    // start ken-burns effect by adding .show class to photos
    setTimeout(()=> { p1.classList.add('show'); p2.classList.add('show'); }, 80);
    // reveal note
    setTimeout(()=> { note.classList.add('show'); }, 1200);
    clickHere.textContent = 'Enjoy 🎉';
  }, 3200);
});

/* optional keyboard shortcuts */
document.addEventListener('keydown', e=>{ if(e.key==='r') addConfetti(160); if(e.key==='Enter') clickHere.click(); });

/* initial tiny hearts for vibe */
for(let i=0;i<5;i++){ setTimeout(spawnHeart, i*400); }
