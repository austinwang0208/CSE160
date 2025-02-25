class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = 0;
        // 0 = color, 1 = sky, 2 = grass, 3 = tree trunk
    }

    render() {
        const rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front face
        // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3DUVNormal([0, 0, 0, 1, 1, 0, 1, 0, 0],  [0, 0, 1, 1, 1, 0], [0,0,-1,0,0,-1,0,0,-1]);
        drawTriangle3DUVNormal([0, 0, 0, 0, 1, 0, 1, 1, 0],  [0, 0, 0, 1, 1, 1], [0,0,-1,0,0,-1,0,0,-1]);

        // Back face
        // gl.uniform4f(u_FragColor, rgba[0] * 0.95, rgba[1] * 0.95, rgba[2] * 0.95, rgba[3]); 
        drawTriangle3DUVNormal([1,0,1, 0,1,1, 0,0,1],  [1,0, 0,1, 0,0], [0,0,1,0,0,1,0,0,1]);  
        drawTriangle3DUVNormal([1,0,1, 1,1,1, 0,1,1],  [1,0, 1,1, 0,1], [0,0,1,0,0,1,0,0,1]);  
        

        // Right face
        // gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]); 
        drawTriangle3DUVNormal([1,0,0, 1,1,1, 1,1,0],  [0,0, 1,1, 1,0], [1,0,0,1,0,0,1,0,0]);  
        drawTriangle3DUVNormal([1,0,0, 1,0,1, 1,1,1],  [0,0, 0,1, 1,1], [1,0,0,1,0,0,1,0,0]);  
        

        // Left face
        // gl.uniform4f(u_FragColor, rgba[0] * 0.85, rgba[1] * 0.85, rgba[2] * 0.85, rgba[3]); 
        drawTriangle3DUVNormal([0,0,0, 0,1,0, 0,1,1],  [0,0, 0,1, 1,1], [-1,0,0,-1,0,0,-1,0,0]);  
        drawTriangle3DUVNormal([0,0,0, 0,1,1, 0,0,1],  [0,0, 1,1, 1,0], [-1,0,0,-1,0,0,-1,0,0]);  
        

        // Top face 
        // gl.uniform4f(u_FragColor, rgba[0] * 0.75, rgba[1] * 0.75, rgba[2] * 0.75, rgba[3]); 
        drawTriangle3DUVNormal([0,1,0, 0,1,1, 1,1,1],  [0,0, 0,1, 1,1], [0,1,0,0,1,0,0,1,0]);  
        drawTriangle3DUVNormal([0,1,0, 1,1,1, 1,1,0],  [0,0, 1,1, 1,0], [0,1,0,0,1,0,0,1,0]);  
        

        // Bottom face
        // gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]); 
        drawTriangle3DUVNormal([0,0,0, 1,0,1, 1,0,0],  [0,0, 1,1, 1,0], [0,-1,0,0,-1,0,0,-1,0]);  
        drawTriangle3DUVNormal([0,0,0, 0,0,1, 1,0,1],  [0,0, 0,1, 1,1], [0,-1,0,0,-1,0,0,-1,0]);  
        
        
    }

    renderFast() {
        const rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
        const vertices = [];
        const uvs = [];
    
        // Front face
        vertices.push(0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0);
        uvs.push(0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1);
        // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); // Set color for face
        
        // Back face
        vertices.push(1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1);
        uvs.push(1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1);
        // gl.uniform4f(u_FragColor, rgba[0] * 0.95, rgba[1] * 0.95, rgba[2] * 0.95, rgba[3]);
    
        // Right face
        vertices.push(1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1);
        uvs.push(0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1);
        // gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
    
        // Left face
        vertices.push(0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1);
        uvs.push(0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0);
        // gl.uniform4f(u_FragColor, rgba[0] * 0.85, rgba[1] * 0.85, rgba[2] * 0.85, rgba[3]);
    
        // Top face
        vertices.push(0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0);
        uvs.push(0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0);
        // gl.uniform4f(u_FragColor, rgba[0] * 0.75, rgba[1] * 0.75, rgba[2] * 0.75, rgba[3]);
    
        // Bottom face
        vertices.push(0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1);
        uvs.push(0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1);
        // gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
    
    
        drawTriangle3DUV(vertices, uvs);
    }

}
