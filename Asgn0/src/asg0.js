function main() {
    var canvas = document.getElementById('example');
    if (!canvas) {
      console.log('Failed to retrieve the <canvas> element');
      return;
    }
  
    var ctx = canvas.getContext('2d');
  
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 400, 400);

    var drawButton = document.getElementById('draw');
    drawButton.addEventListener('click', handleDrawEvent);

    // var v1 = new Vector3([2.25, 2.25, 0]);
    // drawVector(v1, "red")
}
function handleDrawEvent() {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var x = parseFloat(document.getElementById('x').value);
    var y = parseFloat(document.getElementById('y').value);

    //Vector 2
    var x2 = parseFloat(document.getElementById('x2').value);
    var y2 = parseFloat(document.getElementById('y2').value);

    var v1 = new Vector3([x, y, 0]);
    var v2 = new Vector3([x2, y2, 0]);

    drawVector(v1, "red");
    drawVector(v2, "blue");
}

function handleDrawOperationEvent() {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var x = parseFloat(document.getElementById('x').value);
    var y = parseFloat(document.getElementById('y').value);

    //Vector 2
    var x2 = parseFloat(document.getElementById('x2').value);
    var y2 = parseFloat(document.getElementById('y2').value);

    var v1 = new Vector3([x, y, 0]);
    var v2 = new Vector3([x2, y2, 0]);

    drawVector(v1, "red");
    drawVector(v2, "blue");

    const scalar = parseFloat(document.getElementById("scalar").value) || 1;
    const operation = document.getElementById("operation").value;

    if (operation === "add") {
        const v3 = new Vector3().set(v1).add(v2);
        drawVector(v3, "green");
    } else if (operation === "sub") {
        const v3 = new Vector3().set(v1).sub(v2);
        drawVector(v3, "green");
    } else if (operation === "mul") {
        const v3 = new Vector3().set(v1).mul(scalar);
        const v4 = new Vector3().set(v2).mul(scalar);
        drawVector(v3, "green");
        drawVector(v4, "green");
    } else if (operation === "div") {
        const v3 = new Vector3().set(v1).div(scalar);
        const v4 = new Vector3().set(v2).div(scalar);
        drawVector(v3, "green");
        drawVector(v4, "green");
    } else if (operation === "mag") {
        console.log("Magnitude v1:" , v1.magnitude());
        console.log("Magnitude v2:" , v2.magnitude());

    } else if (operation === "norm") {
        const v3 = new Vector3().set(v1).normalize();
        const v4 = new Vector3().set(v2).normalize();
        drawVector(v3, "green");
        drawVector(v4, "green");
    } else if (operation === "angle") {
        angleBetween(v1, v2);
    } else if (operation === "area") {
        areaTriangle(v1, v2);
    }
}


function drawVector(v, color) {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');

    var x = v.elements[0] * 20;
    var y = v.elements[1] * 20

    ctx.strokeStyle = color;

    ctx.beginPath();
    ctx.moveTo(400 / 2, 400 / 2);
    ctx.lineTo(400 / 2 + x, 400 / 2 - y);
    ctx.stroke();
}


function angleBetween(v1, v2) {
    const dotProduct = Vector3.dot(v1, v2);

    const magnitudeV1 = v1.magnitude();
    const magnitudeV2 = v2.magnitude();

    const cosTheta = dotProduct / (magnitudeV1 * magnitudeV2);
    const angle = Math.acos(cosTheta) * (180 / Math.PI);

    console.log("Angle:", angle, "degrees");
    // return angle;
}

function areaTriangle(v1, v2) {
    const crossProduct = Vector3.cross(v1, v2);

    // console.log(crossProduct.magnitude())
    const area = crossProduct.magnitude() / 2;

    console.log("Area:", area);
    // return area;
}
  

