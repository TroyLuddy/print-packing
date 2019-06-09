
import * as THREE from 'three';
import { SVGRenderer } from 'three/examples/jsm/renderers/SVGRenderer.js';

import * as ImageTracer from './imagetracer.js';

var currentOffsetX = 0;
var currentPart = 0;

export function STLToSVG(geometry) {
    // create a scene, that will hold all our elements such as objects, cameras and lights.
    var scene = new THREE.Scene();
    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(150, 150, 150);
    scene.add(spotLight);
    // call the render function
    var step = 0;
    var group = new THREE.Object3D();
    var camera;
    geometry.center();
    var mat = new THREE.MeshBasicMaterial({color: 0x00ff00});
    //mat.wireframe = true;
    group = new THREE.Mesh(geometry, mat);
    var bbox = new THREE.Box3().setFromObject(group);
    console.log("Bounding Box for part:");
    console.log(bbox);
    //group.rotation.x = -0.5 * Math.PI;
    group.scale.set(1, 1, 1);
    scene.add(group);


    // create a camera, which defines where we're looking at.
    camera = new THREE.OrthographicCamera( bbox.min.x, bbox.max.x, bbox.max.z, bbox.min.z, 1, 500);
    // position and point the camera to the center of the scene
    camera.position.x = 0;
    camera.position.y = 50;
    camera.position.z = 0;
    camera.lookAt(new THREE.Vector3(0, 0, 0));


    var pixelsPerMM = 10;
    // create a render and set the size
    var webGLRenderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });
    webGLRenderer.setClearColor(new THREE.Color(0x000000, 0));
    var webGLRendererContainer = document.getElementById("WebGL-output");
    webGLRenderer.setSize(pixelsPerMM*(bbox.max.x - bbox.min.x), pixelsPerMM*(bbox.max.z - bbox.min.z));
    webGLRenderer.shadowMapEnabled = true;
    // add the output of the renderer to the html element
    document.getElementById("WebGL-output").appendChild(webGLRenderer.domElement);

    // render using requestAnimationFrame
    var capture = true;
    function render() {
	requestAnimationFrame(render);
	webGLRenderer.render(scene, camera);
	if(capture) {
	    capture = false;
	    var pngDataURL = webGLRenderer.domElement.toDataURL();
	    // Convert to SVG
	    ImageTracer.imageToSVG(pngDataURL, function(svgString) {
		var combinedSVG = document.getElementById('combinedSVG');
		ImageTracer.appendSVGString( svgString, 'svgContainer');
		var svgElement = document.getElementById('svgContainer').children[0];
		var printBedHeight = document.getElementById('printDepth').value;
		Array.from(svgElement.children).forEach(path => {
		    if(path.getAttribute('fill') == 'rgb(0,255,0)') {
			var parts = document.getElementById('parts-list').querySelectorAll('input');
			var quantity = parts[currentPart].value;
			currentPart += 1;
			for(var i = 0; i < quantity; i++) {
			    var pathClone = path.cloneNode();
			    // We have to place this somewhere not in another element
			    // Get Bounding Box of this path
			    var bbox = path.getBBox();
			    // Move the path to below the print bed
			    pathClone.setAttribute('transform', 'translate(' + currentOffsetX + ',' + printBedHeight + ')');
			    currentOffsetX += bbox.width;
			    combinedSVG.appendChild(pathClone);
			    // Update size of canvas
			    resizeSVG(combinedSVG);
			}
			// Are we finished?
			if(currentPart == parts.length) {
			    var s = new XMLSerializer().serializeToString(document.getElementById("combinedSVG"));
			    /*
			    var encodedData = window.btoa(s);
			    var encodedDataURI = 'data:image/svg+xml;base64,' + encodedData;
			    window.sessionStorage.setItem('svg-data', encodedDataURI);
			    */
			    window.sessionStorage.setItem('svg-data', s);
			    window.location.href = 'SVGnest/index.html';
			}
		    }
		});
		svgElement.remove();
		// Add to combined SVG
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

function resizeSVG(svg) {
  // Get the bounds of the SVG content
  var  bbox = svg.getBBox();
  // Update the width and height using the size of the contents
  svg.setAttribute("width", bbox.x + bbox.width + bbox.x);
  svg.setAttribute("height", bbox.y + bbox.height + bbox.y);
  svg.setAttribute('viewBox', "0 0 " + (bbox.x + bbox.width + bbox.x) + ' ' + (bbox.y + bbox.height + bbox.y));
}
