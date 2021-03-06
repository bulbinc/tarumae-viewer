////////////////////////////////////////////////////////////////////////////////
// tarumae engine
// https://tarumae.tech
//
// Copyright(c) 2016-2019 BULB Corp., Jingwood, all rights reserved
////////////////////////////////////////////////////////////////////////////////

import Tarumae from '../../src/js/tarumae.js';
import { Color4 } from "@jingwood/graphics-math";

window.addEventListener("load", function() {

	const renderer = new Tarumae.Renderer({
		renderPixelRatio: 1,
		backColor: new Color4(0.2),
		enablePostprocess: true,
		enableLighting: false,
		bloomEffect: {
			threshold: 0.5,
			gamma: 1.0,
		},
		renderingImage: {
			resolutionRatio: 0.5,
		}
	});

	const scene = renderer.createScene();

	window._scene = scene;
 
	const count = 20000;
	const pm = new Tarumae.ParticleMesh(count);

	const particles = new Array(count);

	for (let i = 0; i < count; i++) {
   
		particles[i] = {
			speed: Math.random() * 0.2 + 0.02,
			angle: 0,
			x: Math.random() * 20 - 10,
			y: Math.random() * 20 - 10,
			z: Math.random() * 20 - 10,
			ox: Math.random() * 20 - 10,
			oy: Math.random() * 20 - 10,
			oz: Math.random() * 20 - 10,
			r: 1,//Math.random(),
			g: Math.random() * 0.5,
			b: Math.random(),
			size: 1 + Math.random() * 2,
		};
	}

	function update(p, i) {
		pm.vertexBuffer._t_set(i * 3, p.x, p.y, p.z);
		pm.vertexBuffer._t_set((count + i) * 3, p.r, p.g, p.b);
		pm.vertexBuffer._t_set((count * 2 * 3 + i), p.size);
		pm.update();
	}

	function setAll(iterator) {
		for (let i = 0; i < count; i++) {
			iterator(particles[i], i);
		}
	}

	const pobj = new Tarumae.ParticleObject();
	pobj.angle.x = 20;
	pobj.addMesh(pm);
  
	scene.add(pobj);

	function updateFrame() {
		for (var i = 0; i < count; i++) {
			var p = particles[i];

			p.x += (p.ox - p.x) * p.speed;
			p.y += (p.oy - p.y) * p.speed;
			p.z += (p.oz - p.z) * p.speed;

			p.angle += p.speed * 0.2;
  
			update(p, i);
		}
    
		scene.requireUpdateFrame();
		requestAnimationFrame(updateFrame);
	}

	let mountainVertices;

	function collapse() {
		if (mountainVertices) {
			setAll(p => {
				var mv = mountainVertices[parseInt(Math.random() * mountainVertices.length)];

				p.ox = mv.x;
				p.oy = mv.y;
				p.oz = mv.z;
			});
		} else {
			setAll(p => {
				p.ox = Math.random() * 20 - 10;
				p.oy = Math.random() * 20 - 10;
				p.oz = Math.random() * 20 - 10;
			});
		}
	};

	requestAnimationFrame(updateFrame);

	scene.animation = true;

	scene.createObjectFromURL("models/mountain2.mod", mountain => {

		let mesh = mountain.meshes[0];
		mountainVertices = mesh.points;
		
		collapse();

		scene.animate({
			"duration": 2,
		}, t => {
			pobj.angle.y = 140 + 180 * t;
		});
		
	});

	const camera = scene.mainCamera;
	camera.location.set(0, 0, 10);
	camera.angle.set(0, 0, 0);
	camera.fieldOfView = 20;
  
	new Tarumae.ObjectViewController(scene, {
		object: pobj
	});

	scene.show();
});