#version 300 es


in vec3 inPosition;
in vec3 inNormal;
out vec3 fsNormal;

in vec2 a_uv;
out vec2 uvFS;

//out vec3 fs_pos;     

uniform mat4 matrix; 

void main() {

  uvFS = a_uv;
  
  //fs_pos = inPosition;       
  
  fsNormal =  inNormal; 
  gl_Position = matrix * vec4(inPosition,1.0);
}