import React from 'react';
import ReactDOM from 'react-dom';
import styled, { createGlobalStyle } from 'styled-components';
import DrawCanvas from "./drawCanvas";
import Tablebox from "./tableBox";
import Music from "./music";

// 定数
const NUM_FREQUENCY_BUNDLES = 10;
const FREQUENCIES_PRESETS = [
	[100, 100, 100, 100, 100, 100, 100, 100, 100, 100], // デフォルト
	[118, 131, 125, 85, 46, 82, 108, 127, 136, 141], // ロック
	[87, 80, 106, 132, 138, 117, 92, 87, 87, 96], // ポップ
	[110, 134, 117, 76, 100, 127, 131, 122, 108, 82], // ダンス
	[117, 106, 76, 104, 73, 76, 96, 115, 125, 124], // ジャズ
	[0, 0, 0, 3, 13, 96, 129, 146, 152, 139], // 古いラジオ
	[120, 139, 127, 76, 8, 4, 0, 0, 0, 0], // 水中
	[150, 150, 150, 1, 1, 1, 1, 1, 1, 1], // 低音
	[1, 1, 1, 150, 150, 150, 1, 1, 1, 1], // 中音
	[1, 1, 1, 1, 1, 1, 150, 150, 150, 150], // 高音
];

let music = "";
let audioUrl = "";
// 音声ファイルを読み込む
function loadAudio(url) {
	if (music.isInitializedAudio()) {
		music.audioElement.src = url; //set
	} else {
		audioUrl = url;
	}
	dc.drawCanvas(url);
}

////////////////////////////////////////////////////////////////
// UI関連

let playButton;
let timeSeek;
let masterSlider;
let frequencySliders;
let frequencyPreset;
let musicName;

let canvas;
let dc;

// 初期化
function onLoadf(event) {
	//表示
	canvas = document.getElementById('mainCanvas');
	dc = new DrawCanvas(canvas,window.innerWidth,window.innerHeight/4);
	dc.drawCanvas(audioUrl);
	console.log("onLoad");

	// UIの初期化
	playButton = document.getElementById("play");
	playButton.addEventListener("click", onClickPlayButton);
	timeSeek = document.getElementById("time");
	// timeSeek.addEventListener("change", onMusicTime);
	masterSlider = document.getElementById("master");
	frequencySliders = new Array(NUM_FREQUENCY_BUNDLES);
	for (let i = 0; i < frequencySliders.length; ++i) {
		frequencySliders[i] = document.getElementById("frequency" + i);
		frequencySliders[i].addEventListener("change", onChangedFrequencyVolume);
	}
	frequencyPreset = document.getElementById("preset");
	musicName = document.getElementById("musicName");

	music = new Music(NUM_FREQUENCY_BUNDLES,frequencySliders,timeSeek,masterSlider);
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

// 音声ファイルの読み込み
function loadAudioFile(file) {
	musicName.innerText = "Playing music is " + file.name + ".";
	loadAudio(URL.createObjectURL(file));
}

// 再生ボタンを押下
function onClickPlayButton(event) {
	if (!music.isInitializedAudio()) {
		music.initializeAudio();
		loadAudio(audioUrl);
	}
	if (!music.isPlayAudio()) {
		music.playAudio();
	} else {
		music.stopAudio();
	}
}

// 各周波数もリュームを変更
function onChangedFrequencyVolume(event) {
	frequencyPreset.value = -1;
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

const Foreground = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	pointer-events: none;
`;

const Navigation = styled.div`
	position: absolute;
	top: 50px;
	bottom: 0;
	background-color: rgba(64, 64, 64, 0.3);
	overflow-x: scroll;
	pointer-events: auto;
`;

const NavigationPad = styled.div`
	padding: 15px 2px;
`;

const SelectTitle = styled.td`
	padding: 2px 10px;
	text-align: center;
	font-size: small;
	color: rgb(192, 192, 192);
`;

const SelectBox = styled.td`
	padding: 2px 10px;
  text-align: center;
`;

const FileSelector = styled.td`
	padding: 10px;
	text-align: center;
`;

const MusicName = styled.p`
	position: absolute;
	right: 0;
	bottom: 0;
	padding: 10px 10px 10px 10px;
	text-align: right;
	color: rgb(192, 192, 192);
	pointer-events: auto;
`;

class Main extends React.Component {
		// ファイルを選択
		onSelectedFile(event) {
			loadAudioFile(event.target.files[0]);
		}
		// プリセットを変更
		onChangedPreset(event) {
			let preset = FREQUENCIES_PRESETS[event.target.value];
			for (let i = 0; i < frequencySliders.length; ++i) {
				frequencySliders[i].value = preset[i];
			}
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
						<Tablebox key="left"/>
						<Publicbox>&nbsp;</Publicbox>
						<Tablebox key="right"/>
					</Baf>
				</DJtabel>

        <Foreground>

					<Navigation id="navigation">
						<NavigationPad>
								<table>
									<tbody className="equalizer">
									<tr>
										<SelectTitle>PRESET</SelectTitle>
										<SelectBox>
											<select id="preset" title="" onChange={(e)=>this.onChangedPreset(e)}>
												<option value="0">デフォルト</option>
												<option value="1">ロック</option>
												<option value="2">ポップ</option>
												<option value="3">ダンス</option>
												<option value="4">ジャズ</option>
												<option value="5">古いラジオ</option>
												<option value="6">水中</option>
												<option value="7">低音</option>
												<option value="8">中音</option>
												<option value="9">高音</option>
											</select>
										</SelectBox>
									</tr>

									<tr>
										<FileSelector colSpan={2} onChange={(e)=>this.onSelectedFile(e)}>
											<input id="fileSelector" type="file" />
										</FileSelector>
									</tr>
									</tbody>
								</table>
						</NavigationPad>
					</Navigation>

					<MusicName id="musicName">MusMus</MusicName>
        </Foreground>
      </Screen>
      </>
    );
  }
}

// ========================================

ReactDOM.render(<Main />, document.getElementById("root"));