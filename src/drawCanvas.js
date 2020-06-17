import PeakAnalyzer from "./PeakAnalyzer";
import * as PIXI from 'pixi.js';

export default class DrawCanvas {

  constructor(canvas,w,h){
    this.canvas = canvas;
    this.g = [];
    this.g[0] = [];
    this.g[1] = [];

    this.width = w;
    this.height =h;
    this.memWaveLength = 0;

    this.stage = new PIXI.Container();
    this.renderer = PIXI.autoDetectRenderer({
      width:this.width,
      height:this.height,
      resolution: 1,
      antialias: true,
      transparent: true,
    });
  }


  drawCanvas(url){
    var analyzer = new PeakAnalyzer();
    analyzer.analyze(url, window.width * 10)
      .then((peaksArr) => {
        this.drawWaveform(peaksArr);
      }).catch((err) => {
        console.error(err);
      });
  }

  drawWaveform(wave) {
    const js = import("./@akatsuki1910/rust-create-circle/rust_create_circle.js");
    js.then(js => {
      js.greet("WebAssembly");
    });
    // var width = this.width;
    // var height =this.height;
    // this.renderer.resize(width, height);
    // // var halfW = width/2;
    // var halfH = height/2;
    // this.canvas.appendChild(this.renderer.view);
    // const barMargin = 0;
    // const barWidth = width / (wave[0].length - barMargin);
    // let sample;
    // let barHeight;

    // let waveMaxLength = Math.max(this.memWaveLength,wave[0].length);
    // for(var p=0;p<wave.length;p++){
    //   for (let i = 0; i < waveMaxLength; i++) {
    //     if(this.g[p][i] !== undefined){
    //       this.g[p][i].clear();
    //     }else{
    //       this.g[p][i] = new PIXI.Graphics();
    //     }
    //     if(i<wave[0].length){
    //       sample = wave[p][i];
    //       barHeight = sample * halfH /2;
    //       this.g[p][i].x = i * (barWidth + barMargin);
    //       var bh = (p===0)?-barHeight:0;
    //       this.g[p][i].y = halfH + bh;
    //       this.g[p][i].width = barWidth;
    //       this.g[p][i].height = barHeight;
    //       this.g[p][i].beginFill(0x1355a5);
    //       this.g[p][i].drawRect(0,0,barWidth + barMargin,barHeight);
    //       this.g[p][i].endFill();
    //       this.stage.addChild(this.g[p][i]);
    //     }
    //   }
    // }

    // this.memWaveLength = wave[0].length;
    // this.renderer.render(this.stage);
    // cancelAnimationFrame(this.loop);
    // this.loop();
  }

  canvasResize(w,h){
    var width = w;
    var height = h;
    this.renderer.resize(width, height);
    var c_width = (width-this.width)/this.g[0].length;
    var c_height = (height-this.height)/2;
    for(var p=0;p<this.g.length;p++){
      for (let i = 0; i < this.g[0].length; i++) {
        this.g[p][i].width += c_width;
        this.g[p][i].x = i*this.g[p][i].width;
        this.g[p][i].y += c_height;
      }
    }
    this.width = width;
    this.height = height;

    console.log("canvas resize clear!");
  }

  loop(){
    requestAnimationFrame(()=>this.loop());
    this.renderer.render(this.stage);
  }
}