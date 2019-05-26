import React, { Component } from 'react';
import raf from 'raf';
import * as renderer from './Renderer'
import junimo from './junimo-source.png'

 
export default class Canvas extends Component {
 
  componentDidMount() {
      const canvas = document.querySelector('#glcanvas');
      const gl = canvas.getContext('webgl');

        // If we don't have a GL context, give up now
        if (!gl) {
          alert('Unable to initialize WebGL. Your browser or machine may not support it.');
          return;
        }

        this.rafHandle = raf(this.renderGlScene.bind(this, gl));
      
        // Vertex shader program
      
        const vsSource = `
          attribute vec4 aVertexPosition;
          attribute vec2 aTextureCoord;
      
          uniform mat4 uModelViewMatrix;
          uniform mat4 uProjectionMatrix;
      
          varying highp vec2 vTextureCoord;
      
          void main(void) {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            vTextureCoord = aTextureCoord;
          }
        `;
      
        // Fragment shader program
      
        const fsSource = `
          varying highp vec2 vTextureCoord;
      
          uniform sampler2D uSampler;
      
          void main(void) {
            gl_FragColor = texture2D(uSampler, vTextureCoord);
          }
        `;
      
        // Initialize a shader program; this is where all the lighting
        // for the vertices and so forth is established.
        this.shaderProgram = renderer.initShaderProgram(gl, vsSource, fsSource);
      
        // Collect all the info needed to use the shader program.
        // Look up which attribute our shader program is using
        // for aVertexPosition and look up uniform locations.
        this.programInfo = {
          program: this.shaderProgram,
          attribLocations: {
            vertexPosition: gl.getAttribLocation(this.shaderProgram, 'aVertexPosition'),
            textureCoord: gl.getAttribLocation(this.shaderProgram, 'aTextureCoord'),
          },
          uniformLocations: {
            projectionMatrix: gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix'),
            uSampler: gl.getUniformLocation(this.shaderProgram, 'uSampler'),
          },
        };
      
        // Here's where we call the routine that builds all the
        // objects we'll be drawing.
        this.buffers = renderer.initBuffers(gl);
      
        console.log(junimo);
        this.texture = renderer.loadTexture(gl, junimo);
      
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }
 
    renderGlScene(gl, programs) {
      
      renderer.drawScene(gl, this.programInfo, this.buffers, this.texture);

      this.rafHandle = raf(this.renderGlScene.bind(this, gl, programs));
  }
 
    render() {
        return (
          <canvas id="glcanvas" width="640" height="480"></canvas>
        );
    }
}