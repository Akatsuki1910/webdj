import React from 'react';
import ReactDOM from 'react-dom';
import styled, { createGlobalStyle } from 'styled-components';
import DrawCanvas from "./drawCanvas";
import Tablebox from "./tableBox";

const GlobalStyle = createGlobalStyle`
	body {
		margin: 0;
	}
	::-webkit-scrollbar {
		width: 0;
		height: 0;
	}
`;

const Screen = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
`;

const WaveCanvas = styled.div`
  width: 100%;
  height: 50%;
`;

const Canvas = styled.div`
  width: 100%;
	height: 50%;
	background: black;
`;

const DJtabel = styled.div`
	position: relative;
	width: 100%;
	min-width: 400px;
	padding-top: 20%;
`;

const Baf = styled.div`
	display: flex;
	justify-content: center;
	position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const Publicbox = styled.div`
	width: 50px;
	height: 100%;
`;

class Main extends React.Component {
	constructor(){
		super();
		this.music = "";
		this.audioUrl = "";
		this.canvas = "";
		this.dc = [];
		this.canvas = [];
	}

	componentDidMount() {
		// イベント登録
		window.onload =(e)=>{this.onLoadf(e)};
		window.onunload =(e)=>{this.onUnloadf(e)};
		window.onresize =(e)=>{this.onResize(e)};

		this.dc[0] = new DrawCanvas(this.canvas[0],window.innerWidth,window.innerHeight/4);
		this.dc[1] = new DrawCanvas(this.canvas[1],window.innerWidth,window.innerHeight/4);
	}

	// 初期化
	onLoadf(event) {
		// その他の初期化
		this.onResize();
	}

	// 後処理
	onUnloadf(event) {
		console.log("onUnload");
		this.music.terminateAudio();
	}

	// 画面のサイズ変更
	onResize(event) {
		console.log("onResize");
		this.dc[0].canvasResize(window.innerWidth,window.innerHeight/4);
		this.dc[1].canvasResize(window.innerWidth,window.innerHeight/4);
	}

	returnCanvas(i){
		return this.dc[i];
	}

  render() {
    return (
      <>
      <GlobalStyle />
      <Screen>
        <WaveCanvas>
          <Canvas id="canvas" ref={elem => this.canvas[0] = elem}></Canvas>
					<Canvas id="canvas" ref={elem => this.canvas[1] = elem}></Canvas>
        </WaveCanvas>
				<DJtabel>
					<Baf>
						<Tablebox key="0" canvas={()=>this.returnCanvas(0)}/>
						<Publicbox>&nbsp;</Publicbox>
						<Tablebox key="1" canvas={()=>this.returnCanvas(1)}/>
					</Baf>
				</DJtabel>
      </Screen>
      </>
    );
  }
}

// ========================================

ReactDOM.render(<Main />, document.getElementById("root"));