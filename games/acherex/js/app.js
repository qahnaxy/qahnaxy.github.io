// ================================================================
// QUESTIONS
// ================================================================
var QUESTIONS = [
  { cat:'FOREX', diff:'EASY', q:'What is liquidity in the forex market?', opts:['Ease of buying/selling an asset','The bid-ask spread','Central bank reserves','Leverage ratio'], correct:0 },
  { cat:'TECHNICAL', diff:'EASY', q:'What does a bullish engulfing candle indicate?', opts:['Reversal to the upside','Continuation of downtrend','Doji indecision','Volume spike'], correct:0 },
  { cat:'RISK MGMT', diff:'MEDIUM', q:'What happens when a stop loss triggers?', opts:['Position is closed at market price','Position is doubled','Margin call is avoided','Trailing stop activates'], correct:0 },
  { cat:'MARKET STRUCT', diff:'MEDIUM', q:'Best timeframe for major market structure?', opts:['Daily','1-minute','Tick chart','Renko'], correct:0 },
  { cat:'CRYPTO', diff:'EASY', q:'What is a "cold wallet" in crypto?', opts:['Offline storage','Exchange wallet','Hot wallet','Paper wallet'], correct:0 },
  { cat:'PSYCHOLOGY', diff:'MEDIUM', q:'What is "revenge trading"?', opts:['Trading to recover losses impulsively','Hedging a position','Scaling into a winner','Using a trading journal'], correct:0 },
  { cat:'FOREX', diff:'MEDIUM', q:'What is a "pip" in forex?', opts:['Smallest price move','Percentage in point','Lot size unit','Interest rate differential'], correct:0 },
  { cat:'TECHNICAL', diff:'HARD', q:'What does a "golden cross" refer to?', opts:['50 MA crossing above 200 MA','RSI above 70','MACD bearish crossover','Bollinger band squeeze'], correct:0 },
  { cat:'RISK MGMT', diff:'EASY', q:'Common risk-reward for trend following?', opts:['1:2 or higher','1:0.5','1:1 only','0.5:1'], correct:0 },
  { cat:'CRYPTO', diff:'HARD', q:'What is a "flash crash"?', opts:['Rapid price drop and recovery','Slow bleed','Exchange hack','Hard fork'], correct:0 },
  { cat:'MARKET STRUCT', diff:'HARD', q:'Break of structure indicates?', opts:['Trend reversal','Continuation','Consolidation','Volume divergence'], correct:0 },
  { cat:'TECHNICAL', diff:'MEDIUM', q:'Purpose of a moving average?', opts:['Smooth price action','Predict exact tops','Measure volatility','Volume indicator'], correct:0 },
  { cat:'PSYCHOLOGY', diff:'HARD', q:'What is "loss aversion" in trading?', opts:['Feeling losses more intensely than gains','Avoiding all risk','Cutting winners early','Averaging down'], correct:0 },
  { cat:'CRYPTO', diff:'MEDIUM', q:'What is a "halving" in Bitcoin?', opts:['Block reward cut in half every 210,000 blocks','Transaction fee reduction','Network split','Mining difficulty halved'], correct:0 },
  { cat:'FOREX', diff:'HARD', q:'What is a "carry trade" in forex?', opts:['Borrowing low-yield currency to invest in high-yield','Buying and selling simultaneously','Trading only during London session','Using 100x leverage'], correct:0 }
];

// ================================================================
// CANVAS
// ================================================================
var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var W = canvas.width;
var H = canvas.height;

var GROUND_Y = H - 40;
var BOW_X = 140;
var BOW_Y = GROUND_Y - 100;
var GRAVITY = 0.28;
var TARGET_RADIUS = 70;

// ---- DRAG / AIM TUNING ----
var MAX_PULL   = 130;    // px of drag = 100% power
var MIN_PULL   = 12;     // below this the shot is cancelled
var MIN_SPEED  = 12;     // arrow speed at 0% power (px/frame)
var MAX_SPEED  = 78;     // arrow speed at 100% power (px/frame)
var ANGLE_MIN  = -1.50;  // highest arc (radians, negative = upward)
var ANGLE_MAX  = -0.05;  // flattest shot

// Target position (changes each shot)
var target = {
  x: W - 200,
  y: GROUND_Y - 180,
  ringRadius: [14, 26, 40, 56, 72],
  colors: ['#ef4444', '#fff', '#ef4444', '#fff', '#ef4444'],
  bullseye: 0,
  swayPhase: 0,
  swayAmount: 0,
};

// ================================================================
// STATE
// ================================================================
var game = {
  running: false,
  phase: 'idle',     // idle | question | shooting | flying | resolved | done
  score: 0,
  streak: 0,
  bestStreak: 0,
  correctCount: 0,
  totalQuestions: 0,
  maxQuestions: 10,

  currentQ: null,
  shuffledOpts: [],
  correctShuffledIdx: 0,

  // Aim / drag
  aimAngle: -0.7,
  power: 0,            // 0..1
  dragging: false,
  pullX: 0,
  pullY: 0,
  pullLength: 0,

  // Wind
  wind: 0,
  windMax: 0.08,

  // Power shot
  isPowerShot: false,

  // Arrow
  arrow: { x: BOW_X, y: BOW_Y, vx: 0, vy: 0, active: false, rot: 0, powerShot: false },

  timeLeft: 10,
  timerInterval: null,

  trail: [],
  confetti: [],
  screenShake: 0,
  flashColor: null,
  flashTime: 0,

  mouseX: BOW_X,
  mouseY: BOW_Y,

  stuckArrows: [],
};

// ================================================================
// INIT
// ================================================================
function initGame() {
  game.running = true;
  game.score = 0;
  game.streak = 0;
  game.bestStreak = 0;
  game.correctCount = 0;
  game.totalQuestions = 0;
  game.trail = [];
  game.confetti = [];
  game.screenShake = 0;
  game.flashColor = null;
  game.flashTime = 0;
  game.stuckArrows = [];
  game.arrow.active = false;
  game.isPowerShot = false;
  game.dragging = false;
  game.power = 0;

  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('gameOverScreen').classList.add('hidden');
  document.getElementById('bigPopups').innerHTML = '';

  updateHUD();
  updatePowerDots();
  resetPowerMeter();
  nextQuestion();
}

function updateHUD() {
  document.getElementById('scoreDisplay').textContent = game.score;
  document.getElementById('bullseyeDisplay').textContent = game.correctCount;
  document.getElementById('bestStreakDisplay').textContent = game.bestStreak;
  document.getElementById('shotDisplay').textContent = Math.min(game.totalQuestions + 1, game.maxQuestions) + ' / ' + game.maxQuestions;
  var acc = game.totalQuestions > 0 ? Math.round((game.correctCount / game.totalQuestions) * 100) : 0;
  document.getElementById('accuracyDisplay').textContent = acc + '%';
}

function updatePowerDots() {
  for (var i = 1; i <= 3; i++) {
    var dot = document.getElementById('dot' + i);
    if (i <= game.streak) dot.classList.add('filled');
    else dot.classList.remove('filled');
  }
}

function resetPowerMeter() {
  game.power = 0;
  game.pullX = 0;
  game.pullY = 0;
  game.pullLength = 0;
  game.dragging = false;
  var bar = document.getElementById('powerBar');
  if (bar) bar.classList.add('hidden');
  var fill = document.getElementById('powerFill');
  if (fill) fill.style.width = '0%';
}

// ================================================================
// NEXT QUESTION
// ================================================================
function nextQuestion() {
  if (game.totalQuestions >= game.maxQuestions) { endGame(); return; }

  game.phase = 'question';
  game.arrow.active = false;
  game.arrow.x = BOW_X;
  game.arrow.y = BOW_Y;
  game.trail = [];
  game.aimAngle = -0.7;
  resetPowerMeter();

  // >>> FIX: un-hide the question banner each time a new question loads <<<
  document.getElementById('questionBanner').classList.remove('hidden');
  document.getElementById('questionBanner').classList.remove('flash');

  // Randomize target position each question
  target.x = 900 + Math.random() * 260;
  target.y = 260 + Math.random() * 220;
  target.swayPhase = Math.random() * Math.PI * 2;
  target.swayAmount = 15 + Math.random() * 25;

  // Random wind
  game.wind = (Math.random() - 0.5) * 0.16;
  updateWindUI();

  // Power shot?
  game.isPowerShot = (game.streak >= 3);
  if (game.isPowerShot) showPowerBanner();

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
  diffEl.classList.remove('text-green-500', 'text-yellow-500', 'text-red-500');
  diffEl.classList.add(q.diff === 'EASY' ? 'text-green-500' : q.diff === 'MEDIUM' ? 'text-yellow-500' : 'text-red-500');
  document.getElementById('qText').textContent = q.q;

  renderAnswers();

  game.timeLeft = 12;
  startTimer();
}

function renderAnswers() {
  var container = document.getElementById('answersContainer');
  container.innerHTML = '';
  game.shuffledOpts.forEach(function(item, idx) {
    var btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.id = 'ansBtn_' + idx;
    btn.innerHTML = '<span class="letter">' + String.fromCharCode(65 + idx) + '.</span>' + item.text;
    btn.onclick = function() { answerQuestion(idx); };
    container.appendChild(btn);
  });
  container.classList.remove('hidden');
}

function hideAnswers() {
  document.getElementById('answersContainer').classList.add('hidden');
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
    if (game.timeLeft < 3) document.getElementById('questionBanner').classList.add('flash');
    if (game.timeLeft <= 0) {
      clearInterval(game.timerInterval);
      game.timerInterval = null;
      answerQuestion(-1);
    }
  }, 100);
}

// ================================================================
// ANSWER
// ================================================================
function answerQuestion(idx) {
  if (game.timerInterval) { clearInterval(game.timerInterval); game.timerInterval = null; }

  var isCorrect = (idx === game.correctShuffledIdx);

  document.querySelectorAll('.answer-btn').forEach(function(b, i) {
    b.disabled = true;
    if (i === game.correctShuffledIdx) b.classList.add('correct');
    else if (i === idx && !isCorrect) b.classList.add('wrong');
  });

  if (isCorrect) {
    game.streak++;
    game.correctCount++;
    if (game.streak > game.bestStreak) game.bestStreak = game.streak;
    updatePowerDots();
    showBigPopup('✓ CORRECT!', W/2, H/2 - 60, '#22c55e', 44);
    game.flashColor = '#22c55e';
    game.flashTime = 0.2;
    game.score += 50;

    if (game.streak >= 3) game.isPowerShot = true;

    setTimeout(function() {
      hideAnswers();
      startShootingPhase();
    }, 900);
  } else {
    game.streak = 0;
    updatePowerDots();
    showBigPopup('✗ WRONG', W/2, H/2 - 60, '#ef4444', 44);
    game.flashColor = '#ef4444';
    game.flashTime = 0.2;

    setTimeout(function() {
      hideAnswers();
      game.totalQuestions++;
      updateHUD();
      if (game.totalQuestions >= game.maxQuestions) endGame();
      else nextQuestion();
    }, 1200);
  }
}

// ================================================================
// SHOOTING PHASE
// ================================================================
function startShootingPhase() {
  game.phase = 'shooting';
  game.arrow.active = false;
  resetPowerMeter();
  document.getElementById('questionBanner').classList.add('hidden');
  document.getElementById('windBox').classList.remove('hidden');
  document.getElementById('instructions').classList.remove('hidden');
}

// ---- DRAG MECHANIC ----
function updateDrag(mx, my) {
  var dx = mx - BOW_X;
  var dy = my - BOW_Y;
  var len = Math.sqrt(dx*dx + dy*dy);
  if (len < 0.0001) { len = 0.0001; dx = 0.0001; dy = 0; }
  if (len > MAX_PULL) {
    dx = dx / len * MAX_PULL;
    dy = dy / len * MAX_PULL;
    len = MAX_PULL;
  }

  // Launch direction is OPPOSITE the pull (slingshot / bowstring)
  var ang = Math.atan2(-dy, -dx);
  if (ang > ANGLE_MAX) ang = ANGLE_MAX;
  if (ang < ANGLE_MIN) ang = ANGLE_MIN;

  game.aimAngle = ang;
  game.pullX = -Math.cos(ang) * len;
  game.pullY = -Math.sin(ang) * len;
  game.pullLength = len;
  game.power = Math.min(1, len / MAX_PULL);

  document.getElementById('powerBar').classList.remove('hidden');
  document.getElementById('powerFill').style.width = (game.power * 100) + '%';
}

function pointerDown(mx, my) {
  if (game.phase !== 'shooting' || game.arrow.active) return;
  game.dragging = true;
  updateDrag(mx, my);
}

function pointerMove(mx, my) {
  if (!game.dragging) return;
  if (game.phase !== 'shooting' || game.arrow.active) return;
  updateDrag(mx, my);
}

function pointerUp() {
  if (!game.dragging) return;
  game.dragging = false;

  if (game.pullLength < MIN_PULL || game.power < 0.06) {
    resetPowerMeter();
    return;
  }
  releaseShot();
}

function releaseShot() {
  document.getElementById('powerBar').classList.add('hidden');
  document.getElementById('instructions').classList.add('hidden');
  fireArrow();
}

// ================================================================
// FIRE
// ================================================================
function fireArrow() {
  if (game.arrow.active) return;

  var power = game.power;
  var speed = MIN_SPEED + power * (MAX_SPEED - MIN_SPEED);

  var powerShot = game.isPowerShot;
  if (powerShot) {
    speed *= 1.35;
    game.isPowerShot = false;
    showBigPopup('POWER SHOT!', W/2, H/2, '#ff6b00', 52);
    game.screenShake = 18;
  }

  var angle = game.aimAngle;
  game.arrow.x = BOW_X + 20;
  game.arrow.y = BOW_Y;
  game.arrow.vx = Math.cos(angle) * speed;
  game.arrow.vy = Math.sin(angle) * speed;
  game.arrow.active = true;
  game.arrow.rot = angle;
  game.arrow.powerShot = powerShot;
  game.phase = 'flying';

  spawnBurst(BOW_X + 20, BOW_Y, powerShot ? '#ff6b00' : '#daa74b', 12);
  document.getElementById('windBox').classList.add('hidden');

  game.pullX = 0; game.pullY = 0; game.pullLength = 0;
  document.getElementById('powerFill').style.width = '0%';
}

// ================================================================
// ARROW PHYSICS
// ================================================================
function updateArrow() {
  if (!game.arrow.active) return;

  var windEffect = game.arrow.powerShot ? game.wind * 0.4 : game.wind;
  game.arrow.vy += GRAVITY;
  game.arrow.vx += windEffect;

  game.arrow.x += game.arrow.vx;
  game.arrow.y += game.arrow.vy;
  game.arrow.rot = Math.atan2(game.arrow.vy, game.arrow.vx);

  game.trail.push({ x: game.arrow.x, y: game.arrow.y, life: 0.4, maxLife: 0.4, ps: game.arrow.powerShot });
  if (game.trail.length > 25) game.trail.shift();

  var sway = Math.sin(performance.now() * 0.002 + target.swayPhase) * target.swayAmount;
  var tx = target.x + sway;
  var ty = target.y;
  var dx = game.arrow.x - tx;
  var dy = game.arrow.y - ty;
  var dist = Math.sqrt(dx*dx + dy*dy);

  if (dist < target.ringRadius[4]) { hitTarget(dist, tx, ty); return; }

  if (game.arrow.y > GROUND_Y || game.arrow.x > W + 100 || game.arrow.x < -100 || game.arrow.y < -200) {
    arrowMissed();
  }
}

function hitTarget(dist, tx, ty) {
  game.arrow.active = false;
  game.phase = 'resolved';

  var points = 0;
  var ringName = '';
  var ringColor = '#fff';
  if (dist < target.ringRadius[0]) { points = 500; ringName = 'BULLSEYE!'; ringColor = '#ef4444'; }
  else if (dist < target.ringRadius[1]) { points = 200; ringName = 'GREAT!'; ringColor = '#fff'; }
  else if (dist < target.ringRadius[2]) { points = 100; ringName = 'GOOD'; ringColor = '#ef4444'; }
  else if (dist < target.ringRadius[3]) { points = 50; ringName = 'HIT'; ringColor = '#fff'; }
  else { points = 25; ringName = 'EDGE'; ringColor = '#ef4444'; }

  var streakBonus = game.streak >= 3 ? 2 : 1;
  var finalPoints = points * streakBonus;
  game.score += finalPoints;

  game.stuckArrows.push({ x: tx, y: ty, life: 1.5, maxLife: 1.5 });

  if (dist < target.ringRadius[0]) {
    showBigPopup('🎯 BULLSEYE!', tx, ty - 40, '#ef4444', 50);
    showBigPopup('+' + finalPoints, tx, ty + 60, '#ef4444', 40);
    spawnConfetti(tx, ty, 60);
    game.screenShake = 16;
    game.flashColor = '#ef4444';
    game.flashTime = 0.3;
  } else {
    showBigPopup(ringName + ' +' + finalPoints, tx, ty - 40, ringColor, 36);
    spawnConfetti(tx, ty, 25);
    game.screenShake = 8;
    game.flashColor = ringColor;
    game.flashTime = 0.15;
  }

  if (streakBonus > 1) {
    showBigPopup('POWER BONUS x2', tx, ty + 110, '#ff6b00', 28);
  }

  updateHUD();

  setTimeout(function() {
    game.totalQuestions++;
    updateHUD();
    if (game.totalQuestions >= game.maxQuestions) endGame();
    else nextQuestion();
  }, 1800);
}

function arrowMissed() {
  game.arrow.active = false;
  game.phase = 'resolved';
  game.totalQuestions++;

  showBigPopup('MISS', W/2, H/2, '#ef4444', 44);
  game.screenShake = 6;
  game.flashColor = '#ef4444';
  game.flashTime = 0.15;

  updateHUD();

  setTimeout(function() {
    if (game.totalQuestions >= game.maxQuestions) endGame();
    else nextQuestion();
  }, 1200);
}

// ================================================================
// WIND UI
// ================================================================
function updateWindUI() {
  var arrow = document.getElementById('windArrow');
  var speed = document.getElementById('windSpeed');
  var strength = Math.abs(game.wind) / game.windMax;

  if (game.wind > 0.005) {
    arrow.textContent = '→';
    arrow.style.transform = 'scale(' + (0.8 + strength * 0.5) + ')';
  } else if (game.wind < -0.005) {
    arrow.textContent = '←';
    arrow.style.transform = 'scale(' + (0.8 + strength * 0.5) + ')';
  } else {
    arrow.textContent = '•';
  }
  speed.textContent = Math.abs(game.wind).toFixed(3);
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
      color: ['#daa74b', '#4a9eff', '#22c55e', '#ef4444', '#eab308', '#ff6b00'][Math.floor(Math.random()*6)],
      size: 3 + Math.random() * 5,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.4,
    });
  }
}

function spawnBurst(x, y, color, count) {
  for (var i = 0; i < count; i++) {
    var angle = Math.random() * Math.PI * 2;
    var speed = 2 + Math.random() * 6;
    game.confetti.push({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.5, maxLife: 0.5,
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

function showPowerBanner() {
  var el = document.createElement('div');
  el.className = 'power-banner';
  el.textContent = '⚡ POWER SHOT ⚡';
  document.getElementById('bigPopups').appendChild(el);
  setTimeout(function() { el.remove(); }, 1700);
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
  for (var i = game.stuckArrows.length - 1; i >= 0; i--) {
    game.stuckArrows[i].life -= delta;
    if (game.stuckArrows[i].life <= 0) game.stuckArrows.splice(i, 1);
  }
  if (game.flashTime > 0) {
    game.flashTime -= delta;
    if (game.flashTime <= 0) game.flashColor = null;
  }
}

// ================================================================
// TRAJECTORY PREDICTION
// ================================================================
function predictTrajectory(maxSteps) {
  var powerShot = game.isPowerShot;
  var speed = MIN_SPEED + game.power * (MAX_SPEED - MIN_SPEED);
  if (powerShot) speed *= 1.35;

  var windEffect = powerShot ? game.wind * 0.4 : game.wind;
  var vx = Math.cos(game.aimAngle) * speed;
  var vy = Math.sin(game.aimAngle) * speed;
  var x = BOW_X + 20, y = BOW_Y;
  var pts = [];

  for (var i = 0; i < (maxSteps || 260); i++) {
    vy += GRAVITY;
    vx += windEffect;
    x += vx;
    y += vy;
    pts.push({ x: x, y: y });
    if (y > GROUND_Y || x > W + 80 || x < -80 || y < -500) break;
  }
  return pts;
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
  bg.addColorStop(0, '#0a0a20');
  bg.addColorStop(0.5, '#15152e');
  bg.addColorStop(1, '#2a1a10');
  ctx.fillStyle = bg;
  ctx.fillRect(-20, -20, W + 40, H + 40);

  for (var i = 0; i < 40; i++) {
    var sx = (i * 173 + 37) % W;
    var sy = (i * 91 + 13) % (H * 0.6);
    ctx.fillStyle = 'rgba(255,255,255,' + (0.15 + (i % 5) * 0.06) + ')';
    ctx.fillRect(sx, sy, 2, 2);
  }

  ctx.fillStyle = 'rgba(218,167,75,0.15)';
  ctx.beginPath();
  ctx.arc(W - 150, 100, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,220,150,0.4)';
  ctx.beginPath();
  ctx.arc(W - 150, 100, 42, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1a1a30';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(200, GROUND_Y - 120);
  ctx.lineTo(400, GROUND_Y - 60);
  ctx.lineTo(600, GROUND_Y - 150);
  ctx.lineTo(800, GROUND_Y - 80);
  ctx.lineTo(1000, GROUND_Y - 140);
  ctx.lineTo(1280, GROUND_Y - 70);
  ctx.lineTo(1280, GROUND_Y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#1a1408';
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  ctx.strokeStyle = 'rgba(218,167,75,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(W, GROUND_Y);
  ctx.stroke();

  for (var gx = 0; gx < W; gx += 30) {
    ctx.strokeStyle = 'rgba(218,167,75,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gx, GROUND_Y);
    ctx.lineTo(gx + 3, GROUND_Y - 6);
    ctx.stroke();
  }

  drawTarget();

  game.stuckArrows.forEach(function(sa) {
    ctx.save();
    ctx.globalAlpha = sa.life / sa.maxLife;
    ctx.translate(sa.x, sa.y);
    ctx.rotate(-0.3);
    ctx.strokeStyle = '#daa74b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(30, 0);
    ctx.stroke();
    ctx.fillStyle = '#daa74b';
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.lineTo(22, -4);
    ctx.lineTo(22, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  drawBow();

  if (game.phase === 'shooting' && !game.arrow.active) {
    if (game.power > 0.03) drawTrajectoryPreview();
    drawDragRig();
    drawAimReadout();
  }

  game.trail.forEach(function(t) {
    ctx.globalAlpha = t.life / t.maxLife * 0.5;
    ctx.fillStyle = t.ps ? '#ff6b00' : '#daa74b';
    ctx.beginPath();
    ctx.arc(t.x, t.y, 3 * (t.life / t.maxLife), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  if (game.arrow.active) drawArrow(game.arrow.x, game.arrow.y, game.arrow.rot);

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

// ---- TRAJECTORY DOTS + LANDING MARKER ----
function drawTrajectoryPreview() {
  var pts = predictTrajectory(260);
  if (!pts.length) return;

  var col = game.isPowerShot ? '#ff6b00' : '#daa74b';
  var total = pts.length;

  for (var i = 0; i < total; i += 3) {
    var t = i / total;
    var r = 3.6 * (1 - t * 0.6);
    if (r < 0.5) break;
    ctx.globalAlpha = 0.9 * (1 - t * 0.72);
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(pts[i].x, pts[i].y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  var last = pts[pts.length - 1];
  var pulse = 0.6 + Math.sin(performance.now() * 0.008) * 0.4;

  ctx.save();
  ctx.translate(last.x, last.y);
  ctx.strokeStyle = col;
  ctx.globalAlpha = 0.9;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 14 + pulse * 3, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(-20, 0); ctx.lineTo(-8, 0);
  ctx.moveTo(8, 0);   ctx.lineTo(20, 0);
  ctx.moveTo(0, -20); ctx.lineTo(0, -8);
  ctx.moveTo(0, 8);   ctx.lineTo(0, 20);
  ctx.stroke();

  ctx.globalAlpha = 0.85;
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.globalAlpha = 1;
}

// ---- DRAG RIG ----
function drawDragRig() {
  if (game.power <= 0.01 && !game.dragging) return;

  var px = BOW_X + game.pullX;
  var py = BOW_Y + game.pullY;
  var col = game.isPowerShot ? '#ff6b00' : '#daa74b';
  var pwrCol = game.power > 0.82 ? '#ef4444' : game.power > 0.55 ? '#eab308' : '#22c55e';

  ctx.save();
  ctx.setLineDash([6, 7]);
  ctx.lineDashOffset = -(performance.now() * 0.03) % 13;
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(BOW_X, BOW_Y);
  ctx.lineTo(px, py);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(px, py, 22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * game.power);
  ctx.strokeStyle = pwrCol;
  ctx.lineWidth = 4;
  ctx.shadowBlur = 18;
  ctx.shadowColor = pwrCol;
  ctx.stroke();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(px, py, 11, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(218,167,75,0.18)';
  ctx.fill();
  ctx.strokeStyle = col;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(px, py, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
}

// ---- POWER / ANGLE READOUT ----
function drawAimReadout() {
  if (game.power <= 0.01) return;

  var x = BOW_X - 52;
  var y = BOW_Y - 118;
  var boxW = 148, boxH = 52;

  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(x, y, boxW, boxH);
  ctx.strokeStyle = 'rgba(218,167,75,0.55)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, boxW, boxH);

  var pwrCol = game.power > 0.82 ? '#ef4444' : game.power > 0.55 ? '#eab308' : '#22c55e';

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  ctx.font = '900 10px "Courier New", monospace';
  ctx.fillStyle = '#777';
  ctx.fillText('POWER', x + 10, y + 15);
  ctx.font = '900 17px "Courier New", monospace';
  ctx.fillStyle = pwrCol;
  ctx.fillText(Math.round(game.power * 100) + '%', x + 68, y + 15);

  ctx.font = '900 10px "Courier New", monospace';
  ctx.fillStyle = '#777';
  ctx.fillText('ANGLE', x + 10, y + 37);
  ctx.font = '900 17px "Courier New", monospace';
  ctx.fillStyle = '#daa74b';
  ctx.fillText(Math.round(-game.aimAngle * 180 / Math.PI) + '°', x + 68, y + 37);

  ctx.restore();
}

function drawTarget() {
  var sway = Math.sin(performance.now() * 0.002 + target.swayPhase) * target.swayAmount;
  var tx = target.x + sway;
  var ty = target.y;

  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(tx - 4, ty, 8, GROUND_Y - ty - 20);
  ctx.fillRect(tx - 30, GROUND_Y - 24, 60, 8);

  for (var i = target.ringRadius.length - 1; i >= 0; i--) {
    ctx.fillStyle = target.colors[i];
    ctx.beginPath();
    ctx.arc(tx, ty, target.ringRadius[i], 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(tx, ty, 4, 0, Math.PI * 2);
  ctx.fill();

  if (game.isPowerShot) {
    ctx.strokeStyle = '#ff6b00';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#ff6b00';
    ctx.beginPath();
    ctx.arc(tx, ty, target.ringRadius[4] + 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

function drawBow() {
  var angle = game.aimAngle;

  ctx.save();
  ctx.translate(BOW_X, BOW_Y);
  ctx.rotate(angle);

  var bowColor = game.isPowerShot ? '#ff6b00' : '#daa74b';
  ctx.strokeStyle = bowColor;
  ctx.lineWidth = 5;
  ctx.shadowBlur = game.isPowerShot ? 25 : 10;
  ctx.shadowColor = bowColor;
  ctx.beginPath();
  ctx.arc(0, 0, 40, -Math.PI * 0.6, Math.PI * 0.6, false);
  ctx.stroke();
  ctx.shadowBlur = 0;

  var pullback = game.power * 20;
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(Math.cos(-Math.PI * 0.6) * 40, Math.sin(-Math.PI * 0.6) * 40);
  ctx.lineTo(-pullback, 0);
  ctx.lineTo(Math.cos(Math.PI * 0.6) * 40, Math.sin(Math.PI * 0.6) * 40);
  ctx.stroke();

  if (!game.arrow.active && game.phase === 'shooting') {
    ctx.strokeStyle = '#daa74b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-pullback - 10, 0);
    ctx.lineTo(45, 0);
    ctx.stroke();

    ctx.fillStyle = '#daa74b';
    ctx.beginPath();
    ctx.moveTo(45, 0);
    ctx.lineTo(35, -5);
    ctx.lineTo(35, 5);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ff6b00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-pullback - 6, 0);
    ctx.lineTo(-pullback - 12, -6);
    ctx.moveTo(-pullback - 6, 0);
    ctx.lineTo(-pullback - 12, 6);
    ctx.stroke();
  }

  ctx.restore();

  drawArcher(BOW_X, GROUND_Y);
}

function drawArcher(x, groundY) {
  var headY = groundY - 140;
  var bodyY = groundY - 100;
  var legY = groundY - 10;

  ctx.strokeStyle = '#daa74b';
  ctx.fillStyle = '#daa74b';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.arc(x, headY, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#daa74b';
  ctx.beginPath();
  ctx.arc(x, headY - 6, 12, Math.PI, 0);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x, headY + 12);
  ctx.lineTo(x, bodyY + 40);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, bodyY + 40);
  ctx.lineTo(x - 15, legY);
  ctx.moveTo(x, bodyY + 40);
  ctx.lineTo(x + 15, legY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, headY + 25);
  ctx.lineTo(BOW_X + Math.cos(game.aimAngle) * 25, BOW_Y + Math.sin(game.aimAngle) * 25);
  ctx.stroke();

  var pullDist = -10 - game.power * 26;
  var pullX = BOW_X + Math.cos(game.aimAngle) * pullDist;
  var pullY = BOW_Y + Math.sin(game.aimAngle) * pullDist;
  ctx.beginPath();
  ctx.moveTo(x, headY + 25);
  ctx.lineTo(pullX, pullY);
  ctx.stroke();
}

function drawArrow(x, y, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  var color = game.arrow.powerShot ? '#ff6b00' : '#daa74b';

  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.shadowBlur = game.arrow.powerShot ? 20 : 8;
  ctx.shadowColor = color;
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.lineTo(15, 0);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(15, 0);
  ctx.lineTo(5, -5);
  ctx.lineTo(5, 5);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-25, 0);
  ctx.lineTo(-32, -5);
  ctx.moveTo(-25, 0);
  ctx.lineTo(-32, 5);
  ctx.stroke();

  ctx.restore();
}

// ================================================================
// END GAME
// ================================================================
function endGame() {
  game.running = false;
  game.phase = 'done';
  if (game.timerInterval) { clearInterval(game.timerInterval); game.timerInterval = null; }

  document.getElementById('goScore').textContent = game.score;
  document.getElementById('goBullseye').textContent = game.correctCount;

  var bullseyeRate = game.totalQuestions > 0 ? game.correctCount / game.totalQuestions : 0;
  var msg = '';
  if (game.score >= 3000 && bullseyeRate >= 0.7) msg = '🏆 LEGENDARY ARCHER — MARKET SNIPER!';
  else if (game.score >= 1500) msg = '🎯 SHARP SHOOTER — GREAT TRADING INSTINCTS!';
  else if (game.score >= 700) msg = '📈 SOLID SHOTS — KEEP TRAINING!';
  else msg = '📉 BACK TO THE CHARTS — MORE PRACTICE!';
  document.getElementById('goMessage').textContent = msg;

  document.getElementById('questionBanner').classList.add('hidden');
  document.getElementById('answersContainer').classList.add('hidden');
  document.getElementById('windBox').classList.add('hidden');
  document.getElementById('instructions').classList.add('hidden');
  resetPowerMeter();
  document.getElementById('gameOverScreen').classList.remove('hidden');
}

// ================================================================
// INPUT
// ================================================================
function getCanvasPos(e) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height)
  };
}

canvas.addEventListener('mousedown', function(e) {
  e.preventDefault();
  var p = getCanvasPos(e);
  game.mouseX = p.x; game.mouseY = p.y;
  pointerDown(p.x, p.y);
});

window.addEventListener('mousemove', function(e) {
  var p = getCanvasPos(e);
  game.mouseX = p.x; game.mouseY = p.y;
  pointerMove(p.x, p.y);
});

window.addEventListener('mouseup', function() {
  pointerUp();
});

// Touch support
canvas.addEventListener('touchstart', function(e) {
  e.preventDefault();
  var t = e.touches[0];
  var p = getCanvasPos(t);
  game.mouseX = p.x; game.mouseY = p.y;
  pointerDown(p.x, p.y);
}, { passive: false });

window.addEventListener('touchmove', function(e) {
  if (!game.dragging) return;
  e.preventDefault();
  var t = e.touches[0];
  var p = getCanvasPos(t);
  game.mouseX = p.x; game.mouseY = p.y;
  pointerMove(p.x, p.y);
}, { passive: false });

window.addEventListener('touchend', function() {
  pointerUp();
}, { passive: false });

window.addEventListener('keydown', function(e) {
  if (e.code === 'Enter') {
    if (!game.running) {
      var gs = document.getElementById('gameOverScreen');
      var ss = document.getElementById('startScreen');
      if (!ss.classList.contains('hidden') || !gs.classList.contains('hidden')) initGame();
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

  if (game.running && game.phase === 'flying') updateArrow();
  updateEffects(delta);

  render();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
