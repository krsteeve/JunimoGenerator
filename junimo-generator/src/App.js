import React from 'react';
import './App.css';
import Canvas from './Canvas';
import { SketchPicker } from 'react-color'
import Slider from 'react-input-slider';

import ImagePicker from 'react-image-picker'
import 'react-image-picker/dist/index.css'

import img1 from './art-artistic-background-1851447.jpg';
import img2 from './background-beautiful-beauty-2033997.jpg';
import img3 from './art-beautiful-bloom-1037994.jpg';
import img4 from './background-beautiful-bloom-414667.jpg';
import img5 from './background-biology-blue-1426718.jpg';
import img6 from './blur-bright-color-751374.jpg';
import img7 from './color-conifer-daylight-1179229.jpg';

const images = [img1, img2, img3, img4, img5, img6, img7];

export default class App extends React.Component {
  state = {
    color: '#60aa3e',
    image: null,
    normalness: 0,
    brightness: 50,
    darkness: -50,
  }

  render() {
    return (
      <div classname="Top">
        
        <div className="App">
          <div>Junimo Generator <br/>
          <Canvas 
            tintColor={this.state.color} 
            tintTexture={this.state.image} 
            normalnessRatio={this.state.normalness / 100}
            brightnessRatio={this.state.brightness / 100}
            darknessRatio={this.state.darkness / 100}
          />
          </div>
          <div className="ImageSettings">
            <SketchPicker 
              color = {this.state.color}
              onChange = {(color, event) => {
                this.setState({color: color.hex, image:null});
                console.log(this.state.image);
              }}/>
              Main areas: {this.state.normalness} <br/>
              <Slider axis="x" x={this.state.normalness} xmin={-100} onChange={({x}) => this.setState({normalness:x})}/><br/>
              Bright areas: {this.state.brightness} <br/>
              <Slider axis="x" x={this.state.brightness} xmin={-100} onChange={({x}) => this.setState({brightness:x})}/><br/>
              Dark areas: {this.state.darkness} <br/>
              <Slider axis="x" x={this.state.darkness} xmin={-100} onChange={({x}) => this.setState({darkness:x})}/>
            </div>
        </div>
        <div>
          <ImagePicker
            images={images.map((image, i) => ({src: image, value: i}))}
            onPick={ (image) => {
              console.log(image.src);
              this.setState({image:image.src});
            }}/>
        </div>
      </div>
    );
  }
}
