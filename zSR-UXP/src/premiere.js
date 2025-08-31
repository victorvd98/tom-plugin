// Premiere UXP APIs
import { app } from 'uxp';

export async function getActiveSequence() {
  const sequences = await app.project.sequences;
  if (!sequences || sequences.length === 0) return null; // OR (||) logical operator
  return sequences.find(seq => seq.isActive) || null;
}

/**
 * Cut and mute silence ranges in the given clip.
 * @param {Object} clip - The audio clip object from Premiere.
 * @param {Array} silences - Array of { start: number, end: number } in seconds.
 */
export async function cutAndMuteSilences(clip, silences) {
  if (!clip || !silences || silences.length === 0) return;

  const track = clip.parentTrack;
  if (!track) throw new Error('Could not find track for clip.');

  // Sort silence segments in reverse so we cut from the end
  // (avoids messing up time positions when cutting)
  silences.sort((a, b) => b.start - a.start);

  for (const silence of silences) {
    const { start, end } = silence;

    // Make sure silence is within clip duration
    const clipStart = clip.start.seconds;
    const clipEnd = clip.end.seconds;

    if (end <= clipStart || start >= clipEnd) continue;

    const cutStart = Math.max(start, clipStart);
    const cutEnd = Math.min(end, clipEnd);

    try {
      // Add edit points
      await track.addEditAt(cutStart);
      await track.addEditAt(cutEnd);

      // After splitting, find the segment that corresponds to silence and mute it
      const newClips = track.clips.filter(c =>
        c.start.seconds >= cutStart && c.end.seconds <= cutEnd
      );

      for (const silentClip of newClips) {
        silentClip.setMute(true);
      }
    } catch (err) {
      console.error(`Error cutting silence at ${start}-${end}:`, err);
    }
  }
}
