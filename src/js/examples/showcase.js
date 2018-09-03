
import Tarumae from "../entry";
import "../scene/scene";
import "../scene/viewer";
import "../utility/archive";
import "../utility/res";

window.addEventListener("load", function() {

	const renderer = new Tarumae.Renderer({
		// postprocess: true,
		enableLighting: false,
		// renderPixelRatio: window.devicePixelRatio,
	});
	const scene = renderer.createScene();

	window._scene = scene;
 
	scene.createObjectFromURL("/static/floor.toba", obj => {
		const bbox = new Tarumae.BoundingBox(obj.getBounds())
		obj.location.offset(-bbox.origin.x/2, 0, -bbox.origin.z/2)

		scene.add(obj);
	});

	new Tarumae.TouchController(scene, {
		speed: 0.1,
		distance: 2
	});

	scene.show();
});