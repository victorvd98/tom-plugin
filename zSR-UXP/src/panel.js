import { analyzeAudio } from './audioAnalysis.js';
import { getActiveSequence, cutAndMuteSilences } from './premiere.js';

const analyzeBtn = document.getElementById('analyzeBtn');
const thresholdInput = document.getElementById('threshold');
const durationInput = document.getElementById('minDuration');
const statusEl = document.getElementById('status');

analyzeBtn.addEventListener('click', async () => {
  try {
    statusEl.textContent = 'Analyzing audio...';

    const threshold = parseFloat(thresholdInput.value);
    const minDuration = parseInt(durationInput.value, 10);

    const sequence = await getActiveSequence();
    if (!sequence) {
      statusEl.textContent = 'No active sequence found!';
      return;
    }

    // For now, we’ll assume the first selected audio track
    const selectedTrack = sequence.audioTracks.find(track => track.isTargeted);
    if (!selectedTrack) {
      statusEl.textContent = 'Select an audio track first.';
      return;
    }

    // Extract samples or reference
    const audioClip = selectedTrack.clips[0];
    if (!audioClip) {
      statusEl.textContent = 'No clips on this track.';
      return;
    }

    // Step 1: Analyze audio
    const silences = await analyzeAudio(audioClip, threshold, minDuration);
    if (silences.length === 0) {
      statusEl.textContent = 'No silences detected.';
      return;
    }

    statusEl.textContent = `Found ${silences.length} silent segments. Cutting...`;

    // Step 2: Apply cuts/mutes in Premiere
    await cutAndMuteSilences(audioClip, silences);

    statusEl.textContent = 'Done! Silences cut.';
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Error: ' + err.message;
  }
});
