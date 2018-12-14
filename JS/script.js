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
			(this.Y - this.size / 2) * appView.screenRatio()[1],
			this.size * appView.screenRatio()[0],
			this.size * appView.screenRatio()[1]
		);
	}
}

///-------------------------------------------

///------------------------------------
// Find intersection of RAY & SEGMENT
function getIntersection(ray,segment){
	// RAY in parametric: Point + Delta*T1
	var r_px = ray.a.X;
	var r_py = ray.a.Y;
	var r_dx = ray.b.X-ray.a.X;
	var r_dy = ray.b.Y-ray.a.Y;
	// SEGMENT in parametric: Point + Delta*T2
	var s_px = segment.a.X;
	var s_py = segment.a.Y;
	var s_dx = segment.b.X-segment.a.X;
	var s_dy = segment.b.Y-segment.a.Y;
	// Are they parallel? If so, no intersect
	var r_mag = Math.sqrt(r_dx*r_dx+r_dy*r_dy);
	var s_mag = Math.sqrt(s_dx*s_dx+s_dy*s_dy);
	if(r_dx/r_mag==s_dx/s_mag && r_dy/r_mag==s_dy/s_mag){
		// Unit vectors are the same.
		return null;
	}
	// SOLVE FOR T1 & T2
	// r_px+r_dx*T1 = s_px+s_dx*T2 && r_py+r_dy*T1 = s_py+s_dy*T2
	// ==> T1 = (s_px+s_dx*T2-r_px)/r_dx = (s_py+s_dy*T2-r_py)/r_dy
	// ==> s_px*r_dy + s_dx*T2*r_dy - r_px*r_dy = s_py*r_dx + s_dy*T2*r_dx - r_py*r_dx
	// ==> T2 = (r_dx*(s_py-r_py) + r_dy*(r_px-s_px))/(s_dx*r_dy - s_dy*r_dx)
	var T2 = (r_dx*(s_py-r_py) + r_dy*(r_px-s_px))/(s_dx*r_dy - s_dy*r_dx);
	var T1 = (s_px+s_dx*T2-r_px)/r_dx;
	// Must be within parametic whatevers for RAY/SEGMENT
	if(T1<0) return null;
	if(T2<0 || T2>1) return null;
	// Return the POINT OF INTERSECTION
	return {
		X: r_px+r_dx*T1,
		Y: r_py+r_dy*T1,
		param: T1
	};
}
class Polygon {
	constructor(points = [], color = "#FF0000") {
		this.points = points;
		this.color = color;
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
		ctx.moveTo(
			appView.screenRatio()[0] * this.points[0].X,
			appView.screenRatio()[1] * (100 - this.points[0].Y)
		);
		for(let i = 0; i < this.points.length; i++) {
			ctx.lineWidth = 10;
			ctx.lineTo(
				appView.screenRatio()[0] * this.points[i].X,
				appView.screenRatio()[1] * (100 - this.points[i].Y)
			);
			ctx.lineWidth = 2;
			ctx.lineTo(
				appView.screenRatio()[0] * this.points[i].X,
				appView.screenRatio()[1] * (100 - this.points[i].Y)
			);
		}
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

function start() {
	P = new Polygon([], "#FF0000");
    P2 = new Polygon([], "#0000FF");
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
	document.querySelector("#addPolygonPoint").addEventListener(
		"click", function() {
			var x = document.querySelector("#xPolygonPoint").value;
			var y = document.querySelector("#yPolygonPoint").value;
			appControls.addPointToPolygon(new Point(x, 100 - y));
		}
	);
	document.querySelector("#result").addEventListener(
		"click", function() {
            P2.points = findClosestIntersection(P, new Point(50, 50));
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

///--------------------------------------------------


function findClosestIntersection(Poly, camera) {
    // q = (x1, y1)
    // q + s = (x2, y2)
    // s = (x2 - x1, y2 - y1)
    points = Poly.points;
    var segments = [];
    for(var i = 0; i < points.length-1; i++) {
        segments.push({a:{X:points[i].X, Y:points[i].Y}, b:{X:points[i+1].X, Y:points[i+1].Y}});
    }
    segments.push({a:{X:points[points.length-1].X, Y:points[points.length-1].Y}, b:{X:points[0].X, Y:points[0].Y}});    
    var points = (function(segments){
		var a = [];
		segments.forEach(function(seg){
			a.push(seg.a,seg.b);
		});
		return a;
	})(segments);
    //console.log(segments);
    var uniquePoints = (function(points){
    var set = {};
    return points.filter(function(p){
        var key = p.X+","+p.Y;
        if(key in set){
            return false;
        }else{
            set[key]=true;
            return true;
        }
    });
    })(points);
    
    var uniqueAngles = [];
	for(var j=0;j<uniquePoints.length;j++){
		var uniquePoint = uniquePoints[j];
		var angle = Math.atan2(uniquePoint.Y-camera.Y,uniquePoint.X-camera.X);
		uniquePoint.angle = angle;
		uniqueAngles.push(angle- 0.00001, angle, angle + 0.00001);
	}
    //console.log(uniqueAngles);
    
    var intersects = [];
	for(var j=0;j<uniqueAngles.length;j++){
		var angle = uniqueAngles[j];
		// Calculez sin si cos pentru un punct pe aceeasi dreapta de unghi angle
		var dx = Math.cos(angle);
		var dy = Math.sin(angle);
		// Gasesc un punct mai incolo pe dreapta
		var ray = {
			a:{X:camera.X,Y:camera.Y},
			b:{X:camera.X+dx,Y:camera.Y+dy},
            ang: angle
		};
		// Find CLOSEST intersection
		var closestIntersect = null;
		for(var i=0;i<segments.length;i++){
			var intersect = getIntersection(ray,segments[i]);
			if(!intersect) continue;
			if(!closestIntersect || intersect.param<closestIntersect.param){
				closestIntersect=intersect;
                closestIntersect.angle = ray.ang;
			}
		}
        //console.log(ray);
		// Add to list of intersects
		intersects.push(closestIntersect);
	}
    //console.log(uniqueAngles);
    intersects.sort((a,b)=>{return a.angle - b.angle});
    intersects.push(intersects[0]);
    console.log(intersects);
    return intersects;
}

