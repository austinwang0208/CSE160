class Sphere {
    constructor(radius = 1, slices = 32, stacks = 32) {
        this.type = 'sphere';
        this.radius = radius;
        this.slices = slices; // Number of longitude lines
        this.stacks = stacks; // Number of latitude lines
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();

        this.vertices = [];
        this.indices = [];

        this.generateVertices();
    }

    generateVertices() {
        for (let i = 0; i <= this.stacks; i++) {
            const phi = Math.PI * i / this.stacks;
            for (let j = 0; j <= this.slices; j++) {
                const theta = 2 * Math.PI * j / this.slices;

                const x = this.radius * Math.sin(phi) * Math.cos(theta);
                const y = this.radius * Math.cos(phi);
                const z = this.radius * Math.sin(phi) * Math.sin(theta);

                this.vertices.push(x, y, z);
            }
        }

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
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Bind vertex buffer
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);  
        gl.enableVertexAttribArray(a_Position);

        // Bind index buffer
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW); // Use Uint16Array for indices

        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

        // Clean up (good practice)
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.deleteBuffer(vertexBuffer);
        gl.deleteBuffer(indexBuffer);

    }
}