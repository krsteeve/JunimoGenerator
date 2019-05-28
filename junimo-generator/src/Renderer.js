import * as glMatrix from 'gl-matrix'

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple two-dimensional square.
//
export function initBuffers(gl) {

  // Create a buffer for the square's positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the square.

  const positions = [
     1.0,  1.0,
    -1.0,  1.0,
    -1.0, -1.0,
     1.0, -1.0,
  ];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(positions),
                gl.STATIC_DRAW);

  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

  const textureCoordinates = [
    // Front
    1.0,  0.0,
    0.0,  0.0,
    0.0,  1.0,
    1.0,  1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);

  const tintTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tintTextureCoordBuffer);

  const tintTextureCoordinates = [
    // Front
    1.0,  0.0,
    0.0,  0.0,
    0.0,  1.0,
    1.0,  1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tintTextureCoordinates), gl.DYNAMIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  const indices = [
    0, 1, 2,    2, 3, 0,
  ];

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    textureCoord: textureCoordBuffer,
    tintTextureCoord: tintTextureCoordBuffer,
    indices: indexBuffer,
  };
}

export function updateTextureCoordinates(gl, textureCoordBuffer, coordinates) {
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coordinates), gl.DYNAMIC_DRAW);
}

export function getTextureShaderProgram(gl) {
  // Vertex shader program
      
  const vsSource = `
  attribute vec4 aVertexPosition;
  attribute vec2 aTextureCoord;
  attribute vec2 aTintTextureCoord;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  varying highp vec2 vTextureCoord;
  varying highp vec2 vTintTextureCoord;

  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;
    vTintTextureCoord = aTintTextureCoord;
  }
  `;

  // Fragment shader program

  const fsSource = `
    precision highp float;

    varying highp vec2 vTextureCoord;
    varying highp vec2 vTintTextureCoord;

    uniform sampler2D uSampler;
    uniform sampler2D uTintSampler;

    uniform highp vec4 uTintColor;
    uniform float uBrightness;

    uniform bool uUseTintTexture;

    vec3 rgbToHsl(vec3 rgb) {
      float maxVal = max(max(rgb.x, rgb.y), rgb.z);
      float minVal = min(min(rgb.x, rgb.y), rgb.z);

      float L = (maxVal + minVal) / 2.0;
      float H = 0.0;
      float S = 0.0;

      if (maxVal != minVal) {
        float diff = maxVal - minVal;
        S = L > 0.5 ? (diff / (2.0 - maxVal - minVal)) : (diff / (maxVal + minVal));

        if (maxVal == rgb.x) {
          H = (rgb.y - rgb.z) / diff + (rgb.y < rgb.z ? 6.0 : 0.0);
        } else if (maxVal == rgb.y) {
          H = (rgb.z - rgb.x) / diff + 2.0;
        } else {
          H = (rgb.x - rgb.y) / diff + 4.0;
        }

        H /= 6.0;
      }

      return vec3(H, S, L);
    }

    float hueToRgb(float p, float q, float t) {
      if (t < 0.0) t += 1.0;
      if (t > 1.0) t -= 1.0;

      if (t < 1.0 / 6.0) return p + (q - p) * 6.0 * t;
      if (t < 1.0 / 2.0) return q;
      if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6.0;

      return p;
    }

    vec3 hslToRgb(vec3 hsl) {
      float R = 0.0;
      float G = 0.0;
      float B = 0.0;

      if (abs(hsl.y) < 0.000001) {
        R = hsl.z;
        G = hsl.z;
        B = hsl.z;
      } else {
        float Q = hsl.z < 0.5 ? hsl.z * (1.0 + hsl.y) : hsl.z + hsl.y - (hsl.z * hsl.y);
        float P = 2.0 * hsl.z - Q;

        R = hueToRgb(P, Q, hsl.x + 1.0 / 3.0);
        G = hueToRgb(P, Q, hsl.x);
        B = hueToRgb(P, Q, hsl.x - 1.0 / 3.0);
      }

      return vec3(R, G, B);
    }

    vec4 adjustBrightness(vec4 color, float brightness) {
      vec3 hsl = rgbToHsl(vec3(color));
      hsl.z += (hsl.z * brightness);

      return vec4(hslToRgb(hsl), color.w);
    }

    void main(void) {
      gl_FragColor = texture2D(uSampler, vTextureCoord) * 
        adjustBrightness(uUseTintTexture ? texture2D(uTintSampler, vTintTextureCoord) : uTintColor, uBrightness);
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attribute our shader program is using
  // for aVertexPosition and look up uniform locations.
  return {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
      tintTextureCoord: gl.getAttribLocation(shaderProgram, 'aTintTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
      uTintSampler: gl.getUniformLocation(shaderProgram, 'uTintSampler'),
      tintColor: gl.getUniformLocation(shaderProgram, 'uTintColor'),
      brightness: gl.getUniformLocation(shaderProgram, 'uBrightness'),
      useTintTexture: gl.getUniformLocation(shaderProgram, 'uUseTintTexture'),
    },
  };
}

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
export function loadTexture(gl, url, minMagFilter, textureCoordBuffer) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn off mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minMagFilter);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, minMagFilter);
    }

    if (textureCoordBuffer != null) {
      const aspect = image.width / image.height;

      var tintTextureCoordinates;
      if (aspect < 1.0) {
        tintTextureCoordinates = [
          1.0,  0.0,
          0.0,  0.0,
          0.0,  aspect,
          1.0,  aspect,
        ];
      } else {
        tintTextureCoordinates = [
          1.0 / aspect,  0.0,
          0.0,  0.0,
          0.0,  1.0,
          1.0 / aspect,  1.0,
        ];
      }

      updateTextureCoordinates(gl, textureCoordBuffer, tintTextureCoordinates);
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

export function drawStart(gl) {
  gl.clearColor(1.0, 1.0, 1.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

export function drawScene(gl, programInfo, buffers, texture, tint, tintTexture, brightness) {
  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  var mat4 = glMatrix.mat4;

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [-0.0, 0.0, -6.0]);  // amount to translate

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the texture coordinates from
  // the texture coordinate buffer into the textureCoord attribute.
  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.textureCoord);
  }

  // Tell WebGL how to pull out the texture coordinates from
  // the texture coordinate buffer into the textureCoord attribute.
  if (tintTexture != null) {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.tintTextureCoord);
    gl.vertexAttribPointer(
        programInfo.attribLocations.tintTextureCoord,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.tintTextureCoord);
  }

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

  gl.uniform4f(programInfo.uniformLocations.tintColor, tint.r / 255, tint.g / 255, tint.b / 255, 1);
  gl.uniform1f(programInfo.uniformLocations.brightness, brightness);
  gl.uniform1i(programInfo.uniformLocations.useTintTexture, tintTexture != null);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

  if (tintTexture != null) {
    gl.activeTexture(gl.TEXTURE0 + 1);
    gl.bindTexture(gl.TEXTURE_2D, tintTexture);
    gl.uniform1i(programInfo.uniformLocations.uTintSampler, 1);
  }

  {
    const offset = 0;
    const vertexCount = 6;
    const type = gl.UNSIGNED_SHORT;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
export function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
export function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
