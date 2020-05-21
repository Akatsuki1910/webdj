import React from 'react';
import ReactDOM from 'react-dom';
import styled, { css,createGlobalStyle } from 'styled-components';
import DFT from "./dft"
import DrawCanvas from "./drawCanvas";

// メインの処理
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
const NUM_SAMPLES = 1 << NUM_FREQUENCY_BUNDLES; // 2^10 = 1024

////////////////////////////////////////////////////////////////
// サウンド関連

let audioContext;
let audioElement;
let audioSource;
let scriptProcessor;

let audioPrevInputs;
let audioPrevOutputs;
let audioWorkBuffer;

let audioUrl = "music/tw067.mp3";

// イニシャライズされているか否か
function isInitializedAudio() {
	return audioContext != null;
}

// オーディオ関連の初期化
function initializeAudio() {
	// 処理用のバッファを初期化
	audioPrevInputs = [
		new Float32Array(NUM_SAMPLES),
		new Float32Array(NUM_SAMPLES)
	];
	audioPrevOutputs = [
		new Float32Array(NUM_SAMPLES),
		new Float32Array(NUM_SAMPLES)
	];
	audioWorkBuffer = new Float32Array(NUM_SAMPLES * 4); // FFT処理用のバッファ、処理サンプルの倍の複素数を収納できるようにする

	// WebAudio系の初期化
	audioContext = window.AudioContext != null ?
		new window.AudioContext() :
		new window.webkitAudioContext();

	scriptProcessor = audioContext.createScriptProcessor(NUM_SAMPLES, 2, 2);
	scriptProcessor.addEventListener("audioprocess", onAudioProcess);
	scriptProcessor.connect(audioContext.destination);

	audioElement = new Audio();
	audioElement.loop = true;
	audioElement.autoplay = true;
	audioElement.addEventListener("timeupdate", onUpdatedAudioTime);

	audioSource = audioContext.createMediaElementSource(audioElement);
	audioSource.connect(scriptProcessor);
}

// オーディオ関連の後処理
function terminateAudio() {
	audioElement.stop();
}

// 音声ファイルを読み込む
function loadAudio(url) {
	if (isInitializedAudio()) {
        audioElement.src = url;
	} else {
        audioUrl = url;
    }
    dc.drawCanvas(url);
}

// 音声ファイルの再生時間が更新
function onUpdatedAudioTime(event) {
	timeSeek.value = 1000 * (audioElement.currentTime / audioElement.duration);
}

function onMusicTime() {
	audioElement.currentTime = timeSeek.value * audioElement.duration / 1000;
}

// 音声ファイルが再生中か否か
function isPlayAudio() {
	return !audioElement.paused
}

// 音声ファイルを再生する
function playAudio() {
	if (!isPlayAudio()) {
		audioElement.play();
	}
}

// 音声ファイルを停止する
function stopAudio() {
	audioElement.pause();
}

// 音声の波形を処理
function onAudioProcess(event) {
	let input = event.inputBuffer;
	let output = event.outputBuffer;
	for (let i = 0; i < output.numberOfChannels; ++i) {
		let inputData = input.getChannelData(i);
		let outputData = output.getChannelData(i);
		let prevInput = audioPrevInputs[i];
		let prevOutput = audioPrevOutputs[i];

		// 前半に前回の入力波形、後半に今回の入力波形を実数を複素数に変換して作業用バッファに詰める
		for (let j = 0; j < NUM_SAMPLES; ++j) {
			// 前半
			let prevIndex = j * 2;
			audioWorkBuffer[prevIndex] = prevInput[j];
			audioWorkBuffer[prevIndex + 1] = 0.0;

			// 後半
			let nextIndex = (NUM_SAMPLES + j) * 2;
			audioWorkBuffer[nextIndex] = inputData[j];
			audioWorkBuffer[nextIndex + 1] = 0.0;

			// 今回の波形を保存
			prevInput[j] = inputData[j];
		}

		// FFTをかけて周波数
		DFT.fftHighSpeed(NUM_SAMPLES * 2, audioWorkBuffer);

		// 各周波数のボリュームを設定
		for (let j = 0; j < frequencySliders.length; ++j) {
			let volume = frequencySliders[j].value / 100.0;

			for (let k = 1 << j, kEnd = 1 << (j + 1); k < kEnd; ++k) {
				let positiveFq = k * 2;
				audioWorkBuffer[positiveFq] *= volume;
				audioWorkBuffer[positiveFq + 1] *= volume;

				let negativeFq = (NUM_SAMPLES * 2 - k) * 2;
				audioWorkBuffer[negativeFq] *= volume;
				audioWorkBuffer[negativeFq + 1] *= volume;
			}
		}

		// 直流部分のボリュームを設定
		let minFqVolume = frequencySliders[0].value / 100.0;
		audioWorkBuffer[0] *= minFqVolume;
		audioWorkBuffer[1] *= minFqVolume;

		// 最高周波数のボリュームを設定
		let maxFqVolume = frequencySliders[frequencySliders.length - 1].value / 100.0;
		audioWorkBuffer[NUM_SAMPLES * 2] *= maxFqVolume;
		audioWorkBuffer[NUM_SAMPLES * 2 + 1] *= maxFqVolume;

		// ビジュアライザの更新
		// updateFrequencyVisualizerParam(i, audioWorkBuffer);

		// 逆FFTをかける
		DFT.fftHighSpeed(NUM_SAMPLES * 2, audioWorkBuffer, true);

		// 前回の出力波形の後半と今回の出力波形の前半をクロスフェードさせて出力する
		let master = masterSlider.value / 100.0;
		for (let j = 0; j < NUM_SAMPLES; ++j) {
			let prev = prevOutput[j] * (NUM_SAMPLES - j) / NUM_SAMPLES;
			let next = audioWorkBuffer[j * 2] * j / NUM_SAMPLES;
			outputData[j] = (prev + next) * master;
			prevOutput[j] = audioWorkBuffer[(NUM_SAMPLES + j) * 2];
		}
	}
}

////////////////////////////////////////////////////////////////
// UI関連

let fileSelector;
let volumeButton;
let playButton;
let timeSeek;
let navigation;
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
	dc = new DrawCanvas(canvas);
	dc.drawCanvas(audioUrl);
	console.log("onLoad");

	// UIの初期化
	fileSelector = document.getElementById("fileSelector");
	fileSelector.addEventListener("change", onSelectedFile);
	volumeButton = document.getElementById("volume");
	volumeButton.addEventListener("click", onClickVolumeButton);
	playButton = document.getElementById("play");
	playButton.addEventListener("click", onClickPlayButton);
	timeSeek = document.getElementById("time");
	timeSeek.addEventListener("change", onMusicTime);
	navigation = document.getElementById("navigation");
	masterSlider = document.getElementById("master");
	masterSlider.addEventListener("change", onChangedMasterVolume);
	frequencySliders = new Array(NUM_FREQUENCY_BUNDLES);
	for (let i = 0; i < frequencySliders.length; ++i) {
		frequencySliders[i] = document.getElementById("frequency" + i);
		frequencySliders[i].addEventListener("change", onChangedFrequencyVolume);
	}
	frequencyPreset = document.getElementById("preset");
	frequencyPreset.addEventListener("change", onChangedPreset);
	musicName = document.getElementById("musicName");

	// その他の初期化
	onResize();
}

// 後処理
function onUnloadf(event) {
	console.log("onUnload");
	terminateAudio();
}

// 画面のサイズ変更
function onResize(event) {
	console.log("onResize");
	dc.canvasResize();
}

// ファイルをドラッグ
function onDragOver(event) {
	event.stopPropagation();
	event.preventDefault();
}

// ファイルをドロップ
function onDrop(event) {
	event.stopPropagation();
	event.preventDefault();
	loadAudioFile(event.dataTransfer.files[0]);
}

// ファイルを選択
function onSelectedFile(event) {
	loadAudioFile(event.target.files[0]);
}

// 音声ファイルの読み込み
function loadAudioFile(file) {
	musicName.innerText = "Playing music is " + file.name + ".";
	loadAudio(URL.createObjectURL(file));
}

// ボリュームボタンを押下
function onClickVolumeButton() {
	if (navigation.style.display === "none") {
		navigation.style.display = "block";
	} else {
		navigation.style.display = "none";
	}
}

// 再生ボタンを押下
function onClickPlayButton(event) {
	if (!isInitializedAudio()) {
		initializeAudio();
		loadAudio(audioUrl);
	}
	if (!isPlayAudio()) {
		playAudio();
	} else {
		stopAudio();
	}
}

// マスターボリュームを変更
function onChangedMasterVolume(event) {}

// 各周波数もリュームを変更
function onChangedFrequencyVolume(event) {
	frequencyPreset.value = -1;
}

// プリセットを変更
function onChangedPreset(event) {
	let preset = FREQUENCIES_PRESETS[event.target.value];
	for (let i = 0; i < frequencySliders.length; ++i) {
		frequencySliders[i].value = preset[i];
	}
}

// イベント登録
window.onload =(e)=>{onLoadf(e)};
window.onunload =(e)=>{onUnloadf(e)};
window.onresize =(e)=>{onResize(e)};
window.dragover =()=>{onDragOver()};
window.drop =()=>{onDrop()};

const GlobalStyle = createGlobalStyle`
body {
  margin: 0;
  overflow: hidden;
}
::-webkit-scrollbar {
  width: 0;
  height: 0;
}
`;

const HrStyle = css`
height: 0;
    margin: 0;
    padding: 0;
    border: 0;
`;

const Screen = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
`;

const Background = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(16, 16, 16, 1.0);
`;

const Canvas = styled.div`
  width: 100%;
  height: 100%;
`;

const Foreground = styled.div`
position: absolute;
width: 100%;
height: 100%;
pointer-events: none;
`;

const Header = styled.div`
  display: table;
  position: relative;
  width: calc(100vw - 30px);
  padding: 0 15px 0 15px;
  white-space: nowrap;
  line-height: 0;
  background-color: rgba(64, 64, 64, 0.5);
  pointer-events: auto;
`;

const HeadDiv = styled.div`
    display: table-cell;
    height: 50px;
    margin: 0 15px 0 15px;
    text-align: center;
    vertical-align: middle;
`;

const HeadInputButton = styled.input.attrs(props => ({
	type:'button'
}))`
  width: 32px;
  height: 32px;
  margin: 0 20px 0 20px;
  outline: none;
`;

const HeadInputRange = styled.input`
width: 90%;
height: 32px;
margin: 0 15px 0 15px;
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
padding: 15px 2px 15px 2px;
`;

const Separator = styled.hr`
${HrStyle}
margin-top: 5px;
    margin-bottom: 5px;
    border-top: 1px double rgb(92, 92, 92);
`;

const RangeTitle = styled.td`
padding: 2px 10px 2px 10px;
    text-align: center;
    font-size: small;
    color: rgb(192, 192, 192);
`;

const RangeSlider = styled.td`
padding: 2px 10px 2px 10px;
`;

const SelectTitle = styled.td`
padding: 2px 10px 2px 10px;
    text-align: center;
    font-size: small;
    color: rgb(192, 192, 192);
`;

const SelectBox = styled.td`
padding: 2px 10px 2px 10px;
    text-align: center;
`;

const FileSelector = styled.td`
padding: 10px 10px 10px 10px;
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

const MusicUrl = styled.a`
  &:link,
  &:visited,
  &:hover,
  &:active{
    color: rgb(192, 192, 192);
  }
`;



class Main extends React.Component {
  render() {
    return (
      <>
      <GlobalStyle />
      <Screen>
        <Background>
          <Canvas id="mainCanvas"></Canvas>
        </Background>

        <Foreground>
					<Header>
						<HeadDiv style={{width: 1}}>
							<HeadInputButton id="volume" value="volume" />
						</HeadDiv>
						<HeadDiv style={{width: 1}}>
								<HeadInputButton id="play" value="start" />
						</HeadDiv>
						<HeadDiv>
								<HeadInputRange id="time" type="range" min="0" max="1000" defaultValue="0" />
						</HeadDiv>
					</Header>

					<Navigation id="navigation">
						<NavigationPad>
								<table>
									<tbody className="equalizer">
									<tr>
										<td className="rangeTitle">MASTER</td>
										<td className="rangeSlider">
											<input id="master" min="0" max="100" type="range" defaultValue="25" title="" />
										</td>
									</tr>

									<tr>
										<td colSpan={2}>
											<Separator />
										</td>
									</tr>

									<tr>
										<RangeTitle>30</RangeTitle>
										<RangeSlider>
											<input id="frequency0" type="range" min="0" max="200" defaultValue="100" title="" />
										</RangeSlider>
									</tr>
									<tr>
										<RangeTitle>60</RangeTitle>
										<RangeSlider>
											<input id="frequency1" type="range" min="0" max="200" defaultValue="100" title="" />
										</RangeSlider>
									</tr>
									<tr>
										<RangeTitle>120</RangeTitle>
										<RangeSlider>
											<input id="frequency2" type="range" min="0" max="200" defaultValue="100" title="" />
										</RangeSlider>
									</tr>
									<tr>
										<RangeTitle>240</RangeTitle>
										<RangeSlider>
											<input id="frequency3" type="range" min="0" max="200" defaultValue="100" title="" />
										</RangeSlider>
									</tr>
									<tr>
										<RangeTitle>500</RangeTitle>
										<RangeSlider>
											<input id="frequency4" type="range" min="0" max="200" defaultValue="100" title="" />
										</RangeSlider>
									</tr>
									<tr>
										<RangeTitle>1k</RangeTitle>
										<RangeSlider>
											<input id="frequency5" type="range" min="0" max="200" defaultValue="100" title="" />
										</RangeSlider>
									</tr>
									<tr>
										<RangeTitle>2k</RangeTitle>
										<RangeSlider>
											<input id="frequency6" type="range" min="0" max="200" defaultValue="100" title="" />
										</RangeSlider>
									</tr>
									<tr>
										<RangeTitle>4k</RangeTitle>
										<RangeSlider>
											<input id="frequency7" type="range" min="0" max="200" defaultValue="100" title="" />
										</RangeSlider>
									</tr>
									<tr>
										<RangeTitle>8k</RangeTitle>
										<RangeSlider>
											<input id="frequency8" type="range" min="0" max="200" defaultValue="100" title="" />
										</RangeSlider>
									</tr>
									<tr>
										<RangeTitle>16k</RangeTitle>
										<RangeSlider>
											<input id="frequency9" type="range" min="0" max="200" defaultValue="100" title="" />
										</RangeSlider>
									</tr>

									<tr>
										<td colSpan={2}>
											<Separator />
										</td>
									</tr>

									<tr>
										<SelectTitle>PRESET</SelectTitle>
										<SelectBox>
											<select id="preset" title="">
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
										<td colSpan={2}>
												<Separator />
										</td>
									</tr>

									<tr>
										<FileSelector colSpan={2}>
											<input id="fileSelector" type="file" />
										</FileSelector>
									</tr>
									</tbody>
								</table>
						</NavigationPad>
					</Navigation>

					<MusicName id="musicName">
						<MusicUrl href="http://musmus.main.jp/">デフォルトBGM : MusMus</MusicUrl>
						<br />
						ドラッグ＆ドロップで任意の曲を再生可能
					</MusicName>
        </Foreground>
      </Screen>
      </>
    );
  }
}

// ========================================

ReactDOM.render(<Main />, document.getElementById("root"));