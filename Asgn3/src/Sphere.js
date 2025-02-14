class Sphere {
    constructor(radius = 1, slices = 32, stacks = 32) {
        this.type = 'sphere';
        this.radius = radius;
        this.slices = slices; // Number of longitude lines
        this.stacks = stacks; // Number of latitude lines
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = 0;
        // 0 = color, 1 = sky, 2 = grass, 3 = tree trunk
        this.vertices = [];
        this.uvs = [];
        this.indices = [];

        this.generateVertices();
    }

    generateVertices() {
        for (let i = 0; i <= this.stacks; i++) {
            const phi = Math.PI * i / this.stacks;  // Latitude angle
            for (let j = 0; j <= this.slices; j++) {
                const theta = 2 * Math.PI * j / this.slices;  // Longitude angle

                // Compute vertex position
                const x = this.radius * Math.sin(phi) * Math.cos(theta);
                const y = this.radius * Math.cos(phi);
                const z = this.radius * Math.sin(phi) * Math.sin(theta);
                this.vertices.push(x, y, z);

                // Compute UV coordinates
                const u = j / this.slices; // Longitude mapped to [0,1]
                const v = i / this.stacks; // Latitude mapped to [0,1]
                this.uvs.push(u, v);
            }
        }

        // Generate indices for triangles
        for (let i = 0; i < this.stacks; i++) {
            for (let j = 0; j < this.slices; j++) {
                const a = i * (this.slices + 1) + j;
                const b = a + 1;
                const c = (i + 1) * (this.slices + 1) + j;
                const d = c + 1;
                this.indices.push(a, b, d);
                this.indices.push(a, d, c);
            }
        }
    }

    render() {
        const rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Bind vertex buffer
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);  
        gl.enableVertexAttribArray(a_Position);

        // Bind UV buffer
        const uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);

        // Bind index buffer
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

        // Draw sphere
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

        // Cleanup
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.deleteBuffer(vertexBuffer);
        gl.deleteBuffer(uvBuffer);
        gl.deleteBuffer(indexBuffer);
    }
}
