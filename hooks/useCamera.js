// ============================================
// src/hooks/useCamera.js
// Camera stream management (start, stop, switch)
// ============================================

let videoStream  = null;
let facingMode   = 'user'; // 'user' = front | 'environment' = back

/**
 * Start or restart the camera with the current facingMode.
 * Mirrors the video for front camera, un-mirrors for back.
 */
async function startCamera() {
  try {
    // Stop existing stream first
    if (videoStream) videoStream.getTracks().forEach(t => t.stop());

    videoStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode,
        width:  { ideal: 1280 },
        height: { ideal: 960 },
      },
      audio: false,
    });

    const video   = document.getElementById('video');
    const overlay = document.getElementById('overlay');

    video.srcObject = videoStream;

    // Mirror only front camera; back camera should NOT be mirrored
    video.className   = facingMode === 'user' ? '' : 'back';
    overlay.className = facingMode === 'user' ? '' : 'back';

    await new Promise(resolve => (video.onloadedmetadata = resolve));
    video.play();

  } catch (err) {
    console.error('[useCamera] Error:', err);
    document.getElementById('loadText').textContent = 'Camera denied. Please allow access.';
    setStatus('Camera error', '#ff6464', false);
  }
}

/**
 * Toggle between front and back camera
 */
async function switchCamera() {
  facingMode = facingMode === 'user' ? 'environment' : 'user';
  await startCamera();
}

/**
 * Stop all camera tracks and clear the stream
 */
function stopCamera() {
  if (videoStream) {
    videoStream.getTracks().forEach(t => t.stop());
    videoStream = null;
  }
}
