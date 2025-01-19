// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform float u_Size;
    void main() {
        gl_Position = a_Position;
        gl_PointSize = u_Size;
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

    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_ShapeSize');
        return;
    }
    
}

const POINT = 0
const TRIANGLE = 1
const CIRCLE = 2
let currentSegmentCount = 10;
let g_selectedColor=[1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 10.0;
let g_selectedType = POINT;


//this function to draw the triangles
function drawSpecificTriangle(vertices, color) {
    // Create a buffer object
    const vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return;
    }

    // Bind the buffer and write the vertex data
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Assign the buffer object to a_Position
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // Set the color
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);

    // Draw the triangle
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
}

const triangleData = [
    { vertices: [0.0, 0.0, -0.2, 0.06, 0.2, 0.6], color: [0.94, 0.87, 0.8, 1.0] },
    { vertices: [0.0, 0.0, 0.2, 0.08, 0.2, 0.6], color: [0.94, 0.87, 0.8, 1.0] }, 
    { vertices: [0.3, 0.2, 0.2, 0.08, 0.2, 0.6], color: [0.94, 0.87, 0.8, 1.0] }, 
    { vertices: [0.3, 0.2, 0.4, 0.5, 0.2, 0.6], color: [0, 0, 0, 1.0] }, //right ear
    { vertices: [-0.32, 0.25, -0.2, 0.06, 0.2, 0.6], color: [0.94, 0.87, 0.8, 1.0] },
    { vertices: [-0.32, 0.25, -0.2, 0.62, 0.2, 0.6], color: [0.94, 0.87, 0.8, 1.0] },
    { vertices: [-0.32, 0.25, -0.2, 0.62, -0.4, 0.5], color: [0, 0, 0, 1.0]  } , //left ear
    { vertices: [-0.1, 0.4, -0.05, 0.35, -0.15, 0.35], color: [0, 0, 0, 1.0]  } , //left eye
    { vertices: [-0.1, 0.3, -0.05, 0.35, -0.15, 0.35], color: [0, 0, 0, 1.0]  } , //left eye

    { vertices: [0.1, 0.4, 0.05, 0.35, 0.15, 0.35], color: [0, 0, 0, 1.0]  } , //right eye
    { vertices: [0.1, 0.3, 0.05, 0.35, 0.15, 0.35], color: [0, 0, 0, 1.0]  } , //right eye

    { vertices: [0, 0.2, 0.06, 0.15, -0.06, 0.15], color: [0, 0, 0, 1.0]  }, // nose
    { vertices: [-0.05, 0.1, 0.06, 0.15, -0.06, 0.15], color: [0, 0, 0, 1.0]  }, // nose
    { vertices: [-0.05, 0.1, 0.06, 0.15, 0.05, 0.1], color: [0, 0, 0, 1.0]  }, // nose

    //body left
    { vertices: [-0.2, 0.06, -0.3, 0.06, -0.25, 0.13], color: [1.0, 0, 0, 1.0] },
    { vertices: [-0.2, 0.06, -0.3, 0.06, -0.4, -0.2], color: [1.0, 0, 0, 1.0] }, 
    { vertices: [-0.4, -0.6, -0.2, 0.06, -0.4, -0.2], color: [1.0, 0, 0, 1.0] }, 
    { vertices: [-0.4, -0.6, -0.2, 0.06, -0.2, -0.6], color: [1.0, 0, 0, 1.0] }, 

    //body right
    { vertices: [0.2, 0.08, 0.4, -0.15, 0.2, -0.6], color: [1.0, 0, 0, 1.0] }, 
    { vertices: [0.4, -0.6, 0.4, -0.15, 0.2, -0.6], color: [1.0, 0, 0, 1.0] }, 
    { vertices: [0.27, 0.16, 0.2, 0.08, 0.27, 0.0], color: [1.0, 0, 0, 1.0] }, 
    { vertices: [0.27, 0.08, 0.4, -0.2, 0.2, -0.4], color: [1.0, 0, 0, 1.0] },
    

    // middle
    { vertices: [0.0, 0.0, -0.2, 0.06, -0.2, -0.5], color: [1.0, 0, 0, 1.0] },
    { vertices: [0.0, 0.0, 0.2, 0.08, 0.2, -0.5], color: [1.0, 0, 0, 1.0] }, 
    { vertices: [0.0, 0.0, -0.2, -0.5, 0.2, -0.5], color: [1.0, 0, 0, 1.0] }, 

    //left paw
    { vertices: [-0.22, -0.6, -0.38, -0.6, -0.28, -0.65], color: [0.94, 0.87, 0.8, 1.0] },
    { vertices: [-0.38, -0.65, -0.38, -0.6, -0.28, -0.65], color: [0.94, 0.87, 0.8, 1.0] },

    //right paw 
    { vertices: [0.28, -0.65,0.38, -0.65, 0.22, -0.6], color: [0.94, 0.87, 0.8, 1.0] },
    { vertices: [0.38, -0.6, 0.38, -0.65, 0.22, -0.6], color: [0.94, 0.87, 0.8, 1.0] },
];

// Function to render all triangles
function renderAllTriangles() {
    gl.clearColor(0.886, 0.654, 0.654, 1.0); //background color
    gl.clear(gl.COLOR_BUFFER_BIT);
    triangleData.forEach(triangle => {
        drawSpecificTriangle(triangle.vertices, triangle.color);
    });
}


function addActionsforHTMLUI(){

    document.getElementById('drawTrianglesButton').addEventListener('click', renderAllTriangles);

    document.getElementById('clearButton').onclick = function (){g_shapesList = []; renderAllShapes();};

    document.getElementById('pointButton').onclick = function (){g_selectedType=POINT};
    document.getElementById('triButton').onclick = function (){g_selectedType=TRIANGLE};
    document.getElementById('circleButton').onclick = function (){g_selectedType=CIRCLE};


    //slider input
    document.getElementById('redSlide').addEventListener('input', function() { g_selectedColor[0] = this.value/100;});
    document.getElementById('greenSlide').addEventListener('input', function() { g_selectedColor[1] = this.value/100;});
    document.getElementById('blueSlide').addEventListener('input', function() { g_selectedColor[2] = this.value/100;});

    //text input
    document.getElementById('redInput').addEventListener('input', function() { g_selectedColor[0] = this.value/100;});
    document.getElementById('greenInput').addEventListener('input', function() { g_selectedColor[1] = this.value/100;});
    document.getElementById('blueInput').addEventListener('input', function() { g_selectedColor[2] = this.value/100;});



    document.getElementById('segmentSlider').addEventListener('input', function () {
        currentSegmentCount = parseInt(this.value);
    });
    document.getElementById('segmentInput').addEventListener('input', function () {
        currentSegmentCount = parseInt(this.value);
    });


    document.getElementById('sizeSlider').addEventListener('input', function() {g_selectedSize = this.value;});
    document.getElementById('sizeInput').addEventListener('input', function() {g_selectedSize = this.value;});


    document.getElementById('canvasColor').addEventListener('input', function(event) {
        const color = event.target.value;
        const red = parseInt(color.substring(1, 3), 16) / 255;
        const green = parseInt(color.substring(3, 5), 16) / 255;
        const blue = parseInt(color.substring(5, 7), 16) / 255;
        gl.clearColor(red, green, blue, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        renderAllShapes();
    });
}


function main() {

  setupWebGL();
  connectVariableToGLSL();
  
  addActionsforHTMLUI();

  let isDrawing = false;
  canvas.onmousedown = function(ev) {if (ev.button === 0) { isDrawing = true; click(ev); }};
  canvas.onmousemove = function(ev) {if (isDrawing) { click(ev);} };
  canvas.onmouseup = function(ev) {if (ev.button === 0) {isDrawing = false;}};
  

  canvas.onmouseleave = function() {isDrawing = false;};
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}



var g_shapesList = [];


// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = []; //save sizes

function click(ev) {

  let [x,y] = convertCoordinateEventToGL(ev);

  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE){
    point = new Triangle();
  } else {
    point = new Circle();
  }



  point.position=[x,y];
  point.color=g_selectedColor.slice();
  point.size = g_selectedSize;

  g_shapesList.push(point);

//   // Store the coordinates to g_points array
//   g_points.push([x, y]);

//   g_colors.push(g_selectedColor.slice());

//   g_sizes.push(g_selectedSize);
  // Store the coordinates to g_points array
//   if (x >= 0.0 && y >= 0.0) {      // First quadrant
//     g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
//   } else if (x < 0.0 && y < 0.0) { // Third quadrant
//     g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
//   } else {                         // Others
//     g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
//   }

  renderAllShapes();
}

function convertCoordinateEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return ([x, y])
}

function renderAllShapes() {

  var startTime = performance.now();
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {

    g_shapesList[i].render();
  }

  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}