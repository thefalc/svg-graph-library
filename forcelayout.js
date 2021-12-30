///////////// BEGIN ForceLayout Class //////////////////////

// only calculate repulsive force if the node is less than 200 away
var MAX_REPULSIVE_FORCE_DISTANCE = 200.0;

// maximum movement in any direction
var MAX_VERTEX_MOVEMENT = 5.0;

var C = 0.01, K = 200.0;

var wallsX, wallsY;

// member variables
var entitiesToLayout, relationshipsToConsider, x, y, width, height;
var forcesX, forcesY;
var srcDestToNumRels;

function ForceLayout(entitiesToLayout, relationshipsToConsider, x, y, width, height) {
	this.entitiesToLayout = entitiesToLayout;
	this.relationshipsToConsider = relationshipsToConsider;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	
	this.forcesX = new Array(entitiesToLayout.length);
	this.forcesY = new Array(entitiesToLayout.length);
	
	if(wallsX == null) {
		wallsX = new Array(2);
		wallsY = new Array(2);
		wallsX[0] = 0;
		wallsX[1] = SCREEN_WIDTH / 2;
		wallsX[2] = SCREEN_WIDTH;
		wallsY[0] = 0;
		wallsY[1] = SCREEN_HEIGHT / 2;
		wallsY[1] = SCREEN_HEIGHT;
	}
	
	layoutComplete = false;
	this.init();
}

// calculates the number of relationships between node1 and node2
ForceLayout.prototype.numRelations = function(node1, node2) {
	var count = 0;
	for(var i = 0; i < this.relationshipsToConsider.length; i++) {
		var edge = this.relationshipsToConsider[i];
		if(edge.getFrom() == node1 && edge.getTo() == node2) count++;
	}
	return count;
}

// precompute the relationships between nodes
ForceLayout.prototype.preCompute = function() {
	// create edge mapping
	this.srcDestToNumRels = new Array(this.entitiesToLayout.length);
	for(var i = 0; i < this.srcDestToNumRels.length; i++) {
		this.srcDestToNumRels[i] = new Array(this.entitiesToLayout.length);
	}
	
	// populate edge mapping
	for(var i = 0; i < this.srcDestToNumRels.length; i++) {
		var node1 = this.entitiesToLayout[i];
		for(var j = 0; j < this.srcDestToNumRels.length; j++) {
			var node2 = this.entitiesToLayout[j];
			this.srcDestToNumRels[i][j] = this.numRelations(node1, node2);
			this.srcDestToNumRels[i][j] += this.numRelations(node2, node1);
		}
	}
}

// initialize arrays and node sizes
ForceLayout.prototype.init = function() {
	this.preCompute();
	
	var size = computeNodeSize(this.entitiesToLayout.length);	
	for(var i = 0; i < this.entitiesToLayout.length; i++) {
		var entity = this.entitiesToLayout[i];
		this.forcesX[i] = 0;
		this.forcesY[i] = 0;
		
		entity.setSize(size, size);
		entity.update(entity.getX(), entity.getY());
	}
	
}

// calculates the repulsive for between two nodes
ForceLayout.prototype.calcRepulsiveForce = function(i, j) {
	var node1 = this.entitiesToLayout[i];
	var node2 = this.entitiesToLayout[j];
	var dx = node2.getX() - node1.getX();
	var dy = node2.getY() - node1.getY();
	
	var d2 = dx * dx + dy * dy;
	if(d2 < 0.001) {
		dx = Math.random();
		dy = Math.random();
		d2 = dx * dx + dy * dy;
	}
	
	var d = Math.sqrt(d2);
	if(d < MAX_REPULSIVE_FORCE_DISTANCE) {
		var repulsiveForce = K * K / d;
		this.forcesX[i] -= repulsiveForce  * dx / d;
		this.forcesY[i] -= repulsiveForce  * dy / d;
		this.forcesX[j] += repulsiveForce  * dx / d;
		this.forcesY[j] += repulsiveForce  * dy / d;
	}
}

// calculates repulsive forces based on how close we are to a wall
ForceLayout.prototype.calcRepulsiveWallForce = function(i) {
	var node = this.entitiesToLayout[i];
	
	if(node.getX() < 50) {
		var d = Math.sqrt(node.getX());
		var repulsiveForce = K * K / d;
		this.forcesX[i] -= repulsiveForce  * node.getX() / d;
	}
	else if(SCREEN_WIDTH - node.getX() < 100) {
		var d = Math.sqrt(SCREEN_WIDTH - node.getX());
		var repulsiveForce = K * K / d;
		this.forcesX[i] -= repulsiveForce  * (SCREEN_WIDTH - node.getX()) / d;
	}
	if(node.getY() < 50) {
		var d = Math.sqrt(node.getY());
		var repulsiveForce = K * K / d + 10;
		this.forcesY[i] -= repulsiveForce  * node.getY() / d;
	}
	else if(SCREEN_HEIGHT - node.getY() < 100) {
		var d = Math.sqrt(SCREEN_HEIGHT - node.getY());
		var repulsiveForce = K * K / d;
		this.forcesY[i] -= repulsiveForce  * (SCREEN_HEIGHT - node.getY()) / d;
	}
}

// calculates the attractive force between two connected nodes
ForceLayout.prototype.calcAttractiveForce = function(i, j) {
	var node1 = this.entitiesToLayout[i];
	var node2 = this.entitiesToLayout[j];
	var dx = node2.getX() - node1.getX();
	var dy = node2.getY() - node1.getY();
	
	var d2 = dx * dx + dy * dy;
	if(d2 < 0.001) {
		dx = Math.random();
		dy = Math.random();
		d2 = dx * dx + dy * dy;
	}
	
	var d = Math.sqrt(d2);
	if(d < MAX_REPULSIVE_FORCE_DISTANCE) {
		d = MAX_REPULSIVE_FORCE_DISTANCE;
		d2 = d * d;
	}
	
	var attractiveForce = (d2 - K * K) / K;
	attractiveForce += Math.log(this.srcDestToNumRels[i][j] + 1) * 0.5 + 1;//this.srcDestToNumRels[i][j];
	this.forcesX[i] += attractiveForce * dx / d;
	this.forcesY[i] += attractiveForce * dy / d;
	this.forcesX[j] -= attractiveForce * dx / d;
	this.forcesY[j] -= attractiveForce * dy / d;
}

// performs force layout for each iteration
ForceLayout.prototype.computeOneIteration = function(iterations) {
	for(var i = 0; i < this.entitiesToLayout.length; i++) {
		for(var j = i+1; j < this.entitiesToLayout.length; j++) {
			this.calcRepulsiveForce(i, j);
			if(this.srcDestToNumRels[i][j] > 0) this.calcAttractiveForce(i, j);
		}
		this.calcRepulsiveWallForce(i);
	}
	
	this.positionNodes(iterations);
}

// loop through everyone and position them based on their calculated forces
ForceLayout.prototype.positionNodes = function(iterations) {	
	var maxDist = MIN_VALUE;

	for(var i = 0; i < this.entitiesToLayout.length; i++) {
		var entity = this.entitiesToLayout[i];
		if(!entity.getFixed()) {
			var xmove = C * this.forcesX[i];
			var ymove = C * this.forcesY[i];
			var max = MAX_VERTEX_MOVEMENT;
			xmove = Math.min(max, xmove);
			xmove = Math.max(-max, xmove);
			ymove = Math.min(max, ymove);
			ymove = Math.max(-max, ymove);
			
			// keep entity within the screen
			var x = Math.min(SCREEN_WIDTH - 50, Math.max(50, entity.getX() + xmove));
			var y = Math.min(SCREEN_HEIGHT - 50, Math.max(50, entity.getY() + ymove));
			
			maxDist = Math.max(Geometry_getPtDistance(x, y, entity.getX(), entity.getY()), maxDist);
			
			entity.move(x, y);
			
			if(fixNodes && iterations == LAYOUT_MAX_ITERATIONS) entity.setFixed(true);
		}
		
		this.forcesX[i] = 0;
		this.forcesY[i] = 0;
	}
	
	// stop the layout if nodes aren't moving very much
	if(maxDist <= 3.5) {
		layoutComplete = true;
		if(fixNodes) {
			for(var i = 0; i < this.entitiesToLayout.length; i++) this.entitiesToLayout[i].setFixed(true);
		}
	}
}

///////////// END ForceLayout Class //////////////////////