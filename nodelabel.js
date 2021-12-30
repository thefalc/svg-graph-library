var node;
var group, rect;
var textValues;

function NodeLabel(node) {
	this.node = node;
	this.textValues = new Array();
	
	this.group = svgDocument.createElementNS(svgns, "g");
	this.rect = svgDocument.createElementNS(svgns, "rect");
}

NodeLabel.prototype.showLabel = function(x, y) {
	this.rect.setAttribute("x", x);
	this.rect.setAttribute("y", y);
	this.rect.setAttribute("rx", 5);
	this.rect.setAttribute("ry", 5);
	this.rect.setAttribute("width", Math.max(this.node.getLabel().length * 6.0, 90));
	this.rect.setAttribute("stroke", "black");
	this.rect.setAttribute("fill", "lightgray");
	
	this.group.appendChild(this.rect);
	
	this.textValues[0] = this.addText(x+=5, y+=10, this.node.getLabel());
	this.textValues[1] = this.addText(x, y+=10, "Descendants: " + this.node.numOfDescendants);
	this.textValues[2] = this.addText(x, y+=10, "Ancestors: " + this.node.numOfAncestors);
	this.textValues[3] = this.addText(x, y+=10, "Instances: " + this.node.numOfInstances);
	this.textValues[4] = this.addText(x, y+=10, "Properties: " + this.node.numOfProperties);
	this.textValues[5] = this.addText(x, y+=10, "Expanded: " + this.node.expanded);
	
	this.rect.setAttribute("height", this.textValues.length * 10 + 5);
	
	for(var i = 0; i < this.textValues.length; i++) {
		this.group.appendChild(this.textValues[i]);
	}
	
	svgDocument.documentElement.appendChild(this.group);
}

NodeLabel.prototype.removeLabel = function() {
	for(var i = 0; i < this.textValues.length; i++) {
		this.group.removeChild(this.textValues[i]);
	}
	svgDocument.documentElement.removeChild(this.group);
}

NodeLabel.prototype.addText = function(x, y, text) {
	var textOutput = svgDocument.createElementNS(svgns, "text");
	textOutput.setAttributeNS(null, "x", x);
	textOutput.setAttributeNS(null, "y", y);
	textOutput.setAttributeNS(null, "font-size", 10);
	textOutput.setAttributeNS(null, "fill", "black");
	var data = svgDocument.createTextNode(text);
	textOutput.appendChild(data);
	
	return textOutput;
}