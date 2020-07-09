import React from 'react';
import styled from 'styled-components';
import Music from "./music";

const BoxWrap = styled.div`
  width: 100%;
  height: 100%;
  background-color: #bbb;
`;

const HeadInputButton = styled.input.attrs(props => ({
    type:'button'
  }))`
  display: inline-block;
  vertical-align: middle;
  width: 10%;
  height: 50%;
`;

const VerticalRange = styled.input.attrs(props => ({
    orient:"vertical",
    type: "range"
  }))`
  writing-mode: bt-lr;
  -webkit-appearance: slider-vertical;
`;

const VolumeRange = styled(VerticalRange)`
  width: 10%;
  height: calc(100% - 20px);
`;

const RangeSlider = styled(VerticalRange)`
  width: 5%;
  height: calc(100% - 20px);
`;

const TimeRange = styled.input.attrs(props => ({
    type: "range"
  }))`
  width: 75%;
  height: 80%;
  display: inline-block;
  vertical-align: middle;
`;

const ControlBox = styled.div`
  width:100%;
  height: 80%;
  display: flex;
`;

const MusicEffect = styled.div`
  height:100%;
  background-color:yellow;
`;

const MusicControl = styled.div`
  height:20%;
  background-color:#333;
`;

const Navigation = styled.div`
  position: relative;
  width: 100%;
	top: 20px;
  left:0px;
	background-color: rgba(64, 64, 64, 0.3);
  pointer-events: auto;
`;

const NavigationPad = styled.div`
	padding: 15px 2px;
`;

const SelectBox = styled.div`
	padding: 2px 10px;
`;

const FileSelector = styled.div`
	padding: 10px;
`;

const MusicName = styled.div`
  margin: 0;
	padding: 10px;
	text-align: right;
	color: red;
  max-width: calc(100% - 20px);
	pointer-events: auto;
`;

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

export default class TableBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      musicName: "None",
      audioUrl: "",
      NUM_FREQUENCY_BUNDLES: 10,
    };
    this.dc = props.canvas;
    this.timeSeek = React.createRef();
    this.masterSlider = React.createRef();
    this.frequencyPreset = React.createRef();
    this.frequencySliders = [];
    for(var i=0;i<this.state.NUM_FREQUENCY_BUNDLES;i++){
      this.frequencySliders[i] = React.createRef();
    }

    this.music = new Music(this.state.NUM_FREQUENCY_BUNDLES,this.frequencySliders,this.timeSeek,this.masterSlider);

  }

  // 音声ファイルを読み込む
  loadAudio(url) {
    console.log("music set");
    if (this.music.isInitializedAudio()) {
      this.music.setAudio(url); //set
    } else {
      this.setState({audioUrl: url});
    }
  }

  // 音声ファイルの読み込み
  loadAudioFile(file) {
    if(!!file){
      this.setState({musicName:"Playing music is " + file.name + "."});
      let url = URL.createObjectURL(file);
      this.loadAudio(url);
      this.props.canvas().drawCanvas(url);
    }
  }

  // 再生ボタンを押下
  onClickPlayButton(event) {
    if (!this.music.isInitializedAudio()) {
      this.music.initializeAudio();
      this.loadAudio(this.state.audioUrl);
    }
    if (!this.music.isPlayAudio()) {
      this.music.playAudio();
    } else {
      this.music.stopAudio();
    }
  }

  // ファイルを選択
	onSelectedFile(event) {
		this.loadAudioFile(event.target.files[0]);
	}
	// プリセットを変更
	onChangedPreset(event) {
		let preset = FREQUENCIES_PRESETS[event.target.value];
		for (let i = 0; i < this.frequencySliders.length; ++i) {
			this.frequencySliders[i].current.value = preset[i];
		}
  }

  // 各周波数もリュームを変更
  onChangedFrequencyVolume(event) {
    this.frequencyPreset.current.value = -1;
  }

  render(){
    const mN = this.state.musicName;
    return(
      <BoxWrap>
        <ControlBox>
        <VolumeRange min="0" max="100" defaultValue="25" ref={this.masterSlider}/>
          <MusicEffect>
            {(()=>{
              const items = [];
              for (let i=0;i<this.state.NUM_FREQUENCY_BUNDLES;i++) {
                items.push(
                  <RangeSlider key={i} ref={this.frequencySliders[i]} type="range" min="0" max="200" defaultValue="100" title="" onChange={(e)=>this.onChangedFrequencyVolume(e)} />
                );
              }
              return items;
            })()}
          </MusicEffect>
        </ControlBox>
        <MusicControl>
            <HeadInputButton value="start" onClick={(e)=>this.onClickPlayButton(e)} />
            <TimeRange min="0" max="1000" defaultValue="0" ref={this.timeSeek}/>
          </MusicControl>
        <Navigation>
        <NavigationPad>
              <SelectBox>
                <select ref={this.frequencyPreset} onChange={(e)=>this.onChangedPreset(e)}>
                  {(()=>{
                    const option = ["デフォルト","ロック","ポップ","ダンス","ジャズ","古いラジオ","水中","低音","中音","高音"];
                    const items = [];
                    for (let i=0;i<option.length;i++) {
                      items.push(
                        <option key={i} value={i}>{option[i]}</option>
                      );
                    }
                    return items;
                  })()}
                </select>
              </SelectBox>
              <FileSelector colSpan={2} onChange={(e)=>this.onSelectedFile(e)}>
                <input type="file" accept="audio/*"/>
              </FileSelector>
        </NavigationPad>
        <MusicName>{mN}</MusicName>
        </Navigation>
      </BoxWrap>
    )
  }
}