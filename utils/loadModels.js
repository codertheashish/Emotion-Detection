// ============================================
// src/utils/loadModels.js
// Loads face-api.js models from CDN
// ============================================

const MODEL_BASE_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

/**
 * Loads TinyFaceDetector + FaceExpression models.
 * Updates the loading overlay text while loading.
 */
async function loadModels() {
  const lt = document.getElementById('loadText');
  try {
    lt.textContent = 'Loading face detector…';
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_BASE_URL);

    lt.textContent = 'Loading expression model…';
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_BASE_URL);

    return true; // success
  } catch (e) {
    lt.textContent = 'Model load failed — check internet connection';
    console.error('[loadModels] Error:', e);
    return false;
  }
}
