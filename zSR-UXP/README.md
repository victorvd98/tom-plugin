## 🔧 Installation

THIS DOESNT WORK

1. **Enable Developer Mode** in Premiere:
   - Go to `Preferences → Plugins → Development`.
   - Enable **Developer Mode**.
   - Restart Premiere if prompted.

2. **Load the plugin**:
   - In Premiere: `Plugins → Development → Load UXP Plugin…`
   - Select the `premiere-uxp-silence-muter/` folder.

3. **Open the panel**:
   - Go to `Window → Extensions → SR-UXP AutoMute`.
   - Dock it like any other Premiere panel.


---

## ▶️ Usage

1. Open a sequence with audio clips.
2. Select the audio clip you want to process.
3. In **SR-UXP AutoMute**:
   - Adjust **Silence Threshold (dBFS)**.
   - Set **Minimum Silence Duration (ms)**.
   - Click **Analyze** to scan the clip.
   - Review the detected silence ranges.
   - Click **Apply Mutes** to cut and mute silent parts.

---

## ⚠️ Notes & Limitations

- Currently supports **one selected audio clip** at a time.
- Long clips may take longer to analyze (sampling every ~10ms).
- Works best for dialogue and podcasts, not for music.

---

## 🛠 Development

- The project uses **Adobe UXP APIs** (Premiere 2025+).
- Entry point: `index.html` → loads `src/panel.js`.
- All API calls to Premiere are abstracted in `src/premiere.js`.

Run a simple static server during development (e.g. `npx serve .`) if you want live reload for HTML/JS/CSS.  
Then reload the plugin in Premiere via `Plugins → Development → Reload`.

---

## 📜 License

MIT License.  
Free to use, modify, and distribute in your own workflows.

---

## 🙌 Credits

Built with ❤️ for editors who want a faster podcast cleanup workflow.