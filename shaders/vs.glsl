#version 300 es

//receives data from a buffer
in vec3 inPosition;	//aPos
in vec3 inNormal;	//aNormal
in vec2 a_uv;		//aTexCoords

out vec3 fsNormal;
out vec3 fs_pos;
out vec2 uvFS;

uniform mat4 matrix; 

void main() {

  uvFS = a_uv;
  fs_pos=inPosition;	//vertex position, no transformation needed in object space
  fsNormal =  inNormal; //vertex normals, no transformation needed in object space
  gl_Position = matrix * vec4(inPosition,1.0);	//Final transformed vertex position, computed in clip space coordinates
}