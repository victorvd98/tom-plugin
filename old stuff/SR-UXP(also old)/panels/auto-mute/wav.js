// wav.js
// can add stereo track support - picking louder channel

export async function analyzeAudio(audioBuffer, threshold = -40, minDuration = 0.3) {
    // Convert threshold from dBFS to linear amplitude
    const linearThreshold = Math.pow(10, threshold / 20);

    const channelData = audioBuffer.getChannelData(0); // first channel
    const sampleRate = audioBuffer.sampleRate;

    const minSamples = Math.floor(minDuration * sampleRate);
    const silentRegions = [];

    let silentStart = null;

    for (let i = 0; i < channelData.length; i++) {
        const sample = Math.abs(channelData[i]);

        if (sample < linearThreshold) {
            if (silentStart === null) silentStart = i;
        } else {
            if (silentStart !== null) {
                const length = i - silentStart;
                if (length >= minSamples) {
                    silentRegions.push({
                        start: silentStart / sampleRate,
                        end: i / sampleRate,
                    });
                }
                silentStart = null;
            }
        }
    }

    // Check if file ends in silence
    if (silentStart !== null && channelData.length - silentStart >= minSamples) {
        silentRegions.push({
            start: silentStart / sampleRate,
            end: channelData.length / sampleRate,
        });
    }

    return silentRegions;
}
