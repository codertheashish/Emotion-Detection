// ============================================
// src/components/buildBars.js
// Builds the emotion bar rows in the DOM
// ============================================

/**
 * Injects emotion bar HTML into #emotionBars container.
 * Each bar has: emoji | label | animated fill bar | percentage
 */
function buildBars() {
  const container = document.getElementById('emotionBars');
  container.innerHTML = '';

  Object.entries(EMOTIONS).forEach(([name, { emoji, color }]) => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `
      <div class="bar-emoji">${emoji}</div>
      <div class="bar-label">${name}</div>
      <div class="bar-track">
        <div class="bar-fill" id="bar-${name}" style="background:${color}"></div>
      </div>
      <div class="bar-pct" id="pct-${name}">0%</div>
    `;
    container.appendChild(row);
  });
}
