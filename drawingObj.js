var program1; //cat body and eyes
var program2; //cat tail and clock hands
var gl;
var shaderDir; 
var baseDir;
var catModel;
var eyeModel1;
var eyeModel2;
var clockHand1Model;
var clockHand2Model;
var tailModel;

//Parameters for Camera
var cx = 0.0;
var cy = 0.0;
var cz = 0.0;
var elevation = 0.0;
var angle = 0.0;

var setClk= false;

var lookRadius = 10.0;

var modelStr = 'Body/Cat_body_norm.obj';
var modelTexture = 'KitCat_color.png';
var modelNMTexture = 'kitCat_NM.png';
var modelClock1 = 'Pieces/clockhand1.obj';
var modelClock2 = 'Pieces/clockhand2.obj';
var modelEye1 = 'Pieces/eye_norm.obj';
var modelEye2 = 'Pieces/eye_norm.obj';
var modelTail = 'Pieces/tail.obj';

var Node = function() {
  this.children = [];
  this.localMatrix = utils.identityMatrix();	//matrix that transforms the node and the children
  this.worldMatrix = utils.identityMatrix();	//matrix that transforms the node and the children form local space to world space
};

Node.prototype.setParent = function(parent) {
  // remove us from our parent
  if (this.parent) {
    var ndx = this.parent.children.indexOf(this);
    if (ndx >= 0) {
      this.parent.children.splice(ndx, 1);
    }
  }

  // Add us to our new parent
  if (parent) {
    parent.children.push(this);
  }
  this.parent = parent;
};

Node.prototype.updateWorldMatrix = function(matrix) {
  if (matrix) {
    // a matrix was passed in so do the math
    this.worldMatrix = utils.multiplyMatrices(matrix, this.localMatrix);
  } else {
    // no matrix was passed in so just copy.
    utils.copy(this.localMatrix, this.worldMatrix);
  }
  // now process all the children
  var worldMatrix = this.worldMatrix;
  this.children.forEach(function(child) {
    child.updateWorldMatrix(worldMatrix);
  });
};

//***EVENT HANDLER***

var mouseState = false;
var lastMouseX = -100, lastMouseY = -100;
function doMouseDown(event) {
	lastMouseX = event.pageX;
	lastMouseY = event.pageY;
	mouseState = true;
}
function doMouseUp(event) {
	lastMouseX = -100;
	lastMouseY = -100;
	mouseState = false;
}
function doMouseMove(event) {
	if(mouseState) {
		var dx = event.pageX - lastMouseX;
		var dy = lastMouseY - event.pageY;
		lastMouseX = event.pageX;
		lastMouseY = event.pageY;
		
		if((dx != 0) || (dy != 0)) {
			angle = angle + 0.5 * dx;
			elevation = elevation + 0.5 * dy;
		}
	}
}
function doMouseWheel(event) {
	var nLookRadius = lookRadius + event.wheelDelta/200.0;
	if((nLookRadius > 2.0) && (nLookRadius < 100.0)) {
		lookRadius = nLookRadius;
	}
}
function doResize() {
    // set canvas dimensions
	var canvas = document.getElementById("c");
    if((window.innerWidth > 40) && (window.innerHeight > 220)) {
		canvas.width  = window.innerWidth;
		canvas.height = window.innerHeight*0.85;
		gl.viewport(0.0, 0.0, canvas.width, canvas.height);
    }
}

function setClock(){
    setClk= !setClk;
    if(setClk){
        window.addEventListener("keydown", keyFunctionDown, false);
        document.getElementById("manualSet").value="end setting";
        }
    else
    {        
        window.removeEventListener("keydown", keyFunctionDown, false);
        document.getElementById("manualSet").value="set time manually";
    }   
}

var sx=0;
var dx=0;

var keyFunctionDown =function(e) {
	switch(e.keyCode) {
	  case 37:
        sx++;
		break;
	  case 39:
        dx++;
		break;
	}
}
var autoSet=false;
function autoAdjust(){
    autoSet=true;
}


//***MAIN APP
function main() {
    
    var lastUpdateTime = (new Date).getTime();
    
	var canvas = document.getElementById("c");
	canvas.addEventListener("mousedown", doMouseDown, false);
	canvas.addEventListener("mouseup", doMouseUp, false);
	canvas.addEventListener("mousemove", doMouseMove, false);
	canvas.addEventListener("mousewheel", doMouseWheel, false);
	window.onresize = doResize;

	var canvasBottom= document.getElementById("menu");
	
    utils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);	  // Tell WebGL how to convert from clip space to pixels
    gl.clearColor(0.85, 1.0, 0.85, 1.0); 					  // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    //get vertices, normals, indices, and uv coordinates from all the objects (body, tail, eyes and handclocks)
    var catVertices = catModel.vertices;
    var catNormals = catModel.vertexNormals;
    var catIndices = catModel.indices;
    var catTexCoords = catModel.textures;
		 
	var tailVertices = tailModel.vertices;
    var tailIndices = tailModel.indices;
    var tailNormals = tailModel.vertexNormals;

    var eye1Vertices = eyeModel1.vertices;
    var eye1Indices = eyeModel1.indices;
    var eye1Normals = eyeModel1.vertexNormals;
	var eye1TexCoords = eyeModel1.textures;
    
    var eye2Vertices = eyeModel2.vertices;
    var eye2Indices = eyeModel2.indices;
    var eye2Normals = eyeModel2.vertexNormals;
	var eye2TexCoords = eyeModel2.textures;
    
    var clock1Vertices = clockHand1Model.vertices;
    var clock1Indices = clockHand1Model.indices;
    var clock1Normals = clockHand1Model.vertexNormals;

    var clock2Vertices = clockHand2Model.vertices;
    var clock2Indices = clockHand2Model.indices;
    var clock2Normals = clockHand2Model.vertexNormals;
    
	var vertexData= new Array();
        vertexData[0]=catVertices;
        vertexData[1]=eye1Vertices;
        vertexData[2]=eye2Vertices;
        vertexData[3]=clock1Vertices;
        vertexData[4]=clock2Vertices;
        vertexData[5]=tailVertices;

    var normalData= new Array();
        normalData[0]=catNormals;
        normalData[1]=eye1Normals;
        normalData[2]=eye2Normals;
        normalData[3]=clock1Normals;
        normalData[4]=clock2Normals;
        normalData[5]=tailNormals;
    
    var indexData= new Array();
        indexData[0]=catIndices;
        indexData[1]=eye1Indices;
        indexData[2]=eye2Indices;
        indexData[3]=clock1Indices;
        indexData[4]=clock2Indices;
        indexData[5]=tailIndices;
    
    var texData= new Array();
        texData[0]=catTexCoords;
        texData[1]=eye1TexCoords;
        texData[2]=eye2TexCoords; 
    
    var positionAttributeLocation = new Array();
    var uvAttributeLocation = new Array();
    var matrixLocation = new Array();
    var textLocation = new Array();
    var textNMLocation = new Array();   //NM
    var eyePosUniform = new Array();   //eye
    var normalAttributeLocation= new Array();
    var lightDirection= new Array();
    var lightColor= new Array();
    var materialDiffColor= new Array();
	var ambientColor= new Array(); //ambient
	var ambientLight= new Array(); //ambient
	var dTex= new Array();
	var SToonTh= new Array();
	var specularColor= new Array();
	
	for(var i=0; i<6; i++){
		prog= i<3 ? program1 : program2
		//Assume vec4 a_position attribute in GLSL representing the position of the vertices
		positionAttributeLocation[i] = gl.getAttribLocation(prog, "inPosition");  
		matrixLocation[i] = gl.getUniformLocation(prog, "matrix"); 
		eyePosUniform[i] = gl.getUniformLocation(prog, "eyePos");    //eye
		SToonTh[i]=gl.getUniformLocation(prog, 'SToonTh');
		specularColor[i] = gl.getUniformLocation(prog, 'specularColor');
		normalAttributeLocation[i] = gl.getAttribLocation(prog, "inNormal");
		lightDirection[i] = gl.getUniformLocation(prog, 'lightDirection');
		lightColor[i] = gl.getUniformLocation(prog, 'lightColor');
		ambientColor[i] = gl.getUniformLocation(prog, 'ambientColor');	//ambient
		ambientLight[i] = gl.getUniformLocation(prog, 'ambientLight');	//ambient
		dTex[i]=gl.getUniformLocation(prog, 'DTexMix');

		if(i<3)		//if program1, textured objects
		{
			uvAttributeLocation[i] = gl.getAttribLocation(prog, "a_uv");  
			textLocation[i] = gl.getUniformLocation(prog, "u_texture");
		    textNMLocation[i] = gl.getUniformLocation(prog, "normalMap"); //NM
		}
		else		//if program2, non textured objects
			materialDiffColor[i] = gl.getUniformLocation(prog, 'mDiffColor');			
	}

    var vaos =  new Array();
    for(i=0; i<6; i++){
        vaos[i] = gl.createVertexArray();	//create a vertex array object
        gl.bindVertexArray(vaos[i]);		// Bind the attribute/buffer set we want, a VAO for each object

        var positionBuffer = gl.createBuffer();		//A buffer is a block of memory that can be written to or read from.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);									//ARRAY_BUFFER = positionBuffer
		//Vertex data are finally placed inside the buffer that is now ready to be used
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData[i]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionAttributeLocation[i]);						// Turn on the attribute
        gl.vertexAttribPointer(positionAttributeLocation[i], 3, gl.FLOAT, false, 0, 0);	  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)

        if(i<3){
            var uvBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texData[i]), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(uvAttributeLocation[i]);	
            gl.vertexAttribPointer(uvAttributeLocation[i], 2, gl.FLOAT, false, 0, 0);
        }
            
        var normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData[i]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(normalAttributeLocation[i]);
        gl.vertexAttribPointer(normalAttributeLocation[i], 3, gl.FLOAT, false, 0, 0);
        
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData[i]), gl.STATIC_DRAW); 

        if(i<3){
			var texture = gl.createTexture();	//create the texture object
			gl.activeTexture(gl.TEXTURE0+0); 

            var image = new Image();	//HTML image() object
            image.src = baseDir+modelTexture;	//URL of the image
            image.onload= function() {			//Function called once the image is loaded
				gl.bindTexture(gl.TEXTURE_2D, texture);	//set it as the current active
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);	//loads the image data in the texture object (in the GPU)
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);	//Define how textures are interpolated whenever their size needs to be incremented or diminished
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.generateMipmap(gl.TEXTURE_2D);	//Enable the generation of mipmap, which are smaller copies of your texture sized down and filtered in advance
            };
			
            var textureNM = gl.createTexture();
			gl.activeTexture(gl.TEXTURE0+1);

            var imageNM = new Image();
            imageNM.src = baseDir+modelNMTexture;
            imageNM.onload= function() {
				gl.bindTexture(gl.TEXTURE_2D, textureNM);	//forse non [i]?
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageNM);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.generateMipmap(gl.TEXTURE_2D);
            }; 
        }
    }
    
    //Define the scene Graph
    var objects = [];
    var currentDate= new Date();
    var min= currentDate.getMinutes();
    var hr= currentDate.getHours();
    
	var catNode= new Node();
	catNode.drawInfo={
		materialColor: [-1.0 , -1.0 , -1.0],	//not used material, use texture for cat body
        materialDiff: materialDiffColor[0],
        lightColor:lightColor[0],
        lightDirection: lightDirection[0],
        programInfo: program1,
		bufferLength: catIndices.length,
		vertexArray: vaos[0],
        textLocation: textLocation[0],
        textNMLocation: textNMLocation[0],  //NM
        eyePosUniform: eyePosUniform[0],  //eye
		SToonTh: SToonTh[0],
		specularColor: specularColor[0],
		ambientColor: ambientColor[0],	//ambient
		ambientLight: ambientLight[0],	//ambient
		dTex: dTex[0],
        matrixLocation: matrixLocation[0],
	};
	
	var eye1OrbitNode= new Node();
	eye1OrbitNode.localMatrix= eye1LocalMatrix;
	
    var eye2OrbitNode= new Node();
	eye2OrbitNode.localMatrix= eye2LocalMatrix;

	eye1OrbitNode.drawInfo={
        materialColor: [-1.0 , -1.0 , -1.0],	//not used material, use texture for cat eye
        materialDiff: materialDiffColor[1],
        lightColor:lightColor[1],
        lightDirection: lightDirection[1],
        programInfo: program1,
		bufferLength: eye1Indices.length,
		vertexArray: vaos[1],
        textLocation: textLocation[1], 
        textNMLocation: textNMLocation[1],  //NM
        eyePosUniform: eyePosUniform[1],  //eye
		SToonTh: SToonTh[1],
		specularColor: specularColor[1],
		ambientColor: ambientColor[1],	//ambient
		ambientLight: ambientLight[1],	//ambient
		dTex: dTex[1],
        matrixLocation: matrixLocation[1],
	};

	eye2OrbitNode.drawInfo={
		materialColor: [-1.0 , -1.0 , -1.0],	//not used material, use texture for cat eye
        materialDiff: materialDiffColor[2],
        lightColor:lightColor[2],
        lightDirection: lightDirection[2],
		programInfo: program1,
		bufferLength: eye2Indices.length,
		vertexArray: vaos[2],
        textLocation: textLocation[2],
        textNMLocation: textNMLocation[2],  //NM
        eyePosUniform: eyePosUniform[2],  //eye
		SToonTh: SToonTh[2],
		specularColor: specularColor[2],
		ambientColor: ambientColor[2],	//ambient
		ambientLight: ambientLight[2],	//ambient
		dTex: dTex[2],
        matrixLocation: matrixLocation[2],
	};
    
    var clock1OrbitNode= new Node();
    clock1OrbitNode.localMatrix= utils.multiplyMatrices(utils.MakeRotateZMatrix(min*6),clockHand1LocalMatrix);
	
    clock1OrbitNode.drawInfo={
		materialColor: [1.0 , 1.0 , 1.0],
        materialDiff: materialDiffColor[3],
        lightColor:lightColor[3],
        lightDirection: lightDirection[3],
		programInfo: program2,
		bufferLength: clock1Indices.length,
		vertexArray: vaos[3],
        textLocation: textLocation[3],  	//not used texture, use material color for clockhand
        textNMLocation: textNMLocation[3],  //not used texture, use material color for clockhand
        eyePosUniform: eyePosUniform[3],  //eye
		SToonTh: SToonTh[3],
		specularColor: specularColor[3],
		ambientColor: ambientColor[3],	//ambient
		ambientLight: ambientLight[3],	//ambient
		dTex: dTex[3],
        matrixLocation: matrixLocation[3],
	};
    
    var clock2OrbitNode= new Node();
    clock2OrbitNode.localMatrix= utils.multiplyMatrices(utils.MakeRotateZMatrix(hr*30 +(min/60)*30),clockHand2LocalMatrix);

    clock2OrbitNode.drawInfo={
		materialColor: [1.0 , 1.0 , 1.0],
        materialDiff: materialDiffColor[4],
        lightColor:lightColor[4],
        lightDirection: lightDirection[4],
		programInfo: program2,
		bufferLength: clock2Indices.length,
		vertexArray: vaos[4],
        textLocation: textLocation[4],  	//not used texture, use material color for clockhand
        textNMLocation: textNMLocation[4],  //not used texture, use material color for clockhand
        eyePosUniform: eyePosUniform[4],  //eye
		SToonTh: SToonTh[4],
		specularColor: specularColor[4],
		ambientColor: ambientColor[4],	//ambient
		ambientLight: ambientLight[4],	//ambient
		dTex: dTex[4],
        matrixLocation: matrixLocation[4],
	};
    
    var tailNode= new Node();
    tailNode.localMatrix= tailLocalMatrix;
	
    tailNode.drawInfo={
		materialColor: [10.0/255, 10.0/255,10.0/255],//[0.0 , 0.0 , 0.0],
        materialDiff: materialDiffColor[5],
        lightColor:lightColor[5],
        lightDirection: lightDirection[5],
		programInfo: program2,
		bufferLength: tailIndices.length,
		vertexArray: vaos[5],
        textLocation: textLocation[5],  	//not used texture, use material color for clockhand
        textNMLocation: textNMLocation[5],  //not used texture, use material color for clockhand
        eyePosUniform: eyePosUniform[5],  //eye
		SToonTh: SToonTh[5],
		specularColor: specularColor[5],
		ambientColor: ambientColor[5],	//ambient
		ambientLight: ambientLight[5],	//ambient
 		dTex: dTex[5],
		matrixLocation: matrixLocation[5],
	};
    
	eye1OrbitNode.setParent(catNode);
    eye2OrbitNode.setParent(catNode);

    clock1OrbitNode.setParent(catNode);
    clock2OrbitNode.setParent(catNode);
    tailNode.setParent(catNode);
	
	//define an array of objects to be rendered
    var objects = [
	  catNode,
	  eye1OrbitNode,
      eye2OrbitNode,    
      clock1OrbitNode,
      clock2OrbitNode,
      tailNode
	  ];

    requestAnimationFrame(drawScene);
    
    var periodTail= 90;
    var dirTail=1;
    var periodEye= 60;
    var dirEye=1;
    var periodClock1= 90;
    var dirClock1=1;
    var periodClock2= 90;
    var dirClock2=1;

    function drawScene(time) {
    time *= 0.001;
        
    utils.resizeCanvasToDisplaySize(gl.canvas);
    gl.clearColor(0.85, 0.85, 0.85, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Compute the projection matrix
    var aspect = gl.canvas.width / gl.canvas.height;
    var projectionMatrix = utils.MakePerspective(1.0, aspect, 0.1, 100.0);//non serve 
	
    cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cy = lookRadius * Math.sin(utils.degToRad(-elevation));
	
	if(elevation>180)
		elevation=elevation-360
	if(elevation<-180)
		elevation=elevation+360
	if(elevation<=90 && elevation>=-90){
		var viewMatrix = utils.lookAtViewProjection(0.0,0.0,0.0,cx,cy,cz,[0,1,0]);
	}
	else{
		var viewMatrix = utils.lookAtViewProjection(0.0,0.0,0.0,cx,cy,cz,[0,-1,0]);
	}
	 
    if(dirTail==1)
    {
		periodTail++;
        if(periodTail==180)
			dirTail=-1;
    }
    else
    {
		periodTail--;
        if (periodTail== -50)
			dirTail=1;
    }
    if(dirEye==1)
    {
		periodEye++;
        if(periodEye==100)
			dirEye=-1;
    }
    else
    {
		periodEye--;
        if (periodEye== 20)
			dirEye=1;
    }
	
    //Update the local matrices independently
    tailNode.localMatrix= utils.multiplyMatrices(utils.MakeRotateZMatrix(dirTail*0.3), tailNode.localMatrix);
        
    for (dx; dx > 0; dx--) {
        clock1OrbitNode.localMatrix= utils.multiplyMatrices(utils.MakeRotateZMatrix(6), clock1OrbitNode.localMatrix);
        clock2OrbitNode.localMatrix= utils.multiplyMatrices(utils.MakeRotateZMatrix(0.5), clock2OrbitNode.localMatrix);
    }     
    for (sx;  sx>0; sx--) {
        clock1OrbitNode.localMatrix= utils.multiplyMatrices(utils.MakeRotateZMatrix(-6), clock1OrbitNode.localMatrix);
        clock2OrbitNode.localMatrix= utils.multiplyMatrices(utils.MakeRotateZMatrix(-0.5), clock2OrbitNode.localMatrix);
    }     
        
    if(autoSet){
        clock1OrbitNode.localMatrix= utils.multiplyMatrices(utils.MakeRotateZMatrix(min*6),clockHand1LocalMatrix);
        clock2OrbitNode.localMatrix= utils.multiplyMatrices(utils.MakeRotateZMatrix(hr*30 +(min/60)*30),clockHand2LocalMatrix);
        autoSet= false;
    }
    autoSet= false;

    var currDate= new Date();
    var currMin= currDate.getMinutes();
    if(currMin-min>0){
        clock1OrbitNode.localMatrix= utils.multiplyMatrices(utils.MakeRotateZMatrix(6), clock1OrbitNode.localMatrix);
        clock2OrbitNode.localMatrix= utils.multiplyMatrices(utils.MakeRotateZMatrix(0.5), clock2OrbitNode.localMatrix);
        min=currMin;
    }
    eye1OrbitNode.localMatrix= utils.multiplyMatrices(utils.MakeRotateYMatrix(dirEye*0.03), eye1OrbitNode.localMatrix);
    eye2OrbitNode.localMatrix= utils.multiplyMatrices(utils.MakeRotateYMatrix(dirEye*0.03), eye2OrbitNode.localMatrix);
	//Update all the worldMatrix in the scene graph recursively from the root
	catNode.updateWorldMatrix();
	
//Render each object with its own shader
objects.forEach(function (object){

	gl.useProgram(object.drawInfo.programInfo);	  // Tell it to use our program (pair of shaders)
    
    var perspectiveMatrix = utils.MakePerspective(1.0, gl.canvas.width/gl.canvas.height, 0.1, 2000);

    var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, object.worldMatrix);
    //projectionMatrix defines how the scene is perceived by the camera
	var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
	//We need to transpose the matrix before passing it
    gl.uniformMatrix4fv(object.drawInfo.matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));
    
    gl.activeTexture(gl.TEXTURE0+0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(object.drawInfo.textLocation, 0);

    gl.activeTexture(gl.TEXTURE0+1);  //NM  
	gl.bindTexture(gl.TEXTURE_2D, textureNM);
    gl.uniform1i(object.drawInfo.textNMLocation, 1);    //NM 
    
    var alpha = document.getElementById("LDirTheta").value;//theta  default:30
    var beta = document.getElementById("LDirPhi").value;//phi  default:90
    var directionalLight= [Math.cos(-utils.degToRad(alpha)) * Math.cos(-utils.degToRad(beta)),
              Math.sin(-utils.degToRad(alpha)), Math.cos(-utils.degToRad(alpha)) * Math.sin(-utils.degToRad(beta))];
	var lightDirMatrix=utils.sub3x3from4x4(utils.transposeMatrix(object.worldMatrix));
	//in object space light direction must be tramsfromed as the inverse transpose transpose of the 3x3 submatrix of the inverse World matrix(+ normalization)
    var directionalLightTransformed=utils.normalizeVec3(utils.multiplyMatrix3Vector3(lightDirMatrix, directionalLight));

    gl.uniform3fv(object.drawInfo.materialDiff, object.drawInfo.materialColor);
	
	color=document.getElementById("LightColor").value;				//take value from color type input, directionalLightColor
	
    gl.uniform3fv(object.drawInfo.lightColor,  getRGB(color));
    gl.uniform3fv(object.drawInfo.lightDirection,  directionalLightTransformed);
	
	color=document.getElementById("ambientMatColor").value;					//take value from color type input, material color for the ambient
    gl.uniform3fv(object.drawInfo.ambientColor,  getRGB(color));			//ambient
	color=document.getElementById("ambientLightColor").value;				//take value from color type input, ambient light color
    gl.uniform3fv(object.drawInfo.ambientLight,  getRGB(color));			//ambient
	gl.uniform1f(object.drawInfo.dTex, document.getElementById("DTexMix").value/100)
	
	//eye position, for specular toon blinn, in object space eye position is transformed by inverse of the World transform matrix
	var eyePositionMatrix = utils.invertMatrix(object.worldMatrix);	//eye position, for specular toon blinn
	var eyePositionTransformed = utils.normalizeVec3(utils.multiplyMatrix3Vector3(eyePositionMatrix, [cx, cy, cz]));   //eye position, for specular toon blinn
    gl.uniform3fv(object.drawInfo.eyePosUniform, eyePositionTransformed); 	//eye position, for specular toon blinn
	color=document.getElementById("specularColor").value;			//take value from color type input, specular light color
    gl.uniform3fv(object.drawInfo.specularColor,  getRGB(color));	//specular
	gl.uniform1f(object.drawInfo.SToonTh, document.getElementById("SToonTh").value/100)
		
    gl.bindVertexArray(object.drawInfo.vertexArray);
    gl.drawElements(gl.TRIANGLES, object.drawInfo.bufferLength, gl.UNSIGNED_SHORT, 0 );
	});
    window.requestAnimationFrame(drawScene);
  }
}
function getRGB(color)
{
	var r = parseInt(color.substr(1,2), 16)/255			//convert color from hexadecimal to [0,1] RGB range
	var g = parseInt(color.substr(3,2), 16)/255
	var b = parseInt(color.substr(5,2), 16)/255
	return [r,g,b]
}

async function init()
{  
    var path = window.location.pathname;
    var page = path.split("/").pop();
    baseDir = window.location.href.replace(page, '');
    shaderDir = baseDir+"shaders/";

    var canvas = document.getElementById("c");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        document.write("GL context not opened");
        return;
    }

	// create GLSL shaders, upload the GLSL source, compile the shaders
    await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
      var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
      var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
	  // Link the two shaders into a program
      program1 = utils.createProgram(gl, vertexShader, fragmentShader);	//contains the complete pipeline definition.
    });
    
    await utils.loadFiles([shaderDir + 'vs2.glsl', shaderDir + 'fs2.glsl'], function (shaderText) {
      var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
      var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
      program2 = utils.createProgram(gl, vertexShader, fragmentShader);
    });
    
    //Load the obj model 
    var catObjStr = await utils.get_objstr(baseDir+ modelStr);
    catModel = new OBJ.Mesh(catObjStr);
    var eye1ObjStr = await utils.get_objstr(baseDir+ modelEye1);
    eyeModel1 = new OBJ.Mesh(eye1ObjStr);
	var eye2ObjStr = await utils.get_objstr(baseDir+ modelEye2);
    eyeModel2 = new OBJ.Mesh(eye2ObjStr);
	var hand1ObjStr = await utils.get_objstr(baseDir+ modelClock1);
    clockHand1Model = new OBJ.Mesh(hand1ObjStr);
	var hand2ObjStr = await utils.get_objstr(baseDir+ modelClock2);
    clockHand2Model = new OBJ.Mesh(hand2ObjStr);
	var tailObjStr = await utils.get_objstr(baseDir+ modelTail);
    tailModel = new OBJ.Mesh(tailObjStr);
    main();
}

window.onload = init;
