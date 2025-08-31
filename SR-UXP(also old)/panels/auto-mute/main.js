import { analyzeAudio } from './wav.js';

// Grab DOM elements
const thresholdInput = document.getElementById('thresholdInput');
const thresholdValueEl = document.getElementById('thresholdValue');
const minDurationInput = document.getElementById('minDurationInput');
const processBtn = document.getElementById('processBtn');
const statusEl = document.getElementById('status');
const muteListEl = document.getElementById('muteList');

// --- Update slider label live ---
thresholdInput.addEventListener('input', (e) => {
    thresholdValueEl.textContent = e.target.value;
});

// --- Main processing ---
processBtn.addEventListener('click', async () => {
    processBtn.disabled = true;
    statusEl.textContent = 'Processing...';
    muteListEl.innerHTML = '';

    try {
        // --- UXP: get the selected audio clip ---
        const seq = app.project.activeSequence;
        if (!seq) throw new Error('No active sequence found.');
        const selection = seq.getSelection();
        if (!selection.length) throw new Error('No clip selected.');
        const clip = selection[0];

        // --- Export audio to ArrayBuffer ---
        const buffer = await clip.audioTrack.exportToAudioBuffer(); // hypothetical UXP API
        const threshold = parseFloat(thresholdInput.value);
        const minDuration = parseFloat(minDurationInput.value);

        // --- Analyze silence ---
        const silentRegions = await analyzeAudio(buffer, threshold, minDuration);

        if (!silentRegions.length) {
            statusEl.textContent = 'No silences detected.';
        } else {
            statusEl.textContent = `Found ${silentRegions.length} silent regions.`;

            silentRegions.forEach(region => {
                // --- Add volume keyframes to mute region ---
                const volumeProp = clip.components[0].properties.find(p => p.displayName === 'Volume');
                volumeProp.addKey(region.start);
                volumeProp.setValueAtTime(0, region.start, false); // non-ripple
                volumeProp.addKey(region.end);
                volumeProp.setValueAtTime(volumeProp.getValueAtTime(region.start, false), region.end, false);

                // --- Update list in UI ---
                const li = document.createElement('li');
                li.textContent = `${region.start.toFixed(2)}s → ${region.end.toFixed(2)}s`;
                muteListEl.appendChild(li);
            });
        }
    } catch (err) {
        console.error(err);
        statusEl.textContent = `Error: ${err.message}`;
    } finally {
        processBtn.disabled = false;
    }
});
