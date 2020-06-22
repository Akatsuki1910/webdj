export default class PeakAnalyzer {

  audioCtx = new AudioContext();
  promise = null;

  constructor(wasm){
    this.wasm = wasm;
  }

  aryMax = (a, b) => Math.max(a, b);
  aryMin = (a, b) => Math.min(a, b);

  analyze(url, peakLength) {
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();
      req.open('GET', url, true);
      req.responseType = 'arraybuffer';
      req.onload = () => {
        if (req.status === 200) {
          this.onLoadSound(req.response, peakLength, resolve, reject);
        } else {
          reject(req.statusText);
        }
      };
      req.send();
    });
  }

  onLoadSound(audioData, peakLength, resolve, reject) {

    this.audioCtx.decodeAudioData(audioData).then((buffer) => {

      const ch1 = buffer.getChannelData(0);
      const peaks1 = this.getPeaks(ch1, peakLength);

      const ch2 = buffer.getChannelData(1);
      const peaks2 = this.getPeaks(ch2, peakLength);

      resolve([peaks1, peaks2]);

    }).catch((error) => {
      reject(error);
    });
  }

  getPeaks(array, peakLength) {
    // let step;
    if (!peakLength) {
      peakLength = 9000;
    }

    return this.wasm.get_peaks(array,peakLength);
  }
}