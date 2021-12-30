var TWO_PI = 6.28318530;

// line slope
function Geometry_getSlope(x1, y1, x2, y2) {
	return (y2 - y1) / (x2 - x1);
}

// distance between two points
function Geometry_getPtDistance(x1, y1, x2, y2) {
	var x = x1 - x2;
	var y = y1 - y2;
	return Math.sqrt(x * x + y * y);
}

// distance between line and point
function Geometry_getLineDistance(x1, y1, x2, y2, px, py) {
	x2 -= x1;
	y2 -= y1;
	px -= x1;
	py -= y1;
	var dotprod = px * x2 + py * y2;
	var projlenSq = 0.0;
	if(dotprod > 0.0) {
		px = x2 - px;
		py = y2 - py;
		dotprod = px * x2 + py * y2;
		if(dotprod > 0.0) projlenSq = dotprod * dotprod / (x2 * x2 + y2 * y2);
	}
	lenSq = px * px + py * py - projlenSq;
	if (lenSq < 0) return 0;
	return Math.sqrt(lenSq);
}	

function Geometry_getBearing(x1, y1, x2, y2) {
	var x0 = x2 - x1;
	var y0 = y2 - y1;
	return Math.atan2(x0, y0);
}

function Geometry_ptInsideRect(x, y, x1, y1, width, height) {
	return x >= x1 && x <= x1 + width && y >= y1 && y <= y1 + height;
}

//////////////// START OF LINE CLASS //////////////////////////
var p1, p2;
function Line(px1, py1, px2, py2) {
	this.p1 = new Point(px1, py1);
	this.p2 = new Point(px2, py2);
}

// distance between two lines
Line.prototype.getDistance = function(line) {
	var a = this.p1;
	var b = this.p2
	var c = line.p1;
	var d = line.p2;
	
	var m = a.distance(c);
	m = Math.min(m, a.distance(d));
	m = Math.min(m, b.distance(c));
	m = Math.min(m, b.distance(d));
	
	if((b.minus(a).dot(c.minus(a)) > 0) != (b.minus(a).dot(c.minus(b)) > 0)) {
		m = Math.min(m, c.distance(a, b));
	}
	if((b.minus(a).dot(d.minus(a)) > 0) != (b.minus(a).dot(d.minus(b)) > 0)) {
		m = Math.min(m, d.distance(a, b));
	}
	if((d.minus(c).dot(a.minus(c)) > 0) != (d.minus(c).dot(a.minus(d)) > 0)) {
		m = Math.min(m, a.distance(c, d));
	}
	if((d.minus(c).dot(b.minus(c)) > 0) != (d.minus(c).dot(b.minus(d)) > 0)) {
		m = Math.min(m, b.distance(c, d));
	}
	
	return m;
}

Line.prototype.lineIntersectPt = function(line) {
	var x1 = this.p1.getX();
	var y1 = this.p1.getY();
	var x2 = this.p2.getX();
	var y2 = this.p2.getY();
	var x3 = line.p1.getX();
	var y3 = line.p1.getY();
	var x4 = line.p2.getX();
	var y4 = line.p2.getY();
	
	var a1 = y2 - y1;
	var b1 = x1 - x2;
	var c1 = x2*y1 - x1*y2;

	var a2 = y4 - y3;
	var b2 = x3 - x4;
	var c2 = x4*y3 - x3*y4;
	
	var denom = a1*b2 - a2*b1;
	// check if lines are parallel
	if(denom == 0) return null;
	
	var x = (b1*c2 - b2*c1)/denom;
	var y = (a2*c1 - a1*c2)/denom;
	
	return new Point(x, y);
}

Line.prototype.relativeCCW = function(x1, y1, x2, y2, px, py) {
	x2 -= x1;
	y2 -= y1;
	px -= x1;
	py -= y1;
	var ccw = px * y2 - py * x2;
	if(ccw == 0.0) {
		ccw = px * x2 + py * y2;
		if(ccw > 0.0) {
			px -= x2;
			py -= y2;
			ccw = px * x2 + py * y2;
			if(ccw < 0.0) ccw = 0.0;
		}
	}
	
	return (ccw < 0.0) ? -1 : ((ccw > 0.0) ? 1 : 0);
}

Line.prototype.lineIntersects = function(line) {
	var x1 = this.p1.getX();
	var y1 = this.p1.getY();
	var x2 = this.p2.getX();
	var y2 = this.p2.getY();
	var x3 = line.p1.getX();
	var y3 = line.p1.getY();
	var x4 = line.p2.getX();
	var y4 = line.p2.getY();
	
	return ((this.relativeCCW(x1, y1, x2, y2, x3, y3) *
		 this.relativeCCW(x1, y1, x2, y2, x4, y4) <= 0)
		&& (this.relativeCCW(x3, y3, x4, y4, x1, y1) *
		    this.relativeCCW(x3, y3, x4, y4, x2, y2) <= 0));
}

//////////////// START OF POINT CLASS //////////////////////////
var x, y;
function Point(x, y) {
	this.x = x;
	this.y = y;
}

Point.prototype.getX = function() {
	return this.x;
}

Point.prototype.getY = function() {
	return this.y;
}

Point.prototype.perp = function() {
	return new Point(-y, x);
}

Point.prototype.dot = function(p) {
	return this.x * p.x + this.y * p.y;
}

Point.prototype.minus = function(p) {
	return new Point(this.x - p.x, this.y - p.y);
}

Point.prototype.distance = function(p) {
	return Geometry_getPtDistance(this.x, this.y, p.x, p.y);
}

Point.prototype.distance2 = function(p1, p2) {
	var l = p2.minus(p1).dot(this.minus(p1)) / p1.distance(p2);
	return Math.sqrt(this.distance(p1) * this.distance(p1) - l * l);
}