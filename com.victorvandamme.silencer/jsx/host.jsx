/* Host.jsx */

/* helper: returns a platform-safe temp path (string)
   Called from the panel as: exportSequenceAudio() -> returns path or "ERR:...".
*/
function exportSequenceAudio() {
  try {
    var seq = app.project.activeSequence;
    if (!seq) return "ERR:NO_ACTIVE_SEQUENCE";

    // create temp filename in OS temp folder
    var tfolder = Folder.temp;
    var fname = "ppro_silencer_" + (new Date()).getTime() + ".wav";
    var out = tfolder.fsName + "/" + fname; // windows/mac path formats OK

    // IMPORTANT: pick the .epr preset you made to export WAV (audio only).
    // Put the .epr in your extension folder or ask user to point to it.
    // Here we expect it at the extension folder: jsx/preset.epr
    var extPath = Folder($.fileName).parent.parent.fsName; // quick hack: extension root
    var presetPath = extPath + "/presets/audio_only.epr";

    // Use exportAsMediaDirect (renders directly to file)
    var ok = seq.exportAsMediaDirect(out, presetPath, 0); // 0 => entire sequence
    if (ok) return out;
    return "ERR:EXPORT_FAILED";
  } catch (e) {
    return "ERR:" + e.toString();
  }
}

/* insertSilenceMarkers(jsonRanges)
   jsonRanges: array of {start: <seconds>, end: <seconds>}
   returns "OK" or error text.
*/
function insertSilenceMarkers(jsonRanges) {
  try {
    var ranges = (typeof jsonRanges === 'string') ? JSON.parse(jsonRanges) : jsonRanges;
    var seq = app.project.activeSequence;
    if (!seq) return "ERR:NO_SEQ";

    var markers = seq.markers;

    for (var i = 0; i < ranges.length; i++) {
      var r = ranges[i];
      var startSec = r.start;
      var endSec = r.end;
      // create a comment marker at the start time, and set its end/duration
      var m = markers.createMarker(startSec);
      if (m) {
        m.comments = "Auto-silence";
        // set duration: marker has an 'end' property accessible (time object)
        try { m.end = endSec; } catch (e) { /* some builds vary; ignore */ }
      }
    }
    return "OK";
  } catch (e) {
    return "ERR:" + e.toString();
  }
}
