import React from 'react';
import './App.css';
import Canvas from './Canvas';
import { SketchPicker } from 'react-color'

export default class App extends React.Component {
  state = {
    color: '#60aa3e'
  }

  render() {
    return (
      <div className="App">
        <Canvas tintColor={this.state.color}/>
        <SketchPicker 
          color = {this.state.color}
          onChange = {(color, event) => {
            this.setState({color: color.hex});
          }}/>
      </div>
    );
  }
}
