#version 300 es
//add eyepos

precision mediump float;

in vec3 fsNormal;
in vec3 fs_pos; //NM

out vec4 outColor;

uniform vec3 ambientColor;		// material ambient color
uniform vec3 ambientLight;
uniform float DTexMix;

uniform vec3 eyePos;
uniform float SToonTh;
uniform vec3 specularColor;

uniform vec3 mDiffColor; //material diffuse color 
uniform vec3 lightDirection; // directional light direction vec
uniform vec3 lightColor; //directional light color 

void main() {

	vec3 nNormal = normalize(fsNormal);
	vec3 lDir = (lightDirection); 
	vec3 lambertColor = mDiffColor * lightColor * clamp(dot(lDir,nNormal),0.0,1.0);
  
    //ambient
	vec3 ambMatColor= clamp(ambientColor* (1.0-DTexMix) + mDiffColor * DTexMix,0.0,1.0);

	//toon specular blinn
	vec3 eyedirVec = normalize(eyePos - fs_pos);

	vec3 halfVec = normalize(lDir + eyedirVec);

	vec3 ToonSpecBCol;
	if(dot(nNormal, halfVec) > SToonTh) {
		ToonSpecBCol = specularColor;
	} else {
		ToonSpecBCol = vec3(0.0, 0.0, 0.0);
	}
	vec3 specularToonB = lightColor * ToonSpecBCol;
	
	outColor = vec4(clamp(lambertColor + ambientLight * ambMatColor + specularToonB*lightColor, 0.00, 1.0),1.0);
}