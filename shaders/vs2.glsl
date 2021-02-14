#version 300 es
in vec3 inPosition;
in vec3 inNormal;
out vec3 fs_pos;

out vec3 fsNormal;

uniform mat4 matrix; 

void main() {
	fsNormal = inNormal; 
    fs_pos=inPosition;	//vertex position, no transformation needed in object space

	gl_Position = matrix * vec4(inPosition, 1.0);
}