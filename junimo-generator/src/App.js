import React from 'react';
import './App.css';
import Canvas from './Canvas';
import { SketchPicker } from 'react-color'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div>
          <Canvas/>
          <SketchPicker />
        </div>
      </header>
    </div>
  );
}

export default App;
