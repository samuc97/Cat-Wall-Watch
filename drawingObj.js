var program;
var gl;
var shaderDir; 
var baseDir;
var catModel;
var eyeModel1;
var eyeModel2;
var clockHand1Model;
var clockHand2Model;
var tailModel;

var modelStr = 'Body/Cat_body_norm.obj';
var modelTexture = 'kitcat_NM.png'; //normal textures missing
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


function main() {
    
    var lastUpdateTime = (new Date).getTime();
    
    var Rx = 0.0;
    var Ry = 0.0;
    var Rz = 0.0;
    var S  = 1.0;

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
	    var tailTexCoords = tailModel.textures;

	var vertexData= catVertices.concat(tailVertices);
	var normalData= catNormals.concat(tailNormals);
	var indexData= catIndices.concat(tailIndices);
	var texData= catTexCoords.concat(tailTexCoords);
	
    //###################################################################################

    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");  
    var uvAttributeLocation = gl.getAttribLocation(program, "a_uv");  
    var matrixLocation = gl.getUniformLocation(program, "matrix");  
    var textLocation = gl.getUniformLocation(program, "u_texture");

    var perspectiveMatrix = utils.MakePerspective(120, gl.canvas.width/gl.canvas.height, 0.1, 100.0);
    var viewMatrix = utils.MakeView(0, 0.0, 3.0, 0.0, 0.0);

    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texData), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(uvAttributeLocation);
    gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW); 
	
	 //   var indexTailBuffer = gl.createBuffer();
   // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexTailBuffer);

	   // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(tailIndices), gl.STATIC_DRAW); 


    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

//Define the scene Graph

  var objects = [];

	var catNode= new Node();
	catNode.localMatrix =utils.MakeScaleMatrix(40 , 40 , 40 );
	catNode.drawInfo={
		program: program,
		bufferLength: catIndices.length,
		vertexArray: vao,
	};
	
	var tailOrbitNode= new Node();
	tailOrbitNode.localMatrix= utils.MakeTranslateMatrix(1.0,1.0,1.0);
	
	var tailNode= new Node();
	tailNode.localMatrix= utils.MakeScaleMatrix(1.0,1.0,1.0);

	tailNode.drawInfo={
		materialColor: [0.6 , 0.6 , 0.6],
		program: program,
		bufferLength: tailIndices.length,
		vertexArray: vao,
	};
	
	tailOrbitNode.setParent(catNode);
	tailNode.setParent(tailOrbitNode);

	  var objects = [
	  catNode,
	  tailNode,
	  ];


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
    
    drawScene();
    
   function animate(){
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
    
    function drawScene() {
    animate();

    utils.resizeCanvasToDisplaySize(gl.canvas);
    gl.clearColor(0.85, 0.85, 0.85, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//tailOrbitNode.localMatrix= utils.multiplyMatrices()

	catNode.updateWorldMatrix();

objects.forEach(function (object){

	//gl.useProgram(object.drawInfo.programInfo);
    var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, object.worldMatrix);
    var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);

    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));

    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(textLocation, texture);

    gl.bindVertexArray(vao);
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
      program = utils.createProgram(gl, vertexShader, fragmentShader);

    });
    gl.useProgram(program);
    
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

