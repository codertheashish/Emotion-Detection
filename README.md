# EmoSense — Live Emotion Detection

Real-time face emotion detection in the browser.
No backend needed. Pure HTML + CSS + JavaScript.

---

## Project Structure

```
emosense/
├── index.html               ← Main entry point (open this)
├── README.md
├── public/
│   └── models/              ← (Optional) local model files
└── src/
    ├── styles/
    │   └── main.css         ← All styles
    ├── utils/
    │   ├── emotions.js      ← Emotion config (emoji, colors)
    │   └── loadModels.js    ← face-api.js model loader
    ├── components/
    │   ├── buildBars.js     ← Builds emotion bar UI
    │   └── updateUI.js      ← Updates bars, badge, history, status
    ├── hooks/
    │   ├── useCamera.js     ← Camera stream management
    │   └── useDetection.js  ← rAF detection loop
    └── app.js               ← App lifecycle (init, exit)
```

---

## How to Run

### Option 1 — Directly open (easiest)
Just open `index.html` in Chrome or Firefox.
Models load from CDN automatically (internet required).

### Option 2 — Local server (recommended for camera on some browsers)
```bash
# Python
python -m http.server 8080

# Node.js
npx serve .
```
Then open: http://localhost:8080

---

## Features

- Live webcam feed (front + back camera support)
- 7 emotion detection: Happy 😊 Sad 😢 Angry 😠 Fearful 😨 Disgusted 🤢 Surprised 😲 Neutral 😐
- Animated confidence bars for each emotion
- Floating dominant emotion badge on video
- Emotion history strip (last 50 emotions)
- Exit button with confirmation dialog
- Fully mobile responsive (portrait + landscape)

---

## Tech Stack

| Library       | Purpose                        |
|---------------|-------------------------------|
| face-api.js   | Face detection + expressions  |
| @vladmandic/face-api | Model CDN host        |
| Google Fonts  | DM Sans + Space Mono          |

---

## Notes

- HTTPS is required if deploying on a server (camera API restriction)
- localhost works without HTTPS
- Internet is required to load models from CDN on first use
- To use local models: download from https://github.com/vladmandic/face-api/tree/master/model
  and place in `public/models/`, then update MODEL_BASE_URL in `src/utils/loadModels.js`
