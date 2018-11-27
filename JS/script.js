var lastRender = 0;
var components = [];

var col_BGMain 	= "#FAFAFA";
var col_Grid 		= "#EFEFEF";

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
		}
};

function start() {
	P = new Polygon([], "#FF0000");
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
		drawApp();
		P.draw();
	}

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
			appView.screenRatio()[1] * this.points[0].Y
		);
		for(let i = 0; i < this.points.length; i++) {
			ctx.lineWidth = 10;
			ctx.lineTo(
				appView.screenRatio()[0] * this.points[i].X,
				appView.screenRatio()[1] * this.points[i].Y
			);
			ctx.lineWidth = 2;
			ctx.lineTo(
				appView.screenRatio()[0] * this.points[i].X,
				appView.screenRatio()[1] * this.points[i].Y
			);
		}
		ctx.stroke();
	}
}

window.onload = function() {
	document.querySelector("#addPolygonPoint").addEventListener(
		"click", function() {
			var x = document.querySelector("#xPolygonPoint").value;
			var y = document.querySelector("#yPolygonPoint").value;
			appControls.addPointToPolygon(new Point(x, 100 - y));
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