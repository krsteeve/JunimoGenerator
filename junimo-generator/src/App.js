import React from 'react';
import './App.css';
import Canvas from './Canvas';
import { SketchPicker } from 'react-color'

import ImagePicker from 'react-image-picker'

import img1 from './art-artistic-background-1851447.jpg';
import img2 from './background-beautiful-beauty-2033997.jpg';

const images = [img1, img2];

export default class App extends React.Component {
  state = {
    color: '#60aa3e',
    image: null,
  }

  render() {
    return (
      <div>
        <div className="App">
          <Canvas tintColor={this.state.color} tintImage={this.state.image}/>
          <SketchPicker 
            color = {this.state.color}
            onChange = {(color, event) => {
              this.setState({color: color.hex, image:null});
            }}/>
        </div>
        <div>
          <ImagePicker 
            images={images.map((image, i) => ({src: image, value: i}))}
            onPick={ (image) => {
              this.setState({image:image.src});
            }}/>
        </div>
      </div>
    );
  }
}
