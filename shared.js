var _ = require('lodash');
var PF = require('pathfinding');

var State = function(status, config) {
	this.status = status;
	this.config = config;
	this.myCoords = this.coords('X');
	this.otherCoords = this.coords('O');
};

State.prototype.dist = function(m1, n1, m2, n2) {
	var m_dst = m1 - m2;
	var n_dst = n1 - n2;
	return Math.sqrt(m_dst*m_dst + n_dst*n_dst);
}

State.prototype.objectCoords = function(obj, closest_m, closest_n) {
	var best_m = -1;
	var best_n = -1;
	for (var m=0; m<this.status.grid.length; m++) {
		var row = this.status.grid[m];
		for(var n=0; n<row.length; n++) {
			var cell = row[n];
			if(cell == obj) {
				if(closest_m == -1) {
					return {
						m: m,
						n: n
					};
				}
				if(best_m == -1 ||
					this.dist(best_m, best_n, closest_m, closest_n) >= this.dist(m, n, closest_m, closest_n)) {
					best_m = m;
					best_n = n;
				}
			}
		}
	}
	return {
		m: best_m, 
		n: best_n
	};
}

State.prototype.getObj = function(m, n) {
	return this.status.grid[m][n];
}

State.prototype.isObstacle = function(m, n) {
	var obj = this.getObj(m, n);
	return obj == 'W';
}

State.prototype.firstObstacle = function(dir, m, n) {
	var m = m || this.myCoords.m;
	var n = n || this.myCoords.n;
	var m_start = m;
	var n_start = n;
	var m_end = m;
	var n_end = n;
	switch(dir) {
	case 'up':
		m_end = 0;
		break;
	case 'down':
		m_end = this.status.grid.length-1;
		break;
	case 'left':
		n_end = 0;
		break;
	case 'right':
		n_end = this.status.grid[0].length-1;
		break;
	}
	// console.log('firstObstacle', m_start, m_end, n_start, n_end);
	for(var cm=m_start; (m_start < m_end) ? cm <= m_end : cm >= m_end; (m_start < m_end) ? cm++ : cm-- ) {
		for(var cn=n_start; (n_start < n_end) ? cn <= n_end : cn >= n_end; (n_start < n_end) ? cn++ : cn-- ) {
			if (this.isObstacle(cm, cn)) {
				// console.log('obstacle', this.getObj(cm, cn), cm, cn);
				return {
					obj: this.getObj(cm, cn),
					m: cm,
					n: cn
				};
			}
		}
	}
	return null;
}

State.prototype.coords = function(obj) {
	return this.objectCoords(obj, -1, -1);
}

State.prototype.closestCoords = function(obj) {
	return this.objectCoords(obj, this.myCoords.m, this.myCoords.n);
}

State.prototype.faceUp = function() {
	var commands = [];
	switch (this.status.orientation) {
	case "south":
		commands.push("left")
		commands.push("left")
		break;
	case "east":
		commands.push("left")
		break;
	case "west":
		commands.push("right")
		break;
	case "north":
	default:
		// commands.push('noop')
		break;
	}
	return commands;
}
State.prototype.faceDown = function() {
	var commands = [];
	switch (this.status.orientation) {
	case "north":
		commands.push("right")
		commands.push("right")
		break;
	case "east":
		commands.push("right")
		break;
	case "west":
		commands.push("left")
		break;
	case "south":
	default:
		// commands.push('noop')
		break;
	}
	return commands;
}
State.prototype.faceLeft = function() {
	var commands = [];
	switch (this.status.orientation) {
	case "north":
		commands.push("left")
		break;
	case "east":
		commands.push("right")
		commands.push("right")
		break;
	case "south":
		commands.push("right")
		break;
	case "west":
	default:
		// commands.push('noop')
		break;
	}
	return commands;
}
State.prototype.faceRight = function() {
	var commands = [];
	switch (this.status.orientation) {
	case "north":
		commands.push("right")
		break;
	case "south":
		commands.push("left")
		break;
	case "west":
		commands.push("left")
		commands.push("left")
		break;
	case "east":
	default:
		// commands.push('noop')
		break;
	}
	return commands;
}

State.prototype.moveTowards = function(m, n, obstacles, excludeFinal) {
	var my_m = this.myCoords.m;
	var my_n = this.myCoords.n;
	var commands = [];
	var finder = new PF.AStarFinder();
	var t = this;
	obstacles = obstacles || 'LW';
	obstacles = obstacles.split('');
	var grid = _.map(this.status.grid, function(row) {
		return _.map(row, function(cell) {
			if(~_.indexOf(obstacles, cell)) {
				return 1;
			}
			else {
				return 0;
			}
		});
	});

	grid = new PF.Grid(grid);
	var path = finder.findPath(my_n, my_m, n, m, grid);
	// console.log('path', path);

	var nextSpot = path[1];
	if(nextSpot && (!excludeFinal || nextSpot[1] != m || nextSpot[0] != n)) {
		// console.log('nextSpot', nextSpot, my_n, my_m, n, m);
		if(nextSpot[1] < my_m) {
			// console.log('move up');
			commands.push(t.faceUp());
			commands.push('move');
		}
		else if(nextSpot[1] > my_m) {
			// console.log('move down');
			commands.push(t.faceDown());
			commands.push('move');
		}
		else if(nextSpot[0] < my_n) {
			// console.log('move left');
			commands.push(t.faceLeft());
			commands.push('move');
		}
		else if(nextSpot[0] > my_n) {
			// console.log('move right');
			commands.push(t.faceRight());
			commands.push('move');
		}
	}

	commands = _.flatten(commands);
	return commands;
}



exports.State = State;

