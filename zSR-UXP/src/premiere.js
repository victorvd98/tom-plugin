import { app } from 'uxp';

/**
 * Get the currently selected audio clip in the active sequence.
 * @returns {Promise<Object|null>} - Returns clip object or null if none selected
 */
export async function getSelectedClip() {
  const sequences = await app.project.sequences;
  if (!sequences || sequences.length === 0) return null;

  const activeSequence = sequences.find(seq => seq.isActive);
  if (!activeSequence) return null;

  // Find first targeted audio track with a selected clip
  const audioTrack = activeSequence.audioTracks.find(track => track.isTargeted);
  if (!audioTrack) return null;

  const selectedClip = audioTrack.clips.find(c => c.isSelected);
  return selectedClip || null;
}

/**
 * Cut and mute given silence segments in the clip.
 * @param {Object} clip - Premiere audio clip object
 * @param {Array<{start:number,end:number}>} silences - silent segments in seconds
 */
export async function cutAndMuteSilences(clip, silences) {
  if (!clip || !silences || silences.length === 0) return;

  const track = clip.parentTrack;
  if (!track) throw new Error('Cannot find parent track for clip.');

  // Sort silences in reverse to avoid time shift issues
  silences.sort((a, b) => b.start - a.start);

  for (const silence of silences) {
    const clipStart = clip.start.seconds;
    const clipEnd = clip.end.seconds;
    const startTime = Math.max(silence.start, clipStart);
    const endTime = Math.min(silence.end, clipEnd);

    if (startTime >= endTime) continue;

    try {
      // Add edit points at start and end
      await track.addEditAt(startTime);
      await track.addEditAt(endTime);

      // Find new clip segment corresponding to the silence
      const newClips = track.clips.filter(c => c.start.seconds >= startTime && c.end.seconds <= endTime);
      for (const silentClip of newClips) {
        silentClip.setMute(true);
      }
    } catch (err) {
      console.error(`Failed to mute silence ${startTime}-${endTime}:`, err);
    }
  }
}
