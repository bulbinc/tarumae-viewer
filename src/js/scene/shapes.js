////////////////////////////////////////////////////////////////////////////////
// tarumae engine
// http://tarumae.jp
//
// Copyright(c) 2016 BULB CORP. all rights reserved
////////////////////////////////////////////////////////////////////////////////

import Tarumae from "../entry";
import { Vec3, Vec4, Color3, Color4 } from "../math/vector";
import "../webgl/mesh";
import "../utility/event";
import "./object";
import "./material";

Tarumae.Shapes = {};

////////////////////////// Plane //////////////////////////

Tarumae.Shapes.Plane = class extends Tarumae.SceneObject {
	constructor(width, height) {
		super();
		this.addMesh(new Tarumae.Shapes.PlaneMesh(width, height));
	}
};

Tarumae.Shapes.PlaneMesh = class extends Tarumae.Mesh {
	constructor(width, height) {
		super();

		if (typeof width === "undefined") {
			width = 1;
		}

		if (typeof height === "undefined") {
			height = 1;
		}

		var halfWidth = width * 0.5, halfHeight = height * 0.5;

		this.vertices = [-halfWidth, 0, -halfHeight, -halfWidth, 0, halfHeight,
			halfWidth, 0, -halfHeight, halfWidth, 0, halfHeight];
		this.normals = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
		this.texcoords = [0, 0, 0, 1, 1, 0, 1, 1];
		this.tangents = [-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0];
		this.bitangents = [0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1];

		this.meta = {
			vertexCount: 4,
			normalCount: 4,
			uvCount: 1,
			texcoordCount: 4,
			tangentBasisCount: 4,
		};

		this.composeMode = Tarumae.Mesh.ComposeModes.TriangleStrip;
	}
};

////////////////////////// Cube //////////////////////////

Tarumae.CubeMesh = class extends Tarumae.Mesh {
	constructor() {
		super();

		this.vertexBuffer = Tarumae.CubeMesh.VertexBuffer;

		this.meta = {
			vertexCount: 36,
			normalCount: 36,
			texcoordCount: 36,
			tangentBasisCount: 36,
		};
	}	
};

Tarumae.CubeMesh.VertexBuffer = new Float32Array([
	-0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5,
	-0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5,
	0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
	-0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
	-0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5,
	-0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5,
	0.5, 0.5, 0.5,
	-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
	1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
	-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, -1.0,
	0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 1.0,
	0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, -1.0,
	0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
	1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0,
	0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0,
	0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
	0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
	-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0,
	-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
	-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, -1.0,
	0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0,
	-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 0.0, 0.0, 1.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0,
	0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
	-1.0, 0.0, 0.0, -1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
	0.0, 0.0, 1.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
	0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0]);

Tarumae.Shapes.Cube = class extends Tarumae.SceneObject {
	constructor() {
		super();

		this.addMesh(new Tarumae.CubeMesh());
	}

	updateMesh() {
		// todo: dynamically generate faces of cube
	}
};

////////////////////////// GridLine //////////////////////////

Tarumae.GridLine = class extends Tarumae.SceneObject {
	constructor(gridSize, stride) {
		super();

		this.mat = { color: new Color3(0.7, 0.7, 0.7) };
		this.receiveLight = false;

		if (typeof gridSize === "undefined") {
			this.gridSize = 10.0;
		} else {
			this.gridSize = gridSize;
		}

		if (typeof stride === "undefined") {
			this.stride = 1.0;
		} else {
			this.stride = stride;
		}

		this.conflictWithRay = false;
		this.receiveLight = false;

		this.addMesh(Tarumae.GridLine.generateGridLineMesh(this.gridSize, this.stride));
	}
}

Tarumae.GridLine.generateGridLineMesh = function(gridSize, stride) {
	var width = gridSize, height = gridSize;

	var mesh = new Tarumae.Mesh();
	mesh.vertices = [];
	mesh.composeMode = Tarumae.Mesh.ComposeModes.Lines;

	for (var y = -height; y <= height; y += stride) {
		mesh.vertices.push(-width, 0, y);
		mesh.vertices.push(width, 0, y);
	}

	for (var x = -width; x <= width; x += stride) {
		mesh.vertices.push(x, 0, -height);
		mesh.vertices.push(x, 0, height);
	}

	return mesh;
};

////////////////////////// Billboard //////////////////////////

Tarumae.Billboard = class extends Tarumae.SceneObject {
	constructor(image) {
		super();
	
		if (Tarumae.BillboardMesh.instance == null) {
			Tarumae.BillboardMesh.instance = new Tarumae.BillboardMesh();
		}

		this.addMesh(Tarumae.BillboardMesh.instance);

		this.mat = { tex: null };
	
		if (typeof image === "string" && image.length > 0) {
			Tarumae.ResourceManager.download(image, Tarumae.ResourceTypes.Image, img => {
				this.mat.tex = new Tarumae.Texture(img);
				if (this.scene) {
					this.scene.requireUpdateFrame();
				}
			});
		} else if (image instanceof Image) {
			this.mat.tex = image;
		}
	
		this.targetCamera = null;
		this.cameraMoveListener = null;
		this.attachedScene = null;
		this.cameraChangeListener = null;

		this.on("sceneChange", scene => {
			if (scene) {
				this.targetCamera = scene.mainCamera;
				this.cameraMoveListener = this.targetCamera.on("move", function() {
					Tarumae.Billboard.faceToCamera(this, this.targetCamera);
				});

				this.attachedScene = scene;
				this.cameraChangeListener = scene.on("mainCameraChange", function() {
					Tarumae.Billboard.faceToCamera(this, this.targetCamera);
				});
			} else {
				if (this.targetCamera && this.cameraMoveListener) {
					this.targetCamera.removeEventListener("move", this.cameraMoveListener);
				}
				if (this.attachedScene && this.cameraChangeListener) {
					this.attachedScene.removeEventListener("mainCameraChange", this.cameraChangeListener);
				}

				this.targetCamera = null;
				this.cameraMoveListener = null;
				this.attachedScene = null;
				this.cameraChangeListener = null;
			}
		});

		this.shader = {
			name: "billboard",
		};
	}
};	

Tarumae.Billboard.faceToCamera = function(billboard, camera) {
	var cameraLoc = camera.getWorldLocation();
	var worldLoc = billboard.getWorldLocation();

	var diff = cameraLoc.sub(worldLoc);

	billboard.angle.y = Tarumae.MathFunctions.degreeToAngle(Math.atan2(diff.x, diff.z));
};

Tarumae.BillboardMesh = class extends Tarumae.Mesh {
	constructor() {
		super();

		this.meta = {
			vertexCount: 4,
			normalCount: 0,
			texcoordCount: 4
		};

		this.vertexBuffer = Tarumae.BillboardMesh.VertexBuffer;
		this.composeMode = Tarumae.Mesh.ComposeModes.TriangleStrip;
	}
};

Tarumae.BillboardMesh.instance = null;

Tarumae.BillboardMesh.VertexBuffer = new Float32Array([
	-1, 1, 0, -1, -1, 0, 1, 1, 0, 1, -1, 0, 0, 0, 0, 1, 1, 0, 1, 1
]);

////////////////////////// Light //////////////////////////

Tarumae.PointLight = class extends Tarumae.SceneObject {
	constructor() {
		super();

		this.mat = {
			emission: 1.0,
			color: new Color3(1.0, 0.95, 0.9),
		};

		this.type = Tarumae.ObjectTypes.PointLight;
	}
};

////////////////////////// Line //////////////////////////

Tarumae.Shapes.Line = class extends Tarumae.SceneObject {
	constructor(start, end, width) {
		super();
	
		this._start = start || new Vec3();
		this._end = end || new Vec3();
		this._width = width || 0.1;

		this.dirty = true;
	
		this.mesh = new Tarumae.Shapes.LineMesh(this._start, this._end, this._width);
		this.addMesh(this.mesh);
	}
};

// Tarumae.Shapes.Line.prototype = new Tarumae.SceneObject();

Object.defineProperties(Tarumae.Shapes.Line.prototype, {
	"start": {
		get: function() {
			return this._start;
		},
		set: function(val) {
			this._start = val;
			this.dirty = true;
		},
	},

	"end": {
		get: function() {
			return this._end;
		},
		set: function(val) {
			this._end = val;
			this.dirty = true;
		},
	},

	"width": {
		get: function() {
			return this._width;
		},
		set: function(val) {
			this._width = val;
			this.dirty = true;
		},
	},

	"draw": {
		value: function() {
			if (this.dirty) {
				this.mesh.update(this._start, this._end, this._width);
				this.dirty = false;
			}
		},
	},
});

Tarumae.Shapes.LineMesh = class extends Tarumae.SceneObject {
	constructor(start, end, width) {
		super();
		this.name = "LineMesh";

		this.update(start, end, width);

		this.composeMode = Tarumae.Mesh.ComposeModes.TriangleStrip;
	}
};

Tarumae.Shapes.LineMesh.prototype.update = function(start, end, width) {
	this.destroy();
	
	start = start || Vec3.zero;
	end = end || Vec3.zero;
	width = width || 0.5;

	var segs = 5;
	var angles = Math.PI * 2 / segs;

	this.vertices = [];

	var m = new Tarumae.Matrix4().lookAt(start, end, Vec3.up);

	for (var i = 0, a = 0; i <= segs; i++ , a += angles) {
		var v = new Vec4(Math.sin(a) * width, Math.cos(a) * width, 0, 1).mulMat(m);
		
		this.vertices.push(start.x + v.x, start.y + v.y, start.z + v.z);
		this.vertices.push(end.x + v.x, end.y + v.y, end.z + v.z);
	}
};

Tarumae.Shapes.Sphere = class extends Tarumae.SceneObject {
	constructor(segments, rings) {
		super();
	
		this.generateMesh(segments, rings);
	}
};

// Tarumae.Shapes.Sphere.prototype = new Tarumae.SceneObject();

Tarumae.Shapes.Sphere.prototype.generateMesh = function(segments, rings, composeMode) {

	for (var i = 0; i < this.meshes.length; i++) {
		this.meshes[i].destroy();
	}

	this.meshes._s3_clear();

	segments = segments || 12;
	rings = rings || 24;

	var anglePerSeg = Math.PI / segments;
	var anglePerRing = Math.PI * 2.0 / rings;
	var halfPI = Math.PI / 2;
	var vangle = Math.PI / 2 - anglePerSeg;
	
	if (composeMode == Tarumae.Mesh.ComposeModes.Points) {

		var mesh = (function() {
			var mesh = new Tarumae.Mesh();
			mesh.composeMode = composeMode;
			mesh.vertices = [];
			mesh.normals = [];
		
			for (var j = 0; j < segments; j++) {
				var a1 = vangle, a2 = vangle - anglePerSeg;

				var y1 = Math.sin(a1), y2 = Math.sin(a2);
				var l1 = Math.sin(a1 + halfPI), l2 = Math.sin(a2 + halfPI);

				for (var i = 0, hangle = 0; i <= rings; i++ , hangle += anglePerRing) {
			
					var s = Math.sin(hangle), c = Math.cos(hangle);
					var x1 = s * l1, z1 = c * l1, x2 = s * l2, z2 = c * l2;
			
					mesh.vertices.push(x1, y1, z1);
					mesh.normals.push(x1, y1, z1);
				}

				vangle -= anglePerSeg;
			}

			return mesh;
		})();
		
		this.addMesh(mesh);

	} else {
		var generateSphereFan = function(starty) {
			var mesh = new Tarumae.Mesh();
			mesh.composeMode = Tarumae.Mesh.ComposeModes.TriangleFan;
			mesh.vertices = [];
			mesh.normals = [];
			mesh.vertices.push(0, starty, 0);
			mesh.normals.push(0, starty, 0);

			for (var i = 0, hangle = 0; i <= rings; i++ , hangle += anglePerRing) {
				var y = Math.sin(vangle), l = Math.sin(vangle + halfPI);
				var x = Math.sin(hangle) * l, z = Math.cos(hangle) * l;
				mesh.vertices.push(x, y, z);
				mesh.normals.push(x, y, z);
			}

			return mesh;
		};

		var topMesh = generateSphereFan(1);
	
		var middleMesh = new Tarumae.Mesh();
		middleMesh.composeMode = Tarumae.Mesh.ComposeModes.TriangleStrip;
		middleMesh.vertices = [];
		middleMesh.normals = [];
	
		for (var j = 1; j < segments - 1; j++) {
			var a1 = vangle, a2 = vangle - anglePerSeg;

			var y1 = Math.sin(a1), y2 = Math.sin(a2);
			var l1 = Math.sin(a1 + halfPI), l2 = Math.sin(a2 + halfPI);

			for (var i = 0, hangle = 0; i <= rings; i++ , hangle += anglePerRing) {
			
				var s = Math.sin(hangle), c = Math.cos(hangle);
				var x1 = s * l1, z1 = c * l1, x2 = s * l2, z2 = c * l2;
			
				middleMesh.vertices.push(x1, y1, z1);
				middleMesh.vertices.push(x2, y2, z2);
				middleMesh.normals.push(x1, y1, z1);
				middleMesh.normals.push(x2, y2, z2);
			}

			vangle -= anglePerSeg;
		}

		var bottomMesh = generateSphereFan(-1);
	
		this.addMesh(topMesh);
		this.addMesh(middleMesh);
		this.addMesh(bottomMesh);
	}
};

////////////////////////// Circle //////////////////////////

Tarumae.Circle = class extends Tarumae.SceneObject {
	constructor() {
		super();
		var _segments = 8;
		var _circleSize = 0.5;

		this.Parameters = {
			set segments(val) {
				_segments = val;
				this.updateMesh();
			},
			get segments() { return _segments; },
			set circleSize(val) {
				_circleSize = val;
				this.updateMesh();
			},
			get circleSize() { return _circleSize; },

			shader: {
				name: "solidcolor",
				color: new Color4(0.2, 0.64, 0.86, 1)
			},

			mesh: new Tarumae.CircleMesh(_segments, _circleSize),
			updateMesh: function() {

				if (!_segments || _segments < 6) {
					_segments = 8;
				}

				if (!_circleSize) {
					_circleSize = 0.5;
				}

				this.mesh.destroy();
				this.mesh.vertices = [0, 0, 0];
				var anglePerSegment = Math.PI * 2 / _segments;

				for (var i = 0; i <= _segments; i++) {
					var angle = anglePerSegment * (_segments - i);
					this.mesh.vertices.push(Math.sin(angle) * _circleSize, Math.cos(angle) * _circleSize, 0);
				}
			}
		};

		this.addMesh(this.Parameters.mesh);
	}
};

Tarumae.CircleMesh = class extends Tarumae.SceneObject {
	constructor(segments, circleSize) {
		super();

		this.anglePerSegment = Math.PI * 2 / segments;

		// 頂点座標を生成
		this.vertices = [0, 0, 0];

		for (var i = 0; i <= segments; i++) {
			var angle = this.anglePerSegment * (segments - i);
			this.vertices.push(Math.sin(angle) * circleSize, Math.cos(angle) * circleSize, 0);
		}

		// ポリゴン構成方法（三角形FAN）
		this.composeMode = Tarumae.Mesh.ComposeModes.TriangleFan;
	}
};

///////////////// ParticleGenerator /////////////////

Tarumae.ParticleGenerator = class extends Tarumae.SceneObject {
	constructor(spriteCount, sourceBox) {
		super();

		this.spriteCount = spriteCount || 1000;
		this.sourceBox = new Tarumae.BoundingBox();
		this.elapsedTime = 0;
		this.isRunning = false;

		this.ondraw = this.frameRender;
	}
};

// Tarumae.ParticleGenerator.prototype = new Tarumae.SceneObject();

new Tarumae.EventDispatcher(Tarumae.ParticleGenerator).registerEvents(
	"createSprite", "initSprite", "cycleSprite", "destroySprite", "frameSprite");

Object.defineProperties(Tarumae.ParticleGenerator.prototype, {
	"start": {
		value: function() {

			for (var i = 0; i < this.spriteCount; i++) {
				var sp = this.oncreateSprite();
				this.oninitSprite(sp);
				this.add(sp);
			}

			this.isRunning = true;

			if (this.scene) {
				this.scene.animation = true;
			}
		},
	},	

	"stop": {
		value: function() {
			if (this.isRunning) {
				this.isRunning = false;

				if (this.scene) {
					this.scene.animation = true;
				}
			}
		},
	},	

	"frameRender": {
		value: function() {
			if (this.isRunning) {
				for (var i = 0; i < this.objects.length; i++) {
					var sp = this.objects[i];
					if (sp) {
						this.onframeSprite(sp);

						if (this.oncycleSprite(sp)) {
							this.oninitSprite(sp);
						}
					}
				}
			}
		},
	},	

});

//////////////////// ProgressBarObject ////////////////////

Tarumae.ProgressBarObject = class extends Tarumae.SceneObject {
	constructor(session, widthp, heightp) {
		super();
		var _this = this;

		this.progressRate = 0;

		session.on("progress", function() {
			_this.progressRate = session.progressRate;
			if (_this.scene) {
				_this.scene.requireUpdateFrame();
			}
		});

		session.on("finish", function() {
			if (_this.scene) {
				_this.scene.remove(_this);
			}
		});

		this.widthp = widthp || 0.7;
		this.heightp = heightp || 0.05;

		this.on("sceneChange", function(scene) {
			_this.scene = scene;
			if (scene) {
				var renderSize = scene.renderer.renderSize;
				this.width = renderSize.width * this.widthp;
				this.height = renderSize.height * this.heightp;
				this.left = (renderSize.width - this.width) / 2;
				this.top = (renderSize.height - this.height) / 2;
			}
		});

		this.on("draw", (function() {
			var rectbg = new Tarumae.Rect(), rectpb = new Tarumae.Rect(), tpos = new Tarumae.Point();

			return function(g) {
				if (this.progressRate < 1) {
					rectbg.set(this.left, this.top, this.width, this.height);
					rectpb.set(this.left + 1, this.top + 1, this.width * this.progressRate - 2, this.height - 2);
					tpos.set(this.left + this.width / 2, this.top + this.height / 2);

					g.drawRect2D(rectbg, 2, "gray");
					g.drawRect2D(rectpb, 0, null, "#6666ff");
					g.drawText2D(tpos, Math.round(this.progressRate * 100) + " %", "black", "center");
				}
			};
		})());
	}
};