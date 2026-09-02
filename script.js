/* ============================================================
   FEDMON: NO MERCY — v2 script
   custom cursor | live rail | combat HUD canvas |
   scroll-snap reveals | stat bar anim | F-glitch
============================================================ */

(function(){
'use strict';

/* ---------- 1. CUSTOM CURSOR ---------- */
const dot  = document.getElementById('cDot');
const ring = document.getElementById('cRing');
let rx=0, ry=0, dx=0, dy=0;

if(window.matchMedia('(pointer:fine)').matches){
  window.addEventListener('mousemove',e=>{
    dx=e.clientX; dy=e.clientY;
    dot.style.transform=`translate(${dx}px,${dy}px) translate(-50%,-50%)`;
  });
  (function loop(){
    rx+=(dx-rx)*0.18; ry+=(dy-ry)*0.18;
    ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();

  // hot state on interactive elements
  document.querySelectorAll('a,button,.snap-card,.starter').forEach(el=>{
    el.addEventListener('mouseenter',()=>ring.classList.add('hot'));
    el.addEventListener('mouseleave',()=>ring.classList.remove('hot'));
  });
}

/* ---------- 2. LIVE RAIL READOUTS ---------- */
const rHP=document.getElementById('rHP'),
      rCash=document.getElementById('rCash'),
      rHeat=document.getElementById('rHeat'),
      rStam=document.getElementById('rStam'),
      rProg=document.getElementById('rProg');

let cash=0, heat=0, stam=85, hp=100;

// cash slowly counts up to a seed value, jitters
(function cashTick(){
  cash += Math.random()*12;
  if(cash>1247) cash=1247 - Math.random()*30;
  rCash.textContent = '$'+Math.floor(cash).toLocaleString();
  setTimeout(cashTick, 1200 + Math.random()*800);
})();

// stamina drifts down then recovers (loop)
(function stamTick(){
  stam -= Math.random()*3;
  if(stam<40) stam = 70 + Math.random()*20;
  if(stam>95) stam=95;
  rStam.textContent = Math.floor(stam);
  setTimeout(stamTick, 1500);
})();

// heat spikes occasionally (red)
(function heatTick(){
  if(Math.random()<0.3){ heat += Math.floor(Math.random()*2); }
  else { heat -= Math.floor(Math.random()*2); }
  heat = Math.max(0, Math.min(heat,9));
  rHeat.textContent = heat;
  setTimeout(heatTick, 2000);
})();

// hp wobbles
(function hpTick(){
  hp += Math.floor(Math.random()*5)-2;
  hp = Math.max(60, Math.min(hp,100));
  rHP.textContent = hp;
  setTimeout(hpTick, 1800);
})();

// scroll progress on rail
function updateProg(){
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  const p = max>0 ? (h.scrollTop/max) : 0;
  rProg.style.height = (p*100)+'%';
}
window.addEventListener('scroll', updateProg, {passive:true});
updateProg();

/* ---------- 3. SCROLL-SNAP REVEALS ---------- */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{
    if(en.isIntersecting){
      en.target.classList.add('in');
      // stat bars
      en.target.querySelectorAll('.stat-row .bar i').forEach(bar=>{
        bar.style.width = bar.dataset.v+'%';
      });
    }
  });
},{threshold:0.25});

document.querySelectorAll('.snap-card,.starter').forEach(el=>io.observe(el));

/* ---------- 4. MECH CARD METER WIDTHS ---------- */
document.querySelectorAll('.snap-card').forEach(card=>{
  card.style.setProperty('--w', card.dataset.w+'%');
});
document.querySelectorAll('.starter').forEach(card=>{
  card.style.setProperty('--v','100%');
});

/* ---------- 5. COMBAT HUD CANVAS ---------- */
const cv = document.getElementById('combatCanvas');
const cx = cv.getContext('2d');
const W = cv.width, H = cv.height;

const state = {
  tHP:100, cHP:100, sync:0, syncMax:100,
  msg:'> awaiting command...',
  msgTimer:0,
  fx:[],          // floating damage / sparks
  shake:0,
  flash:0,
};

function msg(s, t=90){ state.msg=s; state.msgTimer=t; }
function dmg(target, n){
  if(target==='t'){ state.tHP=Math.max(0,state.tHP-n); }
  else { state.cHP=Math.max(0,state.cHP-n); }
  state.shake=8; state.flash=1;
  // floating number
  const x = target==='t' ? W*0.72 : W*0.28;
  state.fx.push({x, y:H*0.45, v:'-'+n, life:1, vy:-1.2, col:'#e23a4a'});
  // sparks
  for(let i=0;i<8;i++){
    state.fx.push({x, y:H*0.45, v:'', life:1, vy:-2-Math.random()*2, vx:(Math.random()-0.5)*4, col:i%2?'#f6b83e':'#e23a4a', spark:true});
  }
}
function gainSync(n){ state.sync=Math.min(state.syncMax, state.sync+n); }

const moves = {
  jab:    ()=>{ dmg('t', 8);  gainSync(8);  msg('> TRAINER // left jab connects', 70); },
  dodge:  ()=>{ msg('> TRAINER // dodge roll — evaded', 70); state.flash=0.4; },
  tackle: ()=>{ dmg('t', 14); gainSync(12); msg('> TRAINER // TACKLE — body slam', 80); state.shake=12; },
  strike: ()=>{ dmg('t', 18); gainSync(6);  msg('> JUMPMON // elemental strike', 80); },
  ult:    ()=>{
    if(state.sync>=state.syncMax){
      dmg('t', 45); state.sync=0; state.shake=20;
      msg('> SYNERGY ULT // 4th-tier burst — DOUBLED', 120);
      for(let i=0;i<20;i++) state.fx.push({x:W*0.72,y:H*0.45,v:'',life:1,vy:-3-Math.random()*3,vx:(Math.random()-0.5)*6,col:i%2?'#f6b83e':'#e23a4a',spark:true});
    } else {
      msg('> SYNERGY // not charged ('+Math.floor(state.sync)+'/'+state.syncMax+')', 80);
    }
  },
};

document.querySelectorAll('.hud-controls button').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const m = btn.dataset.move;
    if(moves[m]) moves[m]();
    // enemy responds occasionally
    if(Math.random()<0.5 && state.tHP>0){
      setTimeout(()=>{ dmg('c', 6+Math.floor(Math.random()*8)); msg('> ENEMY // counter-attack lands', 60); }, 500);
    }
    // recover HP slowly if both alive
    if(state.tHP===0){ setTimeout(()=>{ state.tHP=100; state.cHP=100; state.sync=0; msg('> REMATCH // fresh combatants', 120); }, 1400); }
  });
});

function drawHUD(){
  // shake
  let sx=0, sy=0;
  if(state.shake>0){ sx=(Math.random()-0.5)*state.shake; sy=(Math.random()-0.5)*state.shake; state.shake*=0.8; if(state.shake<0.5)state.shake=0; }
  cx.save();
  cx.translate(sx,sy);

  // bg
  cx.fillStyle='#050308';
  cx.fillRect(0,0,W,H);

  // grid
  cx.strokeStyle='rgba(255,255,255,0.03)';
  cx.lineWidth=1;
  for(let x=0;x<W;x+=20){ cx.beginPath(); cx.moveTo(x,0); cx.lineTo(x,H); cx.stroke(); }
  for(let y=0;y<H;y+=20){ cx.beginPath(); cx.moveTo(0,y); cx.lineTo(W,y); cx.stroke(); }

  // flash
  if(state.flash>0){ cx.fillStyle='rgba(226,58,74,'+state.flash*0.25+')'; cx.fillRect(0,0,W,H); state.flash*=0.85; if(state.flash<0.02)state.flash=0; }

  // --- top bars: TRAINER HP (left) + CREATURE HP (right) ---
  bar(20, 24, 300, 14, state.cHP, '#3ad48a', 'TRAINER HP', 'left');
  bar(W-320, 24, 300, 14, state.cHP, '#e23a4a', 'CREATURE HP', 'right'); // creature mirrors trainer for demo clarity

  // --- sync energy bar (center) ---
  const sw=180, sx0=W/2-sw/2;
  cx.fillStyle='#0d0a14'; cx.fillRect(sx0, 24, sw, 14);
  cx.strokeStyle='var(--line)'; cx.strokeStyle='rgba(255,255,255,0.1)'; cx.strokeRect(sx0, 24, sw, 14);
  const sg = cx.createLinearGradient(sx0,0,sx0+sw,0);
  sg.addColorStop(0,'#e23a4a'); sg.addColorStop(1,'#f6b83e');
  cx.fillStyle=sg; cx.fillRect(sx0,24, sw*(state.sync/state.syncMax), 14);
  cx.fillStyle='#8a7ea0'; cx.font='8px Courier New'; cx.textAlign='center';
  cx.fillText('SYNC '+(state.sync>=state.syncMax?'READY // 4TH TIER':Math.floor(state.sync)+'%'), W/2, 52);

  // --- fighters (simple pixel sprites) ---
  drawTrainer(140, H*0.62);
  drawCreature(W-160, H*0.6);

  // VS marker
  cx.fillStyle='rgba(226,58,74,0.15)'; cx.font='900 40px Helvetica'; cx.textAlign='center';
  cx.fillText('VS', W/2, H*0.6);

  // --- command console bottom ---
  cx.fillStyle='#0d0a14'; cx.fillRect(0, H-44, W, 44);
  cx.strokeStyle='rgba(255,255,255,0.08)'; cx.beginPath(); cx.moveTo(0,H-44); cx.lineTo(W,H-44); cx.stroke();
  cx.fillStyle='#e8e0f4'; cx.font='12px Courier New'; cx.textAlign='left';
  const m = state.msgTimer>0 ? state.msg : '> awaiting command...';
  cx.fillText(m.slice(0,60), 16, H-18);
  if(state.msgTimer>0) state.msgTimer--;

  // --- floating fx ---
  for(let i=state.fx.length-1;i>=0;i--){
    const f=state.fx[i];
    f.x += f.vx||0; f.y += f.vy; f.vy += 0.08; f.life -= 0.02;
    if(f.life<=0){ state.fx.splice(i,1); continue; }
    cx.globalAlpha=f.life;
    if(f.spark){
      cx.fillStyle=f.col; cx.fillRect(f.x, f.y, 3, 3);
    } else {
      cx.fillStyle=f.col; cx.font='900 22px Helvetica'; cx.textAlign='center';
      cx.fillText(f.v, f.x, f.y);
    }
    cx.globalAlpha=1;
  }

  cx.restore();
  requestAnimationFrame(drawHUD);
}

function bar(x,y,w,h,val,col,label,align){
  cx.fillStyle='#0d0a14'; cx.fillRect(x,y,w,h);
  cx.strokeStyle='rgba(255,255,255,0.1)'; cx.lineWidth=1; cx.strokeRect(x,y,w,h);
  cx.fillStyle=col; cx.fillRect(x,y, w*(val/100), h);
  cx.fillStyle='#4a3f5e'; cx.font='8px Courier New';
  cx.textAlign=align; const tx = align==='left'? x : x+w;
  cx.fillText(label+' '+Math.floor(val)+'%', tx, y-4);
}

function drawTrainer(x,y){
  // body
  cx.fillStyle='#3a3450'; cx.fillRect(x-14, y-30, 28, 40);
  // head
  cx.fillStyle='#c8a878'; cx.fillRect(x-10, y-50, 20, 20);
  // fists
  cx.fillStyle='#c8a878'; cx.fillRect(x-20, y-10, 8, 8); cx.fillRect(x+12, y-10, 8, 8);
  // stance line
  cx.strokeStyle='rgba(58,52,80,0.6)'; cx.beginPath(); cx.moveTo(x,y+10); cx.lineTo(x-10,y+24); cx.moveTo(x,y+10); cx.lineTo(x+10,y+24); cx.stroke();
  // label
  cx.fillStyle='#8a7ea0'; cx.font='8px Courier New'; cx.textAlign='center'; cx.fillText('YOU', x, y+40);
}

function drawCreature(x,y){
  // blob body
  cx.fillStyle='#e23a4a'; cx.beginPath(); cx.arc(x, y-10, 26, 0, Math.PI*2); cx.fill();
  // eyes
  cx.fillStyle='#08060c'; cx.fillRect(x-12, y-18, 6, 6); cx.fillRect(x+6, y-18, 6, 6);
  // spike
  cx.fillStyle='#9a1f2c'; cx.beginPath(); cx.moveTo(x, y-40); cx.lineTo(x-8, y-26); cx.lineTo(x+8, y-26); cx.fill();
  // feet
  cx.fillStyle='#9a1f2c'; cx.fillRect(x-16, y+14, 8, 6); cx.fillRect(x+8, y+14, 8, 6);
  // label
  cx.fillStyle='#8a7ea0'; cx.font='8px Courier New'; cx.textAlign='center'; cx.fillText('JUMPMON', x, y+40);
}

drawHUD();

/* ---------- 6. KEYBOARD: F to glitch ---------- */
const title = document.querySelector('.boot-title');
document.addEventListener('keydown',e=>{
  if(e.key==='f'||e.key==='F'){
    title.style.transition='none';
    let n=0;
    const g = setInterval(()=>{
      title.style.transform = `translate(${(Math.random()-0.5)*10}px, ${(Math.random()-0.5)*6}px) skewX(${(Math.random()-0.5)*8}deg)`;
      title.style.filter = `hue-rotate(${Math.random()*60}deg)`;
      n++;
      if(n>12){ clearInterval(g); title.style.transform=''; title.style.filter=''; }
    }, 40);
    // also fire a combat ult for fun
    if(state.sync<state.syncMax) state.sync = state.syncMax;
  }
});

/* ---------- 7. CONSOLE EASTER EGG ---------- */
console.log('%c FEDMON: NO MERCY ','background:#e23a4a;color:#08060c;font-size:20px;font-weight:900;padding:8px 14px;');
console.log('%c Fight with fists. Survive with monsters. ','color:#f6b83e;font-size:13px;');
console.log('%c press F on the page to charge sync + glitch the title ','color:#8a7ea0;font-size:11px;');

/* ============================================================
   v2.1 EVOLUTION LAYER
============================================================ */

/* ---------- 8. TYPEWRITER BOOT FEED ---------- */
(function typewriter(){
  const lines = document.querySelectorAll('.boot-right .feed .ln');
  if(!lines.length) return;
  // hide all initially (override the CSS fade-in)
  lines.forEach(l=>{ l.style.opacity='0'; l.style.animation='none'; });
  let i = 0;
  function typeLine(){
    if(i >= lines.length){
      // show prompt cursor after all lines
      return;
    }
    const ln = lines[i];
    const full = ln.textContent;
    ln.textContent = '';
    ln.style.opacity = '1';
    ln.classList.add('typing');
    let ci = 0;
    const speed = 18;
    (function type(){
      if(ci < full.length){
        ln.textContent = full.slice(0, ci+1);
        ci++;
        setTimeout(type, speed + Math.random()*12);
      } else {
        ln.classList.remove('typing');
        i++;
        setTimeout(typeLine, 120);
      }
    })();
  }
  // small delay to let page settle
  setTimeout(typeLine, 400);
})();

/* ---------- 9. COMBAT KEYBOARD SHORTCUTS ---------- */
(function combatKeys(){
  const keyMap = {
    'q':'jab', 'e':'dodge', ' ':'tackle', '1':'strike', '3':'ult'
  };
  const buttons = {};
  document.querySelectorAll('.hud-controls button').forEach(btn=>{
    buttons[btn.dataset.move] = btn;
    btn.classList.add('has-key');
  });
  document.addEventListener('keydown',e=>{
    // don't interfere if user is typing in an input
    if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') return;
    const move = keyMap[e.key.toLowerCase()];
    if(move && buttons[move]){
      // only trigger if combat section is in viewport
      const combat = document.getElementById('combat');
      const r = combat.getBoundingClientRect();
      if(r.top < window.innerHeight*0.6 && r.bottom > window.innerHeight*0.3){
        buttons[move].click();
        buttons[move].classList.add('pulse');
        setTimeout(()=>buttons[move].classList.remove('pulse'),300);
      }
    }
  });
})();

/* ---------- 10. WANTED LEVEL SYSTEM ---------- */
(function wantedLevel(){
  const stars = document.querySelectorAll('#wantedStars i');
  const lbl = document.getElementById('wantedLbl');
  if(!stars.length) return;
  let level = 0;
  const labels = [
    '// clean record',
    '// loitering suspicion',
    '// minor warrants',
    '// active pursuit',
    '// wanted: alive only',
    '// shoot on sight'
  ];
  function render(){
    stars.forEach((s,idx)=>{
      s.classList.toggle('active', idx < level);
    });
    lbl.textContent = labels[level];
  }
  render();
  // wanted level rises with aggressive combat moves, falls with dodge
  const origJab = moves.jab, origTackle = moves.tackle, origStrike = moves.strike, origUlt = moves.ult, origDodge = moves.dodge;
  function bump(n){
    level = Math.max(0, Math.min(5, level + n));
    render();
  }
  moves.jab    = function(){ origJab();    bump(0); };
  moves.tackle = function(){ origTackle(); bump(1); };
  moves.strike = function(){ origStrike(); bump(1); };
  moves.ult    = function(){ origUlt();    bump(2); };
  moves.dodge  = function(){ origDodge();  bump(-1); };
  // reset on rematch
  const origClickHandler = document.querySelectorAll('.hud-controls button');
})();

/* ---------- 11. HEAT FLASH ON RAIL ---------- */
(function heatFlash(){
  const rail = document.querySelector('.rail');
  const heatReadout = document.querySelector('.rail .readout.alert');
  let lastHeat = 0;
  // poll the DOM value for heat spikes (the tick IIFE updates rHeat text)
  (function poll(){
    const cur = parseInt(rHeat.textContent, 10) || 0;
    if(cur >= 7 && cur > lastHeat){
      rail.classList.add('heat-flash');
      setTimeout(()=>rail.classList.remove('heat-flash'), 400);
    }
    if(cur >= 8){
      heatReadout.classList.add('critical');
    } else {
      heatReadout.classList.remove('critical');
    }
    lastHeat = cur;
    setTimeout(poll, 500);
  })();
})();

/* ---------- 12. STARTER CARD SELECTION ---------- */
(function starterSelect(){
  const cards = document.querySelectorAll('.starter');
  if(!cards.length) return;
  cards.forEach(card=>{
    card.addEventListener('click',()=>{
      cards.forEach(c=>c.classList.remove('selected'));
      card.classList.add('selected');
      // flash the combat message
      const name = card.querySelector('.name')?.textContent || 'UNKNOWN';
      msg('> DOSSIER // ' + name + ' selected — sync bonded', 100);
    });
  });
})();

/* ---------- 13. ECONOMY COUNT-UP ---------- */
(function countUp(){
  const receipts = document.querySelectorAll('.receipt');
  if(!receipts.length) return;
  const econIO = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(!en.isIntersecting) return;
      if(en.target.dataset.counted) return;
      en.target.dataset.counted = '1';
      // animate the total rows
      en.target.querySelectorAll('.tot .amt').forEach(amt=>{
        const txt = amt.textContent.trim();
        const m = txt.match(/(-?\$?[\d,.]+)/);
        if(!m) return;
        const target = parseInt(m[1].replace(/[$,]/g,''), 10);
        if(isNaN(target)) return;
        const suffix = txt.replace(m[1], '');
        const isNeg = target < 0;
        const abs = Math.abs(target);
        let cur = 0;
        const steps = 30;
        const inc = abs / steps;
        amt.classList.add('counting');
        (function tick(){
          cur += inc;
          if(cur >= abs){
            amt.textContent = (isNeg?'-':'') + '$' + abs.toLocaleString() + suffix.replace(/-?\$[\d,.]+/,'');
            amt.classList.remove('counting');
            return;
          }
          amt.textContent = (isNeg?'-':'') + '$' + Math.floor(cur).toLocaleString() + suffix.replace(/-?\$[\d,.]+/,'');
          requestAnimationFrame(tick);
        })();
      });
    });
  }, {threshold:0.3});
  receipts.forEach(r=>econIO.observe(r));
})();

/* ---------- 14. SECTION SNAP INDICATOR ---------- */
(function snapNav(){
  const sections = document.querySelectorAll('main > section');
  const rail = document.querySelector('.rail');
  if(!sections.length || !rail) return;
  // create mini nav dots on rail
  const nav = document.createElement('div');
  nav.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-top:1rem;';
  sections.forEach((sec, idx)=>{
    const dot = document.createElement('a');
    dot.href = '#' + sec.id;
    dot.style.cssText = 'width:6px;height:6px;border-radius:50%;background:var(--faint);transition:background .2s,transform .2s;display:block;';
    dot.dataset.idx = idx;
    dot.title = sec.id;
    nav.appendChild(dot);
  });
  // insert after progress bar
  const prog = rail.querySelector('.progress');
  if(prog && prog.nextSibling){
    rail.insertBefore(nav, prog.nextSibling);
  } else {
    rail.appendChild(nav);
  }
  const dots = nav.querySelectorAll('a');
  const navIO = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){
        const idx = [...sections].indexOf(en.target);
        dots.forEach((d,i)=>{
          d.style.background = i===idx ? 'var(--red)' : 'var(--faint)';
          d.style.transform = i===idx ? 'scale(1.6)' : 'scale(1)';
        });
      }
    });
  }, {threshold:0.5});
  sections.forEach(s=>navIO.observe(s));
})();

})();
