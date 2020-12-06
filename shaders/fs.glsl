#version 300 es

precision mediump float;


in vec3 fsNormal;

//in vec3 fs_pos //NM

in vec2 uvFS;
out vec4 outColor;

uniform vec3 mDiffColor;
uniform vec3 lightDirection; 
uniform vec3 lightColor;  

//uniform vec3 eyePos;    //NM


uniform sampler2D u_texture;
//uniform sampler2D u_tex_NormalMap;      //NM


void main() {
  
  vec3 nNormal = normalize(fsNormal);
  
  
  
  	//// online computation of tangent and bitangent

	// compute derivations of the world position
	//vec3 p_dx = dFdx(fs_pos);
	//vec3 p_dy = dFdy(fs_pos);
	// compute derivations of the texture coordinate
	//vec2 tc_dx = dFdx(uvFS);
	//vec2 tc_dy = dFdy(uvFS);
	// compute initial tangent and bi-tangent
	//vec3 t = (tc_dy.y * p_dx - tc_dx.y * p_dy) / (tc_dx.x*tc_dy.y - tc_dy.x*tc_dx.y);

	//t = normalize(t - nNormal * dot(nNormal, t));
	//vec3 b = normalize(cross(nNormal,t));
	
	//mat3 tbn = mat3(t, b, nNormal);

  	// parallax mapping
	//vec3 v = normalize(eyePos - fs_pos);

   //vec3 viewDir = transpose(tbn) * v;
    //vec2 texCoords = mix(uvFS, ParallaxMapping(uvFS,  viewDir), effect.g);       
	
	//vec4 nMap = texture(u_tex_NormalMap, texCoords);

  
  
  
  
  
  
  
  
  
  
  
  
  vec3 lDir = (lightDirection); 
  vec4 textureColor=texture(u_texture, uvFS);
  
       

  //vec4 textureNMap=texture(u_tex_NormalMap, uvFS);  //NM
  
  vec4 textOut =textureColor;
  
  vec3 lambertColor = textOut.rgb * lightColor * dot(-lDir,nNormal);
  outColor = vec4(clamp(lambertColor, 0.00, 1.0),1.0);

}

//const float heightScale = 0.02;

//vec2 ParallaxMapping(vec2 texCoords, vec3 viewDir)
//{ 

    // number of depth layers
    //const float minLayers = 8.0;
    //const float maxLayers = 32.0;
    //float numLayers = mix(maxLayers, minLayers, abs(dot(vec3(0.0, 0.0, 1.0), viewDir)));  
    // calculate the size of each layer
    //float layerDepth = 1.0 / numLayers;
    // depth of current layer
    //float currentLayerDepth = 0.0;
    // the amount to shift the texture coordinates per layer (from vector P)
    //vec2 P = viewDir.xy / viewDir.z * heightScale; 
    //vec2 deltaTexCoords = P / numLayers;
  
    // get initial values
    //vec2  currentTexCoords     = texCoords;
    //float currentDepthMapValue = texture(u_tex_NormalMap, currentTexCoords).w;
      
    //while(currentLayerDepth < currentDepthMapValue)
    //{
        // shift texture coordinates along direction of P
      //  currentTexCoords -= deltaTexCoords;
        // get depthmap value at current texture coordinates
        //currentDepthMapValue = texture(u_tex_NormalMap, currentTexCoords).w;  
        // get depth of next layer
        //currentLayerDepth += layerDepth;  
    //}
    
    // get texture coordinates before collision (reverse operations)
    //vec2 prevTexCoords = currentTexCoords + deltaTexCoords;

    // get depth after and before collision for linear interpolation
    //float afterDepth  = currentDepthMapValue - currentLayerDepth;
    //float beforeDepth = texture(u_tex_NormalMap, prevTexCoords).w - currentLayerDepth + layerDepth;
 
    // interpolation of texture coordinates
    //float weight = afterDepth / (afterDepth - beforeDepth);
    //vec2 finalTexCoords = prevTexCoords * weight + currentTexCoords * (1.0 - weight);

    //return finalTexCoords;

//}
