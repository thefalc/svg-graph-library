var edge;
var group, rect;
var textValues;

function EdgeLabel(edge) {
	this.edge = edge;
	this.textValues = new Array();
	
	this.group = svgDocument.createElementNS(svgns, "g");
	this.rect = svgDocument.createElementNS(svgns, "rect");
}

EdgeLabel.prototype.showLabel = function(x, y) {
	this.rect.setAttribute("x", x);
	this.rect.setAttribute("y", y);
	this.rect.setAttribute("rx", 5);
	this.rect.setAttribute("ry", 5);
	this.rect.setAttribute("width", this.edge.getLabel().length * 5.5);
	this.rect.setAttribute("height", 15);
	this.rect.setAttribute("stroke", "black");
	this.rect.setAttribute("fill", "white");
	
	this.group.appendChild(this.rect);
	
	this.textValues[0] = this.addText(x+=5, y+=10, this.edge.getLabel());
	
	for(var i = 0; i < this.textValues.length; i++) {
		this.group.appendChild(this.textValues[i]);
	}
	
	svgDocument.documentElement.appendChild(this.group);
}

EdgeLabel.prototype.removeLabel = function() {
	for(var i = 0; i < this.textValues.length; i++) {
		this.group.removeChild(this.textValues[i]);
	}
	svgDocument.documentElement.removeChild(this.group);
}

EdgeLabel.prototype.addText = function(x, y, text) {
	var textOutput = svgDocument.createElementNS(svgns, "text");
	textOutput.setAttributeNS(null, "x", x);
	textOutput.setAttributeNS(null, "y", y);
	textOutput.setAttributeNS(null, "font-size", 10);
	textOutput.setAttributeNS(null, "fill", "black");
	var data = svgDocument.createTextNode(text);
	textOutput.appendChild(data);
	
	return textOutput;
}

