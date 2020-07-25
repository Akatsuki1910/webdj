import * as cssFunc from "./cssFunc";

export default class Tsumami {
  #size;
  #target;
  #bgcolor;
  #tmmcolor;
  #mbgcolor;
  #meterSize;
  #degree;
  #scale;
  #min;
  #max;
  #obj;
  #mcolor;
  #point;
  #value;
  #mode;
  #centerValue;
  #modenum;

  constructor(settings) {
    settings = (settings === undefined) ? {} : settings;
    this.#size = settings.size || 100;
    this.#target = settings.target || document.getElementById("tsumami");
    this.#bgcolor = settings.bgcolor || "red";
    this.#tmmcolor = settings.tmmcolor || "yellow";
    this.#mbgcolor = settings.mbgcolor || "black";
    this.#meterSize = settings.meterSize || 10;
    this.#degree = settings.degree || 270;
    this.#scale = settings.scale || 1.2;
    this.#min = settings.min || 0;
    this.#max = settings.max || 100;
    this.#obj = settings.obj || "";
    this.#mcolor = settings.mcolor || "blue";
    this.#point = settings.point || "purple";
    this.#value = settings.value || this.#min;
    this.#mode = settings.mode || "nomal";
    this.#centerValue = settings.centerValue || 50;

    this.#createTag();

    this.#modeAdjustment();

    this.#main();
  }

  #createTag = () => {
    this.meterbg = document.createElement('div');
    this.pie = document.createElement('ul');
    this.meterbghole = document.createElement('div');
    this.meterbgholeout = document.createElement('div');
    this.tsumami = document.createElement('div');
    this.point = document.createElement('div');
    this.sliceMeterBg = [];
    this.sliceMeterBgContents = [];
    this.sliceMeter = [];
    this.sliceMeterContents = [];
  }

  #modeAdjustment = () => {
    var modearr = ["center"];
    this.#modenum = 0;
    for(var i in modearr){
      if(modearr[i]===this.#mode){
        this.#modenum = i+1;
        break;
      }
    }
    if(this.#modenum==1){
      this.#value = 0;
      this.#min = -this.#centerValue;
      this.#max = this.#centerValue;
    }
  }

  #main = () => {
    // outer frame
    console.log(this.#target);
    this.#addStyleElement(this.#target, {
      center: false,
      position: "relative",
      width: cssFunc._px(this.#size),
      height: cssFunc._px(this.#size),
      background: this.#bgcolor
    });

    // Meter Background
    this.#addStyleElement(this.meterbg, {
      center: true,
      borderRadius: "50%",
      background: this.#mbgcolor,
      width: cssFunc._px(this.#size / this.#scale),
      height: cssFunc._px(this.#size / this.#scale),
    }, "tsumami-meterbg", this.#target);

    // Hide the meter or Frame of the meter section
    this.#addStyleElement(this.pie, {
      center: false,
      overflow: "hidden",
      borderRadius: "50%",
      position: "absolute",
      padding: 0,
      margin: 0,
      width: cssFunc._px(this.#size),
      height: cssFunc._px(this.#size),
      left: cssFunc._px((this.#size - this.#size / this.#scale) / (-2)),
      top: cssFunc._px((this.#size - this.#size / this.#scale) / (-2)),
    }, "tsumami-meter", this.meterbg);

    // Creating a fan shape to hide the meter
    this.#createsliceMeterBg(this.#degree);

    // Create a fan shape to display the meter
    this.#createsliceMeter(this.#degree);

    // inner circle
    this.#addStyleElement(this.meterbghole, {
      center: true,
      borderRadius: "50%",
      width: cssFunc._px(this.#size / this.#scale - this.#meterSize),
      height: cssFunc._px(this.#size / this.#scale - this.#meterSize),
      background: this.#bgcolor,
    }, "tsumami-meterhole", this.meterbg);

    // outer circle
    this.#addStyleElement(this.meterbgholeout, {
      center: false,
      position: "absolute",
      borderRadius: "50%",
      width: cssFunc._px(this.#size / this.#scale),
      height: cssFunc._px(this.#size / this.#scale),
      background: "rgba(0,0,0,0)",
      border: cssFunc._whileSpace(["solid", cssFunc._px((this.#size - this.#size / this.#scale) / 2), this.#bgcolor]),
      margin: 0,
      top: "50%",
      left: "50%",
      transform: cssFunc._whileSpace(["translateX(-50%)", "translateY(-50%)"]),
    }, "tsumami-meterhole-out", this.meterbg);

    // snack
    this.#addStyleElement(this.tsumami, {
      center: true,
      userSelect: "none",
      width: cssFunc._px(this.#size / 2),
      height: cssFunc._px(this.#size / 2),
      background: this.#tmmcolor,
      borderRadius: "50%",
      transform: cssFunc._rotate(this.#degree / -2),
    }, "tsumami-inner", this.#target);

    // stitch
    this.#addStyleElement(this.point, {
      center: true,
      width: "10%",
      height: "20%",
      background: this.#point,
      transform: "translateY(-100%)",
    }, "tsumami-point", this.tsumami);

    // Additional Events
    this.#eventAdd(this.tsumami);

    // Rotate to initial value
    if(this.#modenum==0){
      const firstRotate = this.#value*this.#degree/(this.#max-this.#min);
      this.#rotateMeter(firstRotate);
      this.tsumami.style.transform = cssFunc._rotate(firstRotate - this.#degree/2);
    }else if(this.#modenum==1){
      this.tsumami.style.transform = cssFunc._rotate(0);
    }

    // Set to initial value
    this.#outputObject.value = this.#value;
  }

  //center
  #styleCenter = () => {
    const style = {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      margin: "auto",
    }
    return style;
  }

  // Add css
  #addStyleElement = (element, style, className = undefined, target = undefined) => {
    if (className !== void 0) element.className = className;
    if (style.center) style = Object.assign(this.#styleCenter(), style);
    delete style.center;
    for (let key in style) {
      element.style[key] = style[key];
    }
    if (target !== void 0) target.appendChild(element);
  }

  #meterStyle = {
    center: false,
    overflow: "hidden",
    position: "absolute",
    width: "50%",
    height: "50%",
    transformOrigin: "0% 100%",
  }

  #meterContentStyle = {
    center: false,
    position: "absolute",
    left: "-100%",
    borderRadius: "50%",
    width: "200%",
    height: "200%",
  }

  // Creating a fan shape to hide the meter
  #createsliceMeterBg = (degree) => {
    degree = (degree > 360) ? 0 : 360 - degree;
    const bf = (degree % 90 == 0) ? 0 : 1;
    const num = 4;//degree / 90 + bf;

    for (let i = 0; i < num; i++) {
      let degreePiece = 0;
      if (degree == 0) {
        this.sliceMeterBg[i] = "";
        this.sliceMeterBgContents[i] = "";
        continue;
      } else if (degree >= 90) {
        degreePiece = 90;
        degree -= 90;
      } else {
        degreePiece = degree;
        degree = 0;
      }
      this.sliceMeterBg[i] = document.createElement("li");
      this.sliceMeterBgContents[i] = document.createElement("div");
      this.#addStyleElement(this.sliceMeterBg[i], {
        ...this.#meterStyle,
        top: 0,
        right: 0,
        transform: cssFunc._whileSpace([cssFunc._rotate(degreePiece / (-2) + 180 - i * 45 + degree / 2), cssFunc._skewY(-90 + degreePiece)]),
      }, "sliceMeterBg", this.pie);

      this.#addStyleElement(this.sliceMeterBgContents[i], {
        ...this.#meterContentStyle,
        background: this.#bgcolor,
        transform: cssFunc._skewY(90 - degreePiece),
      }, "sliceMeterBg-contents", this.sliceMeterBg[i]);
    }
  }

  // create meter
  #createsliceMeter = (degree) => {
    const bf = (degree % 90 == 0) ? 0 : 1;
    const num = 4;//degree / 90 + bf;
    degree = (degree > 360) ? 0 : 360 - degree;
    var tr = [{
        top: cssFunc._px(0),
        right: cssFunc._px(-1)
      },
      {
        top: cssFunc._px(1),
        right: cssFunc._px(0)
      },
      {
        top: cssFunc._px(0),
        right: cssFunc._px(1)
      },
      {
        top: cssFunc._px(-1),
        right: cssFunc._px(0)
      },
    ];
    const centerRotate = [0,90,0,-90];//#modenum == 1
    for (let i = 0; i < num; i++) {
      this.sliceMeter[i] = document.createElement("li");
      this.sliceMeterContents[i] = document.createElement("div");
      const transform = {transform: cssFunc._whileSpace([cssFunc._rotate(180 + 90 * i + degree / 2), cssFunc._skewY(-90)])}
      if(this.#modenum == 1){
        transform = {transform: cssFunc._whileSpace([cssFunc._rotate(centerRotate[i]), cssFunc._skewY(-90)])}
      }
      this.#addStyleElement(this.sliceMeter[i], {
        ...this.#meterStyle,
        ...transform,
        ...tr[i]
      }, "sliceMeter", this.pie);

      this.#addStyleElement(this.sliceMeterContents[i], {
        ...this.#meterContentStyle,
        background: this.#mcolor,
        transform: cssFunc._skewY(90),
      }, "sliceMeter-contents", this.sliceMeter[i]);
    }
  }

  // mouse event
  #eventAdd = (element) => {
    this.#click = false;
    this.#memoryY = 0;
    element.addEventListener('pointerdown', this.#OnMouseDown, false);
    window.addEventListener('pointermove', (e) => {
      this.#OnMouseMove(e, element)
    }, false);
    window.addEventListener('pointerup', this.#OnMouseUp, false);
  }

  #click;
  #memoryY;
  #OnMouseDown = (event) => {
    this.#click = true;
    this.#memoryY = event.clientY;
    // console.log("MouseDown");
  }

  #OnMouseMove = (event, element) => {
    if (this.#click) {
      const rotateDegreeBefore = cssFunc._returnTransformValue(element.style.transform, "rotate");
      let rotateDegreeAfter = rotateDegreeBefore + (event.clientY - this.#memoryY) * 3;
      const degValue = this.#limit(rotateDegreeAfter, -this.#degree / 2, this.#degree / 2);
      element.style.transform = cssFunc._rotate(degValue);
      this.#memoryY = event.clientY;

      this.#rotateMeter(degValue + this.#degree / 2);

      this.#outputObject.value = (this.#max - this.#min) * (degValue + this.#degree / 2) / this.#degree + this.#min;

      // console.log("MouseMove");
    }
  }

  #OnMouseUp = (event) => {
    this.#click = false;
    // console.log("MouseUp");
  }

  //set value
  #outputObject = (() => {
    var val = Object.create(null);
    var memValue = 0;
    Object.defineProperty(val, 'value', {
      set: (value) => {
        if (this.#obj !== "") {
          this.#obj.value = value; //set
        }
        memValue = value;
      },
      get: () => {
        return memValue;
      }
    });
    return val;
  })();

  #rotateMeter = (degree) => {
    const sM = this.sliceMeter;
    const sMC = this.sliceMeterContents;
    if(this.#modenum == 0){
      for (let i = 0; i < this.sliceMeter.length; i++) {
        var rotateDeg = 0;
        if (degree >= 90) {
          rotateDeg = 90;
          degree -= 90;
        } else {
          rotateDeg = degree;
          degree = 0;
        }
        let smTransform = sM[i].style.transform.split(" ")[0];
        sM[i].style.transform = cssFunc._whileSpace([smTransform, cssFunc._skewY(-90 + rotateDeg)]);
        sMC[i].style.transform = cssFunc._skewY(90 - rotateDeg);
      }
    }

    if(this.#modenum == 1){
      var t = [
        [-90,-1],
        [0,-1],
        [0,0],
        [90,0]
      ]
      degree = degree - this.#degree / 2;
      var rotateDeg = [
        this.#limit(-degree-90,0,90),
        this.#limit(-degree,0,90),
        this.#limit(degree,0,90),
        this.#limit(degree-90,0,90)
      ];
      for (let i = 0; i < this.sliceMeter.length; i++) {
        sM[i].style.transform = cssFunc._whileSpace([cssFunc._rotate(t[i][0] + t[i][1]*rotateDeg[i]), cssFunc._skewY(-90 + rotateDeg[i])]);
        sMC[i].style.transform = cssFunc._skewY(90 - rotateDeg[i]);
      }
    }
  }

  // function
  #limit = (value, min, max) => {
    if (value < min) {
      value = min;
    } else if (value > max) {
      value = max;
    }
    return value;
  }

  // test log
  static testlog = () => {
    console.log("testlog");
  }
}