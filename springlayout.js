///////////// BEGIN SpringLayout Class //////////////////////
var MIN_DISTANCE = 0.001, SPRING_STRAIN = 800.0, SPRING_LENGTH = 800.0, SPRING_GRAVITATION = 80000.0, SPRING_MOVE = 0.5;

var EPSILON = 0.001;

var entitiesToLayout, relationshipsToConsider, x, y, width, height;
var tempLocationsX, tempLocationsY, forcesX, forcesY;
var srcDestToNumRels, srcDestToRelsAvgWeight;

function SpringLayout(entitiesToLayout, relationshipsToConsider, x, y, width, height) {
	this.entitiesToLayout = entitiesToLayout;
	this.relationshipsToConsider = relationshipsToConsider;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;

	layoutComplete = false;
	
	this.tempLocationsX = new Array(entitiesToLayout.length);
	this.tempLocationsY = new Array(entitiesToLayout.length);
	this.forcesX = new Array(entitiesToLayout.length);
	this.forcesY = new Array(entitiesToLayout.length);

	this.preCompute();
}

SpringLayout.prototype.computeOneIteration = function(iterations) {
	this.computeForces();
	this.computePositions();

	for(var i = 0; i < this.entitiesToLayout.length; i++) {
		var entity = this.entitiesToLayout[i];
		if(!entity.fixed) {
			entity.move(this.tempLocationsX[i], this.tempLocationsY[i]);
		}
		else entity.update(entity.getX(), entity.getY());
		if(iterations == LAYOUT_MAX_ITERATIONS) entity.setFixed(true);
	}
}

SpringLayout.prototype.numRelations = function(node1, node2) {
	var count = 0;
	for(var i = 0; i < this.relationshipsToConsider.length; i++) {
		var edge = this.relationshipsToConsider[i];
		if(edge.getFrom() == node1 && edge.getTo() == node2) count++;
	}
	return count;
}

SpringLayout.prototype.avgWeight = function(node1, node2) {
	return 1;
}

SpringLayout.prototype.preCompute = function() {	
	// create edge mapping
	this.srcDestToNumRels = new Array(this.entitiesToLayout.length);
	this.srcDestToRelsAvgWeight = new Array(this.entitiesToLayout.length);
	for(var i = 0; i < this.srcDestToNumRels.length; i++) {
		this.srcDestToNumRels[i] = new Array(this.entitiesToLayout.length);
		this.srcDestToRelsAvgWeight[i] = new Array(this.entitiesToLayout.length);
	}
	
	// populate edge mapping
	for(var i = 0; i < this.srcDestToNumRels.length; i++) {
		var node1 = this.entitiesToLayout[i];
		for(var j = 0; j < this.srcDestToNumRels.length; j++) {
			var node2 = this.entitiesToLayout[j];
			this.srcDestToNumRels[i][j] = this.numRelations(node1, node2);
			this.srcDestToNumRels[i][j] += this.numRelations(node2, node1);
			this.srcDestToRelsAvgWeight[i][j] = this.avgWeight(node1, node2);
		}
	}
	
	this.copyCoordinates();
}

SpringLayout.prototype.computeForces = function() {
	for(var i = 0; i < this.entitiesToLayout.length; i++) {
		this.forcesX[i] = 0.0;
		this.forcesY[i] = 0.0;
	}
	
	var min_distance = 1.0; 
	
	for(var i = 0; i < this.entitiesToLayout.length - 1; i++) {
		var sourceEntity = this.entitiesToLayout[i];
		var srcLocationX = this.tempLocationsX[i];
		var srcLocationY = this.tempLocationsY[i];
		var fx = this.forcesX[i];  // force in x direction
		var fy = this.forcesY[i];  // force in y direction
		
		for(var j = i+1; j < this.entitiesToLayout.length; j++) {
			var destinationEntity = this.entitiesToLayout[j];
			if(sourceEntity == destinationEntity) continue;
			var destLocationX = this.tempLocationsX[j];
			var destLocationY = this.tempLocationsY[j];
			var dx = Math.max(srcLocationX - destLocationX, min_distance);
			var dy = Math.max(srcLocationY - destLocationY, min_distance);
			var distance = Math.sqrt(dx * dx + dy * dy);
			var distance_sq = distance * distance;
			
			var numRels = this.srcDestToNumRels[i][j];
			var avgWeight = this.srcDestToRelsAvgWeight[i][j];
			if(numRels > 0) {
				var f = SPRING_STRAIN * Math.log(distance / SPRING_LENGTH);
				fx -= (f * dx / distance);
				fy -= (f * dy / distance);
			}
			else {
				var f = SPRING_STRAIN * Math.log(distance / SPRING_LENGTH);
				fx += (f * dx / distance);
				fy += (f * dy / distance);
			}
			
			this.forcesX[j] -= fx;
			this.forcesY[j] -= fy;
		}
		
		this.forcesX[i] = fx;
		this.forcesY[i] = fy;
	}
}

SpringLayout.prototype.computePositions = function() {
	for(var i = 0; i < this.entitiesToLayout.length; i++) {
		var oldX = this.tempLocationsX[i];
		var oldY = this.tempLocationsY[i];
		var deltaX = SPRING_MOVE * this.forcesX[i];
		var deltaY = SPRING_MOVE * this.forcesY[i];
		
		var maxMovement = 10.0 * SPRING_MOVE;
		if (deltaX >= 0) deltaX = Math.min(deltaX, maxMovement);
		else deltaX = Math.max(deltaX, -maxMovement);
		
		if (deltaY >= 0) deltaY = Math.min(deltaY, maxMovement);
		else deltaY = Math.max(deltaY, -maxMovement);

		this.tempLocationsX[i] = oldX + deltaX;
		this.tempLocationsY[i] = oldY + deltaY;
	}
}

SpringLayout.prototype.copyCoordinates = function() {
	var minX = MAX_VALUE;
	var maxX = MIN_VALUE;
	var minY = MAX_VALUE;
	var maxY = MIN_VALUE;

	for(var i = 0; i < this.entitiesToLayout.length; i++) {
		var entity = this.entitiesToLayout[i];
		minX = Math.min(minX, entity.getX());
		minY = Math.min(minY, entity.getY());
		maxX = Math.max(maxX, entity.getX());
		maxY = Math.max(maxY, entity.getY());
	}

	var spanX = maxX - minX;
	var spanY = maxY - minY;
	var maxSpan = Math.max(spanX, spanY);
	
	var size = computeNodeSize(this.entitiesToLayout.length);

	if(maxSpan > EPSILON) {
		for(var i = 0; i < this.entitiesToLayout.length; i++) {
			var entity = this.entitiesToLayout[i];
			this.tempLocationsX[i] = entity.getX();
			this.tempLocationsY[i] = entity.getY();
			entity.setSize(size, size);
		}
	}
	else this.placeRandomly();
}

SpringLayout.prototype.placeRandomly = function() {
	for(var i = 0; i < this.entitiesToLayout.length; i++) {
		var entity = this.entitiesToLayout[i];
		var x = entity.getX() + Math.random() * 800 - 400;
		var y = entity.getY() + Math.random() * 800 - 400;
		this.tempLocationsX[i] = x;
		this.tempLocationsY[i] = y;
	}
}
///////////// END SpringLayout Class //////////////////////