///////////// BEGIN RandomLayout Class //////////////////////

// maximum number of iterations used for picking random points
var MAX_ITERATIONS = 30;

// maximum value for an integer
var INT_MAX = 100000;

// maximum value of a random movement
var MAX_DIFFERENCE = 800;

// penalty used to keep nodes off the edge of the canvas
var BOUND_PENALTY = 200;

// penalty used to keep nodes from always going to the center of the canvas
var CENTER_PENALTY = 5;

// buffer around the edge of the canvas
var BOUND_BUFFERX = 10;
var TOP_BUFFERY = 10;
var BOTTOM_BUFFERY = 300;

var SMALL_DISTANCE = 100;
var LARGE_DISTANCE = 300;

var SMALL_DISTANCE_PENALTY = 5;
var LARGE_DISTANCE_PENALTY = 30;

// layout member variables
var entitiesToLayout, relationshipsToConsider, x, y, width, height;
var tempLocationsX, tempLocationsY;

function RandomLayout(entitiesToLayout, relationshipsToConsider, x, y, width, height) {
	this.entitiesToLayout = entitiesToLayout;
	this.relationshipsToConsider = relationshipsToConsider;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.tempLocationsX = new Array(this.entitiesToLayout.length);
	this.tempLocationsY = new Array(this.entitiesToLayout.length);
	
	layoutComplete = false;

	this.init();
	this.preCompute();
}

RandomLayout.prototype.init = function() {
	var size = computeNodeSize(this.entitiesToLayout.length);

	for(var i = 0; i < this.entitiesToLayout.length; i++) {
		var entity = this.entitiesToLayout[i];
		this.tempLocationsX[i] = entity.getX();
		this.tempLocationsY[i] = entity.getY();
		
		entity.setSize(size, size);
		entity.update(entity.getX(), entity.getY());
	}
}

RandomLayout.prototype.preCompute = function() {
	for(var i = 0; i < this.entitiesToLayout.length; i++) {
		var bestX, bestY, minConflicts = MAX_VALUE;
		var entity = this.entitiesToLayout[i];
		var entityX = entity.getX();
		var entityY = entity.getY();
		if(!entity.getFixed()) {
			for(var j = 0; j < MAX_ITERATIONS; j++) {
				var x = entityX + Math.random() * MAX_DIFFERENCE - MAX_DIFFERENCE / 2;
				var y = entityY + Math.random() * MAX_DIFFERENCE - MAX_DIFFERENCE / 2;
				var conflicts = this.computeConflicts(entity, x, y);
	
				if(conflicts < minConflicts) {
					minConflicts = conflicts;
					bestX = x;
					bestY = y;
				}
			}
	
			this.tempLocationsX[i] = bestX;
			this.tempLocationsY[i] = bestY;
		}	
	}
}

RandomLayout.prototype.computeOneIteration = function(iterations) {
	layoutComplete = true;
	for(var i = 0; i < this.entitiesToLayout.length; i++) {
		var entity = this.entitiesToLayout[i];
		if(entity.moveTowards(this.tempLocationsX[i], this.tempLocationsY[i])) {
			layoutComplete = false;
		}
		if(fixNodes) entity.setFixed(true);
	}
}

RandomLayout.prototype.computeConflicts = function(target, x, y) {
	var conflicts = 0;
	// add conflict for each intersecting node
	for(var i = 0; i < this.entitiesToLayout.length; i++) {
		var entity = this.entitiesToLayout[i];
		if(entity != target) {
			if(Geometry_ptInsideRect(x, y, this.tempLocationsX[i], this.tempLocationsY[i], entity.getWidth(), entity.getHeight())) conflicts++;
			if(Geometry_ptInsideRect(x + entity.getWidth(), y, this.tempLocationsX[i], this.tempLocationsY[i], entity.getWidth(), entity.getHeight())) conflicts++;
			if(Geometry_ptInsideRect(x + entity.getWidth(), y + entity.getHeight(), this.tempLocationsX[i], this.tempLocationsY[i], entity.getWidth(), entity.getHeight())) conflicts++;
			if(Geometry_ptInsideRect(x, y + entity.getHeight(), this.tempLocationsX[i], this.tempLocationsY[i], entity.getWidth(), entity.getHeight())) conflicts++;
			
			// add node crossing conflicts
			if(this.nodeCrossings(x, y, target, entity)) conflicts++;
		}
	}

	// add conflicts if point of interest outside canvas
	if(x < this.x + BOUND_BUFFERX || x > this.width - BOUND_BUFFERX) conflicts += BOUND_PENALTY;
	if(y < this.y + TOP_BUFFERY || y > this.height - BOTTOM_BUFFERY) conflicts += BOUND_PENALTY;
	
	// add a penalty for going to the centre
	if(this.nearCenter(x, y)) conflicts += CENTER_PENALTY;

	// penalize small and large jumps
	var distance = Geometry_getPtDistance(x, y, target.getX(), target.getY());
	if(distance < SMALL_DISTANCE) conflicts += SMALL_DISTANCE_PENALTY;
	else if(distance > LARGE_DISTANCE) conflicts += LARGE_DISTANCE_PENALTY;

	return conflicts;
}

// calculate how close to the centre of the screen we are
RandomLayout.prototype.nearCenter = function(x, y) {
	return Geometry_getPtDistance(x, y, this.width / 2, this.height / 2) < 50;
}

// calculate whether the entity is along the line defined by (x,y),(target.x, target.y)
RandomLayout.prototype.nodeCrossings = function(x, y, target, entity) {
	return Geometry_getLineDistance(x, y, target.getX(), target.getY(), entity.getX(), entity.getY()) < THRESHOLD;
}