var _ = require('lodash');

exports.dist = function(m1, n1, m2, n2) {
	var m_dst = m1 - m2;
	var n_dst = n1 - n2;
	return Math.sqrt(m_dst*m_dst + n_dst*n_dst);
}

exports.parseGrid = function(grid) {
	var rows = grid.split('\n');
	for(var r=0; r<rows.length; r++) {
		rows[r] = rows[r].split('');
	}
	return rows;
}

exports.objectCoords = function(grid, obj, closest_m, closest_n) {
	var best_m = -1;
	var best_n = -1;
	for (var m=0; m<grid.length; m++) {
		var row = grid[m]
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
					exports.dist(best_m, best_n, closest_m, closest_n) >= exports.dist(m, n, closest_m, closest_n)) {
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

exports.coords = function(grid, obj) {
	return exports.objectCoords(grid, obj, -1, -1);
}

exports.faceUp = function(orientation) {
	var commands = [];
	switch (orientation) {
	case "south":
		commands.push("left")
		commands.push("left")
		break;
	case "east":
		commands.push("left")
		break;
	case "north":
	case "west":
		commands.push("right")
		break;
	default:
		commands.push('noop')
		break;
	}
	return commands;
}
exports.faceDown = function(orientation) {
	var commands = [];
	switch (orientation) {
	case "north":
		commands.push("right")
		commands.push("right")
		break;
	case "east":
		commands.push("right")
		break;
	case "south":
	case "west":
		commands.push("left")
		break;
	default:
		commands.push('noop')
		break;
	}
	return commands;
}
exports.faceLeft = function(orientation) {
	var commands = [];
	switch (orientation) {
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
		commands.push('noop')
		break;
	}
	return commands;
}
exports.faceRight = function(orientation) {
	var commands = [];
	switch (orientation) {
	case "north":
		commands.push("right")
	case "south":
		commands.push("left")
	case "west":
		commands.push("left")
		commands.push("left")
	case "east":
	default:
		commands.push('noop')
	}
	return commands;
}

exports.moveTowards = function(m, n, my_m, my_n, orientation) {
	var commands = [];
	var options = [
		function() {
			if (m < my_m) {
				commands.push(exports.faceUp(orientation));
				commands.push('move');
				return true
			}
			return false
		},
		function() {
			if (m > my_m) {
				commands.push(exports.faceDown(orientation));
				commands.push('move');
				return true
			}
			return false
		},
		function() {
			if (n < my_n) {
				commands.push(exports.faceLeft(orientation));
				commands.push('move');
				return true
			}
			return false
		},
		function() {
			if (n > my_n) {
				commands.push(exports.faceRight(orientation));
				commands.push('move');
				return true
			}
			return false
		},
	];

	options = _.shuffle(options);
	for (var i=0; i<options.length; i++){
		if(options[i]()) {
			break;
		}
	}

	commands = _.flatten(commands);
	return commands;
}

