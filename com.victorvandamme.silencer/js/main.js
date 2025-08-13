// Initialize CSInterface and get status <pre> element
const csInterface = new CSInterface();
const status = document.getElementById('status');

//Update decibel threshold value
document.getElementById('threshold').addEventListener('input', e => {
  document.getElementById('thrValue').textContent = e.target.value;
});

document.getElementById('analyzeBtn').addEventListener('click', async ()=>{
  status.textContent = 'Exporting audio...';
  // 1) Ask ExtendScript to export audio to a temp file with a chosen preset
  const outPath = '' + await evalScriptPromise(`exportSequenceAudio()`); // returns full OS path or error
  if (!outPath || outPath.startsWith('ERR')) {
    status.textContent = 'Export failed: ' + outPath;
    return;
  }
  status.textContent = 'Exported to: ' + outPath + '\nRunning analysis...';

  // 2) Run Python analysis via Node child_process (we have node enabled)
  try {
    const threshold = document.getElementById('threshold').value;
    const minSilenceMs = document.getElementById('minSilence').value;

    const rangesJson = await runPythonAnalyze(outPath, threshold, minSilenceMs);
    status.textContent = 'Found ranges: ' + rangesJson;

    // 3) Tell ExtendScript to create markers
    const resp = await evalScriptPromise(`insertSilenceMarkers(${JSON.stringify(rangesJson)})`);
    status.textContent = 'Markers inserted: ' + resp;
  } catch (err) {
    status.textContent = 'Error: ' + err;
  }
});

// helper to call evalScript as Promise
function evalScriptPromise(expr) {
  return new Promise((resolve) => {
    csInterface.evalScript(expr, (res) => resolve(res));
  });
}

// run python using node child_process
function runPythonAnalyze(wavPath, thresholdDb, minSilenceMs) {
  return new Promise((resolve, reject) => {
    try {
      const cp = require('child_process');
      // assume python3 on PATH; use full path in production
      const py = 'python';
      const script = csInterface.getSystemPath(SystemPath.EXTENSION) + '/server/silence_detect.py';
      const args = [script, wavPath, thresholdDb.toString(), minSilenceMs.toString()];
      const p = cp.spawn(py, args, { windowsHide: true });

      let out = '', err = '';
      p.stdout.on('data', d => out += d.toString());
      p.stderr.on('data', d => err += d.toString());
      p.on('close', code => {
        if (code !== 0) return reject(err || ('exit ' + code));
        try { resolve(JSON.parse(out)); } catch(e) { reject('bad json: '+e + '\n' + out); }
      });
    } catch (e) {
      reject(e.toString());
    }
  });
}
