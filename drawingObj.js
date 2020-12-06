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


// CAT POSITION
  var Rx = 0.0;
  var Ry = 0.0;
  var Rz = 0.0;
  var S  = 1;
  var objectWorldMatrix = utils.MakeWorld(0.0, 0.0, 0.0, Rx, Ry, Rz, S); // Cat Body position

//Parameters for Camera
var cx = 0.0;
var cy = 0.0;
var cz = 0.0;
var elevation = 0.0;
var angle = 0.0;

var setClk= false;

var lookRadius = 10.0;


var tailMaterialColor = [0.0, 0.0, 0.0, 1.0];
var clockMaterialColor = [1.0, 1.0, 1.0, 1.0];



var modelStr = 'Body/Cat_body_norm.obj';
var modelTexture = 'KitCat_color.png'; //normal textures missing
var modelNMTexture = 'KitCat_NM.png';
var modelClock1 = 'Pieces/clockhand1.obj';
var modelClock2 = 'Pieces/clockhand2.obj';
var modelEye1 = 'Pieces/eye_norm.obj';
var modelEye2 = 'Pieces/eye_norm.obj';
var modelTail = 'Pieces/tail.obj';


//example taken from webGLTutorial2
var Node = function() {
  this.children = [];
  this.localMatrix = utils.identityMatrix();
  this.worldMatrix = utils.identityMatrix();
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
			//console.log(angle)
			elevation = elevation + 0.5 * dy;
			//console.log(elevation)
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
		canvas.width  = window.innerWidth-16;
		canvas.height = window.innerHeight-180;
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
            console.log(sx);
		break;
	  case 39:
//console.log("KeyUp   - Dir RIGHT");
        dx++;
		break;
	}
}
var autoSet=false;
function autoAdjust(){
    //console.log("cici")
    autoSet=true;
}
//***MAIN APP
function main() {
    
    var lastUpdateTime = (new Date).getTime();
    
    var Rx = 0.0;//not used
    var Ry = 0.0;
    var Rz = 0.0;
    var S  = 1.0;

	var canvas = document.getElementById("c");
	canvas.addEventListener("mousedown", doMouseDown, false);
	canvas.addEventListener("mouseup", doMouseUp, false);
	canvas.addEventListener("mousemove", doMouseMove, false);
	canvas.addEventListener("mousewheel", doMouseWheel, false);
	window.onresize = doResize;


    
    utils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.85, 1.0, 0.85, 1.0); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    //###################################################################################
    //Here we extract the position of the vertices, the normals, the indices, and the uv coordinates
    var catVertices = catModel.vertices;
    var catNormals = catModel.vertexNormals;
    var catIndices = catModel.indices;
    var catTexCoords = catModel.textures;
	
    var eye1Indices = eyeModel1.indices;
    var eye2Indices = eyeModel2.indices;
    var clock1Indices = clockHand1Model.indices;
    var clock2Indices = clockHand2Model.indices;
    var tailIndices = tailModel.indices;
	 
	var tailVertices = tailModel.vertices;
    var tailNormals = tailModel.vertexNormals;

    var eye1Vertices = eyeModel1.vertices;
    var eye1Normals = eyeModel1.vertexNormals;
	 var eye1TexCoords = eyeModel1.textures;
    
    var eye2Vertices = eyeModel2.vertices;
    var eye2Normals = eyeModel2.vertexNormals;
	var eye2TexCoords = eyeModel2.textures;
    
    var clock1Vertices = clockHand1Model.vertices;
    var clock1Normals = clockHand1Model.vertexNormals;

    var clock2Vertices = clockHand2Model.vertices;
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
    
    //###################################################################################

    var positionAttributeLocation = new Array();
    var uvAttributeLocation = new Array();
    var matrixLocation = new Array();
    var textLocation = new Array();
    //var textNMLocation = new Array();   //NM
    //var eyePosUniform = new Array();   //NM
    var normalAttributeLocation= new Array();
    var lightDirection= new Array();
    var lightColor= new Array();
    var materialDiffColor= new Array();

    positionAttributeLocation[0] = gl.getAttribLocation(program1, "inPosition");  
    uvAttributeLocation[0] = gl.getAttribLocation(program1, "a_uv");  
    matrixLocation[0] = gl.getUniformLocation(program1, "matrix");  
    textLocation[0] = gl.getUniformLocation(program1, "u_texture");
    //textNMLocation[0] = gl.getUniformLocation(program1, "u_tex_NormalMap"); //NM
    //eyePosUniform[0] = gl.getUniformLocation(program1, "eyePos");    //NM
    normalAttributeLocation[0] = gl.getAttribLocation(program1, "inNormal");
    lightDirection[0] = gl.getUniformLocation(program1, 'lightDirection');
    lightColor[0] = gl.getUniformLocation(program1, 'lightColor');
    
    positionAttributeLocation[1] = gl.getAttribLocation(program1, "inPosition");  
    uvAttributeLocation[1] = gl.getAttribLocation(program1, "a_uv");  
    matrixLocation[1] = gl.getUniformLocation(program1, "matrix");  
    textLocation[1] = gl.getUniformLocation(program1, "u_texture");
    //textNMLocation[1] = gl.getUniformLocation(program1, "u_tex_NormalMap"); //NM
    //    eyePosUniform[1] = gl.getUniformLocation(program1, "eyePos");    //NM

    normalAttributeLocation[1] = gl.getAttribLocation(program1, "inNormal");
    lightDirection[1] = gl.getUniformLocation(program1, 'lightDirection');
    lightColor[1] = gl.getUniformLocation(program1, 'lightColor');

    positionAttributeLocation[2] = gl.getAttribLocation(program1, "inPosition");  
    uvAttributeLocation[2] = gl.getAttribLocation(program1, "a_uv");  
    matrixLocation[2] = gl.getUniformLocation(program1, "matrix");  
    textLocation[2] = gl.getUniformLocation(program1, "u_texture");
    //textNMLocation[2] = gl.getUniformLocation(program1, "u_tex_NormalMap"); //NM
     //   eyePosUniform[0] = gl.getUniformLocation(program1, "eyePos");    //NM
    normalAttributeLocation[2] = gl.getAttribLocation(program1, "inNormal");
    lightDirection[2] = gl.getUniformLocation(program1, 'lightDirection');
    lightColor[2] = gl.getUniformLocation(program1, 'lightColor');

    positionAttributeLocation[3] = gl.getAttribLocation(program2, "inPosition");  
    matrixLocation[3] = gl.getUniformLocation(program2, "matrix");  
    materialDiffColor[3] = gl.getUniformLocation(program2, 'mDiffColor');
    normalAttributeLocation[3] = gl.getAttribLocation(program2, "inNormal");
    lightDirection[3] = gl.getUniformLocation(program2, 'lightDirection');
    lightColor[3] = gl.getUniformLocation(program2, 'lightColor');

    positionAttributeLocation[4] = gl.getAttribLocation(program2, "inPosition");  
    matrixLocation[4] = gl.getUniformLocation(program2, "matrix");  
    materialDiffColor[4] = gl.getUniformLocation(program2, 'mDiffColor');
    normalAttributeLocation[4] = gl.getAttribLocation(program2, "inNormal");
    lightDirection[4] = gl.getUniformLocation(program2, 'lightDirection');
    lightColor[4] = gl.getUniformLocation(program2, 'lightColor');

    positionAttributeLocation[5] = gl.getAttribLocation(program2, "inPosition");  
    matrixLocation[5] = gl.getUniformLocation(program2, "matrix");  
    materialDiffColor[5] = gl.getUniformLocation(program2, 'mDiffColor');
    normalAttributeLocation[5] = gl.getAttribLocation(program2, "inNormal");
    lightDirection[5] = gl.getUniformLocation(program2, 'lightDirection');
    lightColor[5] = gl.getUniformLocation(program2, 'lightColor');

    var vaos =  new Array();
    for(i=0; i<6; i++){
        vaos[i] = gl.createVertexArray();
        gl.bindVertexArray(vaos[i]);

        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData[i]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionAttributeLocation[i]);
        gl.vertexAttribPointer(positionAttributeLocation[i], 3, gl.FLOAT, false, 0, 0);

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
            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture[i]);

            var image = new Image();
            image.src = baseDir+modelTexture;
            image.onload= function() {
            gl.bindTexture(gl.TEXTURE_2D, texture);
                      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);
            };
            
            /*var textureNM = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, textureNM[i]);

            var imageNM = new Image();
            imageNM.src = baseDir+modelNMTexture;
            imageNM.onload= function() {
            gl.bindTexture(gl.TEXTURE_2D, textureNM);
                      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageNM);
                      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);
            };*/
        }
    }
    
    //Define the scene Graph
    var objects = [];
    var currentDate= new Date();
    var min= currentDate.getMinutes();
    var hr= currentDate.getHours();
    
    //var catOrbitNode= new Node();

	var catNode= new Node();
	catNode.drawInfo={
		materialColor: [-1.0 , -1.0 , -1.0, 1.0],
        materialDiff: materialDiffColor[0],
        lightColor:lightColor[0],
        lightDirection: lightDirection[0],
        programInfo: program1,
		bufferLength: catIndices.length,
		vertexArray: vaos[0],
        textLocation: textLocation[0],
        //textNMLocation: textNMLocation[0],  //NM
        //eyePosUniform: eyePosUniform[0],  //NM
        matrixLocation: matrixLocation[0],
	};
	
	var eye1OrbitNode= new Node();
	eye1OrbitNode.localMatrix= eye1LocalMatrix;
	
    var eye2OrbitNode= new Node();
	eye2OrbitNode.localMatrix= eye2LocalMatrix;

	//var eye1Node= new Node();
	//eye1Node.localMatrix= utils.MakeScaleMatrix(1.0,1.0,1.0);

	eye1OrbitNode.drawInfo={
        materialColor: [-1.0 , -1.0 , -1.0],
        materialDiff: materialDiffColor[1],
        lightColor:lightColor[1],
        lightDirection: lightDirection[1],
        programInfo: program1,
		bufferLength: eye1Indices.length,
		vertexArray: vaos[1],
        textLocation: textLocation[1], 
        //textNMLocation: textNMLocation[1],  //NM
        //eyePosUniform: eyePosUniform[1],  //NM
        matrixLocation: matrixLocation[1],
	};

    //var eye2Node= new Node();
	//eye2Node.localMatrix= utils.MakeScaleMatrix(1.0,1.0,1.0);

	eye2OrbitNode.drawInfo={
		materialColor: [-1.0 , -1.0 , -1.0],
        materialDiff: materialDiffColor[2],
        lightColor:lightColor[2],
        lightDirection: lightDirection[2],
		programInfo: program1,
		bufferLength: eye2Indices.length,
		vertexArray: vaos[2],
        textLocation: textLocation[2],
        //textNMLocation: textNMLocation[2],  //NM
        //        eyePosUniform: eyePosUniform[2],  //NM

        matrixLocation: matrixLocation[2],
	};
    
    var clock1OrbitNode= new Node();
    clock1OrbitNode.localMatrix= utils.multiplyMatrices(utils.MakeRotateZMatrix(min*6),clockHand1LocalMatrix);
	
    clock1OrbitNode.drawInfo={
		materialColor: [0.85 , 0.55 , 0.0],
        materialDiff: materialDiffColor[3],
        lightColor:lightColor[3],
        lightDirection: lightDirection[3],
		programInfo: program2,
		bufferLength: clock1Indices.length,
		vertexArray: vaos[3],
        textLocation: textLocation[3],  
        //textNMLocation: textNMLocation[3],  //NM
        //        eyePosUniform: eyePosUniform[3],  //NM

        matrixLocation: matrixLocation[3],
	};
    
     var clock2OrbitNode= new Node();
        clock2OrbitNode.localMatrix= utils.multiplyMatrices(utils.MakeRotateZMatrix(hr*30 +(min/60)*30),clockHand2LocalMatrix);

    //clock2OrbitNode.localMatrix= clockHand2LocalMatrix;
	
    clock2OrbitNode.drawInfo={
		materialColor: [1.0 , 0.5 , 1.0],
        materialDiff: materialDiffColor[4],
        lightColor:lightColor[4],
        lightDirection: lightDirection[4],
		programInfo: program2,
		bufferLength: clock2Indices.length,
		vertexArray: vaos[4],
        textLocation: textLocation[4],  
        //textNMLocation: textNMLocation[4],  //NM
        //        eyePosUniform: eyePosUniform[4],  //NM
        matrixLocation: matrixLocation[4],
	};
    
    var tailNode= new Node();
    tailNode.localMatrix= tailLocalMatrix;
	
    tailNode.drawInfo={
		materialColor: [0.0 , 0.0 , 0.0],
        materialDiff: materialDiffColor[5],
        lightColor:lightColor[5],
        lightDirection: lightDirection[5],
		programInfo: program2,
		bufferLength: tailIndices.length,
		vertexArray: vaos[5],
        textLocation: textLocation[5],  
        //textNMLocation: textNMLocation[5],  //NM
        //        eyePosUniform: eyePosUniform[5],  //NM

        matrixLocation: matrixLocation[5],
	};
    
    //catNode.setParent(catOrbitNode);
    
	eye1OrbitNode.setParent(catNode);
	//eye1Node.setParent(eye1OrbitNode);

    eye2OrbitNode.setParent(catNode);
        //eye2Node.setParent(eye2OrbitNode);
    
    clock1OrbitNode.setParent(catNode);
    clock2OrbitNode.setParent(catNode);
    tailNode.setParent(catNode);
	  
    var objects = [
	  catNode,
	  eye1OrbitNode,
      eye2OrbitNode,    
      clock1OrbitNode,
      clock2OrbitNode,
      tailNode
	  ];

    requestAnimationFrame(drawScene);
    
   function animate(){//not used for the moment
    var currentTime = (new Date).getTime();
    /*if(lastUpdateTime != null){
      var deltaC = (30 * (currentTime - lastUpdateTime)) / 1000.0;
      Rx += deltaC;
      Ry -= deltaC;
      Rz += deltaC;    
    }*/
    worldMatrix = utils.MakeWorld(0.0, 0.0, 0.0, Rx, Ry, Rz, S);
    lastUpdateTime = currentTime;               
  }
    var periodTail= 90;
    var dirTail=1;
    var periodEye= 90;
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

        // Compute the camera matrix using look at.
    /*var cameraPosition = [0.0, 0.0, 2.0];
    var target = [0.0, 0.0, 0.0];
    var up = [0.0, 1.0, 0.0];
    var cameraMatrix = utils.LookAt(cameraPosition, target, up);    //necessary????
    var viewMatrix = utils.invertMatrix(cameraMatrix);*/
	
    cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cy = lookRadius * Math.sin(utils.degToRad(-elevation));
	
	if(elevation>180)
		elevation=elevation-360
	if(elevation<-180)
		elevation=elevation+360
	//var viewMatrix = utils.MakeView(cx, cy, cz, elevation, -angle);
	if(elevation<=90 && elevation>=-90){
		var viewMatrix = utils.lookAtViewProjection(0.0,0.0,0.0,cx,cy,cz,[0,1,0]);
		//console.log(cx,cy,cz)
	}
	else{
		var viewMatrix = utils.lookAtViewProjection(0.0,0.0,0.0,cx,cy,cz,[0,-1,0]);
			//console.log(cx,cy,cz)
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
           if(periodEye==150)
               dirEye=-1;
       }
    else
        {
            periodEye--;
            if (periodEye== 0)
                dirEye=1;
        }
    
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
        //console.log("bbbbbbbbibbi")
        clock1OrbitNode.localMatrix= utils.multiplyMatrices(utils.MakeRotateZMatrix(min*6),clockHand1LocalMatrix);
        clock2OrbitNode.localMatrix= utils.multiplyMatrices(utils.MakeRotateZMatrix(hr*30 +(min/60)*30),clockHand2LocalMatrix);
        autoSet= false;
    }
    autoSet= false;

    
    //SURREALIST MODE
    //eye1OrbitNode.localMatrix= utils.multiplyMatrices(utils.MakeRotateZMatrix(0.5), eye1OrbitNode.localMatrix);
        var currDate= new Date();
        var currMin= currDate.getMinutes();
    if(currMin-min>0){
        clock1OrbitNode.localMatrix= utils.multiplyMatrices(utils.MakeRotateZMatrix(6), clock1OrbitNode.localMatrix);
        clock2OrbitNode.localMatrix= utils.multiplyMatrices(utils.MakeRotateZMatrix(0.5), clock2OrbitNode.localMatrix);
        min=currMin;

    }
    eye1OrbitNode.localMatrix= utils.multiplyMatrices(utils.MakeRotateYMatrix(dirEye*0.06), eye1OrbitNode.localMatrix);
        //strabism mode
        //eye1OrbitNode.localMatrix= utils.multiplyMatrices(utils.MakeRotateYMatrix(-dirEye*0.06), eye1OrbitNode.localMatrix);

    eye2OrbitNode.localMatrix= utils.multiplyMatrices(utils.MakeRotateYMatrix(dirEye*0.06), eye2OrbitNode.localMatrix);

	catNode.updateWorldMatrix();

objects.forEach(function (object){

	gl.useProgram(object.drawInfo.programInfo);
    
    var perspectiveMatrix = utils.MakePerspective(1.0, gl.canvas.width/gl.canvas.height, 0.1, 2000);

    var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, object.worldMatrix);
    var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);

    gl.uniformMatrix4fv(object.drawInfo.matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));
    
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(object.drawInfo.textLocation, texture);

    //gl.activeTexture(gl.TEXTURE1);  //NM
    //gl.uniform1i(object.drawInfo.textNMLocation, textureNM);    //NM
    
    
    var alpha = -45;
    var beta = 90;
    var directionalLight= [Math.cos(-utils.degToRad(alpha)) * Math.cos(-utils.degToRad(beta)),
              Math.sin(-utils.degToRad(alpha)), Math.cos(-utils.degToRad(alpha)) * Math.sin(-utils.degToRad(beta))];
    var directionalLightColor = [1.0, 1.0, 1.0];
	var lightDirMatrix=utils.sub3x3from4x4(utils.transposeMatrix(object.worldMatrix));

    var directionalLightTransformed=utils.normalizeVec3(utils.multiplyMatrix3Vector3(lightDirMatrix, directionalLight));

    gl.uniform3fv(object.drawInfo.materialDiff, object.drawInfo.materialColor);
    gl.uniform3fv(object.drawInfo.lightColor,  [1.0, 1.0, 1.0]);
    gl.uniform3fv(object.drawInfo.lightDirection,  directionalLightTransformed);
    gl.uniform3fv(object.drawInfo.lightColor,  directionalLightColor);
    
    	//gl.uniform3f(object.drawInfo.eyePosUniform, cx, cy, cz); //NM

    
    gl.bindVertexArray(object.drawInfo.vertexArray);
    gl.drawElements(gl.TRIANGLES, object.drawInfo.bufferLength, gl.UNSIGNED_SHORT, 0 );
	});
    window.requestAnimationFrame(drawScene);
  }
}

async function init(){
  
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

    await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
      var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
      var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
      program1 = utils.createProgram(gl, vertexShader, fragmentShader);

    });
    //gl.useProgram(program1);
    
    await utils.loadFiles([shaderDir + 'vs2.glsl', shaderDir + 'fs2.glsl'], function (shaderText) {
      var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
      var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
      program2 = utils.createProgram(gl, vertexShader, fragmentShader);

    });
   // gl.useProgram(program2);
    
    //###################################################################################
    //This loads the obj model in the catModel variable
    var catObjStr = await utils.get_objstr(baseDir+ modelStr);
    catModel = new OBJ.Mesh(catObjStr);
    //###################################################################################
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

