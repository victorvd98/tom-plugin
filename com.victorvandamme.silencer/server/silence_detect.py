#!/usr/bin/env python3
import sys
import json
import numpy as np
from scipy.io import wavfile

def rms(a):
    # Root mean square of a NumPy array.
    return np.sqrt(np.mean(a.astype(np.float64) ** 2))

def find_silence(wav_path, thresh_db=-40.0, min_silence_ms=500, win_ms=50):
    # Read WAV file
    sr, audio = wavfile.read(wav_path)  # audio: np.int16 or np.float32 array
    # Convert to float in range [-1, 1]
    if np.issubdtype(audio.dtype, np.integer):
        max_val = np.iinfo(audio.dtype).max
        audio = audio.astype(np.float32) / max_val
    elif np.issubdtype(audio.dtype, np.floating):
        audio = audio.astype(np.float32)

    # If stereo/multi-channel, average to mono
    if audio.ndim > 1:
        audio = np.mean(audio, axis=1)

    win = int(sr * (win_ms / 1000.0))
    step = win  # non-overlapping windows
    starts = []
    db_values = []

    for i in range(0, len(audio), step):
        block = audio[i:i+win]
        if block.size == 0:
            break
        val = rms(block)
        db = -999.0 if val == 0 else 20.0 * np.log10(val)
        db_values.append(db)
        starts.append(i / sr)

    # Find contiguous windows below threshold for at least min_silence_ms
    silence_windows = []
    min_frames = int(min_silence_ms / win_ms)
    cur_start = None
    cur_len = 0

    for i, db in enumerate(db_values):
        if db < thresh_db:
            if cur_start is None:
                cur_start = starts[i]
                cur_len = 1
            else:
                cur_len += 1
        else:
            if cur_start is not None and cur_len >= min_frames:
                silence_windows.append((cur_start, starts[i] + win_ms / 1000.0))
            cur_start = None
            cur_len = 0

    # Handle trailing silence
    if cur_start is not None and cur_len >= min_frames:
        silence_windows.append((cur_start, starts[-1] + win_ms / 1000.0))

    # Merge adjacent silence windows if they are very close
    merged = []
    for s, e in silence_windows:
        if not merged:
            merged.append([s, e])
        else:
            if s <= merged[-1][1] + 0.01:
                merged[-1][1] = max(merged[-1][1], e)
            else:
                merged.append([s, e])

    return merged

if __name__ == '__main__':
    if len(sys.argv) < 4:
        print(json.dumps([]))
        sys.exit(1)

    wav_path = sys.argv[1]
    threshold = float(sys.argv[2])
    min_silence = int(sys.argv[3])

    ranges = find_silence(wav_path, thresh_db=threshold, min_silence_ms=min_silence)
    out = [{'start': float(s), 'end': float(e)} for s, e in ranges]
    print(json.dumps(out))
