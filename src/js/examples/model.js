
import Tarumae from "../entry";
import "../scene/scene";
import "../scene/animation"
import "../scene/viewer";
import "../utility/archive";
import "../utility/res";
import { Color3, Color4 } from "../math/vector";

window.addEventListener("load", function() {

	const renderer = new Tarumae.Renderer({
		// renderPixelRatio: window.devicePixelRatio,
		renderPixelRatio: 1,
		backColor: new Color4(0.74, .87, .85, 1),
		// backgroundImage: "../static/textures/bg-gray-gradient.jpg",
		showDebugPanel: true,
		// enableLighting: false,
		// postprocess: true,
		enableAntialias: true,
	});

	const scene = renderer.createScene();

	window._scene = scene;
 
	// scene.add(new Tarumae.GridLine());
	this.models = [
		{ name: "chair_adv_01.toba" },
		// { name: "chair_compact_01.toba" },
		{ name: "chair_jati.toba" },
		{ name: "char_stand_01.toba", scale: [1, 1, 1], color: [.7, .7, .7] },
		{ name: "desk_study_1p.toba", color: [.7, .7, .7] },
		// { name: "fan_vintage_ceiling.toba", scale: [3, 3, 3] },
		// { name: "print_mfp_w1500.toba", color: [.7, .7, .7] },
		{ name: "rice_cooker_01.toba", z: 1, color: [.7, .7, .7] },
		// { name: "sofa_leather_3s.toba" },
		// { name: "ceo.toba", color: [.5, .5, .5] },
	];

	const ground = {
		mesh: new Tarumae.Shapes.PlaneMesh(2, 2),
		// mat: { tex: "../static/textures/empty.png" }
	};
	scene.load(ground);

	scene.onkeydown = function(key) {
		if (key >= Tarumae.Viewer.Keys.D1
			&& key <= Tarumae.Viewer.Keys.D9) {
			switchTo(key - Tarumae.Viewer.Keys.D1);
		}
	};

	let firstObject = true;
	this.currentIndex = -1;

	for (const [i, mod] of models.entries()) {
		
		scene.createObjectFromURL("../static/models/" + mod.name, obj => {
			mod.obj = obj;
			obj.location.x = 5;
			obj.visible = false;
			scene.add(obj);

			if (firstObject) {
				switchTo(i);
				firstObject = false;
			}
		});
	}

	function switchTo(idx) {
		if (idx === window.currentIndex) return;
		
		if (window.currentIndex !== -1) {
			const mod = window.models[currentIndex];
			if (mod) {
				const prevObj = window.models[currentIndex].obj;
				scene.animate({}, t => {
					prevObj.location.x = -3 * t;
					prevObj.opacity = 1 - t;
				}, _ => prevObj.visible = false);
			}
		}

		currentIndex = idx;

		const mod = models[currentIndex];
		if (mod) {
			const nextObj = mod.obj;
			if (mod.color) {
				if (!nextObj.mat) nextObj.mat = {}
				nextObj.mat.color = mod.color;
			}
			if (mod.scale) {
				nextObj.scale.set(mod.scale[0], mod.scale[1], mod.scale[2]);
			}
			nextObj.visible = true;
			scene.animate({ effect: "fadein", duration: 0.5 }, t => {
				nextObj.location.x = 3 * (1 - t);
				nextObj.opacity = t;
			});
			scene.animate({ effect: "fadeout" }, t => nextObj.angle.y = -(1 - t) * 500 + 25);
		}
	}

	scene.mainCamera.location.set(0, 1, 2);
	scene.mainCamera.angle.set(-15, 0, 0);
	
	const light = new Tarumae.PointLight();
	light.location.set(1, 2, -2);
	scene.add(light);
	
	// new Tarumae.TouchController(scene);
	new Tarumae.ModelViewer(scene);

	scene.show();
});