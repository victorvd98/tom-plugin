premiere-uxp-silence-muter/
├─ manifest.json
├─ index.html
├─ src/
│  ├─ panel.js
│  ├─ ui.js
│  ├─ premiere.js        // tiny wrappers around Premiere UXP APIs (sequence, clips, keyframes, cuts)
│  └─ audioAnalysis.js   // dBFS + min-duration silence detection on sampled waveforms
├─ styles/
│  └─ panel.css
├─ assets/
│  ├─ icon-dark.png
│  └─ icon-light.png
└─ README.md