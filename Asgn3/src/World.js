// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }`

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform sampler2D u_Sampler3;
    uniform sampler2D u_Sampler4;
    uniform int u_whichTexture;
    void main() {
        if (u_whichTexture == 0) {                   // Use color
            gl_FragColor = u_FragColor;
          
          } else if (u_whichTexture == -1) {           // Use UV debug color
            gl_FragColor = vec4(v_UV,1.0,1.0);
          
          } else if (u_whichTexture == 1) {            // Use texture0 (sky)
            gl_FragColor = texture2D(u_Sampler0, v_UV);
          
          } else if (u_whichTexture == 2) {            // Use texture1 (grass)
            gl_FragColor = texture2D(u_Sampler1, v_UV);

          } else if (u_whichTexture == 3) {
            gl_FragColor = texture2D(u_Sampler2, v_UV); //trunk

          } else if (u_whichTexture == 4) {
            gl_FragColor = texture2D(u_Sampler3, v_UV); //sand

          } else if (u_whichTexture == 5) {
            gl_FragColor = texture2D(u_Sampler4, v_UV); //leaves

          }else {                                     // Error, put Redish
            gl_FragColor = vec4(1,.2,.2,1);
          
        }
    }`

// global
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_whichTexture;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    // gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL); // Ensure closer objects overwrite farther ones
    gl.clearDepth(1.0); // Set depth buffer to maximum depth
    // gl.disable(gl.CULL_FACE);

    
}

function connectVariableToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return;
    }

    // // Get the storage location of a_Position
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of u_Sampler
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler');
        return false;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1'); 
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return false;
    }

    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2'); 
    if (!u_Sampler2) {
        console.log('Failed to get the storage location of u_Sampler2');
        return false;
    }

    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3'); 
    if (!u_Sampler3) {
        console.log('Failed to get the storage location of u_Sampler3');
        return false;
    }


    u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4'); 
    if (!u_Sampler4) {
        console.log('Failed to get the storage location of u_Sampler4');
        return false;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
    
}

const POINT = 0
const TRIANGLE = 1
const CIRCLE = 2
let currentSegmentCount = 10;
let g_selectedColor=[1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 10.0;
let g_selectedType = POINT;
let g_globalAngle = 0;
let g_yellowAngle = 15;
let g_purpleAngle = -90;
let g_yellowAnimation = false;
let feetSlideAnimation = false;
let tailAnimation = false;
let g_feetAngle = 0;
let g_tailAngle = 0;


let isDragging = false;
let lastX = 0;
let lastY = 0;
let yaw = -90;  // Start looking forward (-Z)
let pitch = 0;  // Vertical look angle

let rotationX = 0;
let rotationY = 0;
let rotationZ = 0;

let forward = [0, 0, -1];  // Forward direction
let right = [1, 0, 0];      // Right direction (perpendicular to forward)
const speed = 0.1; // Movement speed
const turnSpeed = 2; 
let turnedBefore = false;

function addMouseEventsForCamera() {
    canvas.addEventListener('mousedown', (event) => {
        isDragging = true;
        turnedBefore = true;
        lastX = event.clientX;
        lastY = event.clientY;
    });
    
    canvas.addEventListener('mousemove', (event) => {
        if (isDragging) {
            let deltaX = event.clientX - lastX;
            let deltaY = event.clientY - lastY;
    
            const sensitivity = 0.2;
            yaw += deltaX * sensitivity;
            pitch -= deltaY * sensitivity;
    
            // Limit pitch to prevent flipping
            pitch = Math.min(Math.max(pitch, -89), 89);
    
            lastX = event.clientX;
            lastY = event.clientY;
    
            updateCameraVectors();
            updateViewMatrix();
        }
    });
    
    
    
    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
    });
}

function updateViewMatrix() {
    // Set target point based on updated forward vector
    g_at[0] = g_eye[0] + forward[0];
    g_at[1] = g_eye[1] + forward[1];
    g_at[2] = g_eye[2] + forward[2];

    let viewMatrix = new Matrix4();
    viewMatrix.setLookAt(
        g_eye[0], g_eye[1], g_eye[2], // Eye position
        g_at[0], g_at[1], g_at[2],    // Look-at position
        g_up[0], g_up[1], g_up[2]     // Up direction
    );

    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    renderAllShapes();
}



function updateCameraVectors() {
    let radYaw = (yaw * Math.PI) / 180;
    let radPitch = (pitch * Math.PI) / 180;

    // Compute new forward vector
    forward = [
        Math.cos(radPitch) * Math.cos(radYaw),
        Math.sin(radPitch),
        Math.cos(radPitch) * Math.sin(radYaw),
    ];

    // Normalize forward vector
    let length = Math.hypot(forward[0], forward[1], forward[2]);
    forward = forward.map((val) => val / length);

    // Compute the right vector (perpendicular to forward and up)
    right = [
        forward[2] * g_up[1] - forward[1] * g_up[2],
        forward[0] * g_up[2] - forward[2] * g_up[0],
        forward[1] * g_up[0] - forward[0] * g_up[1],
    ];

    // Normalize right vector
    length = Math.hypot(right[0], right[1], right[2]);
    right = right.map((val) => val / length);
}

function getRandomPosition() {
    let x = Math.floor(Math.random() * g_map.length);
    let y = Math.floor(Math.random() * g_map[0].length);

    // Collision with trees
    let collision = trees.some(tree => tree.x === x && tree.y === y);
    if (collision) {
        return getRandomPosition(); // Try again
    }

    // Collision with water (optional)
    collision = waterTiles.some(tile => tile.x === x && tile.y === y);
    if (collision) {
        return getRandomPosition(); // Try again
    }

    // Collision with terrain (g_map)
    if (g_map[x][y] > 0) { // Check if the terrain height at (x, y) is greater than 0
        return getRandomPosition(); // Try again
    }

    console.log(x, y);
    return { x: x, y: y };
    
}





function addActionsforHTMLUI(){

    // document.getElementById('drawTrianglesButton').addEventListener('click', renderAllTriangles);

    document.getElementById('animationYellowOffButton').onclick = function() { g_yellowAnimation=false };
    document.getElementById('animationYellowOnButton').onclick = function() { g_yellowAnimation=true };

    document.getElementById('feetSlideOn').onclick = function() { feetSlideAnimation=true };
    document.getElementById('feetSlideOff').onclick = function() { feetSlideAnimation=false };

    document.getElementById('tailOn').onclick = function() { tailAnimation=true };
    document.getElementById('tailOff').onclick = function() { tailAnimation=false };
    //slider
    // document.getElementById('angleSlide').addEventListener('mouseup', function() { g_globalAngle = this.ariaValueMax; renderAllShapes(); });
    document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });

    document.getElementById('yellowSlide').addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes(); });

    document.getElementById('purpleSlide').addEventListener('mousemove', function() { g_purpleAngle = this.value; renderAllShapes(); });

    document.getElementById('feetSlide').addEventListener('mousemove', function() { g_feetAngle = this.value; renderAllShapes(); });


}


function initTextures() {

    // Create the image object
    var image = new Image();
    if (!image) {
      console.log('Failed to create the image object');
      return false;
    }
  
    // Register the event handler to be called on loading an image
    image.onload = function() {
      sendTextureToTEXTURE0(image);
    }
  
    // Tell the browser to load an image
    image.src = 'sky.jpg';


    var grassImage = new Image();
    if (!grassImage) {
        console.log('Failed to create the image object');
        return false;
      }
    grassImage.onload = function() {
        sendTextureToTEXTURE1(grassImage);
    }
    grassImage.src = 'grass.jpg';

    // tree
    var treeImage = new Image();
    if (!treeImage) {
        console.log('Failed to create the image object');
        return false;
      }
      treeImage.onload = function() {
        sendTextureToTEXTURE2(treeImage);
    }
    treeImage.src = 'treeTrunk.jpg';


    var sandImage = new Image();
    if (!sandImage) {
        console.log('Failed to create the image object');
        return false;
      }
      sandImage.onload = function() {
        sendTextureToTEXTURE3(sandImage);
    }
    sandImage.src = 'sand.jpg'; 




    var leavesImage = new Image();
    if (!leavesImage) {
        console.log('Failed to create the leavesImage object');
        return false;
      }
      leavesImage.onload = function() {
        sendTextureToTEXTURE4(leavesImage);
    }
    leavesImage.src = 'leaves.png'; 
    //can add more textures
    return true;
  }
  
  function sendTextureToTEXTURE0(image) {

    // Create a texture object
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    
    
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler0, 0);

    console.log("finished loadTexture");
  }

  function sendTextureToTEXTURE4(image) {

    // Create a texture object
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    
    
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler4, 4);

    console.log("finished loadTexture");
  }

  function sendTextureToTEXTURE1(image) { 
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the grass texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE1); // Use texture unit 1
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    gl.uniform1i(u_Sampler1, 1); 
    console.log("finished load Grass Texture");

}

function sendTextureToTEXTURE2(image) { 
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the grass texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE2); // Use texture unit 1
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    gl.uniform1i(u_Sampler2, 2); 
    console.log("finished load Grass Texture");

}

function sendTextureToTEXTURE3(image) { 
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the grass texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE3); // Use texture unit 1
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    gl.uniform1i(u_Sampler3, 3); 
    console.log("finished load Sand Texture");

}


function main() {

  setupWebGL();
  connectVariableToGLSL();
  
  addActionsforHTMLUI();
  addMouseEventsForCamera();
  updateViewMatrix();


  document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w': // Move forward
            g_eye[0] += forward[0] * speed;
            g_eye[1] += forward[1] * speed;
            g_eye[2] += forward[2] * speed;
            break;
        case 's': // Move backward
            g_eye[0] -= forward[0] * speed;
            g_eye[1] -= forward[1] * speed;
            g_eye[2] -= forward[2] * speed;
            break;
        case 'a': // Strafe left
            if (turnedBefore) {
                g_eye[0] += right[0] * speed;
                g_eye[1] += right[1] * speed;
                g_eye[2] += right[2] * speed;
            } else{
                g_eye[0] -= right[0] * speed;
                g_eye[1] -= right[1] * speed;
                g_eye[2] -= right[2] * speed;
            }
            break;
        case 'd': // Strafe right
        if (turnedBefore) {
            g_eye[0] -= right[0] * speed;
            g_eye[1] -= right[1] * speed;
            g_eye[2] -= right[2] * speed;
        } else{
            g_eye[0] += right[0] * speed;
            g_eye[1] += right[1] * speed;
            g_eye[2] += right[2] * speed;
        }
            break;
        case 'q': // Rotate left (counterclockwise)
            yaw -= turnSpeed;
            turnedBefore = true;
            updateCameraVectors();
            break;
        case 'e': // Rotate right (clockwise)
            yaw += turnSpeed;
            turnedBefore = true;
            updateCameraVectors();
            break;
    }
    updateViewMatrix(); // Refresh camera view after movement
});

  initTextures();

  // Specify the color for clearing <canvas>
//   gl.clearColor(0, 0, 0, 1); //173/255, 216/255, 230/255
  gl.clearColor(173/255, 216/255, 230/255, 1);

  // Clear <canvas>
//   gl.clear(gl.COLOR_BUFFER_BIT);
//   renderAllShapes();
  requestAnimationFrame(tick);
}


// g_globalAngle = this.value
var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;


function tick() {
    g_seconds = performance.now()/1000.0-g_startTime
    // console.log(g_seconds);

    updateAnimationAngles();

    renderAllShapes();

    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
    if (g_yellowAnimation) {
        g_yellowAngle = (15*Math.sin(3*g_seconds));
    }

    if (feetSlideAnimation) {
        g_feetAngle = (10*Math.sin(10*g_seconds))
    }

    if (tailAnimation) {
        g_tailAngle= (10*Math.sin(3*g_seconds));
    }
}

function drawPsyduckFace(matrix) {
    gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

    // gl.uniform1i(u_whichTexture, 2)

    const face = new Sphere();
    face.color = [1.0, 0.85, 0.25, 1.0];
    face.matrix.set(matrix);
    face.matrix.scale(1.5, 1.2, 1.3);
    face.render();

    const hair1 = new Cube();
    hair1.color = [0, 0, 0, 1.0]; 
    hair1.matrix.set(matrix);
    hair1.matrix.scale(0.05, 0.7, 0.05); 
    hair1.matrix.translate(0, 1.4, -0.5); 
    hair1.render();

    const hair2 = new Cube();
    hair2.color = [0, 0, 0, 1.0];  
    hair2.matrix.set(matrix);

    // hair2.matrix.translate(-2.5, 0, 0);
    hair2.matrix.rotate(10, 0, 0, 1);
    // hair2.matrix.translate(2.5, 0, 0);

    hair2.matrix.scale(0.05, 0.7, 0.05); 
    hair2.matrix.translate(0, 1.4, -0.5); 
    hair2.render();

    const hair3 = new Cube();
    hair3.color = [0, 0, 0, 1.0];  
    hair3.matrix.set(matrix);
    hair3.matrix.rotate(-10, 0, 0, 1);
    hair3.matrix.scale(0.05, 0.7, 0.05); 
    hair3.matrix.translate(0, 1.4, -0.5); 
    hair3.render();



    const beak = new Sphere();
    beak.color = [0.9, 0.9, 0.7, 0.9];
    beak.matrix.set(matrix);
    beak.matrix.rotate(7, 1, 0, 0);
    beak.matrix.translate(0, -0.5, 1.5); 
    beak.matrix.scale(0.6, 0.3, 1); 
    beak.render();


    const beakopen = new Sphere();
    beakopen.color = [0, 0, 0, 1];
    beakopen.matrix.set(matrix);
    beakopen.matrix.rotate(7, 1, 0, 0);
    beakopen.matrix.translate(0, -0.5, 1.5); 
    beakopen.matrix.scale(0.61, 0.1, 1.01); 
    beakopen.render();

    // gl.uniform1i(u_whichTexture, 2)
    const eye = new Sphere();
    eye.color = [1.0, 1.0, 1.0, 1.0]; 
    eye.matrix.set(matrix);
    eye.matrix.translate(-0.5, 0.3, 1); 
    eye.matrix.scale(0.4, 0.3, 0.4); 
    eye.render();

    const eye2 = new Sphere();
    eye2.color = [1.0, 1.0, 1.0, 1.0];
    eye2.matrix.set(matrix);
    eye2.matrix.translate(0.5, 0.3, 1);
    eye2.matrix.scale(0.4, 0.3, 0.4);
    eye2.render();

    const pupil = new Sphere();
    pupil.color = [0.0, 0.0, 0.0, 1.0];
    pupil.matrix.set(matrix);
    pupil.matrix.translate(-0.6, 0.4, 1.3);
    pupil.matrix.scale(0.1, 0.1, 0.1);
    pupil.render();

    const pupil2 = new Sphere();
    pupil2.color = [0.0, 0.0, 0.0, 1.0];
    pupil2.matrix.set(matrix);
    pupil2.matrix.translate(0.6, 0.4, 1.3); 
    pupil2.matrix.scale(0.1, 0.1, 0.1);
    pupil2.render();
}


function drawPsyduckBody(matrix) {

    // gl.uniform1i(u_whichTexture, 2)
    gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

    // Torso
    const torso = new Sphere();
    torso.textureNum = 0;
    torso.color = [1.0, 0.8, 0.2, 1.0];
    torso.matrix.set(matrix);
    torso.matrix.translate(0, -1.9, 0); 
    torso.matrix.scale(1.6, 1.8, 1.5); 
    torso.render();

    // Left Arm
    const leftArm = new Sphere();
    leftArm.color = [1.0, 0.82, 0.25, 1.0];
    leftArm.matrix.set(matrix);
    leftArm.matrix.translate(-1.4, -1.5, 0);
    leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1);
    const leftArmMat = new Matrix4(leftArm.matrix);
    leftArm.matrix.scale(0.9, 0.5, 0.3);
    leftArm.render();

    const leftArm2 = new Sphere();
    leftArm2.color = [1.0, 0.82, 0.25, 1.0];
    leftArm2.matrix = new Matrix4(leftArmMat); 

    leftArm2.matrix.translate(-0.6, 0, 0);
    leftArm2.matrix.rotate(-g_purpleAngle, 0, 0, 1);

    leftArm2.matrix.translate(0.6, 0, 0);

    leftArm2.matrix.scale(0.8, 0.3, 0.5);
    leftArm2.render();


    const rightArm = new Sphere();
    rightArm.color = [1.0, 0.82, 0.25, 1.0];
    rightArm.matrix.set(matrix);
    rightArm.matrix.translate(1.4, -1.5, 0);
    rightArm.matrix.rotate(g_yellowAngle, 0, 0, 1);
    const rightArmMatrix = new Matrix4(rightArm.matrix);
    rightArm.matrix.scale(0.9, 0.5, 0.3);
    rightArm.render();

    const rightArm2 = new Sphere();
    rightArm2.color = [1.0, 0.82, 0.25, 1.0];
    rightArm2.matrix = new Matrix4(rightArmMatrix);

    rightArm2.matrix.translate(0.6, 0, 0);

    rightArm2.matrix.rotate(g_purpleAngle, 0, 0, 1);
    rightArm2.matrix.translate(-0.6, 0, 0);

    rightArm2.matrix.scale(0.8, 0.3, 0.5);
    rightArm2.render();

    //feet
    // Feet 1
    const feet1 = new Sphere();
    feet1.color = [0.9, 0.9, 0.7, 0.9];
    feet1.matrix.set(matrix);
    feet1.matrix.translate(0.6, -3.5, 0.5);

    const feetjoint = -1;
    feet1.matrix.translate(0, 0, feetjoint);

    feet1.matrix.rotate(g_feetAngle, 1, 0, 0);      

    feet1.matrix.translate(0, 0, -feetjoint);


    feet1.matrix.scale(0.5, 0.2, 0.9);
    feet1.render();

    // Feet 2 (Mirrored)
    const feet2 = new Sphere();
    feet2.color = [0.9, 0.9, 0.7, 0.9];
    feet2.matrix.set(matrix);
    feet2.matrix.translate(-0.6, -3.5, 0.5);
    feet2.matrix.translate(0, 0, feetjoint);
    feet2.matrix.rotate(-g_feetAngle, 1, 0, 0);           
    feet2.matrix.translate(0, 0, -feetjoint);

    feet2.matrix.scale(0.5, 0.2, 0.9);
    feet2.render();


    // TAIL
    const tail = new Sphere();
    tail.color = [1.0, 0.85, 0.25, 1.0];
    tail.matrix.set(matrix);
    tail.matrix.translate(0, -2.7, -1.4);
    const tailMatrix = new Matrix4(tail.matrix);
    tail.matrix.scale(0.5, 0.4, 0.5);
    tail.render();

    //2
    const tail2 = new Sphere();
    tail2.color = [1.0, 0.85, 0.25, 1.0];
    tail2.matrix = tailMatrix;
    tail2.matrix.rotate(g_tailAngle, 0, 1, 0);

    tail2.matrix.translate(0, 0, -0.3);
    const tail2Matrix = new Matrix4(tail2.matrix);
    tail2.matrix.scale(0.3, 0.3, 0.5);
    tail2.render();

    //3
    const tail3 = new Sphere();
    tail3.color = [1.0, 0.85, 0.25, 1.0];
    tail3.matrix = tail2Matrix;
    tail3.matrix.rotate(g_tailAngle * 3, 0, 1, 0);
    tail3.matrix.translate(0, 0, 1);
    tail3.matrix.rotate(-20, 1, 0, 0);
    tail3.matrix.translate(0, 0, -1);
    
    tail3.matrix.translate(0, 0.7, -0.3);
    
    // const rightArmMatrix = new Matrix4(rightArm.matrix);
    tail3.matrix.scale(0.2, 0.3, 0.2);
    tail3.render();

}

function drawGround() {
    // gl.uniform1i(u_whichTexture, 1);

    var body = new Cube();
    body.color = [1.0, 0, 0, 1];
    body.textureNum = 2; // 1 grass 0 sky, else weird color

    body.matrix.translate(0, -.75, 0.0);
    body.matrix.scale(50, 0, 50); // (50x50)

    body.matrix.translate(-.5, 0, -0.5); 
    body.render();
}

function drawSky() {
    var sky = new Cube();
    sky.color = [1.0,0.0,0.0,1.0];
    
    sky.textureNum=1;
    sky.matrix.scale(50,50,50);
    
    sky.matrix.translate(-.5,-.5, -0.5);
    sky.render();



}


let g_map = [];

for (let x = 0; x < 50; x++) {
    g_map[x] = [];
    for (let y = 0; y < 50; y++) {
        // Example: Random terrain
        g_map[x][y] = Math.random() < 0.3 ? (Math.random() * 3 + 1) : 0; // Hills or flat
        // Example: All flat
        // g_map[x][y] = 0;
        // Example: Checkerboard pattern
        // g_map[x][y] = (x + y) % 2; 

    }
}

var numTrees = 15; // Total number of trees to spawn
var trees = [];

// Generate random tree positions
for (let i = 0; i < numTrees; i++) {
    let tx = Math.floor(Math.random() * g_map.length); // Random x within map bounds
    let ty = Math.floor(Math.random() * g_map[0].length); // Random y within map bounds

    // Check if a tree already exists at this location (optional but recommended)
    let treeExists = trees.some(tree => tree.x === tx && tree.y === ty);
    if (!treeExists) { // Only add tree if location is free
        trees.push({ x: tx, y: ty });
    } else {
      i--; // Decrement i to retry spawning a tree
    }
}

var numWaterPatches = 10; // Number of water patches
var waterTiles = [];

for (let i = 0; i < numWaterPatches; i++) {
    let wx = Math.floor(Math.random() * (g_map.length - 3)); // Ensure enough space for 2x2
    let wy = Math.floor(Math.random() * (g_map[0].length - 3));

    // Add a 2x2 water patch
    for (let x = wx; x < wx + 2; x++) {
        for (let y = wy; y < wy + 2; y++) {
            waterTiles.push({ x: x, y: y });
        }
    }
}


function drawMap() {

    for (let x = 0; x < g_map.length; x++) {
        for (let y = 0; y < g_map[x].length; y++) {
            let height = g_map[x][y];

            if (height > 0) {
                var block = new Cube();
                block.color = [1.0, 1.0, 1.0, 1.0];
                block.textureNum = 4;
                block.matrix.translate(x - g_map.length / 2 + 0.5, -0.75, y - g_map[0].length / 2 + 0.5);
                block.matrix.scale(1*0.7, height * 0.2, 1*0.7);
                block.renderFast();
            }
        }
    }

    // Draw Water
    for (let i = 0; i < waterTiles.length; i++) {
        let wx = waterTiles[i].x;
        let wy = waterTiles[i].y;

        var water = new Cube();
        water.color = [0.0, 0.3, 1.0, 0.6];
        water.matrix.translate(wx - g_map.length / 2 + 0.5, -0.7, wy - g_map[0].length / 2 + 0.5);
        water.matrix.scale(1, 0.05, 1);
        water.renderFast();
    }

    // Draw Trees
    for (let i = 0; i < trees.length; i++) {
        let tx = trees[i].x;
        let ty = trees[i].y;
        let treeHeight = 2;

        for (let h = 0; h < treeHeight; h++) {
            var trunk = new Cube();
            trunk.textureNum = 3;
            trunk.matrix.scale(treeHeight * 0.2, treeHeight * 0.6, treeHeight * 0.2);
            trunk.matrix.translate(0, -1, 0);
            trunk.matrix.translate(tx - g_map.length / 2 + 0.5, h - 0.75, ty - g_map[0].length / 2 + 0.5);
            trunk.renderFast();
        }

        let leafOffsets = [-1, 0, 1];
        for (let dx of leafOffsets) {
            for (let dy of leafOffsets) {
                if (dx === 0 && dy === 0) continue;
                var leaf = new Cube();
                leaf.textureNum = 5;
                leaf.matrix.scale(treeHeight * 0.2, treeHeight * 0.2, treeHeight * 0.2);
                leaf.color = [0.0, 0.8, 0.0, 1.0];
                leaf.matrix.translate(0, -0.5, 0);
                leaf.matrix.translate((tx + dx) - g_map.length / 2 + 0.5, treeHeight - 0.75, (ty + dy) - g_map[0].length / 2 + 0.5);
                leaf.renderFast();
            }
        }
    }
}





var g_eye = [0, 0, 3];
var g_at = [0, 0, -100];
var g_up = [0, 1, 0];

const psyduckPosition = getRandomPosition();

function renderAllShapes() {

  var startTime = performance.now();



  var projMat = new Matrix4()//.rotate(g_globalAngle, 0, 1, 0);
  projMat.setPerspective(50, canvas.width/canvas.height, 1, 100)
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4()//.rotate(g_globalAngle, 0, 1, 0);
  viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0], g_at[1], g_at[2], g_up[0], g_up[1], g_up[2]) //eye, at, up
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
  
  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);


  const psyduckX = psyduckPosition.x - g_map.length / 2 + 0.5;
  const psyduckZ = psyduckPosition.y - g_map[0].length / 2 + 0.5;

  // just enabling didnt work had to add this here chatgpt helped me figure that out
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const faceMatrix = new Matrix4(globalRotMat);
  faceMatrix.rotate(rotationX, -1, 0, 0) // Pitch
  faceMatrix.rotate(rotationY, 0, -1, 0) // Yaw
  faceMatrix.rotate(rotationZ, 0, 0, -1); // Roll (if needed)
  faceMatrix.rotate(g_feetAngle, 0, 0, 1);
  faceMatrix.scale(0.05, 0.05, 0.05); 
  faceMatrix.translate(psyduckX, -10, psyduckZ);

  drawGround();
  drawPsyduckFace(faceMatrix);
  drawPsyduckBody(faceMatrix);
  drawSky();
  drawMap()


  var duration = performance.now() - startTime;
  sendTextToHTML( " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}


main();