// minimum size for a node
var MIN_ENTITY_SIZE = 10;

// maximum and minimum integer values
var MAX_VALUE = 1000000;
var MIN_VALUE = -1000000;

// layout type constants
var SPRING_LAYOUT = 1;
var RANDOM_LAYOUT = 2;
var FORCE_LAYOUT = 3;

///////////// BEGIN Rectangle Class //////////////////////
var x, y, width, height;
function Rectangle(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}
///////////// END Rectangle Class //////////////////////

///////////// BEGIN LayoutFactory Class //////////////////////
function LayoutFactory_getInstance(type, entitiesToLayout, relationshipsToConsider, x, y, width, height) {
	if(type == SPRING_LAYOUT) return new SpringLayout(entitiesToLayout, relationshipsToConsider, x, y, width, height);
	else if(type == RANDOM_LAYOUT) return new RandomLayout(entitiesToLayout, relationshipsToConsider, x, y, width, height);
	else if(type == FORCE_LAYOUT) return new ForceLayout(entitiesToLayout, relationshipsToConsider, x, y, width, height);
}
///////////// END LayoutFactory Class //////////////////////

function computeNodeSize(numOfElements) {
	return Math.max(MIN_ENTITY_SIZE, NODE_SIZE - numOfElements / 2);
}

// adds markers to the svg definition, used by edges
function buildMarkers() {
	var defs = svgDocument.createElementNS(svgns, "defs");
	var marker = svgDocument.createElementNS(svgns, "marker");
	marker.setAttributeNS(null, "id", "myMarker1");
	marker.setAttributeNS(null, "viewBox", "0 0 10 10");
	marker.setAttributeNS(null, "refX", "1");
	marker.setAttributeNS(null, "refY", "5");
	marker.setAttributeNS(null, "markerUnits", "userSpaceOnUse");
	marker.setAttributeNS(null, "markerWidth", "10");
	marker.setAttributeNS(null, "markerHeight", "10");
	marker.setAttributeNS(null, "orient", "auto");
	
	var polyline = svgDocument.createElementNS(svgns, "polyline");
	polyline.setAttributeNS(null, "points", "0,0 10,5 0,10 1,5");
	polyline.setAttributeNS(null, "fill", "blue");
	
	marker.appendChild(polyline);
	
	var marker2 = svgDocument.createElementNS(svgns, "marker");
	marker2.setAttributeNS(null, "id", "myMarker2");
	marker2.setAttributeNS(null, "viewBox", "0 0 10 10");
	marker2.setAttributeNS(null, "refX", "1");
	marker2.setAttributeNS(null, "refY", "5");
	marker2.setAttributeNS(null, "markerUnits", "userSpaceOnUse");
	marker2.setAttributeNS(null, "markerWidth", "10");
	marker2.setAttributeNS(null, "markerHeight", "10");
	marker2.setAttributeNS(null, "orient", "auto");
	
	var polyline2 = svgDocument.createElementNS(svgns, "polyline");
	polyline2.setAttributeNS(null, "points", "0,0 10,5 0,10 1,5");
	polyline2.setAttributeNS(null, "fill", "yellow");
	
	marker2.appendChild(polyline2);
	
	var marker3 = svgDocument.createElementNS(svgns, "marker");
	marker3.setAttributeNS(null, "id", "myMarker3");
	marker3.setAttributeNS(null, "viewBox", "0 0 10 10");
	marker3.setAttributeNS(null, "refX", "1");
	marker3.setAttributeNS(null, "refY", "5");
	marker3.setAttributeNS(null, "markerUnits", "userSpaceOnUse");
	marker3.setAttributeNS(null, "markerWidth", "10");
	marker3.setAttributeNS(null, "markerHeight", "10");
	marker3.setAttributeNS(null, "orient", "auto");
	
	var polyline3 = svgDocument.createElementNS(svgns, "polyline");
	polyline3.setAttributeNS(null, "points", "0,0 10,5 0,10 1,5");
	polyline3.setAttributeNS(null, "fill", "red");
	
	marker3.appendChild(polyline3);
	
	defs.appendChild(marker);
	defs.appendChild(marker2);
	defs.appendChild(marker3);
	svgDocument.documentElement.appendChild(defs);
}	

// generates the graph
function generateGraph() {
	var sNodes = "1 :THING 1 Author 1 Content 1 Layout_info 1 Library 1 Newspaper 1 Organization 1 People 1 News_Service 1 Columnist 1 Editor 1 Reporter 1 Advertisement 1 Article 1 Billing_Chart 1 Content_Layout 1 Prototype_Newspaper 1 Rectangle 1 Section 1 Employee 1 Personals_Ad 1 Standard_Ad 1 Columnist 1 Editor 1 Reporter 1 Salesperson 1 Manager 1 Director 2 Joe$Schmo";
	var sEdges = ":THING 1 Author 1 Content 1 Layout_info 1 Library 1 Newspaper 1 Organization 1 People^Author 1 News_Service 1 Columnist 1 Editor 1 Reporter^Content 1 Advertisement 1 Article^Layout_info 1 Billing_Chart 1 Content_Layout 1 Prototype_Newspaper 1 Rectangle 1 Section^People 1 Employee^Advertisement 1 Personals_Ad 1 Standard_Ad^Employee 1 Columnist 1 Editor 1 Reporter 1 Salesperson 1 Manager^Manager 1 Director^Reporter 3 Joe$Schmo";
		
	var arrNodes = sNodes.split(" ");
	var arrEdges = sEdges.split("^");
	
	var count = 0;
	for(var i = 0; i < arrNodes.length; i += 2) {
		var label = arrNodes[i+1].replace("$", " ");
		var type = arrNodes[i];
		nodes[count] = new Node(type, label);			
		count++;
	}
	
	var count = 0;
	for(var i = 0; i < arrEdges.length; i++) {
		var arrAdjs = arrEdges[i].split(" ");
		var label = arrAdjs[0].replace("$", " ");
		var nodeIndex = getNodeIndex(label);
		if(nodeIndex == -1) alert("BAD INDEX 1 " + label);
		
		for(var j = 1; j < arrAdjs.length; j += 2) {
			var type = arrAdjs[j];
			var label2 = arrAdjs[j+1].replace("$", " ");
			var adjIndex = getNodeIndex(label2);	
			if(adjIndex == -1) alert("BAD INDEX 2 " + label2);
			var edge = new Edge(type, nodes[nodeIndex], nodes[adjIndex]);
			edges[count++] = edge;
			nodes[nodeIndex].addOutEdge(edge);
			nodes[adjIndex].addInEdge(edge);
		}
	}

	nodes[0].draw();
	nodes[0].setFixed(true);
}

//////////// DEBUGGING FUNCTIONS ////////////////////////
function print(val) {
	var data = svgDocument.createTextNode(val);
	textOutput.appendChild(data);
}

function println(val) {
	prevY += 20;
	var textOutput = svgDocument.createElementNS(svgns, "text");
	textOutput.setAttributeNS(null, "x", prevX);
	textOutput.setAttributeNS(null, "y", prevY);
	textOutput.setAttributeNS(null, "font-size", 12);
	textOutput.setAttributeNS(null, "fill", "black");
	var data = svgDocument.createTextNode(val);
	textOutput.appendChild(data);
	svgDocument.documentElement.appendChild(textOutput);
}
