// ================================================================
// QUESTIONS
// ================================================================
var QUESTIONS = [
{ cat:'Forex', diff:'Easy', q:'What is liquidity in the forex market?', opts:['Ease of buying/selling','Bid-ask spread','Bank reserves','Leverage'], correct:0 },
{ cat:'Technical Analysis', diff:'Easy', q:'What does a bullish engulfing candle indicate?', opts:['Reversal up','Continuation down','Indecision','Volume spike'], correct:0 },
{ cat:'Risk Mgmt', diff:'Medium', q:'What happens when a stop loss triggers?', opts:['Position closed','Position doubled','Margin call','Trailing activates'], correct:0 },
{ cat:'Market Structure', diff:'Medium', q:'Best timeframe for major market structure?', opts:['Daily','1-minute','Tick','Renko'], correct:0 },
{ cat:'Crypto', diff:'Easy', q:'What is a cold wallet?', opts:['Offline storage','Exchange wallet','Hot wallet','Paper wallet'], correct:0 },
{ cat:'Psychology', diff:'Medium', q:'What is revenge trading?', opts:['Trading to recover losses impulsively','Hedging','Scaling in','Journaling'], correct:0 },
{ cat:'Forex', diff:'Medium', q:'What is a pip?', opts:['Smallest price move','Percentage','Lot size','Interest rate'], correct:0 },
{ cat:'Technical Analysis', diff:'Hard', q:'What is a golden cross?', opts:['50MA above 200MA','RSI above 70','MACD bearish','Bollinger squeeze'], correct:0 },
{ cat:'Risk Mgmt', diff:'Easy', q:'Common risk-reward for trend following?', opts:['1:2 or higher','1:0.5','1:1 only','0.5:1'], correct:0 },
{ cat:'Crypto', diff:'Hard', q:'What is a flash crash?', opts:['Rapid drop and recovery','Slow bleed','Exchange hack','Hard fork'], correct:0 },
{ cat:'Market Structure', diff:'Hard', q:'Break of structure indicates?', opts:['Trend reversal','Continuation','Consolidation','Volume divergence'], correct:0 },
{ cat:'Technical Analysis', diff:'Medium', q:'Purpose of a moving average?', opts:['Smooth price action','Predict exact tops','Measure volatility','Volume indicator'], correct:0 }
];
// ================================================================
// STATE
// ================================================================
var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var W = canvas.width, H = canvas.height;
var GRAVITY = 0.6;
var MOVE_SPEED = 3.2;
var JUMP_POWER = -11;
var GROUND_Y = H - 40;
var state = {
active: false,
over: false,
scoreA: 0,
scoreB: 0,
players: {},
current: 'A1',
phase: 'idle',
timeLeft: 0,
timerInterval: null,
questionTimer: null,
activeQuestion: null,
answerCorrect: false,
damageMultiplier: 1,
platforms: [],
ladders: [],
bullets: [],
keys: {},
particles: [],
stickmanBodies: {},
};
// ================================================================
// LEVEL DESIGN
// ================================================================
function buildLevel() {
  state.platforms = [
    // solid ground (cannot drop through)
    { x:0, y:GROUND_Y, w:W, h:40, color:'#1a1a2e', solid:true },
    // LEFT BUILDING – one-way platforms
    { x:40,  y:GROUND_Y-100, w:180, h:20, color:'#2a2a44', solid:false },
    { x:40,  y:GROUND_Y-200, w:180, h:20, color:'#2a2a44', solid:false },
    { x:40,  y:GROUND_Y-300, w:180, h:20, color:'#2a2a44', solid:false },
    // RIGHT BUILDING
    { x:W-220, y:GROUND_Y-100, w:180, h:20, color:'#2a2a44', solid:false },
    { x:W-220, y:GROUND_Y-200, w:180, h:20, color:'#2a2a44', solid:false },
    { x:W-220, y:GROUND_Y-300, w:180, h:20, color:'#2a2a44', solid:false },
    // CENTRAL BRIDGE
    { x:W/2-160, y:GROUND_Y-150, w:320, h:20, color:'#3a3a55', solid:false },
    // MID STEPPING STONES
    { x:240,     y:GROUND_Y-70,  w:140, h:18, color:'#4a4a66', solid:false },
    { x:W-380,   y:GROUND_Y-70,  w:140, h:18, color:'#4a4a66', solid:false },
    // HIGH CENTRAL
    { x:W/2-70,  y:GROUND_Y-270, w:140, h:18, color:'#4a4a66', solid:false },
    // COVER CRATES – solid
    { x:190, y:GROUND_Y-40, w:50, h:40, color:'#6a3a22', solid:true },
    { x:W-240, y:GROUND_Y-40, w:50, h:40, color:'#223a6a', solid:true },
  ];
  state.ladders = [
    { x:120,     y:GROUND_Y-300, w:16, h:300 },
    { x:W-136,   y:GROUND_Y-300, w:16, h:300 },
    { x:W/2-8,   y:GROUND_Y-150, w:16, h:150 },
  ];
}
// ================================================================
// STICKMAN
// ================================================================
function createStickman(id, team, x, y) {
return {
id: id,
team: team,
x: x, y: y,
vx: 0, vy: 0,
w: 20, h: 44,
onGround: false,
onLadder: false,
facing: team === 'A' ? 1 : -1,
hp: 100, maxHp: 100,
alive: true,
kills: 0,
shootCooldown: 0,
hitFlash: 0,
armAngle: 0,
airJumps: 1,          // remaining double-jumps
dropping: false,      // currently dropping through platform
dropTimer: 0,         // how long to ignore platforms
wasJumpKey: false,    // for edge detection
};
}
// ================================================================
// INIT
// ================================================================
function initGame() {
buildLevel();
state.active = true;
state.over = false;
state.scoreA = 0;
state.scoreB = 0;
state.bullets = [];
state.particles = [];
state.keys = {};
state.players = {
A1: createStickman('A1', 'A', 130, GROUND_Y - 44),
A2: createStickman('A2', 'A', 200, GROUND_Y - 44),
B1: createStickman('B1', 'B', W-130, GROUND_Y - 44),
B2: createStickman('B2', 'B', W-200, GROUND_Y - 44),
};
state.current = Math.random() < 0.5 ? 'A1' : 'B1';
state.phase = 'question';
document.getElementById('startBox').classList.add('hidden');
document.getElementById('gameOverBox').classList.add('hidden');
document.getElementById('questionBox').classList.add('hidden');
document.getElementById('timerBar').classList.add('hidden');
document.getElementById('controlsBox').classList.add('hidden');
render();
setTimeout(function() { showQuestion(); }, 200);
}
// ================================================================
// QUESTION SYSTEM
// ================================================================
var DIFF_CLASSES = {
  Easy:   ['bg-green-500/20',  'text-green-500'],
  Medium: ['bg-yellow-500/20', 'text-yellow-500'],
  Hard:   ['bg-red-500/20',    'text-red-500']
};
function showQuestion() {
var q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
state.activeQuestion = q;
var indexed = q.opts.map(function(o, i){ return { text:o, correct:i===q.correct }; });
for (var i = indexed.length-1; i>0; i--) {
var j = Math.floor(Math.random()*(i+1));
var tmp = indexed[i]; indexed[i]=indexed[j]; indexed[j]=tmp;
}
q._shuffled = indexed;
q._correctIdx = indexed.findIndex(function(x){ return x.correct; });
document.getElementById('qCategory').textContent = q.cat.toUpperCase();
var diffEl = document.getElementById('qDifficulty');
diffEl.textContent = q.diff.toUpperCase();
diffEl.classList.remove('bg-green-500/20','text-green-500','bg-yellow-500/20','text-yellow-500','bg-red-500/20','text-red-500');
var diffClasses = DIFF_CLASSES[q.diff] || DIFF_CLASSES.Easy;
diffEl.classList.add(diffClasses[0], diffClasses[1]);
document.getElementById('qText').textContent = q.q;
document.getElementById('qFeedback').textContent = '';
var qTimerEl = document.getElementById('qTimer');
qTimerEl.textContent = '8';
qTimerEl.classList.remove('text-red-500');
qTimerEl.classList.add('text-[#daa74b]');
var ansBox = document.getElementById('qAnswers');
ansBox.innerHTML = '';
indexed.forEach(function(item, idx) {
var btn = document.createElement('button');
btn.className = 'answer-btn panel p-3 text-white text-[13px] cursor-pointer border border-white/10';
btn.innerHTML = '<span class="text-[#daa74b] font-bold mr-[6px]">'+String.fromCharCode(65+idx)+'.</span>'+item.text;
btn.onclick = function(){ answerQuestion(idx, btn); };
ansBox.appendChild(btn);
});
document.getElementById('questionBox').classList.remove('hidden');
var timeLeft = 8;
if (state.questionTimer) clearInterval(state.questionTimer);
state.questionTimer = setInterval(function() {
timeLeft -= 0.1;
qTimerEl.textContent = Math.max(0, Math.ceil(timeLeft));
if (timeLeft < 3) { qTimerEl.classList.remove('text-[#daa74b]'); qTimerEl.classList.add('text-red-500'); }
if (timeLeft <= 0) {
clearInterval(state.questionTimer);
answerQuestion(-1, null);
}
}, 100);
}
function answerQuestion(idx, btn) {
if (state.questionTimer) { clearInterval(state.questionTimer); state.questionTimer = null; }
var q = state.activeQuestion;
var isCorrect = (idx === q._correctIdx);
state.answerCorrect = isCorrect;
document.querySelectorAll('#qAnswers .answer-btn').forEach(function(b, i) {
b.disabled = true;
b.classList.remove('cursor-pointer');
b.classList.add('cursor-default');
if (i === q._correctIdx) b.classList.add('correct');
if (i === idx && !isCorrect) b.classList.add('wrong');
});
var fb = document.getElementById('qFeedback');
fb.classList.remove('text-green-500','text-red-500');
if (isCorrect) {
fb.textContent = '✓ CORRECT! 6 seconds — full damage';
fb.classList.add('text-green-500');
state.damageMultiplier = 1;
} else {
fb.textContent = (idx === -1 ? '⏱ TIMEOUT! ' : '✗ WRONG! ') + '3 seconds — half damage';
fb.classList.add('text-red-500');
state.damageMultiplier = 0.5;
}
setTimeout(function() {
document.getElementById('questionBox').classList.add('hidden');
startActionPhase(isCorrect ? 6 : 3);
}, 1200);
}
// ================================================================
// ACTION PHASE
// ================================================================
function startActionPhase(seconds) {
state.phase = 'action';
state.timeLeft = seconds;
document.getElementById('timerBar').classList.remove('hidden');
document.getElementById('controlsBox').classList.remove('hidden');
var fillEl = document.getElementById('timerFill');
fillEl.style.width = '100%';
fillEl.classList.remove('bg-[#daa74b]','bg-red-500');
fillEl.classList.add(seconds === 6 ? 'bg-[#daa74b]' : 'bg-red-500');
document.getElementById('timerText').textContent = seconds.toFixed(1);
updateTurnDisplay();
if (state.timerInterval) clearInterval(state.timerInterval);
state.timerInterval = setInterval(function() {
state.timeLeft -= 0.1;
if (state.timeLeft <= 0) {
state.timeLeft = 0;
clearInterval(state.timerInterval);
state.timerInterval = null;
endActionPhase();
}
var pct = (state.timeLeft / seconds) * 100;
fillEl.style.width = pct + '%';
document.getElementById('timerText').textContent = Math.max(0, state.timeLeft).toFixed(1);
if (state.timeLeft < 2) document.getElementById('timerText').classList.add('timer-flash');
else document.getElementById('timerText').classList.remove('timer-flash');
}, 100);
}
function endActionPhase() {
state.phase = 'resolving';
document.getElementById('timerBar').classList.add('hidden');
document.getElementById('controlsBox').classList.add('hidden');
document.getElementById('timerText').classList.remove('timer-flash');
for (var id in state.players) {
state.players[id].vx = 0;
state.players[id].onLadder = false;
}
setTimeout(nextTurn, 500);
}
// ================================================================
// TURN MANAGEMENT
// ================================================================
function nextTurn() {
state.bullets = [];
var order = ['A1', 'A2', 'B1', 'B2'];
var idx = order.indexOf(state.current);
var attempts = 0;
do {
idx = (idx + 1) % order.length;
var candidate = order[idx];
if (state.players[candidate].alive) { state.current = candidate; break; }
attempts++;
} while (attempts < 8);
var anyAlive = Object.values(state.players).some(function(p){ return p.alive; });
if (!anyAlive) { endGame(); return; }
var aliveA = ['A1','A2'].filter(function(id){ return state.players[id].alive; }).length;
var aliveB = ['B1','B2'].filter(function(id){ return state.players[id].alive; }).length;
if (aliveA === 0 || aliveB === 0) { endGame(); return; }
state.phase = 'question';
updateTurnDisplay();
render();
setTimeout(function() { showQuestion(); }, 400);
}
function updateTurnDisplay() {
var cur = state.players[state.current];
if (!cur) return;
var label = document.getElementById('turnLabel');
label.textContent = state.current;
label.classList.remove('text-[#daa74b]','text-[#4a9eff]');
label.classList.add(cur.team === 'A' ? 'text-[#daa74b]' : 'text-[#4a9eff]');
document.getElementById('phaseLabel').textContent = state.phase.toUpperCase();
}
// ================================================================
// INPUT
// ================================================================
window.addEventListener('keydown', function(e) {
state.keys[e.key.toLowerCase()] = true;
if (e.key === 'Enter' && (!state.active || state.over)) initGame();
if (['w','a','s','d',' ','e'].indexOf(e.key.toLowerCase()) !== -1) e.preventDefault();
});
window.addEventListener('keyup', function(e) {
state.keys[e.key.toLowerCase()] = false;
});
// ================================================================
// PHYSICS & COLLISION
// ================================================================
function rectOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
return ax < bx+bw && ax+aw > bx && ay < by+bh && ay+ah > by;
}
function updatePlayer(p, dt) {
if (!p.alive) return;
var isMyTurn = (p.id === state.current) && state.phase === 'action';
// drop timer countdown
if (p.dropTimer > 0) {
  p.dropTimer -= dt;
  if (p.dropTimer <= 0) p.dropping = false;
}
if (isMyTurn) {
  // Horizontal
  if (state.keys['a']) { p.vx = -MOVE_SPEED; p.facing = -1; }
  else if (state.keys['d']) { p.vx = MOVE_SPEED; p.facing = 1; }
  else { p.vx *= 0.7; }
  // Ladder
  var onAnyLadder = false;
  for (var i = 0; i < state.ladders.length; i++) {
    var L = state.ladders[i];
    if (rectOverlap(p.x - p.w/2, p.y, p.w, p.h, L.x, L.y, L.w, L.h)) {
      onAnyLadder = true;
      break;
    }
  }
  if (onAnyLadder && (state.keys['w'] || state.keys['s'] || p.onLadder)) {
    p.onLadder = true;
  }
  if (p.onLadder) {
    p.vy = 0;
    if (state.keys['w']) p.vy = -2.5;
    else if (state.keys['s']) p.vy = 2.5;
    if (!onAnyLadder) p.onLadder = false;
    p.airJumps = 1; // reset air jumps when on ladder
  } else {
    // ===== JUMP / DOUBLE JUMP =====
    var jumpKey = !!state.keys['w'];
    if (jumpKey && !p.wasJumpKey) {
      if (p.onGround) {
        p.vy = JUMP_POWER;
        p.onGround = false;
        // airJumps stays 1 so you still have one left
      } else if (p.airJumps > 0) {
        p.vy = JUMP_POWER;
        p.airJumps--;
      }
    }
    p.wasJumpKey = jumpKey;
    // ===== DROP THROUGH PLATFORM =====
    if (p.onGround && state.keys['s'] && !p.dropping) {
      // only drop if standing on a non-solid platform
      var canDrop = false;
      for (var i = 0; i < state.platforms.length; i++) {
        var pl = state.platforms[i];
        if (!pl.solid &&
            p.x + p.w/2 > pl.x && p.x - p.w/2 < pl.x + pl.w &&
            Math.abs((p.y + p.h) - pl.y) < 6) {
          canDrop = true;
          break;
        }
      }
      if (canDrop) {
        p.dropping = true;
        p.dropTimer = 0.25; // ignore platforms for 0.25s
        p.onGround = false;
        p.vy = 2; // gentle push down
      }
    }
  }
  // Shoot
  if (state.keys[' '] && p.shootCooldown <= 0) {
    shoot(p);
    p.shootCooldown = 0.4;
  }
} else {
  p.vx *= 0.8;
}
// Gravity
if (!p.onLadder) {
  p.vy += GRAVITY;
}
// ===== X movement + collision =====
p.x += p.vx;
for (var i = 0; i < state.platforms.length; i++) {
  var pl = state.platforms[i];
  if (rectOverlap(p.x-p.w/2, p.y, p.w, p.h, pl.x, pl.y, pl.w, pl.h)) {
    if (p.vx > 0) p.x = pl.x - p.w/2;
    else if (p.vx < 0) p.x = pl.x + pl.w + p.w/2;
    p.vx = 0;
  }
}
// ===== Y movement + collision =====
p.y += p.vy;
p.onGround = false;
for (var i = 0; i < state.platforms.length; i++) {
  var pl = state.platforms[i];
  // while dropping, ignore non-solid platforms
  if (p.dropping && !pl.solid) continue;
  if (rectOverlap(p.x-p.w/2, p.y, p.w, p.h, pl.x, pl.y, pl.w, pl.h)) {
    if (pl.solid) {
      // full solid collision
      if (p.vy > 0) {
        p.y = pl.y - p.h;
        p.vy = 0;
        p.onGround = true;
        p.airJumps = 1;
      } else if (p.vy < 0) {
        p.y = pl.y + pl.h;
        p.vy = 0;
      }
    } else {
      // one-way platform – only land when falling onto the top
      if (p.vy >= 0 && (p.y + p.h - p.vy) <= pl.y + 8) {
        p.y = pl.y - p.h;
        p.vy = 0;
        p.onGround = true;
        p.airJumps = 1;
      }
      // going up → pass through freely
    }
  }
}
// Ground safety (also solid)
if (p.y + p.h > GROUND_Y) {
  p.y = GROUND_Y - p.h;
  p.vy = 0;
  p.onGround = true;
  p.airJumps = 1;
  p.dropping = false;
}
// Bounds
if (p.x - p.w/2 < 0) p.x = p.w/2;
if (p.x + p.w/2 > W) p.x = W - p.w/2;
// Cooldowns
if (p.shootCooldown > 0) p.shootCooldown -= dt;
if (p.hitFlash > 0) p.hitFlash -= dt;
}
// ================================================================
// SHOOTING
// ================================================================
function shoot(shooter) {
var spawnX = shooter.x + shooter.facing * 20;
var spawnY = shooter.y + 14;
var angle = shooter.facing === 1 ? 0 : Math.PI;
state.bullets.push({
x: spawnX, y: spawnY,
vx: Math.cos(angle) * 12,
vy: 0,
owner: shooter.id,
team: shooter.team,
damage: 25 * state.damageMultiplier,
life: 1.5,
});
for (var i = 0; i < 5; i++) {
state.particles.push({
x: spawnX, y: spawnY,
vx: (Math.random()-0.5)*3 + shooter.facing*2,
vy: (Math.random()-0.5)*3,
life: 0.3, maxLife: 0.3,
color: '#daa74b', size: 3,
});
}
}
function updateBullets(dt) {
for (var i = state.bullets.length - 1; i >= 0; i--) {
var b = state.bullets[i];
b.x += b.vx;
b.y += b.vy;
b.life -= dt;
var hit = false;
for (var j = 0; j < state.platforms.length; j++) {
var pl = state.platforms[j];
if (b.x > pl.x && b.x < pl.x+pl.w && b.y > pl.y && b.y < pl.y+pl.h) {
hit = true;
for (var k = 0; k < 6; k++) {
state.particles.push({
x: b.x, y: b.y,
vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4,
life: 0.3, maxLife: 0.3, color: '#daa74b', size: 2,
});
}
break;
}
}
if (!hit) {
for (var id in state.players) {
var p = state.players[id];
if (p.id === b.owner || p.team === b.team || !p.alive) continue;
if (b.x > p.x - p.w/2 && b.x < p.x + p.w/2 && b.y > p.y && b.y < p.y + p.h) {
p.hp -= b.damage;
p.hitFlash = 0.2;
hit = true;
for (var k = 0; k < 8; k++) {
state.particles.push({
x: b.x, y: b.y,
vx: (Math.random()-0.5)*5, vy: (Math.random()-0.5)*5,
life: 0.4, maxLife: 0.4,
color: b.team === 'A' ? '#daa74b' : '#4a9eff', size: 3,
});
}
if (p.hp <= 0) {
p.hp = 0;
p.alive = false;
var attacker = state.players[b.owner];
if (attacker) {
attacker.kills++;
if (attacker.team === 'A') state.scoreA++;
else state.scoreB++;
addKillFeed(attacker.id, p.id);
if (state.scoreA >= 5 || state.scoreB >= 5) {
endGame();
}
}
}
break;
}
}
}
if (hit || b.life <= 0 || b.x < 0 || b.x > W || b.y < 0 || b.y > H) {
state.bullets.splice(i, 1);
}
}
}
function updateParticles(dt) {
for (var i = state.particles.length - 1; i >= 0; i--) {
var p = state.particles[i];
p.x += p.vx;
p.y += p.vy;
p.vy += 0.2;
p.life -= dt;
if (p.life <= 0) state.particles.splice(i, 1);
}
}
// ================================================================
// RENDERING
// ================================================================
function render() {
ctx.clearRect(0, 0, W, H);
var bg = ctx.createLinearGradient(0, 0, 0, H);
bg.addColorStop(0, '#0d0d18');
bg.addColorStop(1, '#050510');
ctx.fillStyle = bg;
ctx.fillRect(0, 0, W, H);
ctx.strokeStyle = 'rgba(218,167,75,0.05)';
ctx.lineWidth = 1;
for (var x = 0; x < W; x += 40) {
ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
}
for (var y = 0; y < H; y += 40) {
ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
}
state.ladders.forEach(function(L) {
ctx.strokeStyle = '#8a6a2a';
ctx.lineWidth = 2;
var rungs = Math.floor(L.h / 15);
for (var r = 0; r <= rungs; r++) {
var ly = L.y + r * 15;
ctx.beginPath();
ctx.moveTo(L.x, ly);
ctx.lineTo(L.x + L.w, ly);
ctx.stroke();
}
ctx.beginPath();
ctx.moveTo(L.x, L.y); ctx.lineTo(L.x, L.y + L.h);
ctx.moveTo(L.x + L.w, L.y); ctx.lineTo(L.x + L.w, L.y + L.h);
ctx.stroke();
});
state.platforms.forEach(function(pl) {
ctx.fillStyle = pl.color || '#2a2a44';
ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
ctx.strokeStyle = 'rgba(218,167,75,0.3)';
ctx.lineWidth = 1;
ctx.strokeRect(pl.x + 0.5, pl.y + 0.5, pl.w - 1, pl.h - 1);
});
state.bullets.forEach(function(b) {
ctx.fillStyle = b.team === 'A' ? '#daa74b' : '#4a9eff';
ctx.shadowBlur = 10;
ctx.shadowColor = ctx.fillStyle;
ctx.beginPath();
ctx.arc(b.x, b.y, 3, 0, Math.PI*2);
ctx.fill();
ctx.shadowBlur = 0;
});
state.particles.forEach(function(p) {
ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
ctx.fillStyle = p.color;
ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
ctx.globalAlpha = 1;
});
for (var id in state.players) {
drawStickman(state.players[id]);
}
if (state.active && state.phase === 'action') {
var cur = state.players[state.current];
if (cur && cur.alive) {
ctx.fillStyle = '#daa74b';
ctx.font = 'bold 14px system-ui';
ctx.textAlign = 'center';
ctx.fillText('▼', cur.x, cur.y - 12);
}
}
if (state.phase === 'action') {
var cur = state.players[state.current];
if (cur && cur.alive) {
ctx.strokeStyle = 'rgba(218,167,75,0.3)';
ctx.setLineDash([4, 6]);
ctx.beginPath();
ctx.moveTo(cur.x + cur.facing * 20, cur.y + 14);
ctx.lineTo(cur.x + cur.facing * 300, cur.y + 14);
ctx.stroke();
ctx.setLineDash([]);
}
}
}
function drawStickman(p) {
if (!p.alive) return;
var color = p.team === 'A' ? '#daa74b' : '#4a9eff';
var x = p.x, y = p.y;
var flash = p.hitFlash > 0;
ctx.save();
if (flash) {
ctx.shadowBlur = 20;
ctx.shadowColor = '#fff';
}
ctx.strokeStyle = flash ? '#ffffff' : color;
ctx.fillStyle = flash ? '#ffffff' : color;
ctx.lineWidth = 3;
ctx.lineCap = 'round';
ctx.beginPath();
ctx.arc(x, y + 8, 8, 0, Math.PI * 2);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(x, y + 16);
ctx.lineTo(x, y + 32);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(x - 8, y + 22);
ctx.lineTo(x + 8, y + 22);
ctx.stroke();
var gunX = x + p.facing * 18;
var gunY = y + 20;
ctx.beginPath();
ctx.moveTo(x, y + 22);
ctx.lineTo(gunX, gunY);
ctx.stroke();
ctx.fillStyle = '#333';
ctx.fillRect(gunX - (p.facing > 0 ? 0 : 12), gunY - 3, 12, 6);
var legSpread = 5;
ctx.beginPath();
ctx.moveTo(x, y + 32);
ctx.lineTo(x - legSpread, y + 44);
ctx.moveTo(x, y + 32);
ctx.lineTo(x + legSpread, y + 44);
ctx.stroke();
var hpPct = p.hp / p.maxHp;
ctx.fillStyle = 'rgba(0,0,0,0.6)';
ctx.fillRect(x - 18, y - 12, 36, 5);
ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444';
ctx.fillRect(x - 18, y - 12, 36 * hpPct, 5);
ctx.fillStyle = color;
ctx.font = 'bold 11px system-ui';
ctx.textAlign = 'center';
ctx.fillText(p.id, x, y - 16);
if (p.id === state.current && state.phase === 'action') {
ctx.strokeStyle = '#daa74b';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.arc(x, y + 22, 28, 0, Math.PI * 2);
ctx.stroke();
}
ctx.restore();
}
// ================================================================
// HUD
// ================================================================
function updateHUD() {
document.getElementById('scoreA').textContent = state.scoreA;
document.getElementById('scoreB').textContent = state.scoreB;
for (var id in state.players) {
var p = state.players[id];
var el = document.getElementById('hp' + id);
if (el) {
el.textContent = id + ': ' + (p.alive ? Math.floor(p.hp) : 'DEAD');
el.style.opacity = p.alive ? 1 : 0.4;
el.style.textDecoration = p.alive ? 'none' : 'line-through';
}
}
updateTurnDisplay();
}
function addKillFeed(killerId, victimId) {
var feed = document.getElementById('killFeed');
var item = document.createElement('div');
item.className = 'panel kill-feed-item py-2 px-[14px] text-xs';
item.innerHTML = '<span class="text-[#daa74b] font-bold">' + killerId + '</span> 🔫 <span class="text-[#888]">' + victimId + '</span>';
feed.prepend(item);
setTimeout(function() { item.remove(); }, 4000);
}
// ================================================================
// END GAME
// ================================================================
function endGame() {
state.over = true;
state.active = false;
if (state.timerInterval) clearInterval(state.timerInterval);
if (state.questionTimer) clearInterval(state.questionTimer);
document.getElementById('questionBox').classList.add('hidden');
document.getElementById('timerBar').classList.add('hidden');
document.getElementById('controlsBox').classList.add('hidden');
var winner = state.scoreA > state.scoreB ? 'A' : 'B';
var goTitle = document.getElementById('goTitle');
goTitle.textContent = 'TEAM ' + winner + ' WINS';
goTitle.classList.remove('text-[#daa74b]','text-[#4a9eff]');
goTitle.classList.add(winner === 'A' ? 'text-[#daa74b]' : 'text-[#4a9eff]');
document.getElementById('goScore').textContent = state.scoreA + ' — ' + state.scoreB;
document.getElementById('gameOverBox').classList.remove('hidden');
}
// ================================================================
// MAIN LOOP
// ================================================================
var lastTime = performance.now();
function loop(now) {
var dt = Math.min((now - lastTime) / 1000, 0.05);
lastTime = now;
if (state.active || state.over) {
if (state.active) {
for (var id in state.players) {
updatePlayer(state.players[id], dt);
}
updateBullets(dt);
updateParticles(dt);
}
render();
updateHUD();
}
requestAnimationFrame(loop);
}
// ================================================================
// BOOT
// ================================================================
document.getElementById('startBtn').onclick = initGame;
document.getElementById('playAgainBtn').onclick = initGame;
buildLevel();
requestAnimationFrame(loop);
