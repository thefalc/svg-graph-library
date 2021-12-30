///////////// BEGIN Edge Class //////////////////////

// threshold for a line selection
var THRESHOLD = 20;

// default opacity of the edge
var EDGE_OPACITY = 0.3;

// edge member variables
var type, label;
var to, from;	
var line, marker;
var visible, labelShown, edgeLabel;
var x1, y1, x2, y2;

function Edge(type, from, to) {
	this.type = type;		
	this.to = to;
	this.from = from;
	
	this.visible = false;
	this.labelShown = false;
	this.initLabel();
	this.edgeLabel = new EdgeLabel(this);
}	

Edge.prototype.getFrom = function() { return this.from; }
Edge.prototype.getTo = function() { return this.to; }
Edge.prototype.getType = function() { return this.type; }
Edge.prototype.getLabel = function() { return this.label; }

// initializes the label that's displayed on a mouseover event
Edge.prototype.initLabel = function() {
	if(this.type == IS_SUBCLASS) {
		this.label = this.from.getLabel() + " ---has subclass---> " + this.to.getLabel();
	}
	else if(this.type == HAS_PROPERTY) {
		this.label = this.from.getLabel() + " ---has property---> " + this.to.getLabel();
	}
	else if(this.type == IS_INSTANCE) {
		this.label = this.from.getLabel() + " ---has instance---> " + this.to.getLabel();
	}
}

// initializes the svg objects that draw the edge
Edge.prototype.init = function() {				
	this.line = svgDocument.createElementNS(svgns, "path");		
	this.line.setAttributeNS(null, "stroke-width", 1);
	this.line.setAttributeNS(null, "opacity", EDGE_OPACITY);
	this.line.setAttributeNS(null, "fill", "none");
	if(this.type == IS_SUBCLASS) {
		this.line.setAttributeNS(null, "stroke", "blue");
		this.line.setAttributeNS(null, "marker-mid", "url(#myMarker1)");
	}
	else if(this.type == HAS_PROPERTY) {
		this.line.setAttributeNS(null, "stroke", "yellow");
		this.line.setAttributeNS(null, "marker-mid", "url(#myMarker2)");
	}
	else if(this.type == IS_INSTANCE) {
		this.line.setAttributeNS(null, "stroke", "red");
		this.line.setAttributeNS(null, "marker-mid", "url(#myMarker3)");
	}
	
	this.update();
	this.visible = true;	
	svgDocument.documentElement.insertBefore(this.line, svgDocument.documentElement.firstChild);	
	this.select(true);
}

// checks whether this edge contains coordinate (x, y)
Edge.prototype.contains = function(x, y) {
	return Geometry_getLineDistance(this.x1, this.y1, this.x2, this.y2, x, y) < THRESHOLD;
}

// displays the edge label
Edge.prototype.showLabel = function(x, y) {
	if(this.visible && !this.labelShown) {			
		this.edgeLabel.showLabel(x, y);
		this.labelShown = true;			
	}
}

// hides the edge label
Edge.prototype.hideLabel = function() {
	if(this.labelShown == true) {
		this.edgeLabel.removeLabel();
		this.labelShown = false;
	}
}

// updates the positional information for the edge
Edge.prototype.update = function() {
	this.x1 = this.from.getX() + this.from.getWidth() / 2;
	this.y1 = this.from.getY() + this.from.getHeight() / 2;
	this.x2 = this.to.getX() + this.to.getWidth() / 2;
	this.y2 = this.to.getY() + this.to.getHeight() / 2;

	// calculate the mid-point along the line to place our marker
	var midX = (this.x1 + this.x2) / 2;
	var midY = (this.y1 + this.y2) / 2;
	this.line.setAttribute("d", "M" + this.x1 + "," + this.y1 + " L" + midX + "," + midY + " L"+ this.x2 + "," + this.y2);
}

// removes the edge from the canvas
Edge.prototype.hide = function() {
	if(this.visible) {
		svgDocument.documentElement.removeChild(this.line);
		this.visible = false;
	}
}

// selects or deselects the edge
Edge.prototype.select = function(highlight) {
	if(this.visible) {
		if(highlight) {			
			this.line.setAttributeNS(null, "stroke-width", 3);
			this.line.setAttributeNS(null, "opacity", 1);
		}
		else {
			this.line.setAttributeNS(null, "stroke-width", 1);
			this.line.setAttributeNS(null, "opacity", EDGE_OPACITY);
		}
	}	
}

///////////// END Edge Class //////////////////////