///////////// BEGIN Node Class //////////////////////

// node constants
var NODE_SIZE = 60;

// node member variables
var type, label, visible, nodeLabel;	
var x, y, width, height, layoutWidth, layoutHeight;
var prevX, prevY;
var group, rect, circle, text, line;
var selected, pressed;
var expanded;
var nodeBolded;
var edgesOut, edgesIn;
var fixed;
var numOfDescendants, numOfAncestors, numOfInstances, numOfProperties;

function Node(type, label) {
	this.type = type;		
	this.label = label;
	this.visible = false;
	
	this.edgesOut = new Array();
	this.edgesIn = new Array();

	this.initValues();
	
	this.numOfDescendants = 0;
	this.numOfInstances = 0;
	this.numOfProperties = 0;
	this.numOfAncestors = 0;
	
	this.nodeLabel = new NodeLabel(this);
}

Node.prototype.initValues = function() {
	this.x = SCREEN_WIDTH / 2 - 100;
	this.y = 200;	
	this.width = NODE_SIZE;
	this.height = NODE_SIZE;
	this.layoutWidth = this.width;
	this.layoutHeight = this.height;
	this.selected = false;
	this.pressed = false;
	this.prevX = this.x;
	this.prevY = this.y;
	this.nodeBolded = false;
	this.expanded = false;
	this.fixed = false;
}

// adds the edge to the out edges array
Node.prototype.addOutEdge = function(edge) {
	this.edgesOut[this.edgesOut.length] = edge;
	
	// update stats
	if(edge.getType() == IS_SUBCLASS) this.numOfDescendants++;
	else if(edge.getType() == IS_INSTANCE) this.numOfInstances++;
	else if(edge.getType() == HAS_PROPERTY) this.numOfProperties++;
}

// adds the edge to the in edges array
Node.prototype.addInEdge = function(edge) {
	this.edgesIn[this.edgesIn.length] = edge;
	
	// update stats
	if(edge.getType() == IS_SUBCLASS) this.numOfAncestors++;
}

Node.prototype.mouseDown = function(evt) {
	this.prevX = evt.clientX;
	this.prevY = evt.clientY;
}

Node.prototype.getX = function() { return this.x; }
Node.prototype.getY = function() { return this.y; }
Node.prototype.getWidth = function() { return this.layoutWidth; }
Node.prototype.getHeight = function() { return this.layoutHeight; }
Node.prototype.getLabel = function() { return this.label; }
Node.prototype.getType = function() { return this.type; }
Node.prototype.getFixed = function() { return this.fixed; }

Node.prototype.setFixed = function(fixed) { this.fixed = fixed; }
Node.prototype.setLocation = function(x, y) { this.x = x; this.y = y; }

// sets the layout width and height
Node.prototype.setSize = function(width, height) {		
	this.layoutWidth = width;
	this.layoutHeight = height;
}

// checks if this node contains coordinates (x, y)
Node.prototype.contains = function(x, y) { 
	return x >= this.x && x <= this.x + this.layoutWidth && y >= this.y && y <= this.y + this.layoutHeight;
}

// calls the select method for all outgoing edges
Node.prototype.selectEdges = function(highlight) {
	if(this.expanded) {
		for(var i = 0; i < this.edgesOut.length; i++) this.edgesOut[i].select(highlight);			
	}
}

// displays the statistics preview for the node
Node.prototype.showLabel = function(x, y) {
	if(this.visible && !this.labelShown && !this.selected) {		
		this.nodeLabel.showLabel(x, y);
		this.labelShown = true;			
	}
}

// hides the statistics preview for the node
Node.prototype.hideLabel = function() {
	if(this.labelShown == true) {
		this.nodeLabel.removeLabel();
		this.labelShown = false;
	}
}

// highlights the node label
Node.prototype.highlight = function() {
	this.text.setAttribute("fill", "red");
	this.text.setAttribute("font-weight", "bold");
}

// selects or deselects the node
Node.prototype.select = function(highlight) {
	if(highlight && !this.nodeBolded) {
		this.rect.setAttributeNS(null, "stroke-width", "2");
		this.rect.setAttributeNS(null, "stroke", "blue");	
		this.nodeBolded = true;
	}
	else {
		this.rect.setAttributeNS(null, "stroke-width", "1");	
		this.rect.setAttributeNS(null, "stroke", "black");
		this.nodeBolded = false;
	}
	
	this.selected = highlight;		
	this.selectEdges(highlight);
}

// moves a node to coordinates (x, y)
Node.prototype.move = function(x, y) {
	this.x += x - this.prevX;
	this.y += y - this.prevY;
	
	this.update();
	
	this.prevX  = x;
	this.prevY = y;
}

// move's this node towards the point x, y
Node.prototype.moveTowards = function(x, y) {
	if(this.x != x)  {
		var slope = Geometry_getSlope(x, y, this.x, this.y);
		var b = this.y - slope * this.x;
		
		var newX = this.x;
		if(x > this.x) newX = Math.min(this.x + 5, x);
		else newX = Math.max(this.x - 5, x);
		
		var newY = slope * newX + b;	
		this.move(newX, newY);
		
		return true;
	}
	return false;
}

// expands this node by making it's neighbors visible
Node.prototype.expandNode = function() {
	// used to set random points in a circle around the parent node
	var cx = this.x + this.layoutWidth / 2;
	var cy = this.y + this.layoutHeight / 2;
	var r = Math.max(MIN_ENTITY_SIZE, this.layoutWidth - this.edgesOut.length / 2);
	var angle_div = TWO_PI / this.edgesOut.length;

	var expanded = false;

	for(var i = 0; i < this.edgesOut.length; i++) {
		if(!this.edgesOut[i].visible) {
			if(!this.edgesOut[i].getTo().visible) {
				if(currentLayout == SPRING_LAYOUT) {
					var angle = angle_div * i;
					var x = Math.cos(angle) * r + cx;
					var y = Math.sin(angle) * r + cy;
					
					this.edgesOut[i].getTo().draw(x, y);
				}
				else this.edgesOut[i].getTo().draw(this.x, this.y);
			}
			this.edgesOut[i].init();
			this.edgesOut[i].visible = true;
			expanded = true;
		}
	}
	
	for(var i = 0; i < this.edgesIn.length; i++) {
		if(!this.edgesIn[i].visible) {
			this.edgesIn[i].init();
			this.edgesIn[i].visible = true;
			if(!this.edgesIn[i].getFrom().visible) {
				this.edgesIn[i].getFrom().draw(this.x, this.y);
			}
		}
	}
	
	if(expanded) {
		this.circle.setAttribute("fill", "none");
		this.expanded = true;
	}
}

// node double click event
Node.prototype.doubleClick = function() {
	if(!this.expanded && (this.edgesOut.length > 0 || this.edgesIn.length > 0)) {
		this.expandNode();
		layoutGraph();
	}
	else {
		// hide all the edges
		for(var i = 0; i < this.edgesOut.length; i++) {
			this.edgesOut[i].getTo().remove();
			this.edgesOut[i].hide();
		}
		this.expanded = false;
		// fill the circle again to indicate no expansion
		if(this.type == TYPE_NODE) {
			this.circle.setAttributeNS(null, "fill", "rgb(204, 159, 42)");
		}
		else if(this.type == INSTANCE_NODE) {
			this.circle.setAttributeNS(null, "fill", "rgb(151, 115, 150)");
		}
	}
}

// removes this node and all out edges from the canvas
Node.prototype.remove = function() {
	if(this.visible) {
		for(var i = 0; i < this.edgesOut.length; i++) {
			this.edgesOut[i].getTo().remove();
			this.edgesOut[i].hide();
		}
		for(var i = 0; i < this.edgesIn.length; i++) {
			this.edgesIn[i].hide();
		}
		svgDocument.documentElement.removeChild(this.group);
		this.initValues();
		this.visible = false;
		this.expanded = false;
		this.fixed = false;
	}
}

// updates the position and size of the node
Node.prototype.update = function(x, y) {
	var xt = this.x;
	var yt = this.y;
	this.x = 0;
	this.y = 0;
	
	var scaleX = this.layoutWidth / this.width;
	var scaleY = this.layoutHeight / this.height;
	
	this.group.setAttribute("transform", "translate(" + xt + "," + yt + "), scale(" + scaleX + "," + scaleY + ")");
	this.x = xt;
	this.y = yt;
	this.prevX = x;
	this.prevY = y;
	
	// update edges
	this.updateEdges(this.edgesOut);
	this.updateEdges(this.edgesIn);
}

// updates the position of the given edges
Node.prototype.updateEdges = function(edges) {
	for(var i = 0; i < edges.length; i++) {
		if(edges[i].visible) edges[i].update();
	}
}

// draws the node at the given coordinates
Node.prototype.draw = function(x, y) {	
	if(x != null && y != null) {
		this.x = x;
		this.y = y;
	}

	this.group = svgDocument.createElementNS(svgns, "g");
	this.group.setAttributeNS(null, "id", this.label);

	// draw little circle that accompanies label
	this.circle = svgDocument.createElementNS(svgns, "circle");	
	if(this.type == TYPE_NODE) {
		this.circle.setAttributeNS(null, "fill", "rgb(204, 159, 42)");
		this.circle.setAttributeNS(null, "stroke", "rgb(204, 159, 42)");
		this.circle.setAttributeNS(null, "stroke-width", "2");
	}
	else if(this.type == INSTANCE_NODE) {
		this.circle.setAttributeNS(null, "fill", "rgb(151, 115, 150)");
		this.circle.setAttributeNS(null, "stroke", "rgb(151, 115, 150)");
		this.circle.setAttributeNS(null, "stroke-width", "2");
	}
	
	// draw text label
	var data = svgDocument.createTextNode(this.label);		
	this.text = svgDocument.createElementNS(svgns, "text");	
	this.text.setAttributeNS(null, "fill", "black");
	this.text.setAttributeNS(null, "font-size", "12");
	this.text.setAttributeNS(null, "text-anchor", "right");	
	this.text.appendChild(data);
	
	// draw main rectangle
	this.rect = svgDocument.createElementNS(svgns, "rect");
	this.rect.setAttributeNS(null, "width", this.width);
	this.rect.setAttributeNS(null, "height", this.height);
	if(this.type == TYPE_NODE) {
		this.rect.setAttributeNS(null, "fill", "rgb(245, 224, 171)");
	}
	else if(this.type == INSTANCE_NODE) {
		this.rect.setAttributeNS(null, "fill", "rgb(233, 226, 233)");
	}
	this.rect.setAttributeNS(null, "stroke", "rgb(0, 0, 0)");
	
	// draw line across upper part of rectangle
	this.line = svgDocument.createElementNS(svgns, "line");		
	this.line.setAttributeNS(null, "stroke-width", 1);
	this.line.setAttributeNS(null, "stroke", "rgb(0, 0, 0)");
	
	this.circle.setAttributeNS(null, "cx", 6);
	this.circle.setAttributeNS(null, "cy",  -8);
	this.circle.setAttributeNS(null, "r", 4);		
	
	this.text.setAttributeNS(null, "x", 14);
	this.text.setAttributeNS(null, "y", -4);
	
	this.rect.setAttributeNS(null, "x", 0);
	this.rect.setAttributeNS(null, "y", 0);
	
	this.line.setAttributeNS(null, "x1", 0);
	this.line.setAttributeNS(null, "y1", 5);
	this.line.setAttributeNS(null, "x2", this.width);
	this.line.setAttributeNS(null, "y2", 5);
	
	this.update(this.x, this.y);
	
	// add objects to group
	this.group.appendChild(this.circle);
	this.group.appendChild(this.text);
	this.group.appendChild(this.rect);
	this.group.appendChild(this.line);
	
	svgDocument.documentElement.appendChild(this.group);
	this.visible = true;
}

// determines if this node has the given edge
Node.prototype.hasEdge = function(edge) {
	for(var i = 0; i < this.edgesOut.length; i++) {
		if(this.edgesOut[i] == edge) return true;
	}
	for(var i = 0; i < this.edgesIn.length; i++) {
		if(this.edgesIn[i] == edge) return true;
	}
	return false;
}

///////////// END Node Class //////////////////////
