import * as UI from './ui.js';
import { analyzeAudio } from './audioAnalysis.js';
import { getSelectedClip, cutAndMuteSilences } from './premiere.js';

let targetClip = null;
let detectedSilences = [];

/**
 * Initializes the panel.
 * Sets up UI events and default state.
 */
export function initPanel() {
  UI.init();

  // Analyze button
  UI.onAnalyzeClick(async () => {
    UI.clearMuteRanges();
    UI.setStatus('Checking selection...');
    targetClip = await getSelectedClip();

    if (!targetClip) {
      UI.setStatus('No audio clip selected. Please select a clip.');
      UI.setSelectedClip('No clip selected');
      UI.disableApply();
      return;
    }

    UI.setSelectedClip(targetClip.name);
    UI.setStatus('Analyzing audio...');

    const threshold = UI.getThreshold();
    const minDuration = UI.getMinDuration();

    try {
      detectedSilences = await analyzeAudio(targetClip, threshold, minDuration);

      if (detectedSilences.length === 0) {
        UI.setStatus('No silences detected.');
        UI.disableApply();
        return;
      }

      // Display detected ranges
      detectedSilences.forEach(({ start, end }) => {
        UI.addMuteRange(start, end);
      });

      UI.setStatus(`Found ${detectedSilences.length} silences. Ready to apply.`);
      UI.enableApply();
    } catch (err) {
      console.error(err);
      UI.setStatus('Error during analysis: ' + err.message);
    }
  });

  // Apply button
  UI.onApplyClick(async () => {
    if (!targetClip || detectedSilences.length === 0) return;

    UI.setStatus('Applying mutes...');
    try {
      await cutAndMuteSilences(targetClip, detectedSilences);
      UI.setStatus('Mutes applied successfully!');
      UI.disableApply();
    } catch (err) {
      console.error(err);
      UI.setStatus('Error applying mutes: ' + err.message);
    }
  });
}

// Initialize panel when module is loaded
initPanel();
