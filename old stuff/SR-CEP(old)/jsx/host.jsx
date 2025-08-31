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
function removeSilence(ranges) {
    var seq = app.project.activeSequence;
    var track = seq.audioTracks[0]; 
    for (var i = ranges.length - 1; i >= 0; i--) { // reverse to avoid messing up indices
        var start = ranges[i].start;
        var end = ranges[i].end;
        track.setInPoint(start);
        track.setOutPoint(end);
        track.deleteClip();
    }
    return "Removed " + ranges.length + " silent sections";
}

