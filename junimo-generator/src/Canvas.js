import React, { Component } from 'react';
import raf from 'raf';
import * as renderer from './Renderer'
import junimoOutline from './junimo-outline.png'
import junimoMain from './junimo-main.png'
import junimoDark from './junimo-dark.png'
import junimoLight from './junimo-light.png'
import junimoCheeks from './junimo-cheeks.png'

var Color = require('color');
 
export default class Canvas extends Component {

  state = {
  }
 
  componentDidMount() {
      const canvas = document.querySelector('#glcanvas');
      const gl = canvas.getContext('webgl');

        // If we don't have a GL context, give up now
        if (!gl) {
          alert('Unable to initialize WebGL. Your browser or machine may not support it.');
          return;
        }

        this.rafHandle = raf(this.renderGlScene.bind(this, gl));

        this.programInfo = renderer.getTextureShaderProgram(gl);
      
        // Here's where we call the routine that builds all the
        // objects we'll be drawing.
        this.buffers = renderer.initBuffers(gl);
      
        this.textures = [
          {texture: renderer.loadTexture(gl, junimoOutline, gl.NEAREST), tint:{r:0, g:0, b:0, a:1}, brightness:0},
          {texture: renderer.loadTexture(gl, junimoMain, gl.NEAREST), tint:{r:0, g:0, b:0, a:1}, brightness:0},
          {texture: renderer.loadTexture(gl, junimoDark, gl.NEAREST), tint:{r:0, g:0, b:0, a:1}, brightness:-0.5},
          {texture: renderer.loadTexture(gl, junimoLight, gl.NEAREST), tint:{r:0, g:0, b:0, a:1}, brightness:0.5},
          {texture: renderer.loadTexture(gl, junimoCheeks, gl.NEAREST), tint:{r:215, g:164, b:166, a:1}, brightness:0},
        ];

        this.updateColors();
      
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }

    componentDidUpdate() {
      this.updateColors();
    }

    updateColors() {
      var color = Color(this.props.tintColor);

      this.textures[1].tint = color.object();
      this.textures[2].tint = color.object();
      this.textures[3].tint = color.object();
    }
 
    renderGlScene(gl, programs) {

      renderer.drawStart(gl);

      this.textures.forEach(function(texture, index) {
        renderer.drawScene(gl, this.programInfo, this.buffers, texture.texture, texture.tint, null, texture.brightness);
      }, this);

      this.rafHandle = raf(this.renderGlScene.bind(this, gl, programs));
  }
 
    render() {
        return (
          <canvas id="glcanvas" width="640" height="480"></canvas>
        );
    }
}