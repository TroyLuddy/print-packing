
import * as THREE from 'three';
import { SVGRenderer } from 'three/examples/jsm/renderers/SVGRenderer.js';

import * as ImageTracer from './imagetracer.js';

export function STLToSVG(geometry) {
    // create a scene, that will hold all our elements such as objects, cameras and lights.
    var scene = new THREE.Scene();
    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(150, 150, 150);
    scene.add(spotLight);
    // create a render and set the size
    var webGLRenderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });
    webGLRenderer.setClearColor(new THREE.Color(0x000, 1.0));
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    webGLRenderer.shadowMapEnabled = true;
    // add the output of the renderer to the html element
    document.getElementById("WebGL-output").appendChild(webGLRenderer.domElement);
    // call the render function
    var step = 0;
    // model from http://www.thingiverse.com/thing:69709
    var group = new THREE.Object3D();
    var camera;
    geometry.center();
    var mat = new THREE.MeshBasicMaterial({color: 0x7777ff});
    //mat.wireframe = true;
    group = new THREE.Mesh(geometry, mat);
    var bbox = new THREE.Box3().setFromObject(group);
    //group.rotation.x = -0.5 * Math.PI;
    group.scale.set(0.6, 0.6, 0.6);
    scene.add(group);

    // create a camera, which defines where we're looking at.
    camera = new THREE.OrthographicCamera( bbox.min.x, bbox.max.x, bbox.max.z, bbox.min.z, 1, 500);
    // position and point the camera to the center of the scene
    camera.position.x = 0;
    camera.position.y = 50;
    camera.position.z = 0;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    var capture = true;

    // render using requestAnimationFrame
    function render() {
	requestAnimationFrame(render);
	webGLRenderer.render(scene, camera);
	if(capture) {
	    capture = false;
	    var pngDataURL = webGLRenderer.domElement.toDataURL();
	    // Convert to SVG
	    ImageTracer.imageToSVG(pngDataURL, function(svgString) {
		ImageTracer.appendSVGString( svgString, 'svgContainer');
	    }, 'posterized2d');
	    //downloadURI(pngDataURL, 'render.png');
	}
    }
    render();

};

function downloadURI(uri, name) {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
