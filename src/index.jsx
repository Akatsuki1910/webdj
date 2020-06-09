import React from 'react';
import ReactDOM from 'react-dom';
import styled, { createGlobalStyle } from 'styled-components';
import DrawCanvas from "./drawCanvas";
import Tablebox from "./tableBox";

let music = "";
let audioUrl = "";

let canvas;
let dc;

// 初期化
function onLoadf(event) {
	//表示
	canvas = document.getElementById('mainCanvas');
	dc = new DrawCanvas(canvas,window.innerWidth,window.innerHeight/4);
	dc.drawCanvas(audioUrl);
	console.log("onLoad");

	// その他の初期化
	onResize();
}

// 後処理
function onUnloadf(event) {
	console.log("onUnload");
	music.terminateAudio();
}

// 画面のサイズ変更
function onResize(event) {
	console.log("onResize");
	dc.canvasResize(window.innerWidth,window.innerHeight/4);
}

// イベント登録
window.onload =(e)=>{onLoadf(e)};
window.onunload =(e)=>{onUnloadf(e)};
window.onresize =(e)=>{onResize(e)};

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

	testlog(){
		console.log("a");
	}

  render() {
    return (
      <>
      <GlobalStyle />
      <Screen>
        <WaveCanvas>
          <Canvas id="mainCanvas"></Canvas>
					<Canvas id="mainCanvas"></Canvas>
        </WaveCanvas>
				<DJtabel>
					<Baf>
						<Tablebox key="left" value="1"/>
						<Publicbox>&nbsp;</Publicbox>
						<Tablebox key="right" value="2"/>
					</Baf>
				</DJtabel>
      </Screen>
      </>
    );
  }
}

// ========================================

ReactDOM.render(<Main />, document.getElementById("root"));