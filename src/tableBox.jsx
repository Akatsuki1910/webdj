import React from 'react';
import styled from 'styled-components';

const BoxWrap = styled.div`
  width: 50%;
  height: 100%;
  display: flex;
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
  width: 5%;
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

const RightBox = styled.div`
  width:95%;
`;

const MusicEffect = styled.div`
  height:80%;
  background-color:yellow;
`;

const MusicControl = styled.div`
  height:20%;
  background-color:#333;
`;


export default class TableBox extends React.Component {
  render(){
    return(
      <BoxWrap>
        <VolumeRange id="master" min="0" max="100" defaultValue="25" />
        <RightBox>
          <MusicEffect>
            {(()=>{
              const items = [];
              for (let i=0;i<10;i++) {
                const p = "frequency"+i;
                items.push(
                  <RangeSlider key={i} id={p} type="range" min="0" max="200" defaultValue="100" title="" />
                );
              }
              return items;
            })()}
          </MusicEffect>
          <MusicControl>
            <HeadInputButton id="play" value="start" />
            <TimeRange id="time" min="0" max="1000" defaultValue="0" />
          </MusicControl>
        </RightBox>
      </BoxWrap>
    )
  }
}