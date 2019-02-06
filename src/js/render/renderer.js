////////////////////////////////////////////////////////////////////////////////
// tarumae engine
// http://tarumae.jp
//
// Copyright(c) 2016 BULB CORP. all rights reserved
////////////////////////////////////////////////////////////////////////////////

import Tarumae from "../entry";
import "../utility/utility";
import { Vec2, Vec3, Vec4, Color3, Color4, Point } from "../math/vector";
import "../scene/scene";
import { initDOM } from "./dom";
import "./pipeline";
import "./draw2d";
import "../webgl/shader";
import "../webgl/buffers";
import "../utility/debug";

Tarumae.Renderer = class {

	static defaultOptions() {
		return {
			containerId: "canvas-container",
			renderPixelRatio: 1,
			enable3D: true,
			perspective: {
				method: Tarumae.ProjectionMethods.Persp,
				angle: 50.0,
				near: 0.1,
				far: 100.0,
			},
			backColor: new Color4(0.93, 0.93, 0.93, 1.0),
			backgroundImage: undefined,
			enableDrawMesh: true,
			enableCustomDraw: true,
			enableLighting: true,
			enableLightmap: true,
			enableNormalMap: true,
			enableEnvmap: true,
			enableHighlightSelectedChildren: true,
			enableShadow: false,
			shadowQuality: {
				scale: 1,
				viewDepth: 2,
				resolution: 1024,
			},
			enablePostprocess: true,
			postprocess: {
				gamma: 1.2,
			},
			bloomEffect: {
				enabled: true,
				threshold: 0.1,
				gamma: 1.5,
			},
			debugMode: false,
			showDebugPanel: false,
			enable3D: true,
			enableAntialias: false,
		};
	}

	constructor(options) {

		this.initialized = false;
		this.debugMode = false;
		this.developmentVersion = false;

		if (typeof Tarumae.Version === "object") {
			var ver = Tarumae.Version;
			ver.toString = function() {
				return this.major + "." + this.minor + "." + this.build + "." + this.revision;
			};
			console.debug("tarumae v" + ver);
		} else {
			this.debugMode = true;
			this.developmentVersion = true;
			console.debug("tarumae (development version)");
		}

		this.options = { ...Tarumae.Renderer.defaultOptions(), ...options };

		initDOM(this);
	
		if (this.options.enable3D) {
			let gl;

			try {
				gl = this.canvas.getContext("webgl");
				if (!gl) gl = this.canvas.getContext("experimental-webgl");
			} catch (e) {
				console.error("cannot create webgl context: " + e);
			}

			if (!gl) {
				console.error("failed to initialize WebGL context.");
				return;
			}

			this.gl = gl;
		}

		try {
			this.ctx = this.canvas2d.getContext("2d");
		} catch (e) {
			this.ctx = null;
		}

		// debug mode
		if (this.debugMode) {
			this.debugger = new Tarumae.Debugger(this);

			if (this.options.showDebugPanel) {
				this.debugger.showDebugPanel = true;
			}
		}

		this.drawingContext2D = new Tarumae.DrawingContext2D(this.canvas2d, this.ctx);

		this.currentScene = null;
		this.current2DScene = null;
	
		this.wireframe = false;
		this.aspectRate = 1.0;
		this.transparencyList = [];

		this.respool = new Tarumae.ResourcePool();

		// matrices
		this.projectionMatrix = new Tarumae.Matrix4();
		this.viewMatrix = new Tarumae.Matrix4();
		this.cameraMatrix = new Tarumae.Matrix4();
		this.modelMatrix = new Tarumae.Matrix4();

		if (this.options.enable3D) {

			// load shaders
			this.currentShader = null;
			this.shaderStack = [];

			if (typeof this.options.defaultShader === "undefined") {
				this.options.defaultShader = "standard";
			}

			this.aspectRate = 1;
			this.renderSize = new Tarumae.Size();

			if (this.options.enableShadow && typeof Tarumae.FrameBuffer === "function") {
				// this.shadowFrameBuffer = new Tarumae.FrameBuffer(this, 2048, 2048, Color4.white);
			}

			if (typeof Tarumae.StencilBuffer === "function") {
				// this.stencilBuffer = new Tarumae.StencilBuffer(this);
			}

			const gl = this.gl;
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL);
			gl.enable(gl.CULL_FACE);
			gl.cullFace(gl.BACK);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA,
				gl.ONE_MINUS_DST_ALPHA, gl.ONE);
			
			window.addEventListener("resize", _ => this.resetViewport(), false);

			this.resetViewport();

			if (typeof Tarumae.Viewer === "function") {
				this.viewer = new Tarumae.Viewer(this);
			} else {
				this.viewer = null;
			}

			this.cachedMeshes = {};
			this.cachedTextures = {};
			this.cachedImages = {};
			this.resourceManager = new Tarumae.ResourceManager();

			// create shader programs
			for (const [_, define] of Object.entries(Tarumae.Renderer.Shaders)) {
				this.loadShader(define, define.vert, define.frag);
			}
		}

		this.init();
		this.render();
	}

	get renderPixelRatio() {
		return this.options.renderPixelRatio;
	}
	
	set renderPixelRatio(val) {
		this.options.renderPixelRatio = val;
		this.resetViewport();
	}

	setGLViewport() {
		this.glViewport(
			this.renderSize.width * this.options.renderPixelRatio,
			this.renderSize.height * this.options.renderPixelRatio);
	}

	glViewport(width, height) {
		this.gl.viewport(0, 0, width, height);
	}

	resetViewport() {
		const size = this.renderSize;
	
		size.width = this.container.clientWidth;
		size.height = this.container.clientHeight;
	
		this.aspectRate = size.width / size.height;
	
		this.canvas.width = size.width * this.options.renderPixelRatio;
		this.canvas.height = size.height * this.options.renderPixelRatio;
		this.canvas2d.width = size.width;
		this.canvas2d.height = size.height;

		this.setGLViewport();

		if (this.currentScene) {
			this.currentScene.requireUpdateFrame();
		}
	}

	getCanvasResolution() {
		return {
			width: this.canvas.width,
			height: this.canvas.height,
		};
	}
	
	init() {
		const renderer = this;
	
		renderer.initialized = true;
	
		// apply default shader
		renderer.useShader(renderer.options.defaultShader);
	
		Tarumae.Utility.invokeIfExist(renderer, "oninit");
	
		if (renderer.currentScene) {
			renderer.currentScene.requireUpdateFrame();
		}
	
		this.createPipeline();

		console.debug("renderer initialized.");
	}
	
	loadShader(shaderDefine, vertSource, fragSource) {
		var renderer = this;
	
		let shader = new Tarumae.Shaders[shaderDefine.class](renderer, vertSource, fragSource);
		shaderDefine.instance = shader;
		Tarumae.Utility.invokeIfExist(shaderDefine, "oncreate");
	}
	
	useShader(shader) {
		if (!shader || !this.initialized) return;
	
		let shaderInstance;

		if (typeof shader === "string") {
			var shaderDefine = Tarumae.Renderer.Shaders[shader];

			if (shaderDefine
				&& shaderDefine.instance instanceof Tarumae.Shader) {
				shaderInstance = shaderDefine.instance;
			}
		} else if (typeof shader === "object") {
			if (shader.instance) {
				shaderInstance = shader.instance;
			} else if (shader instanceof Tarumae.Shader) {
				shaderInstance = shader;
			}
		}

		if (shaderInstance) {
			this.shaderStack.push(shaderInstance);
			shaderInstance.use();
		}

		this.currentShader = shaderInstance;

		return shaderInstance;
	}
	
	getCurrentShader() {
		return this.shaderStack[this.shaderStack.length - 1];
	}
	
	useCurrentShader() {
		var shader = this.getCurrentShader();
		shader.use();
	}
	
	disuseCurrentShader() {
		if (this.shaderStack.length > 1) {
			this.shaderStack.pop();
			var shader = this.shaderStack[this.shaderStack.length - 1];
			shader.use();
		}
	}

	clearViewport() {
		const gl = this.gl;
	
		const backColor = this.options.backColor;
		gl.clearColor(backColor.r, backColor.g, backColor.b, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}
	
	perspectiveProject(m) {
		m.perspective(this.getAfov(), this.aspectRate,
			this.options.perspective.near, this.options.perspective.far);
	}
	
	orthographicProject(m) {
		const scale = ((this.viewer.originDistance - 0.5) * 10);
		m.ortho(-this.aspectRate * scale, this.aspectRate * scale, -scale, scale, -this.options.perspective.far, this.options.perspective.far);
	}
	
	getAfov() {
		const scene = this.currentScene;
	
		if (scene && scene.mainCamera && typeof scene.mainCamera.fieldOfView !== "undefined") {
			return scene.mainCamera.fieldOfView;
		} else {
			return this.options.perspective.angle;
		}
	}
	
	render() {
		if (this.initialized) {
	
			if (this.options.enable3D) {
				this.setGLViewport();
			}

			const scene = this.currentScene;

			// FIXME: remove this
			let clear2d = false;
	
			if (scene && (scene.animation || scene.requestedUpdateFrame)) {
				if (this.debugMode) {
					this.debugger.beforeDrawFrame();
				}

				this.ctx.clearRect(0, 0, this.canvas2d.width, this.canvas2d.height);
				clear2d = true;

				if (this.options.enable3D) {
					this.renderPipeline();
				}
				scene.requestedUpdateFrame = false;

				if (this.debugMode) {
					this.debugger.afterDrawFrame();
				}
			}
	
			if (this.current2DScene && (this.current2DScene.animation || this.current2DScene.requestedUpdateFrame)) {
				if (!clear2d) {
					this.ctx.clearRect(0, 0, this.canvas2d.width, this.canvas2d.height);
				}
				this.current2DScene.render(this.drawingContext2D);
				this.current2DScene.requestedUpdateFrame = false;
			}
		}
	
		requestAnimationFrame(_ => this.render());
	}

	createPipeline() {
		this.pipelineNodes = [];

		if (this.options.backgroundImage) {
			this.createTextureFromURL(this.options.backgroundImage, tex => {
				const bgImageSource = new Tarumae.PipelineNodes.ImageSource(this, tex);
				this._bgImageRenderer = new Tarumae.PipelineNodes.ImageToScreenRenderer(this, {
					flipTexcoordY: true
				});
				this._bgImageRenderer.enableAntialias = false;
				this._bgImageRenderer.input = bgImageSource;
				if (this.currentScene) this.currentScene.requireUpdateFrame();
			});
		}
		
		if (this.options.enablePostprocess || this.options.enableShadow) {
			const width = this.canvas.width, height = this.canvas.height,
				sw = width * (this.options.bloomEffect.threshold || 0.1),
				sh = height * (this.options.bloomEffect.threshold || 0.1);
			
			let shadowMapRenderer = undefined;

			if (this.options.enableShadow) {
				shadowMapRenderer = new Tarumae.PipelineNodes.ShadowMapRenderer(this, {
					resolution: {
						width: this.options.shadowQuality.resolution || 2048,
						height: this.options.shadowQuality.resolution || 2048,
					}
				});
			}
	
			const sceneImageRenderer = new Tarumae.PipelineNodes.SceneToImageRenderer(this);
			sceneImageRenderer.shadowMap2DInput = shadowMapRenderer;

			let imgRendererBlur = undefined, imgRendererSmall = undefined;

			if (!this.options.bloomEffect
				|| this.options.bloomEffect.eanbled === undefined
				|| (this.options.bloomEffect && this.options.bloomEffect.enabled)) {
				imgRendererSmall = new Tarumae.PipelineNodes.ImageFilterRenderer(this, {
					resolution: {
						width: sw,
						height: sh,
					},
					flipTexcoordY: true,
					filter: "linear-interp",
				});
				imgRendererSmall.gammaFactor = this.options.bloomEffect.gamma || 1.4;
				imgRendererSmall.input = sceneImageRenderer;
			
				imgRendererBlur = new Tarumae.PipelineNodes.BlurRenderer(this, {
					resolution: {
						width: sw,
						height: sh,
					}
				});
				imgRendererBlur.input = imgRendererSmall;
				// imgRendererBlur.gammaFactor = 1.0;
			}

			const imgRenderer = new Tarumae.PipelineNodes.ImageToScreenRenderer(this);
			imgRenderer.input = sceneImageRenderer;
			imgRenderer.gammaFactor = this.options.postprocess.gamma;
			imgRenderer.tex2Input = imgRendererBlur;
			imgRenderer.enableAntialias = this.options.enableAntialias;

			const previewRenderer = new Tarumae.PipelineNodes.MultipleImagePreviewRenderer(this);
			previewRenderer.addPreview(sceneImageRenderer);
			previewRenderer.addPreview(imgRendererSmall);
			previewRenderer.addPreview(imgRendererBlur);
			previewRenderer.addPreview(shadowMapRenderer);
			previewRenderer.enableAntialias = true;
			
			this.pipelineNodes.push(imgRenderer);
			// this.pipelineNodes.push(previewRenderer);

		} else {
			this.pipelineNodes.push(new Tarumae.PipelineNodes.DefaultRenderer(this));
		}
	}
	
	renderPipeline() {
		for (const node of this.pipelineNodes) {
			node.clear();
		}

		for (const node of this.pipelineNodes) {
			node.process();
		}
	}

	renderBackground() {
		if (this.options.backgroundImage) {
			if (this._bgImageRenderer) {
				this._bgImageRenderer.clear();
				this._bgImageRenderer.process();
			}
		} else {
			this.clearViewport();
		}
	}

	renderFrame() {		
		const scene = this.currentScene;
		if (scene) {
			this.prepareRenderMatrices();
			this.drawSceneFrame(scene);
		}
	}

	prepareRenderMatrices() {
		const scene = this.currentScene;
		if (!scene) return;

		this.cameraMatrix.loadIdentity();
		this.viewMatrix.loadIdentity();

		const projectionMethod = ((scene && scene.mainCamera)
			? (this.currentScene.mainCamera.projectionMethod)
			: (this.options.perspective.method));

		switch (projectionMethod) {
			default:
			case Tarumae.ProjectionMethods.Persp:
			case "persp":
				this.perspectiveProject(this.projectionMatrix);
				break;

			case Tarumae.ProjectionMethods.Ortho:
			case "ortho":
				this.orthographicProject(this.projectionMatrix);
				break;
		}

		if (scene.mainCamera) {
			this.makeCameraMatrix(scene.mainCamera, this.cameraMatrix);
		}
	
		this.makeViewMatrix(this.viewMatrix);
	
		this.projectionViewMatrix = this.viewMatrix.mul(this.cameraMatrix).mul(this.projectionMatrix);
		this.projectionViewMatrixArray = this.projectionViewMatrix.toArray();
	}
	
	drawSceneFrame(scene) {

		this.transparencyList._t_clear();
	
		if (!scene) return;

		if (this.debugger) {
			this.debugger.numberOfSceneRendered++;
			if (this.debugger.numberOfSceneRendered > 1) {
				console.warn("duplicate scene renderering");
			}
		}

		if (this.wireframe) {
			this.useShader("wireframe");
		}

		if (this.currentShader) {
			this.currentShader.beginScene(scene);
		}
	
		for (var i = 0; i < scene.objects.length; i++) {
			this.drawObject(scene.objects[i]);
		}

		if (this.wireframe) {
			this.disuseCurrentShader();
		}

		if (!this.wireframe) {
			// draw transparency objects
			for (const tranObj of this.transparencyList) {
				this.drawObject(tranObj, true);
			}

			// draw selected objects
			if (Array.isArray(scene.selectedObjects)) {
				for (var k = 0; k < scene.selectedObjects.length; k++) {
					var obj = scene.selectedObjects[k];
					if (obj.visible) {
						this.drawHighlightObject(obj, new Color4(0.1, 0.6, 1.0, 0.5));
	
						if (this.options.enableHighlightSelectedChildren) {
							this.drawHighlightChildren(obj, new Color4(0.1, 1.0, 0.6, 0.5));
						}
					}
				}
			}
	
			// draw hover object
			// if (scene.hoverObject) {
			// 	this.drawHighlightObject(scene.hoverObject, new Color4(1.0, 0.5, 0.0, 0.5));
			// }
		}
	
		scene.drawFrame(this);
	
		if (this.currentShader) {
			this.currentShader.endScene(scene);
		}
	}
	
	makeCameraMatrix(camera, m) {
	
		var plist = [];
		var parent = camera.parent;
	
		while (parent) {
			plist.push(parent);
			parent = parent.parent;
		}
	
		// scale
		for (var i = plist.length - 1; i >= 0; i--) {
			var obj = plist[i];
	
			m.scale(1 / obj.scale.x, 1 / obj.scale.y, 1 / obj.scale.z);
		}
	
		m.scale(1 / camera.scale.x, 1 / camera.scale.y, 1 / camera.scale.z);
	
		// rotate
		for (let i = plist.length - 1; i >= 0; i--) {
			let obj = plist[i];
	
			m.rotate(-obj.angle.x, -obj.angle.y, -obj.angle.z);
		}
	
		m.rotate(-camera.angle.x, -camera.angle.y, -camera.angle.z);
	
		// translate
		for (let i = plist.length - 1; i >= 0; i--) {
			let obj = plist[i];
	
			m.translate(-obj.location.x, -obj.location.y, -obj.location.z);
		}
	
		m.translate(-camera.location.x, -camera.location.y, -camera.location.z);
	
		return m;
	}
	
	getCameraRotationMatrix(camera) {
	
		var plist = [];
		var parent = camera.parent;
	
		while (parent) {
			plist.push(parent);
			parent = parent.parent;
		}
	
		var m = new Tarumae.Matrix4().loadIdentity();
	
		for (var i = plist.length - 1; i >= 0; i--) {
			var obj = plist[i];
	
			m.rotate(-obj.angle.x, -obj.angle.y, -obj.angle.z);
		}
	
		return m;
	}
	
	makeViewMatrix(m) {
		const viewer = this.viewer;
	
		if (viewer) {
			m.translateZ(-(viewer.originDistance) * 10);
	
			if ((!viewer.location.equals(0, 0, 0) || !viewer.angle.equals(0, 0, 0)
				// || !viewer.scale.equals(1, 1, 1)
			)) {
				m.rotate(viewer.angle)
					.translate(viewer.location.x, viewer.location.y, viewer.location.z)
					//.scale(viewer.scale.z, viewer.scale.z, viewer.scale.z)
					;
			}
		}
	}
	
	makeProjectMatrix(projectMethod, m) {
		var projectionMethod = projectMethod
			|| ((this.currentScene && this.currentScene.mainCamera)
				? (this.currentScene.mainCamera.projectionMethod)
				: (this.options.perspective.method));
	
		switch (projectionMethod) {
			default:
			case Tarumae.ProjectionMethods.Persp:
			case "persp":
				this.perspectiveProject(m);
				break;
	
			case Tarumae.ProjectionMethods.Ortho:
			case "ortho":
				this.orthographicProject(m);
				break;
		}
	}
	
	createScene() {
		return new Tarumae.Scene(this);
	}
	
	createScene2D() {
		if (!Tarumae.Draw2D) return null;
	
		var scene = new Draw2D.Scene2D();
		scene.renderer = this;
		return scene;
	}
	
	showScene(scene) {
		if (this.currentScene != scene) {
			if (this.currentScene) {
				this.currentScene.close();
			}
	
			this.currentScene = scene;
	
			if (this.debugMode) {
				Tarumae.Debugger.currentScene = scene;
			}
		}
	}
	
	drawObject(obj, transparencyRendering = false) {

		if (!obj || obj.visible === false) {
			return;
		}
	
		if (!transparencyRendering) {
			obj._opacity = (!isNaN(obj.opacity) ? obj.opacity : 1)
				* (1.0 - Tarumae.MathFunctions.clamp((obj.mat && !isNaN(obj.mat.transparency)) ? obj.mat.transparency : 0));
	
			if (obj._opacity < 1) {
				this.transparencyList.push(obj);
	
				for (let i = 0; i < obj.objects.length; i++) {
					let child = obj.objects[i];
					this.drawObject(child);
				}
	
				return;
			}
		}

		if (this.debugger) {
			this.debugger.beforeObjectRender(obj);
		}
	
		let shaderPushed = false;
	
		if (obj.wireframe) {
			this.useShader("wireframe");
			shaderPushed = true;
		}

		const objShader = obj.shader || null;
		if (objShader) {
			var objShaderName = objShader.name || null;
	
			if (objShaderName) {
				this.useShader(objShaderName);
				shaderPushed = true;
			}
		}

		if (!shaderPushed && obj instanceof Tarumae.ParticleObject) {
			this.useShader("point");
			shaderPushed = true;
		}
	
		this.currentShader.beginObject(obj);
	
		if (this.options.enableCustomDraw) {
			obj.draw(this);
		}
	
		switch (obj.type) {
			default:
			case Tarumae.ObjectTypes.GenericObject:
				{
					for (let i = 0; i < obj.meshes.length; i++) {
						var mesh = obj.meshes[i];
						if (mesh && this.options.enableDrawMesh) {
							if (mesh.meta && mesh.meta.vertexCount == 0) {
								console.warn('invaliad mesh from object ' + obj.name);
							}
							this.currentShader.beginMesh(mesh);
							mesh.draw(this);
							this.currentShader.endMesh(mesh);
						}
					}
	
					if (!transparencyRendering) {
						for (let i = 0; i < obj.objects.length; i++) {
							let child = obj.objects[i];
							this.drawObject(child);
						}
					}
				}
				break;
	
			case Tarumae.ObjectTypes.Div:
				{
					var div = obj._htmlObject;
	
					var worldloc = new Vec4(0, 0, 0, 1).mulMat(obj._transform);
					var p = this.transformPoint(worldloc);
	
					var w = div.scrollWidth / 2;
					var h = div.scrollHeight / 2;
	
					div.style.left = (p.x - w) + "px";
					div.style.top = (p.y - h) + "px";
	
					if (typeof obj.enableDepthScale !== "undefined"
						&& obj.enableDepthScale) {
						var pw = 1 + 1 / p.w;
						// let tw = div.scrollWidth * pw / 2;
						// let th = div.scrollHeight * pw / 2;
						// div.style.transform = "translate(" + (tw) + "px," + (th) +"px) scale(" + pw + "," + pw +") translate(" + (-tw) + "px," + (-th) + "px)";
						div.style.transform = "scale3d(" + pw + "," + pw + "," + pw + ")";
					}
				}
				break;
		}
	
		this.currentShader.endObject(obj);

		if (shaderPushed) {
			this.disuseCurrentShader();
		}
		
		if (this.debugger) {
			this.debugger.afterObjectRender(obj);
		}
		// if (this.debugMode) {
		// 	this.debugger.drawBoundingBox(obj, this.transformStack);
		// }
	}
	
	drawHighlightObject(obj, color) {
		if (obj.visible === false || !this.options.enableDrawMesh || !obj._transform) {
			return;
		}
	
		// var gl = this.gl;
	
		var shader = this.useShader("solidcolor");
	
		shader.color = color;
		shader.beginObject(obj);
	
		for (var i = 0; i < obj.meshes.length; i++) {
			var mesh = obj.meshes[i];
	
			shader.beginMesh(mesh);
			mesh.draw(this);
			shader.endMesh(mesh);
		}
	
		if (this.options.enableCustomDraw) {
			obj.draw(this);
		}
	
		shader.endObject(obj);
		this.disuseCurrentShader();
	}
	
	drawHighlightChildren(obj, color) {
		for (var i = 0; i < obj.objects.length; i++) {
			var child = obj.objects[i];
			this.drawHighlightObject(child, color);
	
			if (child.objects.length > 0) {
				this.drawHighlightChildren(child, color);
			}
		}
	}
	
	createTextureFromURL(url, handler) {
		const cachedTexture = this.cachedTextures[url];
		if (cachedTexture && typeof handler === "function") {
			handler(cachedTexture);
			return;
		}
	
		this.resourceManager.add(url, Tarumae.ResourceTypes.Image, img => {
			let texture = this.cachedTextures[url];
			
			if (!texture && img) {
				texture = new Tarumae.Texture(img);
			}
	
			if (texture) {
				this.cachedTextures[url] = texture;
			}
	
			if (typeof handler === "function") {
				handler(texture);
			}
		});
	
		this.resourceManager.load();
	}

	createWorldRayFromScreenPosition(p) {
		var ray;
	
		var projectMethod = (this.currentScene && this.currentScene.mainCamera)
			? (this.currentScene.mainCamera.projectionMethod)
			: (this.options.perspective.method);
	
		switch (projectMethod) {
			default:
			case Tarumae.ProjectionMethods.Persp:
			case "persp":
				{
					var viewAngle = (this.currentScene && this.currentScene.mainCamera)
						? (this.currentScene.mainCamera.fieldOfView)
						: (this.options.perspective.angle);
	
					var viewRange = Math.tan(viewAngle * Math.PI / 2.0 / 180.0);
	
					var viewportWidth = viewRange * this.aspectRate;
					var viewportHeight = viewRange;
	
					ray = new Tarumae.Ray(new Vec3(0, 0, 0), new Vec3(
						(p.x / this.renderSize.width - 0.5) * viewportWidth,
						-(p.y / this.renderSize.height - 0.5) * viewportHeight,
						-0.5).normalize());
				}
				break;
	
			case Tarumae.ProjectionMethods.Ortho:
			case "ortho":
				{
					// var viewRange = (this.viewer.originDistance - 0.5) * 10 * 2;
	
					// var viewportWidth = viewRange * this.aspectRate;
					// var viewportHeight = viewRange;
	
					var x = (p.x / this.renderSize.width - 0.5) * viewportWidth;
					var y = -(p.y / this.renderSize.height - 0.5) * viewportHeight;
	
					ray = new Tarumae.Ray(new Vec3(x, y, 0), new Vec3(0, 0, -1));
				}
				break;
		}
	
		var m = this.viewMatrix.mul(this.cameraMatrix).inverse();
		ray.origin = new Vec4(ray.origin, 1).mulMat(m).xyz();
		ray.dir = new Vec4(ray.dir, 0).mulMat(m).xyz().normalize();
	
		return ray;
	}
	
	transformPoint(pos, matrix, projectMethod) {
		return this.toScreenPosition(this.toWorldPosition(pos, matrix, projectMethod), projectMethod);
	}
	
	toScreenPosition(pos) {
		var projectMethod = projectMethod
			|| ((this.currentScene && this.currentScene.mainCamera)
				? (this.currentScene.mainCamera.projectionMethod)
				: (this.options.perspective.method));
		
		var renderHalfWidth = this.renderSize.width / 2;
		var renderHalfHeight = this.renderSize.height / 2;
		
		var w = ((projectMethod == Tarumae.ProjectionMethods.Persp || projectMethod == "persp") ? pos.w : 1.0) || 1.0;
		
		return new Tarumae.Point(
			(pos.x / w) * renderHalfWidth + renderHalfWidth,
			-(pos.y / w) * renderHalfHeight + renderHalfHeight);
	}
		
	toScreenPositionEx(pos) {
		var projectMethod = projectMethod
			|| ((this.currentScene && this.currentScene.mainCamera)
				? (this.currentScene.mainCamera.projectionMethod)
				: (this.options.perspective.method));
		
		var renderHalfWidth = this.renderSize.width / 2;
		var renderHalfHeight = this.renderSize.height / 2;
		
		var w = ((projectMethod == Tarumae.ProjectionMethods.Persp || projectMethod == "persp") ? pos.w : 1.0) || 1.0;
		
		return new Vec3(
			(pos.x / w) * renderHalfWidth + renderHalfWidth,
			-(pos.y / w) * renderHalfHeight + renderHalfHeight,
			1.0 / pos.z
		);
	}

	transformPoints(points) {
		const renderHalfWidth = this.renderSize.width / 2;
		const renderHalfHeight = this.renderSize.height / 2;
		
		const ps = new Array(points.length);
		
		for (var i = 0; i < points.length; i++) {
			var p = new Vec4(points[i], 1.0).mulMat(this.projectionViewMatrix);
		
			ps[i] = new Tarumae.Point(
				(p.x / p.w) * renderHalfWidth + renderHalfWidth,
				-(p.y / p.w) * renderHalfHeight + renderHalfHeight);
		}
		
		return ps;
	}
		
	transformTriangle(triangle) {
		const m = this.viewMatrix.mul(this.cameraMatrix);
		
		return {
			v1: new Vec4(triangle.v1, 1.0).mulMat(m).xyz(),
			v2: new Vec4(triangle.v2, 1.0).mulMat(m).xyz(),
			v3: new Vec4(triangle.v3, 1.0).mulMat(m).xyz(),
		};
	}
		
	viewRayHitTestPlaneInWorldSpace(pos, planeVertices) {
		const ray = this.createWorldRayFromScreenPosition(pos);
		return Tarumae.MathFunctions.rayIntersectsPlane(ray, planeVertices, Tarumae.Ray.MaxDistance);
	};

	// 2D Drawing by 3D coordinates - Start

	drawPoint(p, size = 3, color = "black") {
		this.drawingContext2D.drawPoint(this.transformPoint(p), size, color);
	}

	drawLine(from, to, width, color) {
		var points = this.transformPoints([from, to]);
		this.drawLine2D(points[0], points[1], width, color);
	};

	drawRay(ray, length = 1, width = 1, color = "black") {
		this.drawArrow(ray.origin, ray.origin.add(ray.dir.mul(length)), width, color);
	}

	drawBBox(box, width, color) {
		if (!box) return;
		
		var points = this.transformPoints([
			{ x: box.min.x, y: box.min.y, z: box.min.z },
			{ x: box.max.x, y: box.min.y, z: box.min.z },
			{ x: box.min.x, y: box.max.y, z: box.min.z },
			{ x: box.max.x, y: box.max.y, z: box.min.z },
		
			{ x: box.min.x, y: box.min.y, z: box.max.z },
			{ x: box.max.x, y: box.min.y, z: box.max.z },
			{ x: box.min.x, y: box.max.y, z: box.max.z },
			{ x: box.max.x, y: box.max.y, z: box.max.z },
		]);
		
		this.drawingContext2D.drawLineSegments2D([
			points[0], points[1], points[2], points[3],
			points[4], points[5], points[6], points[7],
		
			points[0], points[4], points[1], points[5],
			points[2], points[6], points[3], points[7],
		
			points[0], points[4], points[1], points[5],
			points[2], points[6], points[3], points[7],
		
			points[0], points[2], points[1], points[3],
			points[4], points[6], points[5], points[7],
		], width, color);
	}

	drawFocusBBox(box, len, width, color) {
		if (!box) return;
		
		len = len || 0.1;
		
		var points = this.transformPoints([
			{ x: box.min.x, y: box.min.y, z: box.min.z },
			{ x: box.max.x, y: box.min.y, z: box.min.z },
			{ x: box.min.x, y: box.max.y, z: box.min.z },
			{ x: box.max.x, y: box.max.y, z: box.min.z },
		
			{ x: box.min.x, y: box.min.y, z: box.max.z },
			{ x: box.max.x, y: box.min.y, z: box.max.z },
			{ x: box.min.x, y: box.max.y, z: box.max.z },
			{ x: box.max.x, y: box.max.y, z: box.max.z },
		]);
		
		this.drawingContext2D.drawLineSegments2D([
			points[0], points[1], points[2], points[3],
			points[4], points[5], points[6], points[7],
		
			points[0], points[4], points[1], points[5],
			points[2], points[6], points[3], points[7],
		
			points[0], points[4], points[1], points[5],
			points[2], points[6], points[3], points[7],
		
			points[0], points[2], points[1], points[3],
			points[4], points[6], points[5], points[7],
		], width, color);
	};
		
	drawArrow(from, to, width, color) {
		var points = this.transformPoints([from, to]);
		this.drawingContext2D.drawArrow(points[0], points[1], width, color);
	};

	drawLine(from, to, width, color) {
		var points = this.transformPoints([from, to]);
		this.drawingContext2D.drawLine(points[0], points[1], width, color);
	};

	fillArrow(from, to, size, color) {
		var points = this.transformPoints([from, to]);
		this.drawingContext2D.fillArrow(points[0], points[1], size, color);
	}

	drawArrow(from, to, width, color) {
		var points = this.transformPoints([from, to]);
		this.drawingContext2D.drawArrow(points[0], points[1], width, color);
	};
	fillArrow(from, to, size, color) {
		var points = this.transformPoints([from, to]);
		this.drawingContext2D.fillArrow(points[0], points[1], size, color);
	}
  
	drawRect(topLeft, bottomRight, strokeWidth, strokeColor, fillColor) {
		var rect3d = this.transformPoints([topLeft, bottomRight]);
		
		var left = Math.min(rect3d[0].x, rect3d[1].x),
			top = Math.min(rect3d[0].y, rect3d[1].y),
			right = Math.max(rect3d[0].x, rect3d[1].x),
			bottom = Math.max(rect3d[0].y, rect3d[1].y);
		
		this.drawingContext2D.drawRect(new Tarumae.Rect(left, top, right - left, bottom - top), strokeWidth, strokeColor, fillColor);
	};

	drawPolygon(points, strokeWidth, strokeColor, fillColor) {
		if (points.length < 2) return;
		this.drawingContext2D.drawPolygon(this.transformPoints(points), strokeWidth, strokeColor, fillColor);
	};

	drawEllipse(v, size, strokeWidth, strokeColor, fillColor) {
		this.drawingContext2D.drawEllipse(this.transformPoint(v), size, strokeWidth, strokeColor, fillColor);
	};

	drawImage(location, image) {
		var p = this.transformPoint(location);
				
		var x = p.x - image.width / 2;
		var y = p.y - image.height / 2;
				
		if (x >= 0 && y >= 0
			&& x < this.renderSize.width && y < this.renderSize.height) {
			return this.drawingContext2D.drawImage({ x: x, y: y }, image);
		}
	};
		
	drawText(location, text, color, halign) {
		this.drawingContext2D.drawText(this.transformPoint(location), text, color, halign);
	};

	// 2D Drawing by 3D coordinates - End

	createSnapshotOfRenderingImage({
		imgformat = "image/png",
		imgQuality = 0.85, /* only for jpeg */
		resolution = this.getCanvasResolution(),
		renderBackground = false,
	} = {
		resolution: this.getCanvasResolution()
	}) {
		
		const renderbuffer = new Tarumae.FrameBuffer(this,
			resolution.width, resolution.height, {
				clearBackground: renderBackground
			}
		);

		renderbuffer.use();
		
		if (renderBackground) {
			this.renderBackground();
		} else {
			this.gl.clearColor(0, 0, 0, 0);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		}
		
		this.renderFrame();

		try {
			const img = Tarumae.Utility.getImageDataURLFromTexture(this,
				renderbuffer.texture, imgformat, imgQuality);
			return img;
		} catch (e) {
			console.warn(e);
		}

		renderbuffer.disuse();
		renderbuffer.destroy();
	};
};

Tarumae.Renderer.prototype.toWorldPosition = (function() {
	var projectionMatrix = new Tarumae.Matrix4();
	
	return function(pos, viewMatrix, projectMethod) {
	
		this.makeProjectMatrix(projectMethod, projectionMatrix);
	
		var m = (viewMatrix || this.viewMatrix).mul(this.cameraMatrix).mul(projectionMatrix);
	
		if (Array.isArray(pos)) {
			for (var i = 0; i < pos.length; i++) {
				pos[i] = new Vec4(pos[i], 1.0).mulMat(m);
			}
		} else {
			return new Vec4(pos, 1.0).mulMat(m);
		}
	};
})();

Object.assign(Tarumae, {
	ProjectionMethods: {
		Persp: 0,
		Ortho: 1,
	},

	DrawMode: {
		Normal: 0,
		ShadowMap: 1,
	}
});

import solidcolorVert from '../../shader/solidcolor.vert';
import solidcolorFrag from '../../shader/solidcolor.frag';
import billboardVert from '../../shader/billboard.vert';
import billboardFrag from '../../shader/billboard.frag';
import simpleVert from '../../shader/simple.vert';
import simpleFrag from '../../shader/simple.frag';
import grayscaleVert from '../../shader/simple.vert';
import grayscaleFrag from '../../shader/simple.frag';
import panoramaVert from '../../shader/panorama.vert';
import panoramaFrag from '../../shader/panorama.frag';
import standardVert from '../../shader/standard.vert';
import standardFrag from '../../shader/standard.frag';
import wireframeVert from '../../shader/wireframe.vert';
import wireframeFrag from '../../shader/wireframe.frag';
import pointVert from '../../shader/points.vert';
import pointFrag from '../../shader/points.frag';
import imageVert from '../../shader/image.vert';
import imageFrag from '../../shader/image.frag';
import blurVert from '../../shader/blur.vert';
import blurFrag from '../../shader/blur.frag';
import screenVert from '../../shader/screen.vert';
import screenFrag from '../../shader/screen.frag';
import shadowmapVert from '../../shader/shadowmap.vert';
import shadowmapFrag from '../../shader/shadowmap.frag';

Tarumae.Renderer.Shaders = {
	// viewer: {
	// 	vert: fs.readFileSync(__dirname + "../../../shader/viewer.vert", "utf8"),
	// 	frag: fs.readFileSync(__dirname + "../../../shader/viewer.frag", "utf8"), class: "ViewerShader"
	// },
	// solidcolor: { vert: solidcolorVert, frag: solidcolorFrag, class: "SolidColorShader" },
	// billboard: { vert: billboardVert, frag: billboardFrag, class: "BillboardShader" },
	// simple: { vert: simpleVert, frag: simpleFrag, class: "SimpleShader" },
	// grayscale: { vert: grayscaleVert, frag: grayscaleFrag, class: "GrayscaleShader" },
	point: { vert: pointVert, frag: pointFrag, class: "PointShader" },
	panorama: { vert: panoramaVert, frag: panoramaFrag, class: "PanoramaShader" },
	standard: { vert: standardVert, frag: standardFrag, class: "StandardShader" },
	wireframe: { vert: wireframeVert, frag: wireframeFrag, class: "WireframeShader" },
	point: { vert: pointVert, frag: pointFrag, class: "PointShader" },
	image: { vert: imageVert, frag: imageFrag, class: "ImageShader" },
	blur: { vert: blurVert, frag: blurFrag, class: "ImageShader" },
	screen: { vert: screenVert, frag: screenFrag, class: "ScreenShader" },
	shadowmap: { vert: shadowmapVert, frag: shadowmapFrag, class: "ShadowMapShader" },
};


Tarumae.ResourcePool = class {
	constructor() {
	}

	loadTexture(url, onload) {
	}
};

new Tarumae.EventDispatcher(Tarumae.ResourcePool).registerEvents(
	"texAdded");


