// ============================================
// src/hooks/useDetection.js
// face-api.js detection loop with rAF
// ============================================

let animFrame    = null;
let modelsLoaded = false;
let _lastEmotion = null; // track last dominant emotion for history dedup

/**
 * Main detection loop using requestAnimationFrame.
 * Detects faces → expressions → updates UI each frame.
 */
function startDetection() {
  const video  = document.getElementById('video');
  const canvas = document.getElementById('overlay');
  const ctx    = canvas.getContext('2d');

  async function detect() {
    // Wait until models and video are ready
    if (!modelsLoaded || video.readyState < 2) {
      animFrame = requestAnimationFrame(detect);
      return;
    }

    // Sync canvas size to video
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let detections;
    try {
      detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 }))
        .withFaceExpressions();
    } catch (_) {
      animFrame = requestAnimationFrame(detect);
      return;
    }

    if (!detections || detections.length === 0) {
      toggleFaceUI(false);
      animFrame = requestAnimationFrame(detect);
      return;
    }

    toggleFaceUI(true);

    // ── Draw corner bracket boxes for each detected face ──
    const dims   = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, dims);
    const resized = faceapi.resizeResults(detections, dims);

    resized.forEach(det => {
      const b = det.detection.box;
      const s = Math.min(20, b.width * 0.18); // bracket size proportional to face

      ctx.strokeStyle = 'rgba(124,106,255,0.9)';
      ctx.lineWidth   = 2.5;
      ctx.lineCap     = 'round';
      ctx.beginPath();

      // Top-left corner
      ctx.moveTo(b.x + s, b.y);         ctx.lineTo(b.x, b.y);         ctx.lineTo(b.x, b.y + s);
      // Top-right corner
      ctx.moveTo(b.x + b.width - s, b.y);  ctx.lineTo(b.x + b.width, b.y);  ctx.lineTo(b.x + b.width, b.y + s);
      // Bottom-left corner
      ctx.moveTo(b.x, b.y + b.height - s); ctx.lineTo(b.x, b.y + b.height); ctx.lineTo(b.x + s, b.y + b.height);
      // Bottom-right corner
      ctx.moveTo(b.x + b.width - s, b.y + b.height); ctx.lineTo(b.x + b.width, b.y + b.height); ctx.lineTo(b.x + b.width, b.y + b.height - s);

      ctx.stroke();
    });

    // ── Use first face's expressions ──
    const exprs  = detections[0].expressions;
    const sorted = Object.entries(exprs).sort((a, b) => b[1] - a[1]);
    const [domName, domScore] = sorted[0];
    const info = EMOTIONS[domName] || EMOTIONS.neutral;

    updateBars(exprs);
    updateBadge(domName, domScore);

    // Add to history only on emotion change
    if (_lastEmotion !== domName) {
      _lastEmotion = domName;
      addHistory(domName, info.emoji, info.color);
    }

    animFrame = requestAnimationFrame(detect);
  }

  detect();
}

/**
 * Stop the detection loop
 */
function stopDetection() {
  if (animFrame) {
    cancelAnimationFrame(animFrame);
    animFrame = null;
  }
}
