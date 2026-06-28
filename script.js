// ===================================================
// EmoSense — script.js
// ===================================================

// ===== EMOTION CONFIG =====
const EMOTIONS = {
    happy:     { emoji: '😊', color: '#ffd166' },
    sad:       { emoji: '😢', color: '#6ab4ff' },
    angry:     { emoji: '😠', color: '#ff6464' },
    fearful:   { emoji: '😨', color: '#b06aff' },
    disgusted: { emoji: '🤢', color: '#64ffb0' },
    surprised: { emoji: '😲', color: '#ff9f40' },
    neutral:   { emoji: '😐', color: '#a0a0b8' },
};

// ===== STATE =====
let videoStream = null;
let animFrame   = null;
let modelsLoaded = false;
let facingMode  = 'user';

// ===== BUILD EMOTION GRID =====
function buildGrid() {
    const g = document.getElementById('emotionGrid');
    g.innerHTML = '';
    Object.entries(EMOTIONS).forEach(([name, { emoji }]) => {
        g.innerHTML += `
            <div class="emo-tile" id="tile-${name}">
                <div class="t-emoji">${emoji}</div>
                <div class="t-pct" id="tpct-${name}">0%</div>
                <div class="t-name">${name}</div>
            </div>`;
    });
}

// ===== UPDATE EMOTION TILES =====
function updateTiles(expressions, domName) {
    Object.entries(expressions).forEach(([name, score]) => {
        const tile = document.getElementById('tile-' + name);
        const pct  = document.getElementById('tpct-' + name);
        if (pct)  pct.textContent = Math.round(score * 100) + '%';
        if (tile) {
            const info = EMOTIONS[name];
            tile.classList.toggle('active', name === domName);
            tile.style.borderColor = name === domName ? info.color + '88' : '';
            tile.style.background  = name === domName ? info.color + '18' : '';
            pct.style.color        = name === domName ? info.color : '';
        }
    });
}

// ===== INIT APP =====
async function initApp() {
    // Hide splash
    document.getElementById('splash').classList.add('hide');
    setTimeout(() => document.getElementById('splash').style.display = 'none', 650);

    // Show app
    document.getElementById('app').style.display = 'flex';

    buildGrid();
    await startCamera();
    await loadModels();
    startDetection();
}

// ===== START CAMERA =====
async function startCamera() {
    try {
        if (videoStream) videoStream.getTracks().forEach(t => t.stop());

        videoStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode, width: { ideal: 1280 }, height: { ideal: 960 } },
            audio: false
        });

        const v  = document.getElementById('video');
        const ov = document.getElementById('overlay');

        v.srcObject  = videoStream;
        v.className  = facingMode === 'user' ? '' : 'back';
        ov.className = facingMode === 'user' ? '' : 'back';

        await new Promise(r => v.onloadedmetadata = r);
        v.play();

    } catch (e) {
        document.getElementById('loadText').textContent = 'Camera denied. Please allow access.';
        setStatus('Camera error', '#ff6464', false);
    }
}

// ===== SWITCH CAMERA =====
async function switchCamera() {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    await startCamera();
}

// ===== LOAD AI MODELS =====
async function loadModels() {
    const lt = document.getElementById('loadText');
    try {
        const BASE = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

        lt.textContent = 'Loading face detector…';
        await faceapi.nets.tinyFaceDetector.loadFromUri(BASE);

        lt.textContent = 'Loading expression model…';
        await faceapi.nets.faceExpressionNet.loadFromUri(BASE);

        modelsLoaded = true;
        document.getElementById('loadingOverlay').style.display = 'none';
        setStatus('Live', '#64ffb0', true);

    } catch (e) {
        document.getElementById('loadText').textContent = 'Model load failed — check internet';
        setStatus('Error', '#ff6464', false);
    }
}

// ===== SET STATUS BAR =====
function setStatus(text, color, live) {
    document.getElementById('statusText').textContent = text;
    const d = document.getElementById('statusDot');
    d.style.background  = color;
    d.style.boxShadow   = `0 0 8px ${color}`;
    document.getElementById('statusRow').classList.toggle('live', live);
}

// ===== DETECTION LOOP =====
function startDetection() {
    const video  = document.getElementById('video');
    const canvas = document.getElementById('overlay');
    const ctx    = canvas.getContext('2d');

    async function detect() {
        if (!modelsLoaded || video.readyState < 2) {
            animFrame = requestAnimationFrame(detect);
            return;
        }

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

        const badge = document.getElementById('dominantBadge');

        // No face detected — reset tiles
        if (!detections || detections.length === 0) {
            badge.style.display = 'none';
            Object.keys(EMOTIONS).forEach(name => {
                const p = document.getElementById('tpct-' + name);
                const t = document.getElementById('tile-' + name);
                if (p) p.textContent = '0%';
                if (t) {
                    t.classList.remove('active');
                    t.style.borderColor = '';
                    t.style.background  = '';
                    p.style.color       = '';
                }
            });
            animFrame = requestAnimationFrame(detect);
            return;
        }

        // Draw corner brackets around face
        const dims = { width: video.videoWidth, height: video.videoHeight };
        faceapi.matchDimensions(canvas, dims);
        faceapi.resizeResults(detections, dims).forEach(det => {
            const b = det.detection.box;
            const s = Math.min(22, b.width * 0.18);

            ctx.strokeStyle = 'rgba(124,106,255,0.9)';
            ctx.lineWidth   = 2.5;
            ctx.lineCap     = 'round';
            ctx.beginPath();
            // Top-left corner
            ctx.moveTo(b.x + s, b.y);       ctx.lineTo(b.x, b.y);           ctx.lineTo(b.x, b.y + s);
            // Top-right corner
            ctx.moveTo(b.x + b.width - s, b.y);   ctx.lineTo(b.x + b.width, b.y);   ctx.lineTo(b.x + b.width, b.y + s);
            // Bottom-left corner
            ctx.moveTo(b.x, b.y + b.height - s);  ctx.lineTo(b.x, b.y + b.height);  ctx.lineTo(b.x + s, b.y + b.height);
            // Bottom-right corner
            ctx.moveTo(b.x + b.width - s, b.y + b.height); ctx.lineTo(b.x + b.width, b.y + b.height); ctx.lineTo(b.x + b.width, b.y + b.height - s);
            ctx.stroke();
        });

        // Get dominant emotion
        const exprs = detections[0].expressions;
        const [domName, domScore] = Object.entries(exprs).sort((a, b) => b[1] - a[1])[0];
        const info = EMOTIONS[domName] || EMOTIONS.neutral;

        // Update tiles
        updateTiles(exprs, domName);

        // Update dominant badge
        badge.style.display     = 'flex';
        badge.style.borderColor = info.color + '66';
        document.getElementById('dEmoji').textContent = info.emoji;
        document.getElementById('dLabel').textContent = domName;
        document.getElementById('dPct').textContent   = Math.round(domScore * 100) + '%';

        // Add to history on emotion change
        if (window._lastEmo !== domName) {
            window._lastEmo = domName;
            addHistory(info.emoji, info.color, domName, Math.round(domScore * 100));
        }

        animFrame = requestAnimationFrame(detect);
    }

    detect();
}

// ===== ADD HISTORY PILL =====
function addHistory(emoji, color, label, pct) {
    const track = document.getElementById('historyTrack');
    const pill  = document.createElement('div');
    pill.className  = 'h-pill';
    pill.title      = label + ' ' + pct + '%';
    pill.style.borderColor = color + '55';
    pill.innerHTML  = `${emoji}<span class="h-pct">${pct}%</span>`;
    track.appendChild(pill);
    track.scrollLeft = track.scrollWidth;
    // Keep max 50 items
    while (track.children.length > 50) track.removeChild(track.firstChild);
}

// ===== EXIT DIALOG =====
function openExitDialog() {
    document.getElementById('exitOverlay').style.display = 'flex';
    if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
}

function closeExitDialog() {
    document.getElementById('exitOverlay').style.display = 'none';
    if (modelsLoaded) startDetection();
}

function doExit() {
    // Stop camera & animation
    if (videoStream) { videoStream.getTracks().forEach(t => t.stop()); videoStream = null; }
    if (animFrame)   { cancelAnimationFrame(animFrame); animFrame = null; }

    // Reset state
    modelsLoaded      = false;
    window._lastEmo   = null;
    facingMode        = 'user';

    // Reset UI
    document.getElementById('exitOverlay').style.display       = 'none';
    document.getElementById('app').style.display               = 'none';
    document.getElementById('historyTrack').innerHTML          = '';
    document.getElementById('dominantBadge').style.display     = 'none';
    document.getElementById('loadingOverlay').style.display    = 'flex';
    document.getElementById('loadText').textContent            = 'Loading AI models…';
    setStatus('Initializing', '#a0a0b8', false);

    // Show splash
    const sp = document.getElementById('splash');
    sp.style.display = 'flex';
    sp.classList.remove('hide');
}
