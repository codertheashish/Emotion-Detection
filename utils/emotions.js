// ============================================
// src/utils/emotions.js
// Emotion config: emoji, colors, labels
// ============================================

const EMOTIONS = {
  happy:     { emoji: '😊', color: '#ffd166' },
  sad:       { emoji: '😢', color: '#6ab4ff' },
  angry:     { emoji: '😠', color: '#ff6464' },
  fearful:   { emoji: '😨', color: '#b06aff' },
  disgusted: { emoji: '🤢', color: '#64ffb0' },
  surprised: { emoji: '😲', color: '#ff9f40' },
  neutral:   { emoji: '😐', color: '#a0a0b8' },
};

/**
 * Returns the dominant emotion name from a face-api expressions object
 * @param {Object} expressions - e.g. { happy: 0.9, sad: 0.02, ... }
 * @returns {string} dominant emotion key
 */
function getDominantEmotion(expressions) {
  return Object.entries(expressions).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
}
