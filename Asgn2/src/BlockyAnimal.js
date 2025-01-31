// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    void main() {
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }`

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }`

// global
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

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

    // gl.enable(gl.DEPTH_TEST);
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
let rotationX = 0;
let rotationY = 180;
let rotationZ = 0;

function addMouseEventsForCamera() {
    canvas.onmousedown = function(ev) {
        if (ev.shiftKey) {
            // Toggle tail wag animation on Shift + Click
            tailAnimation = !tailAnimation;
            console.log("Tail Animation: ", tailAnimation);
        } else if (ev.button === 0) {
            isDragging = true;
            lastX = ev.clientX;
            lastY = ev.clientY;
        }
    };

    canvas.onmousemove = function(ev) {
        if (isDragging) {
            const deltaX = ev.clientX - lastX;
            const deltaY = ev.clientY - lastY;

            // Adjust rotation speeds as needed
            rotationY += deltaX * 0.5; // Rotate around Y axis (yaw)
            rotationX += deltaY * 0.5; // Rotate around X axis (pitch)

            lastX = ev.clientX;
            lastY = ev.clientY;

            renderAllShapes();
        }
    };

    canvas.onmouseup = function(ev) {
        if (ev.button === 0) {
            isDragging = false;
        }
    };

    canvas.onmouseout = function() {
        isDragging = false;
    };

    // ... (Mouse wheel zoom handling - keep this)
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


function main() {

  setupWebGL();
  connectVariableToGLSL();
  
  addActionsforHTMLUI();
  addMouseEventsForCamera();

  // Specify the color for clearing <canvas>
  gl.clearColor(173/255, 216/255, 230/255, 1);

  // Clear <canvas>
//   gl.clear(gl.COLOR_BUFFER_BIT);
//   renderAllShapes();
  requestAnimationFrame(tick);
}

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
    gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

    // Torso
    const torso = new Sphere();
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

function drawPath() {


    const middle = new Cube();
    middle.color = [165/255, 42/255, 42/255, 1];
    middle.matrix.scale(0.9999, 0.4, 2);
    middle.matrix.translate(-0.5, -1.9, -0.5);
    middle.render();


}


function renderAllShapes() {

  var startTime = performance.now();

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);


  // just enabling didnt work had to add this here chatgpt helped me figure that out
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



  const faceMatrix = new Matrix4(globalRotMat);
  faceMatrix.rotate(rotationX, -1, 0, 0) // Pitch
  faceMatrix.rotate(rotationY, 0, -1, 0) // Yaw
  faceMatrix.rotate(rotationZ, 0, 0, -1); // Roll (if needed)
  faceMatrix.rotate(g_feetAngle, 0, 0, 1);
  faceMatrix.scale(0.2, 0.2, 0.2); 
  faceMatrix.translate(0,2, 0); 
  drawPsyduckFace(faceMatrix);

  
  drawPsyduckBody(faceMatrix);
//   const pathMatrix = new Matrix4(globalRotMat);
//   drawPath(faceMatrix)

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