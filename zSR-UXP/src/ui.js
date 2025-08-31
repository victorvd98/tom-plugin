// Cached DOM elements
let thresholdInput, thresholdValue;
let minDurationInput;
let analyzeBtn, applyBtn;
let statusEl, selectedClipEl, muteRangesEl;

// Event callback holders
let analyzeCallback = null;
let applyCallback = null;

export function init() {
  thresholdInput = document.getElementById('thresholdInput');
  thresholdValue = document.getElementById('thresholdValue');
  minDurationInput = document.getElementById('minDurationInput');
  analyzeBtn = document.getElementById('analyzeBtn');
  applyBtn = document.getElementById('applyBtn');
  statusEl = document.getElementById('status');
  selectedClipEl = document.getElementById('selectedClip');
  muteRangesEl = document.getElementById('muteRanges');

  // Update threshold display
  thresholdInput.addEventListener('input', () => {
    thresholdValue.textContent = thresholdInput.value;
  });

  // Button click events
  analyzeBtn.addEventListener('click', () => {
    if (typeof analyzeCallback === 'function') analyzeCallback();
  });

  applyBtn.addEventListener('click', () => {
    if (typeof applyCallback === 'function') applyCallback();
  });
}

// Event registration
export function onAnalyzeClick(callback) {
  analyzeCallback = callback;
}

export function onApplyClick(callback) {
  applyCallback = callback;
}

// Get input values
export function getThreshold() {
  return parseFloat(thresholdInput.value);
}

export function getMinDuration() {
  return parseInt(minDurationInput.value, 10);
}

// UI updates
export function setStatus(text) {
  statusEl.textContent = text;
}

export function setSelectedClip(name) {
  selectedClipEl.textContent = name;
}

export function addMuteRange(start, end) {
  const li = document.createElement('li');
  li.textContent = `Mute: ${start.toFixed(2)}s → ${end.toFixed(2)}s`;
  muteRangesEl.appendChild(li);
}

export function clearMuteRanges() {
  muteRangesEl.innerHTML = '';
}

// Enable/disable buttons
export function enableApply() {
  applyBtn.disabled = false;
}

export function disableApply() {
  applyBtn.disabled = true;
}
