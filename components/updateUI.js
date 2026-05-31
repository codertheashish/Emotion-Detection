// ============================================
// src/components/updateUI.js
// Functions to update bars, badge, history, status
// ============================================

/**
 * Update all emotion bars with new expression scores
 * @param {Object} expressions - face-api expressions object
 */
function updateBars(expressions) {
  Object.entries(expressions).forEach(([name, score]) => {
    const fill = document.getElementById('bar-' + name);
    const pct  = document.getElementById('pct-' + name);
    if (fill) fill.style.width   = (score * 100).toFixed(1) + '%';
    if (pct)  pct.textContent    = Math.round(score * 100) + '%';
  });
}

/**
 * Update the floating dominant emotion badge
 * @param {string} name  - emotion key e.g. 'happy'
 * @param {number} score - confidence 0–1
 */
function updateBadge(name, score) {
  const info  = EMOTIONS[name] || EMOTIONS.neutral;
  const badge = document.getElementById('dominantBadge');
  badge.style.display     = 'flex';
  badge.style.borderColor = info.color + '66';
  document.getElementById('dEmoji').textContent = info.emoji;
  document.getElementById('dLabel').textContent = name;
  document.getElementById('dPct').textContent   = Math.round(score * 100) + '%';
}

/**
 * Add a pill to the emotion history strip
 * @param {string} name  - emotion key
 * @param {string} emoji - emoji character
 * @param {string} color - hex color
 */
function addHistory(name, emoji, color) {
  const track = document.getElementById('historyTrack');
  const pill  = document.createElement('div');
  pill.className        = 'h-pill';
  pill.title            = name;
  pill.textContent      = emoji;
  pill.style.borderColor = color + '55';
  track.appendChild(pill);
  track.scrollLeft = track.scrollWidth;
  // Keep max 50 entries
  while (track.children.length > 50) track.removeChild(track.firstChild);
}

/**
 * Show/hide the "no face" message and bars section
 * @param {boolean} faceFound
 */
function toggleFaceUI(faceFound) {
  document.getElementById('noFaceMsg').style.display   = faceFound ? 'none'  : 'block';
  document.getElementById('barsSection').style.display = faceFound ? 'block' : 'none';
  if (!faceFound) document.getElementById('dominantBadge').style.display = 'none';
}

/**
 * Update header status indicator
 * @param {string}  text  - status label
 * @param {string}  color - hex color for dot
 * @param {boolean} live  - whether to show live pulse animation
 */
function setStatus(text, color, live) {
  document.getElementById('statusText').textContent = text;
  const dot = document.getElementById('statusDot');
  dot.style.background = color;
  dot.style.boxShadow  = `0 0 8px ${color}`;
  const row = document.getElementById('statusRow');
  live ? row.classList.add('live') : row.classList.remove('live');
}
