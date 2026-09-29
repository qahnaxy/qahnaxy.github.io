// ================================================================
// CANVAS
// ================================================================
var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var W = canvas.width;
var H = canvas.height;

var HOOP_Y = 200;
var HOOP_RADIUS = 48;
var BALL_START_X = W / 2;
var BALL_START_Y = H - 110;
var BALL_RADIUS = 15;
var GRAVITY = 0.55;

var HOOPS = [
  { letter:'A', x: W * 0.13, y: HOOP_Y, color:'#daa74b' },
  { letter:'B', x: W * 0.37, y: HOOP_Y, color:'#4a9eff' },
  { letter:'C', x: W * 0.63, y: HOOP_Y, color:'#22c55e' },
  { letter:'D', x: W * 0.87, y: HOOP_Y, color:'#ef4444' },
];

// ================================================================
// STATE
// ================================================================
var game = {
  running: false,
  phase: 'idle',
  score: 0,
  streak: 0,
  bestStreak: 0,
  correctCount: 0,
  totalQuestions: 0,
  maxQuestions: 10,

  currentQ: null,
  shuffledOpts: [],
  correctShuffledIdx: 0,

  ball: { x: BALL_START_X, y: BALL_START_Y, vx: 0, vy: 0, active: false, rotation: 0, rotSpeed: 0 },

  aimAngle: -Math.PI / 2,

  // Timing bar
  barActive: false,
  barPos: 0,           // 0..1
  barDir: 1,
  barSpeed: 1.25,      // fills per second
  barFrozen: false,    // after tap, needle freezes
  barFrozenPos: 0,
  greenStart: 0.42,
  greenEnd: 0.58,
  perfectTap: false,

  timeLeft: 10,
  timerInterval: null,
  barRAF: null,

  trail: [],
  confetti: [],
  hoopGlows: [0,0,0,0],
  netSway: [0,0,0,0],
  screenShake: 0,
  flashColor: null,
  flashTime: 0,

  mouseX: W/2,
  mouseY: H/2,
};

// ================================================================
// INIT
// ================================================================
function initGame() {
  game.running = true;
  game.phase = 'aiming';
  game.score = 0;
  game.streak = 0;
  game.bestStreak = 0;
  game.correctCount = 0;
  game.totalQuestions = 0;
  game.trail = [];
  game.confetti = [];
  game.hoopGlows = [0,0,0,0];
  game.netSway = [0,0,0,0];
  game.screenShake = 0;
  game.flashColor = null;
  game.flashTime = 0;

  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('gameOverScreen').classList.add('hidden');
  document.getElementById('questionBanner').classList.remove('hidden');
  document.getElementById('questionBanner').classList.remove('flash');
  document.getElementById('bigPopups').innerHTML = '';

  updateHUD();
  nextQuestion();
}

function updateHUD() {
  document.getElementById('scoreDisplay').textContent = game.score;
  document.getElementById('streakDisplay').textContent = game.streak;
  document.getElementById('bestStreakDisplay').textContent = game.bestStreak;
  document.getElementById('shotDisplay').textContent = Math.min(game.totalQuestions + 1, game.maxQuestions) + ' / ' + game.maxQuestions;
  var acc = game.totalQuestions > 0 ? Math.round((game.correctCount / game.totalQuestions) * 100) : 0;
  document.getElementById('accuracyDisplay').textContent = acc + '%';
}

// ================================================================
// NEXT QUESTION
// ================================================================
function nextQuestion() {
  if (game.totalQuestions >= game.maxQuestions) { endGame(); return; }

  // Reset ball
  game.ball.x = BALL_START_X;
  game.ball.y = BALL_START_Y;
  game.ball.vx = 0;
  game.ball.vy = 0;
  game.ball.active = false;
  game.ball.rotation = 0;
  game.trail = [];
  game.aimAngle = -Math.PI / 2;

  // Reset bar
  game.barActive = false;
  game.barPos = 0;
  game.barDir = 1;
  game.barFrozen = false;
  game.barFrozenPos = 0;
  game.perfectTap = false;
  document.getElementById('timingBar').classList.remove('active');
  document.getElementById('instructions').classList.remove('active');

  // Pick question
  var q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
  game.currentQ = q;

  var indexed = q.opts.map(function(o, i){ return { text:o, correct:i===q.correct }; });
  for (var i = indexed.length-1; i>0; i--) {
    var j = Math.floor(Math.random()*(i+1));
    var tmp = indexed[i]; indexed[i]=indexed[j]; indexed[j]=tmp;
  }
  game.shuffledOpts = indexed;
  game.correctShuffledIdx = indexed.findIndex(function(x){ return x.correct; });

  document.getElementById('qCategory').textContent = q.cat;
  var diffEl = document.getElementById('qDifficulty');
  diffEl.textContent = q.diff;
  diffEl.style.color = q.diff==='EASY' ? '#22c55e' : q.diff==='MEDIUM' ? '#eab308' : '#ef4444';
  document.getElementById('qText').textContent = q.q;

  renderAnswerCards();

  game.phase = 'aiming';
  game.timeLeft = 10;
  startTimer();
}

function renderAnswerCards() {
  var container = document.getElementById('answerCards');
  container.innerHTML = '';
  HOOPS.forEach(function(h, i) {
    var card = document.createElement('div');
    card.className = 'answer-card';
    card.id = 'answerCard_' + i;
    card.style.left = h.x + 'px';
    card.style.top = (h.y + HOOP_RADIUS + 80) + 'px';
    card.style.width = '240px';
    var item = game.shuffledOpts[i];
    card.innerHTML = '<span class="letter ' + h.letter + '">' + h.letter + '</span><span class="text">' + item.text + '</span>';
    container.appendChild(card);
  });
}

// ================================================================
// TIMER
// ================================================================
function startTimer() {
  if (game.timerInterval) clearInterval(game.timerInterval);
  document.getElementById('qTimer').textContent = Math.ceil(game.timeLeft);
  document.getElementById('questionBanner').classList.remove('flash');

  game.timerInterval = setInterval(function() {
    game.timeLeft -= 0.1;
    var t = Math.max(0, Math.ceil(game.timeLeft));
    document.getElementById('qTimer').textContent = t;
    if (game.timeLeft < 3) {
      document.getElementById('questionBanner').classList.add('flash');
    }
    if (game.timeLeft <= 0) {
      clearInterval(game.timerInterval);
      game.timerInterval = null;
      // Auto-shoot without any timing (miss)
      if (game.phase === 'aiming' && !game.ball.active) {
        if (!game.barActive) {
          startTimingBar();
        }
        game.barFrozenPos = 0.05; // outside green
        resolveShot();
      }
    }
  }, 100);
}

// ================================================================
// TIMING BAR (the new mechanic)
// ================================================================
function startTimingBar() {
  if (game.barActive) return;
  game.barActive = true;
  game.barPos = 0;
  game.barDir = 1;
  game.barFrozen = false;
  game.barFrozenPos = 0;
  document.getElementById('timingBar').classList.add('active');
  document.getElementById('instructions').classList.add('active');
}

function tapTiming() {
  if (!game.barActive || game.barFrozen) return;
  // Freeze needle at current position
  game.barFrozen = true;
  game.barFrozenPos = game.barPos;
  game.perfectTap = (game.barFrozenPos >= game.greenStart && game.barFrozenPos <= game.greenEnd);
  resolveShot();
}

function updateTimingBar(delta) {
  if (!game.barActive || game.barFrozen) return;

  // Speed: fills 0→1 in 1/barSpeed seconds
  game.barPos += game.barDir * game.barSpeed * delta;

  if (game.barPos >= 1) {
    game.barPos = 1;
    game.barDir = -1;
  }
  if (game.barPos <= 0) {
    game.barPos = 0;
    game.barDir = 1;
  }

  document.getElementById('needle').style.left = (game.barPos * 100) + '%';
}

// ================================================================
// RESOLVE SHOT
// ================================================================
function resolveShot() {
  if (game.timerInterval) { clearInterval(game.timerInterval); game.timerInterval = null; }
  document.getElementById('questionBanner').classList.remove('flash');

  var made = game.perfectTap;

  // Fire the ball with fixed power (the timing decides whether it makes it)
  var angle = game.aimAngle;
  if (angle > -0.1) angle = -0.1;
  if (angle < -Math.PI + 0.1) angle = -Math.PI + 0.1;

  // Base power
  var power = 30;

  // If missed timing, add variance so ball flies off and misses
  if (!made) {
    // Random big variance
    var error = (Math.random() - 0.5) * 0.6;
    angle += error;
    power = 30 + (Math.random() - 0.5) * 14;
  }

  game.ball.x = BALL_START_X;
  game.ball.y = BALL_START_Y;
  game.ball.vx = Math.cos(angle) * power;
  game.ball.vy = Math.sin(angle) * power;
  game.ball.active = true;
  game.ball.rotation = 0;
  game.ball.rotSpeed = (angle > -Math.PI/2) ? 0.22 : -0.22;

  game.phase = 'flying';

  // Muzzle flash
  spawnBurst(BALL_START_X, BALL_START_Y, '#daa74b', 12);
  document.getElementById('instructions').classList.remove('active');
}

// ================================================================
// BALL PHYSICS
// ================================================================
function updateBall() {
  if (!game.ball.active) return;

  game.ball.x += game.ball.vx;
  game.ball.y += game.ball.vy;
  game.ball.vy += GRAVITY;
  game.ball.rotation += game.ball.rotSpeed;

  game.trail.push({ x: game.ball.x, y: game.ball.y, life: 0.5, maxLife: 0.5 });
  if (game.trail.length > 20) game.trail.shift();

  // Check hoop scoring
  for (var i = 0; i < HOOPS.length; i++) {
    var h = HOOPS[i];
    var dx = game.ball.x - h.x;
    var dy = game.ball.y - h.y;
    if (Math.abs(dx) < HOOP_RADIUS * 0.6 && Math.abs(dy) < 20 && game.ball.vy > 0.5) {
      scoreHoop(i);
      return;
    }
  }

  if (game.ball.y > H + 60 || game.ball.x < -80 || game.ball.x > W + 80) {
    ballMissed();
    return;
  }

  if (game.ball.x < BALL_RADIUS) { game.ball.x = BALL_RADIUS; game.ball.vx *= -0.7; }
  if (game.ball.x > W - BALL_RADIUS) { game.ball.x = W - BALL_RADIUS; game.ball.vx *= -0.7; }
  if (game.ball.y < BALL_RADIUS) { game.ball.y = BALL_RADIUS; game.ball.vy *= -0.5; }
}

// ================================================================
// SCORING
// ================================================================
function scoreHoop(hoopIndex) {
  game.ball.active = false;
  game.hoopGlows[hoopIndex] = 1.5;
  game.netSway[hoopIndex] = 1;
  game.totalQuestions++;

  var isCorrect = (hoopIndex === game.correctShuffledIdx);

  // Highlight answer cards
  document.querySelectorAll('.answer-card').forEach(function(c, i) {
    if (i === game.correctShuffledIdx) c.classList.add('correct');
    else if (i === hoopIndex && !isCorrect) c.classList.add('wrong');
  });

  if (isCorrect) {
    game.streak++;
    game.correctCount++;
    if (game.streak > game.bestStreak) game.bestStreak = game.streak;

    var basePts = 100;
    var streakBonus = Math.min((game.streak - 1) * 50, 500);
    var pts = basePts + streakBonus;
    game.score += pts;

    showPerfectBanner('GREEN!');
    showBigPopup('+' + pts, HOOPS[hoopIndex].x, HOOPS[hoopIndex].y - 30, '#22c55e', 52);
    showBigPopup('SWISH!', HOOPS[hoopIndex].x, HOOPS[hoopIndex].y + 60, '#22c55e', 28);

    if (game.streak >= 3) showComboText(game.streak + 'x COMBO!');

    spawnConfetti(HOOPS[hoopIndex].x, HOOPS[hoopIndex].y, 50);
    spawnBurst(HOOPS[hoopIndex].x, HOOPS[hoopIndex].y, HOOPS[hoopIndex].color, 25);

    game.screenShake = 12;
    game.flashColor = '#22c55e';
    game.flashTime = 0.25;
  } else {
    game.streak = 0;
    showBigPopup('WRONG HOOP', HOOPS[hoopIndex].x, HOOPS[hoopIndex].y - 30, '#ef4444', 36);
    game.screenShake = 6;
    game.flashColor = '#ef4444';
    game.flashTime = 0.2;
  }

  updateHUD();
  game.phase = 'resolved';

  setTimeout(function() {
    if (game.totalQuestions >= game.maxQuestions) endGame();
    else nextQuestion();
  }, 1600);
}

function ballMissed() {
  game.ball.active = false;
  game.totalQuestions++;
  game.streak = 0;

  document.querySelectorAll('.answer-card').forEach(function(c, i) {
    if (i === game.correctShuffledIdx) c.classList.add('correct');
  });

  showBigPopup('AIR BALL', W/2, H/2, '#ef4444', 44);
  game.screenShake = 5;
  game.flashColor = '#ef4444';
  game.flashTime = 0.15;

  updateHUD();
  game.phase = 'resolved';

  setTimeout(function() {
    if (game.totalQuestions >= game.maxQuestions) endGame();
    else nextQuestion();
  }, 1400);
}

// ================================================================
// EFFECTS
// ================================================================
function spawnConfetti(x, y, count) {
  for (var i = 0; i < count; i++) {
    var angle = Math.random() * Math.PI * 2;
    var speed = 4 + Math.random() * 10;
    game.confetti.push({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      life: 1.0, maxLife: 1.0,
      color: ['#daa74b', '#4a9eff', '#22c55e', '#ef4444', '#eab308', '#ff69b4', '#00ffff'][Math.floor(Math.random()*7)],
      size: 3 + Math.random() * 6,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.4,
    });
  }
}

function spawnBurst(x, y, color, count) {
  for (var i = 0; i < count; i++) {
    var angle = Math.random() * Math.PI * 2;
    var speed = 2 + Math.random() * 7;
    game.confetti.push({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.6, maxLife: 0.6,
      color: color,
      size: 2 + Math.random() * 4,
      rot: 0, rotSpeed: 0,
    });
  }
}

function showBigPopup(text, x, y, color, size) {
  var el = document.createElement('div');
  el.className = 'big-pop';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.color = color;
  el.style.fontSize = (size || 44) + 'px';
  el.textContent = text;
  document.getElementById('bigPopups').appendChild(el);
  setTimeout(function() { el.remove(); }, 1200);
}

function showComboText(text) {
  var el = document.createElement('div');
  el.className = 'combo-text';
  el.textContent = text;
  document.getElementById('bigPopups').appendChild(el);
  setTimeout(function() { el.remove(); }, 950);
}

function showPerfectBanner(text) {
  var el = document.createElement('div');
  el.className = 'perfect-banner';
  el.textContent = text;
  document.getElementById('bigPopups').appendChild(el);
  // force reflow
  void el.offsetWidth;
  el.classList.add('go');
  setTimeout(function() { el.remove(); }, 1300);
}

function updateEffects(delta) {
  for (var i = game.confetti.length - 1; i >= 0; i--) {
    var c = game.confetti[i];
    c.x += c.vx;
    c.y += c.vy;
    c.vy += 0.3;
    c.vx *= 0.99;
    c.rot += c.rotSpeed;
    c.life -= delta;
    if (c.life <= 0) game.confetti.splice(i, 1);
  }
  for (var i = game.trail.length - 1; i >= 0; i--) {
    game.trail[i].life -= delta * 1.8;
    if (game.trail[i].life <= 0) game.trail.splice(i, 1);
  }
  for (var i = 0; i < 4; i++) {
    game.hoopGlows[i] *= 0.93;
    game.netSway[i] *= 0.9;
  }
  if (game.flashTime > 0) {
    game.flashTime -= delta;
    if (game.flashTime <= 0) game.flashColor = null;
  }
}

// ================================================================
// RENDER
// ================================================================
function render() {
  var shakeX = 0, shakeY = 0;
  if (game.screenShake > 0.5) {
    shakeX = (Math.random() - 0.5) * game.screenShake;
    shakeY = (Math.random() - 0.5) * game.screenShake;
    game.screenShake *= 0.85;
  } else {
    game.screenShake = 0;
  }
  ctx.save();
  ctx.translate(shakeX, shakeY);

  var bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0a0a1a');
  bg.addColorStop(0.5, '#12122a');
  bg.addColorStop(1, '#050510');
  ctx.fillStyle = bg;
  ctx.fillRect(-20, -20, W + 40, H + 40);

  ctx.strokeStyle = 'rgba(218,167,75,0.06)';
  ctx.lineWidth = 1;
  for (var x = 0; x < W; x += 50) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (var y = 0; y < H; y += 50) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  HOOPS.forEach(function(h, i) {
    var g = ctx.createRadialGradient(h.x, h.y, 20, h.x, h.y, 280);
    g.addColorStop(0, hexToRgba(h.color, 0.12 + game.hoopGlows[i] * 0.3));
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(h.x - 280, h.y - 280, 560, 560);
  });

  ctx.fillStyle = 'rgba(218,167,75,0.08)';
  ctx.fillRect(0, H - 50, W, 50);
  ctx.strokeStyle = 'rgba(218,167,75,0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, H - 50);
  ctx.lineTo(W, H - 50);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(218,167,75,0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(BALL_START_X, H - 50, 80, Math.PI, Math.PI * 2);
  ctx.stroke();

  HOOPS.forEach(function(h, i) { drawHoop(h, i); });

  game.trail.forEach(function(t) {
    ctx.globalAlpha = t.life / t.maxLife * 0.6;
    ctx.fillStyle = '#ffb060';
    ctx.beginPath();
    ctx.arc(t.x, t.y, BALL_RADIUS * 0.7 * (t.life / t.maxLife), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  if (game.ball.active) {
    drawBall(game.ball.x, game.ball.y, game.ball.rotation);
  } else if (game.phase === 'aiming') {
    drawBall(BALL_START_X, BALL_START_Y, performance.now() * 0.002);
    drawAimLine();
  }

  game.confetti.forEach(function(c) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, c.life / c.maxLife);
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    ctx.fillStyle = c.color;
    ctx.fillRect(-c.size/2, -c.size/2, c.size, c.size);
    ctx.restore();
  });
  ctx.globalAlpha = 1;

  ctx.restore();

  if (game.flashColor && game.flashTime > 0) {
    ctx.fillStyle = game.flashColor;
    ctx.globalAlpha = Math.min(0.35, game.flashTime * 1.4);
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }
}

function drawHoop(h, idx) {
  var glow = game.hoopGlows[idx];
  var sway = game.netSway[idx];

  ctx.fillStyle = 'rgba(20,20,40,0.95)';
  ctx.fillRect(h.x - 55, h.y - 70, 110, 75);
  ctx.strokeStyle = h.color;
  ctx.lineWidth = 3;
  if (glow > 0.1) {
    ctx.shadowBlur = 30 * glow;
    ctx.shadowColor = h.color;
  }
  ctx.strokeRect(h.x - 55, h.y - 70, 110, 75);
  ctx.shadowBlur = 0;

  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(h.x - 22, h.y - 50, 44, 34);

  if (glow > 0.1) {
    ctx.shadowBlur = 40 * glow;
    ctx.shadowColor = h.color;
  }
  ctx.strokeStyle = h.color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(h.x, h.y, HOOP_RADIUS, 12, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(h.x, h.y - 2, HOOP_RADIUS - 3, 9, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // ---- Realistic woven net mesh ----
  var netHeight = 58;
  var netStrands = 11;
  var pull = 0.22; // how sharply strands converge toward center at the bottom

  var stemPts = [];
  for (var i = 0; i <= netStrands; i++) {
    var t = i / netStrands;
    // top point follows the rim's elliptical curve (front edge bulges toward viewer)
    var topX = h.x - HOOP_RADIUS + t * (HOOP_RADIUS * 2);
    var topY = h.y + Math.sin(t * Math.PI) * 5;
    // bottom point pulls inward and sways gently
    var bottomX = h.x + (topX - h.x) * pull + Math.sin(sway * 6 + t * 5) * 5;
    var bottomY = h.y + netHeight;
    stemPts.push({ topX: topX, topY: topY, bottomX: bottomX, bottomY: bottomY });
  }

  // vertical strands, bowed slightly outward like real netting catching air
  ctx.lineWidth = 1;
  for (var i = 0; i <= netStrands; i++) {
    var p = stemPts[i];
    var bow = (p.topX - h.x) * 0.18;
    var midX = (p.topX + p.bottomX) / 2 + bow;
    var midY = (p.topY + p.bottomY) / 2;
    var edgeFade = 1 - Math.abs((i / netStrands) - 0.5) * 0.6;
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.55 * edgeFade) + ')';
    ctx.beginPath();
    ctx.moveTo(p.topX, p.topY);
    ctx.quadraticCurveTo(midX, midY, p.bottomX, p.bottomY);
    ctx.stroke();
  }

  // diagonal cross-ties at increasing depth, forming a diamond weave that
  // dims slightly toward the bottom for a bit of depth/shading
  var ringLevels = [0.22, 0.46, 0.7];
  ringLevels.forEach(function(lvl, li) {
    var nextLvl = lvl + 0.24;
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.42 - li * 0.09) + ')';
    ctx.lineWidth = 1;
    for (var i = 0; i < netStrands; i++) {
      var a = stemPts[i];
      var b = stemPts[i + 1];
      var ax = a.topX + (a.bottomX - a.topX) * lvl;
      var ay = a.topY + (a.bottomY - a.topY) * lvl;
      var bx = b.topX + (b.bottomX - b.topX) * lvl;
      var by = b.topY + (b.bottomY - b.topY) * lvl;
      var ax2 = a.topX + (a.bottomX - a.topX) * nextLvl;
      var ay2 = a.topY + (a.bottomY - a.topY) * nextLvl;
      var bx2 = b.topX + (b.bottomX - b.topX) * nextLvl;
      var by2 = b.topY + (b.bottomY - b.topY) * nextLvl;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx2, by2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(ax2, ay2);
      ctx.stroke();
    }
  });

  if (glow > 0.05) {
    ctx.globalAlpha = glow * 0.6;
    ctx.fillStyle = h.color;
    ctx.beginPath();
    ctx.ellipse(h.x, h.y, HOOP_RADIUS + 12, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawBall(x, y, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  ctx.beginPath();
  ctx.arc(0, 0, BALL_RADIUS + 3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fill();

  var grad = ctx.createRadialGradient(-6, -6, 3, 0, 0, BALL_RADIUS);
  grad.addColorStop(0, '#ffb060');
  grad.addColorStop(0.5, '#ff8020');
  grad.addColorStop(1, '#b83a00');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffb060';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#ff8020';
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = '#2a0a00';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-BALL_RADIUS, 0);
  ctx.lineTo(BALL_RADIUS, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -BALL_RADIUS);
  ctx.lineTo(0, BALL_RADIUS);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, BALL_RADIUS, Math.PI * 0.2, Math.PI * 0.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, BALL_RADIUS, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.arc(-5, -5, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawAimLine() {
  var startX = BALL_START_X;
  var startY = BALL_START_Y;
  var vx = Math.cos(game.aimAngle);
  var vy = Math.sin(game.aimAngle);

  var speed = 30;
  var simX = startX, simY = startY;
  var simVx = vx * speed, simVy = vy * speed;
  ctx.fillStyle = 'rgba(218,167,75,0.55)';
  for (var i = 0; i < 30; i++) {
    simX += simVx;
    simY += simVy;
    simVy += GRAVITY;
    if (simY > H || simX < 0 || simX > W) break;
    var r = 3.5 - i * 0.08;
    if (r < 0.5) break;
    ctx.globalAlpha = 0.55 - i * 0.015;
    ctx.beginPath();
    ctx.arc(simX, simY, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function hexToRgba(hex, a) {
  var r = parseInt(hex.slice(1,3), 16);
  var g = parseInt(hex.slice(3,5), 16);
  var b = parseInt(hex.slice(5,7), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

// ================================================================
// END GAME
// ================================================================
function endGame() {
  game.running = false;
  game.phase = 'done';
  if (game.timerInterval) { clearInterval(game.timerInterval); game.timerInterval = null; }

  var acc = game.totalQuestions > 0 ? Math.round((game.correctCount / game.totalQuestions) * 100) : 0;
  document.getElementById('goScore').textContent = game.score;
  document.getElementById('goAccuracy').textContent = acc + '%';

  var msg = '';
  if (acc >= 90) msg = '🏆 MARKET WIZARD — S-TIER TRADER!';
  else if (acc >= 70) msg = '📈 SOLID TRADER — NICE SHOTS!';
  else if (acc >= 50) msg = '📊 GETTING THERE — KEEP GRINDING!';
  else msg = '📉 STUDY UP — BACK TO THE CHARTS!';
  document.getElementById('goMessage').textContent = msg;

  document.getElementById('questionBanner').classList.add('hidden');
  document.getElementById('answerCards').innerHTML = '';
  document.getElementById('timingBar').classList.remove('active');
  document.getElementById('instructions').classList.remove('active');
  document.getElementById('gameOverScreen').classList.remove('hidden');
}

// ================================================================
// INPUT
// ================================================================
canvas.addEventListener('mousemove', function(e) {
  var rect = canvas.getBoundingClientRect();
  var scaleX = canvas.width / rect.width;
  var scaleY = canvas.height / rect.height;
  game.mouseX = (e.clientX - rect.left) * scaleX;
  game.mouseY = (e.clientY - rect.top) * scaleY;

  if (game.phase === 'aiming' && !game.ball.active && !game.barActive) {
    var dx = game.mouseX - BALL_START_X;
    var dy = game.mouseY - BALL_START_Y;
    var angle = Math.atan2(dy, dx);
    if (angle > 0) angle = -0.3;
    angle = Math.max(-Math.PI + 0.15, Math.min(-0.15, angle));
    game.aimAngle = angle;
  }
});

// SPACE = start timing bar + tap in green
window.addEventListener('keydown', function(e) {
  if (e.code === 'Space') {
    e.preventDefault();
    if (game.phase === 'aiming' && !game.ball.active) {
      if (!game.barActive) {
        startTimingBar();
      } else if (!game.barFrozen) {
        tapTiming();
      }
    }
  }
  if (e.code === 'Enter') {
    if (!game.running) {
      var gs = document.getElementById('gameOverScreen');
      var ss = document.getElementById('startScreen');
      if (!ss.classList.contains('hidden') || !gs.classList.contains('hidden')) initGame();
    }
  }
});

// Also allow mouse click to charge/tap
canvas.addEventListener('mousedown', function(e) {
  if (game.phase === 'aiming' && !game.ball.active) {
    if (!game.barActive) {
      startTimingBar();
    } else if (!game.barFrozen) {
      tapTiming();
    }
  }
});

document.getElementById('startBtn').onclick = initGame;
document.getElementById('playAgainBtn').onclick = initGame;

// ================================================================
// MAIN LOOP
// ================================================================
var lastTime = performance.now();

function loop(now) {
  var delta = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  // Update timing bar
  if (game.barActive && !game.barFrozen) {
    updateTimingBar(delta);
  }

  if (game.running) {
    if (game.phase === 'flying') updateBall();
    updateEffects(delta);
  } else {
    updateEffects(delta);
  }

  render();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
