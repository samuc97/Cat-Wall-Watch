#version 300 es
precision mediump float;	//medium precision

in vec3 fsNormal;
in vec3 fs_pos; //NM

in vec2 uvFS;
out vec4 outColor;

uniform vec3 ambientColor;		// material ambient color
uniform vec3 ambientLight;
uniform float DTexMix;

uniform vec3 eyePos;
uniform float SToonTh;
uniform vec3 specularColor;

uniform vec3 lightDirection; 
uniform vec3 lightColor;  

uniform sampler2D u_texture;
uniform sampler2D normalMap;  


void main() {
   
	vec3 normal = texture(normalMap, uvFS).rgb;    //the color of the normal map
	normal = normalize(normal * 2.0 - 1.0);   

	vec3 nNormal = normalize(fsNormal);
   
   
   	//start TANGENT SPACE, on the fly computation of tangent and bitangent
	vec3 p_dx = dFdx(fs_pos);  //coordinates
	vec3 p_dy = dFdy(fs_pos);
		
	//vec3 n_norm=normalize(cross(p_dx,p_dy))
		
	vec2 tc_dx = dFdx(uvFS);   //uv changes
	vec2 tc_dy = dFdy(uvFS);
	vec3 t = (tc_dy.y * p_dx - tc_dx.y * p_dy) /(tc_dx.x*tc_dy.y - tc_dy.x*tc_dx.y);   //tangent direction tansformed in world space
					
	t = normalize(t - nNormal * dot(nNormal, t));  //compute orthogonal version of tangent and bitangent
	vec3 b = normalize(cross(nNormal,t));
	mat3 tbn = mat3(t, b, nNormal);
		
	vec3 n=tbn*normal; 
  	//end TANGENT SPACE

	vec3 lDir = (lightDirection); 
	vec4 textureColor=texture(u_texture, uvFS);
  
	vec4 textOut =textureColor;
  
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

  
	//ambient
	vec3 ambMatColor= clamp(ambientColor* (1.0-DTexMix) + textureColor.rgb * DTexMix,0.0,1.0);
  
	vec3 lambertColor = textOut.rgb * lightColor * clamp(dot(lDir,n),0.0,1.0);
	outColor = vec4(clamp(lambertColor + ambientLight * ambMatColor + specularToonB, 0.00, 1.0),1.0);	//Final fragment color output, in RGBA
}