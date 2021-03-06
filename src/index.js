import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
var stlLoader = new STLLoader();

import { STLToSVG } from './stl-processor.js';

document.addEventListener("DOMContentLoaded", function(event) { 
    var partsInputElement = document.getElementById('parts-input');
    partsInputElement.addEventListener('change', function() {
	var partsListElement = document.getElementById('parts-list');
	partsListElement.innerHTML = '';
	Array.from(this.files).forEach(file => {
	    var rowTemplate = document.getElementById('part-row');
	    var clone = document.importNode(rowTemplate.content, true);
	    var td = clone.querySelectorAll("td");
	    td[0].textContent = file.name;

	    partsListElement.appendChild(clone);
	});
    });

    var pixelsPerMM = 10;
    var loadSTLButton = document.getElementById('load-stl');
    loadSTLButton.addEventListener('click', function() {
	// Add dimensions to output SVG
	var combinedSVG = document.getElementById('combinedSVG');
	var rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
	var width = document.getElementById('printWidth').value;
	var height = document.getElementById('printDepth').value;
	rect.setAttributeNS(null, 'x', 0);
        rect.setAttributeNS(null, 'y', 0);
        rect.setAttributeNS(null, 'height', width * pixelsPerMM);
        rect.setAttributeNS(null, 'width', height * pixelsPerMM);
        rect.setAttributeNS(null, 'stroke', 'white');
        rect.setAttributeNS(null, 'stroke-width', '1');
	combinedSVG.appendChild(rect);

	var processFileFunc = function(event) {
	    var url = event.target.result;
	    stlLoader.load(url, STLToSVG);
	};
	// Read each file
	Array.from(partsInputElement.files).forEach(file => {
	    // To access file from a form we are using the HTLM5 file API
	    var fileReader = new FileReader();
	    fileReader.onload = processFileFunc;
	    fileReader.readAsDataURL(file);
	});
	
    });
});
