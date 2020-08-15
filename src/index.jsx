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

const WaveCanvas = styled.div``;

const Canvas = styled.canvas`
  margin:0;
	display: block;
	background: black;
`;

const DJtabel = styled.div`
	position: relative;
	display: flex;
	justify-content: center;
  width: 100%;
`;

const Publicbox = styled.div`
	width: 50px;
	height: 100%;
`;

class Main extends React.Component {
	constructor(){
		super();
		this.music = "";
		this.canvas = "";
		this.dc = [];
		this.canvas = [];

		this.DJbooth = 2;
	}

	componentDidMount() {
		// イベント登録
		window.onload =(e)=>{this.onLoadf(e)};
		window.onunload =(e)=>{this.onUnloadf(e)};
		window.onresize =(e)=>{this.onResize(e)};

		for(var i=0;i<this.DJbooth;i++){
			this.dc[i] = new DrawCanvas("canvas"+i,this.canvas[i],window.innerWidth,window.innerHeight/4);
		}
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
		for(var i=0;i<this.DJbooth;i++){
			this.dc[i].canvasResize(window.innerWidth,window.innerHeight/4);
		}
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
					{(()=>{
						const items = [];
						for (let i=0;i<this.DJbooth;i++) {
							const id = "canvas"+i;
							items.push(
								<Canvas key={id} id={id} ref={elem => this.canvas[i] = elem}></Canvas>
							);
						}
						return items;
					})()}
        </WaveCanvas>
				<DJtabel>
					{(()=>{
						const items = [];
						for (let i=0;i<this.DJbooth;i++) {
							const key = "table"+i;
							items.push(
								<Tablebox key={key} num={i} canvas={()=>this.returnCanvas(i)}/>
							);
							if(i+1!==this.DJbooth)items.push(<Publicbox key={i}>&nbsp;</Publicbox>);
						}
						return items;
					})()}
				</DJtabel>
      </Screen>
      </>
    );
  }
}

// ========================================

ReactDOM.render(<Main />, document.getElementById("root"));