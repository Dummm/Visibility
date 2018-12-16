var lastRender = 0;
var components = [];

var col_BGMain 	= "#FAFAFA";
var col_Grid 		= "#EFEFEF";

class Point {
	constructor(X, Y, size, color) {
		this.X = X;
		this.Y = Y;
		this.size = size;
		this.color = color;
	}
	draw() {
		var ctx = appView.context;
		ctx.fillStyle = this.color;
		ctx.fillRect(
			(this.X - this.size / 2) * appView.screenRatio()[0],
			(100 - this.Y - this.size / 2) * appView.screenRatio()[1],
			this.size * appView.screenRatio()[0],
			this.size * appView.screenRatio()[1]
		);
	}
}
class Polygon {
	constructor(points = [], lineWidth = 2, color = "#FF0000", fill = false) {
		this.points = points;
		this.lineWidth = lineWidth;
		this.color = color;
		this.fill = fill;
	}
	addPoint(p) {
		this.points.push(p);
		console.log("Added point " + p.X + ", " + p.Y + " to polygon");
	}
	removePoint(p) {
		console.log("Removed point " + p.X + ", " + p.Y + " to polygon");
		this.points.splice(
			this.points.indexOf(p), 1
		);
	}
	draw() {
		if(!this.points[0]) return;
		var ctx = appView.context;
		ctx.beginPath();
		ctx.strokeStyle = this.color;
		ctx.lineWidth = this.lineWidth;

		if(this.fill) ctx.fillStyle = this.color;
		else		 ctx.fillStyle = "#00000000";
		ctx.moveTo(
			appView.screenRatio()[0] * this.points[0].X,
			appView.screenRatio()[1] * (100 - this.points[0].Y)
		);
		for(let i = 0; i < this.points.length; i++) {
			ctx.lineTo(
				appView.screenRatio()[0] * this.points[i].X,
				appView.screenRatio()[1] * (100 - this.points[i].Y)
			);
		}
		//ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
}

var appView = {
	canvas: document.getElementById("app"),
	start: function() {
		this.resize();
		this.context = this.canvas.getContext("2d");
		paused = false;
		this.resize(this.canvas.parentElement);
	},
	clear: function() {
		this.context = this.canvas.getContext("2d");
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.fillStyle = col_BGMain;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	},
	screenRatio: function() {
		return [(this.canvas.width  / 100), (this.canvas.height / 100)];
	},
	resize: function() {
		var element = this.canvas.parentElement;
		if(element.offsetHeight > element.offsetWidth) {
			this.canvas.width  = element.offsetWidth;
			this.canvas.height = element.offsetWidth;
		}
		else {
			this.canvas.width  = element.offsetHeight;
			this.canvas.height = element.offsetHeight;
		}
	}
};
var appControls = {
	polygonControls: 	document.querySelector("#polygonControls .appInfo"),
	pointsControls:		document.querySelector("#pointsControls .appInfo"),
	addPointToPolygon:
		function(p) {
			P.addPoint(p);
			var par = document.createElement("p");
			/*
			par.appendChild(
				document.createTextNode(
					"(" + p.X + ",&emsp;" + p.Y + ")"
				)
			);
			*/
			par.innerHTML = "(" + p.X + ",&emsp;" + p.Y + ")";
			par.addEventListener("click", function(e) {
				(e.srcElement || e.target).parentElement.removeChild(e.srcElement || e.target);
				P.removePoint(p);
			});
			this.polygonControls.appendChild(par);
		},
    addPointToPolygonWithMouse:
		function(p) {
			P.addPoint(p);
			var par = document.createElement("p");
			/*
			par.appendChild(
				document.createTextNode(
					"(" + p.X + ",&emsp;" + p.Y + ")"
				)
			);
			*/
			par.innerHTML = "(" + p.X + ",&emsp;" + (100 - p.Y) + ")";
			par.addEventListener("click", function(e) {
				(e.srcElement || e.target).parentElement.removeChild(e.srcElement || e.target);
				P.removePoint(p);
			});
			this.polygonControls.appendChild(par);
		}
};
var cursor = {
	position: new Point(0, 0),
	updatePosition: function(e) {
		var p = new Point();
		var c = appView.canvas;
		p.X = ((e.clientX  - c.offsetLeft)  /  appView.screenRatio()[0]);
		p.Y = ((e.clientY  - c.offsetTop)   /  appView.screenRatio()[1]);

		p.X = Math.round(p.X / 5) * 5;
		p.Y = Math.round(p.Y / 5) * 5;
		p.Y = 100 - p.Y;

		this.position = p;
		//console.log(this.position);
	},
	draw: function() {
		var size = 10;
		var ctx = appView.context;
		ctx.fillStyle = "#FF0000";
		ctx.fillRect(
			appView.screenRatio()[0] * this.position.X - (size / 2),
			appView.screenRatio()[1] * (100 - this.position.Y) - (size / 2),
			size,
			size
		);
	}
};
class Camera extends Point {
  constructor(X, Y, size, color, speed = 1) {
		super(X, Y, size, color);
		this.speed = speed;
	}

	setPosition(x, y) {
		if(x > 100) 			this.X = 100;
		else if(x < 0) 		this.X = 0;
		else 							this.X = x;

		if(y > 100) 			this.Y = 100;
		else if(y <   0) 	this.Y = 0;
		else 							this.Y = y;
	}

	moveUp() {
		this.Y = Math.min(this.Y + this.speed, 100);
	};
	moveDown() {
		this.Y = Math.max(this.Y - this.speed, 0);
	};
	moveLeft() {
		this.X = Math.max(this.X - this.speed, 0);
	};
	moveRight() {
		this.X = Math.min(this.X + this.speed, 100);
	};
}

function start() {
	P  = new Polygon([], 1.5, "#2D2D2D", false);
	P2 = new Polygon([], 1.5, "#0000FF", false);
	C = new Camera(50, 50, 2, "#FF00FF", 5);
	appView.start();
	window.requestAnimationFrame(loop);
}
function loop(timestamp) {
  var progress = timestamp - lastRender;
	progress /= 16;

	if(!paused) {
		/*
		updateGameInfo();
		updateObjects(progress);

		drawGameArea();
		drawUI();
		drawObjects();
		*/
	}
	drawApp();
	P.draw();
	P2.draw();
	cursor.draw();
	C.draw();

  lastRender = timestamp;
  window.requestAnimationFrame(loop);
}
function drawApp() {
	appView.clear();
	var ctx = appView.context;
	for(let i = 1; i <= 9; i++) {
		ctx.beginPath();
		ctx.moveTo(appView.screenRatio()[0] * 10 * i, 0);
		ctx.lineTo(appView.screenRatio()[0] * 10 * i, appView.screenRatio()[0] * 100);
		ctx.strokeStyle = col_Grid;
		ctx.lineWidth = 2;
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(0, 															appView.screenRatio()[1]  * 10 * i);
		ctx.lineTo(appView.screenRatio()[0] * 100, 	appView.screenRatio()[1]  * 10 * i);
		ctx.strokeStyle = col_Grid;
		ctx.lineWidth = 2;
		ctx.stroke();
	}

	//new Point(50, 50, 1, "#FF0000").draw();
}
window.onload = function() {
	window.addEventListener(
		"keydown", function(e) {
			switch(e.keyCode) {
				case 37: C.moveLeft(); 	break;
				case 38: C.moveUp();		break;
				case 39: C.moveRight();	break;
				case 40: C.moveDown();	break;
				case 13: {
					P2.points = intersectieApropiata(P, C);
					P.fill = true;
					P2.fill = true;
				}
				default: break;
			}
	});
	document.querySelector("#addPolygonPoint").addEventListener(
		"click", function() {
			var x = document.querySelector("#xPolygonPoint").value;
			var y = document.querySelector("#yPolygonPoint").value;
			appControls.addPointToPolygon(new Point(x, y));
		}
	);
	document.querySelector("#addPoint").addEventListener(
		"click", function() {
			C.setPosition(
				parseInt(document.querySelector("#xPoint").value),
				parseInt(document.querySelector("#yPoint").value)
			);
		}
	);
	document.querySelector("#xPoint").addEventListener(
		"change", function() {
			C.setPosition(
				parseInt(document.querySelector("#xPoint").value),
				parseInt(document.querySelector("#yPoint").value)
			);
		}
	);
	document.querySelector("#yPoint").addEventListener(
		"change", function() {
			C.setPosition(
				parseInt(document.querySelector("#xPoint").value),
				parseInt(document.querySelector("#yPoint").value)
			);
		}
	);
	document.querySelector("#result").addEventListener(
		"click", function() {
			P2.points = intersectieApropiata(P, C);
			P.fill = true;
			P2.fill = true;
		}
	);
	document.querySelector("#appContainer")
		.addEventListener("click", function() {
			appControls.addPointToPolygon(new Point(
				cursor.position.X,
				cursor.position.Y
				));
			/*
			var c = appView.canvas;
			appControls.addPointToPolygon(new Point(
				((e.clientX  - c.offsetLeft)  /  appView.screenRatio()[0]),
				((e.clientY  - c.offsetTop)   /  appView.screenRatio()[1])
				));
			*/
		}
	);
	document.querySelector("#appContainer")
		.addEventListener("mousemove", function(e) {
			cursor.updatePosition(e);
		}
	);
	document.querySelector("#appControls")
		.addEventListener("click", function(e) {
			(e.srcElement || e.target).classList.toggle("closed");
		}
	);

	start();
	appView.clear();
};
window.addEventListener('resize', () => {
	appView.resize();
});

function prod_vect(a, b) {
	var n = 0, lim = Math.min(a.length, b.length);
	for (var i = 0; i < lim; i++)
		n += a[i] * b[i];
	return n;
}
function norma(a) {
	var patrate = 0;
	for (var i = 0; i < a.length; i++)
		patrate += a[i] * a[i];
	return Math.sqrt(patrate);
}
function cosinus(a, b) {
	return prod_vect(a, b) / (norma(a) * norma(b));
}
// Gaseste intersectia dintre o raza si un segment
function getIntersection(ray,segment){
	// RAY in parametric: Point + Delta*U
	// s = (raza_x2 - raza_x1, raza_y2 - raza_y1)
	// r = (segm_x2 - segm_x1, segm_y2 - segm_y1)
	// (raza_x1, raza_y1) = (raza_x2, raza_y2) + U*s
	// (segm_x1, segm_y1) = (segm_x2, segm_y2) + V*r
	var raza_x1 = ray.a.X,                 raza_y1 = ray.a.Y;
	var raza_x2 = ray.b.X-ray.a.X,         raza_y2 = ray.b.Y-ray.a.Y;
	var segm_x1 = segment.a.X,             segm_y1 = segment.a.Y;
	var segm_x2 = segment.b.X-segment.a.X, segm_y2 = segment.b.Y-segment.a.Y;

	// Pentru a gasi punctul de intersectie rezolvam sistemul:
	// (raza_x1, raza_y1) + U*s = (segm_x1, segm_y1) + V*r
	//  ====
	// Folosind produsul vectorial cu s avem:
	// (raza_x1, raza_y1) x s + U * (s x s) = (segm_x1, segm_y1) x s + V * (r x s)
	//                                  ^ = 0
	// V = ( (raza_x1, raza_y1) x s - (segm_x1, segm_y1) x s ) / (r x s)
	// V = ( ((raza_x1, raza_y1) - (segm_x1, segm_y1)) x s ) / (r x s)
	// V = ((raza_x1 - segm_x1, raza_y1 - segm_y1) x s) / (r x s)

	// Folosind produsul vectorial cu r avem:
	// (raza_x1, raza_y1) x r + U * (s x r) = (segm_x1, segm_y1) x r + V * (r x r)
	//                                                                          ^ = 0
	// U = ( (segm_x1, segm_y1) x r - (raza_x1, raza_y1) x r) / (s x r)
	// U = ( ((segm_x1, segm_y1) - (raza_x1, raza_y1)) x r ) / (s x r)
	// U = ((segm_x1 - raza_x1, segm_y1 - raza_y1) x r) / (s x r)
	//
	// stim ca (s x r) = - (r x s)
	// (s x r) = (raza_x2 - raza_x1)*(segm_y2 - segm_y1) - (raza_y2 - raza_y1)*(segm_x2 - segm_x1)
	// (segm_x1 - raza_x1, segm_y1 - raza_y1) x s) = (segm_x1 - raza_x1)*(raza_y2 - raza_y1) - (segm_y1 - raza_y1)*(raza_x2 - raza_x1)
	// (raza_x1 - segm_x1, raza_y1 - segm_y1) x r) = (raza_x1 - segm_x1)*(segm_y2 - segm_y1) - (raza_y1 - segm_y1)*(segm_x2 - segm_x1)
	//
	//        var U = ((segm_x1 - raza_x1)*(raza_y2 - raza_y1) - (segm_y1 - raza_y1)*(raza_x2 - raza_x1))/
	//            ((raza_x2 - raza_x1)*(segm_y2 - segm_y1) - (raza_y2 - raza_y1)*(segm_x2 - segm_x1));
	//        var V = -((raza_x1 - segm_x1)*(segm_y2 - segm_y1) - (raza_y1 - segm_y1)*(segm_x2 - segm_x1))/
	//            ((raza_x2 - raza_x1)*(segm_y2 - segm_y1) - (raza_y2 - raza_y1)*(segm_x2 - segm_x1))

	// Raza si segmentul se intersecteaza => sistemul:
	// raza_x1 + raza_x2 * U = segm_x1 + segm_x2 * V => U = (segm_x1 + segm_x2 * V - raza_x1) / raza_x2
	// raza_y1 + raza_y2 * U = segm_y1 + segm_y2 * V => U = (segm_y1 + segm_y2 * V - raza_y1) / raza_y2
	// Avem deci (segm_x1 + segm_x2 * V - raza_x1) / raza_x1 = (segm_y1 + segm_y2 * V - raza_y1) / raza_y1 <==>
	//      <==> (segm_x1 * raza_y2 - raza_x1*raza_y2 + segm_x2 * raza_y2 * V) = (segm_y1 * raza_x2 - raza_x2*raza_y1 + segm_y2 * raza_x2 * V) <==>
	//      <==> V = (segm_x1*raza_y2 - raza_x1*raza_y2 - segm_y1*raza_x2 + raza_x2*raza_y1) / (segm_y2 * raza_x2 - segm_x2 * raza_y2)

	var V = (segm_x1*raza_y2 - raza_x1*raza_y2 - segm_y1*raza_x2 + raza_x2*raza_y1) / (segm_y2 * raza_x2 - segm_x2 * raza_y2);//(raza_x2*(segm_y1-raza_y1) + raza_y2*(raza_x1-segm_x1))/(segm_x2*raza_y2 - segm_y2*raza_x2)
	var U = (segm_x1+segm_x2*V-raza_x1)/raza_x2;
	// Testam daca cei 2 vectori sunt paraleli (adica cosinusul unghiului dintre ei este 1)
	if (cosinus({raza_x2,raza_y2}, {segm_x2,segm_y2}) == 1) {
			return null;
	}
	if(U<0) return null;
	if(V<0 || V>1) return null;
	return {
		X: raza_x1+raza_x2*U,
		Y: raza_y1+raza_y2*U,
		param: U
	};
}
function intersectieApropiata(Poly, camera) {
	// q = (x1, y1)
	// q + s = (x2, y2)
	// s = (x2 - x1, y2 - y1)
	puncte = Poly.points;
	var segmente = [];
	for(var i = 0; i < puncte.length-1; i++) {
			segmente.push({
					a:{X:puncte[i].X, Y:puncte[i].Y},
					b:{X:puncte[i+1].X, Y:puncte[i+1].Y}
			});
	}
	segmente.push({
			a:{X:puncte[puncte.length-1].X, Y:puncte[puncte.length-1].Y},
			b:{X:puncte[0].X, Y:puncte[0].Y}
	});

	var puncte = (function(segmente) {
		var a = [];
		segmente.forEach(
			function(seg) {
				a.push(seg.a,seg.b);
			}
		);
		return a;
	}) (segmente);

	var uniquePoints = (function(puncte) {
		var set = {};
		return puncte.filter(function(p) {
			var key = p.X + ", " + p.Y;
			if(key in set) {
					return false;
			}
			else {
					set[key] = true;
					return true;
			}
		});
	})(puncte);

	var uniqueAngles = [];
	for(var j = 0; j < uniquePoints.length; j++) {
		var uniquePoint = uniquePoints[j];
		var theta = Math.atan2(uniquePoint.Y - camera.Y, uniquePoint.X - camera.X );
		uniquePoint.unghi = theta;
		uniqueAngles.push(theta - 0.00001);
		uniqueAngles.push(theta);
		uniqueAngles.push(theta + 0.00001);
	}

	var intersectii = [];
	for(var j = 0; j < uniqueAngles.length; j++) {
		var unghi = uniqueAngles[j];

		// Calculam sin si cos pentru a gasi un punct pe aceeasi dreapta
		var x_cos = Math.cos(unghi);
		var y_cos = Math.sin(unghi);
		var raza = {
			a: {
				X: camera.X,
				Y: camera.Y
			},
			b: {
				X: camera.X + x_cos,
				Y: camera.Y + y_cos
			},
			ang: unghi
		};

		var intersectMin = null;
		for(var i = 0; i < segmente.length; i++) {
			var intersect = getIntersection(raza, segmente[i]);
			if(!intersect) continue;
			if(!intersectMin || intersect.param < intersectMin.param) {
				intersectMin = intersect;
				intersectMin.unghi = raza.ang;
			}
		}

		intersectii.push(intersectMin);
	}

	// Sortam dupa unghiul polar:
	intersectii.sort((a, b) => {return a.unghi - b.unghi;});

	// Adaugam un segment de la primul punct la ultimul
	intersectii.push(intersectii[0]);

	return intersectii;
}

