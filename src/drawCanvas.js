import PeakAnalyzer from "./PeakAnalyzer";

export default class DrawCanvas {

  constructor(id,canvas,w,h){
    this.canvas = canvas;
    this.g = [];
    this.g[0] = [];
    this.g[1] = [];
    this.id = id;

    this.width = w;
    this.height =h;
    this.memWaveLength = 0;

    this.url = "";

    this.wasm = {};

    this.loadWasm();
  }

  loadWasm = async () => {
    console.log("wasm loading");
    try {
      this.wasm = await import('external');
      console.log("wasm load");
    } catch(err) {
      console.error(`Unexpected error in loadWasm. [Message: ${err.message}]`);
    }
  };


  drawCanvas(url){
    this.url = url;
    var analyzer = new PeakAnalyzer();
    analyzer.analyze(url, window.innerWidth)
      .then((peaksArr) => {
        this.drawWaveform(peaksArr);
      }).catch((err) => {
        console.error(err);
      });
  }

  drawWaveform(wave) {
    this.wasm.greet("WebAssembly");
    this.wasm.clear_canvas(this.id);
    for(var i=0;i<wave.length;i++){
      this.wasm.create_wave(this.id,wave[i],i,0,"blue");
    }
  }

  canvasResize(w,h){
    var width = w;
    var height = h;

    this.canvas.width = width;
    this.canvas.height = height;
    this.drawCanvas(this.url);
    console.log("canvas resize clear!");
  }
}