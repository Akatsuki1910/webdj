import React from 'react';
import styled, {css} from 'styled-components';
import Music from "./music";
import Tsumami from './tsumami';

const flexStyle = css`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
`

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
  width: 50px;
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
  max-height: 200px;
  display: flex;
`;

const MusicEffect = styled.div`
  height:100%;
  background-color:yellow;
  display:none;
`;

const MusicControl = styled.div`
  height:10%;
  background-color:#333;
  padding:10px;
  ${flexStyle}
`;

const Navigation = styled.div`
  height:10%;
`;

const FileSelector = styled.div`
	padding: 10px;
`;

const MusicName = styled.div`
	padding: 10px;
	text-align: right;
	color: red;
`;

const TsumamiDiv = styled.div`
  width: 100%;
  ${flexStyle}
`;

const TsumamiBox = styled.div`
  display:inline-block;
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
    this.num = props.num;
    this.dc = props.canvas;
    this.timeSeek = React.createRef();
    this.masterSlider = React.createRef();
    this.frequencyPreset = React.createRef();
    this.frequencySliders = [];
    for(var i=0;i<this.state.NUM_FREQUENCY_BUNDLES;i++){
      this.frequencySliders[i] = React.createRef();
    }

    this.tsumami = React.createRef();
  }

  componentDidMount(){
    let tsumamiValue = [];
    const eN=[0,3,6];
    for(var i=0;i<3;i++){
      const tfc = this.frequencySliders[eN[i]].current;
      tsumamiValue[i] = (() => {
        const val = Object.create(null);
        Object.defineProperty(val, 'value', {
          set: (value) => {
            tfc.value = Math.round(value)+100;
            this.onChangedFrequencyVolume();
          }
        });
        return val;
      })();

      const option = {
        obj: tsumamiValue[i],
        mode: "center",
        centerValue:100,
        target:document.getElementById("tsumami"+this.num+i)
      }

      new Tsumami(option);
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
  onChangedFrequencyVolume() {
    const efectorNum = [[0,1,2],[3,4,5],[6,7,8,9]];

    for(var i=0;i<efectorNum.length;i++){
      var eN = efectorNum[i];
      for(var l=1;l<eN.length;l++){
        this.frequencySliders[eN[l]].current.value = this.frequencySliders[eN[0]].current.value;
      }
    }
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
                  <RangeSlider key={i} ref={this.frequencySliders[i]} type="range" min="0" max="200" defaultValue="100" title="" onChange={(e)=>this.onChangedFrequencyVolume()} />
                );
              }
              return items;
            })()}
          </MusicEffect>
          <TsumamiDiv>
            {(()=>{
              const items = [];
              for (let i=0;i<3;i++) {
                const tsumamiId = "tsumami"+this.num+i;
                items.push(
                  <TsumamiBox key={tsumamiId} id={tsumamiId} ref={this.tsumami}></TsumamiBox>
                );
              }
              return items;
            })()}
          </TsumamiDiv>
        </ControlBox>
        <MusicControl>
          <HeadInputButton value="start" onClick={(e)=>this.onClickPlayButton(e)} />
          <TimeRange min="0" max="1000" defaultValue="0" ref={this.timeSeek}/>
        </MusicControl>
        <Navigation>
          <FileSelector onChange={(e)=>this.onSelectedFile(e)}>
            <input type="file" accept="audio/*"/>
          </FileSelector>
          <MusicName>{mN}</MusicName>
        </Navigation>
      </BoxWrap>
    )
  }
}