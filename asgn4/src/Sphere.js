class Sphere {
    constructor() {
      this.type = 'sphere';
      // this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 1.0, 1.0, 1.0];
      // this.size = 5.0;
      // this.segments = 10;
      this.matrix = new Matrix4();
      this.textureNum = 0;
      this.verts32 = new Float32Array([]);
    }

    render() {
        var rgba = this.color;
        // var size = this.size;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var d = Math.PI / 10;
        var dd = Math.PI / 10;
        // var uv = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        for (var t = 0; t < Math.PI; t += d) {
            for (var r = 0; r < (2 * Math.PI); r += d) {

                var p1 = [Math.sin(t) * Math.cos(r), Math.sin(t) * Math.sin(r), Math.cos(t)];

                var p2 = [Math.sin(t + dd) * Math.cos(r), Math.sin(t + dd) * Math.sin(r), Math.cos(t + dd)];
                var p3 = [Math.sin(t) * Math.cos(r + dd), Math.sin(t) * Math.sin(r + dd), Math.cos(t)];

                var p4 = [Math.sin(t + dd) * Math.cos(r + dd), Math.sin(t + dd) * Math.sin(r + dd), Math.cos(t + dd)];

                var v = [];
                var uv = [];

                v = v.concat(p1); uv = uv.concat([0, 0]);
                v = v.concat(p2); uv = uv.concat([0, 0]);
                v = v.concat(p4); uv = uv.concat([0, 0]);

                gl.uniform4f(u_FragColor, 1, 1, 1, 1);
                drawTriangle3DUVNormal(v, uv, v);

                v = []; uv = [];
                v = v.concat(p1); uv = uv.concat([0, 0]);
                v = v.concat(p4); uv = uv.concat([0, 0]);
                v = v.concat(p3); uv = uv.concat([0, 0]);

                gl.uniform4f(u_FragColor, 1, 1, 1, 1);
                drawTriangle3DUVNormal(v, uv, v);
            }
        }
    }
  }


















// class Sphere {
//     constructor(radius = 1, slices = 32, stacks = 32) {
//         this.type = 'sphere';
//         this.radius = radius;
//         this.slices = slices; // Number of longitude lines
//         this.stacks = stacks; // Number of latitude lines
//         this.color = [1.0, 1.0, 1.0, 1.0];
//         this.matrix = new Matrix4();
//         this.textureNum = 0;
//         // 0 = color, 1 = sky, 2 = grass, 3 = tree trunk
//         this.vertices = [];
//         this.uvs = [];
//         this.indices = [];

//         this.generateVertices();
//     }

//     generateVertices() {
//         for (let i = 0; i <= this.stacks; i++) {
//             const phi = Math.PI * i / this.stacks;  // Latitude angle
//             for (let j = 0; j <= this.slices; j++) {
//                 const theta = 2 * Math.PI * j / this.slices;  // Longitude angle

//                 // Compute vertex position
//                 const x = this.radius * Math.sin(phi) * Math.cos(theta);
//                 const y = this.radius * Math.cos(phi);
//                 const z = this.radius * Math.sin(phi) * Math.sin(theta);
//                 this.vertices.push(x, y, z);

//                 // Compute UV coordinates
//                 const u = j / this.slices; // Longitude mapped to [0,1]
//                 const v = i / this.stacks; // Latitude mapped to [0,1]
//                 this.uvs.push(u, v);
//             }
//         }

//         // Generate indices for triangles
//         for (let i = 0; i < this.stacks; i++) {
//             for (let j = 0; j < this.slices; j++) {
//                 const a = i * (this.slices + 1) + j;
//                 const b = a + 1;
//                 const c = (i + 1) * (this.slices + 1) + j;
//                 const d = c + 1;
//                 this.indices.push(a, b, d);
//                 this.indices.push(a, d, c);
//             }
//         }
//     }

//     render() {
//         const rgba = this.color;
//         gl.uniform1i(u_whichTexture, this.textureNum);
//         gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
//         gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

//         // Bind vertex buffer
//         const vertexBuffer = gl.createBuffer();
//         gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
//         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
//         gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);  
//         gl.enableVertexAttribArray(a_Position);

//         // Bind UV buffer
//         const uvBuffer = gl.createBuffer();
//         gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
//         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.STATIC_DRAW);
//         gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
//         gl.enableVertexAttribArray(a_UV);

//         // Bind index buffer
//         const indexBuffer = gl.createBuffer();
//         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
//         gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

//         // Draw sphere
//         gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

//         // Cleanup
//         gl.bindBuffer(gl.ARRAY_BUFFER, null);
//         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
//         gl.deleteBuffer(vertexBuffer);
//         gl.deleteBuffer(uvBuffer);
//         gl.deleteBuffer(indexBuffer);
//     }
// }
