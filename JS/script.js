var showConsole = false;
var keyStates = {};
var paused = true;
var lastRender = 0;
var Players = [];

var col_BGMain 	= 'hsl(' + (360 * Math.random()) +', 100%, 50%)';
var col_Title 	= col_BGMain;
var col_BGSec 	= "#FFFFFF";
var col_P1 			= "#FFFFFF";
var col_P2 			= "#FFFFFF";
var col_B 			= "#FFFFFF";

function startGame() {
	document.getElementById("gamePlayButton")
		.setAttribute("style", "display: none;");

	P1 = new Player(98, 50, 1, 20, col_P1, 1, 0.5);
	P2 = new Player(2,  50, 1, 20, col_P2, 1, 0.5);
	B =  new Ball	 (50, 50, 2, 4,  col_B , 1);
	p1Score = new UI(52.5, 10, "'Oswald'", 7, "normal", "#FFFFFF", "left",  P1);
	p2Score = new UI(47.5, 10, "'Oswald'", 7, "normal", "#FFFFFF", "right", P2);

	Players.push(P1);
	Players.push(P2);
	window.requestAnimationFrame(loop);
}
function loop(timestamp) {
  var progress = timestamp - lastRender;
	progress /= 16;
	if(!paused) {
		updateGameInfo();
		updateObjects(progress);

		drawGameArea();
		drawUI();
		drawObjects();
	}

  lastRender = timestamp;
  window.requestAnimationFrame(loop);
}
var gameArea = {
	canvas : document.getElementById("gameArea"),
	start : function() {
		this.resize(this.canvas.parentElement);
		this.context = this.canvas.getContext("2d");
		paused = false;
		this.resize(this.canvas.parentElement);
	},
	clear : function() {
		this.context = this.canvas.getContext("2d");
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.fillStyle = col_BGMain;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	},
	screenRatio : function() {
		return [(this.canvas.width  / 100), (this.canvas.height / 100)];
	},
	resize: function(element) {
		if(element.offsetHeight > element.offsetWidth / 2) {
			this.canvas.width = element.offsetWidth;
			this.canvas.height = element.offsetWidth / 2;
		}
		else {
			this.canvas.width = element.offsetHeight * 2;
			this.canvas.height = element.offsetHeight;
		}
	}
};

class UI {
	constructor(x, y, font, fontSize, fontWeight, color, align, comp) {
		this.X = x;
		this.Y = y;
		this.font = font;
		this.fontSize = fontSize;
		this.fontWeight = fontWeight;
		this.color = color;
		this.align = align;
		this.comp = comp;
	}
	draw() {
		var ctx = gameArea.context;
		ctx.font =
			this.fontWeight + " " +
			(this.fontSize * gameArea.screenRatio()[1]) + "px " +
			this.font;
		ctx.fillStyle = this.color;
		ctx.textAlign = this.align;
		ctx.fillText(
			this.comp.data,
			this.X * gameArea.screenRatio()[0],
			this.Y * gameArea.screenRatio()[1]);
	}
}
class Component {
	constructor(x, y, width, height, color) {
		this.X = x;
		this.Y = y;
		this.width = width;
		this.height = height;
		this.speed = 0;
		//this.maxSpeed = 2;
		this.velocityX = 0;
		this.velocityY = 0;
		this.friction = 1;
		this.color = color;
	}

	get top() 		{ return this.Y + this.height / 2; }
	get bottom() 	{ return this.Y - this.height / 2; }
	get left() 		{ return this.X - this.width  / 2; }
	get right() 	{ return this.X + this.width  / 2; }
	get data() {}

	draw() {}
	collisions() {}
	updatePosition(delta) {
		this.X += this.velocityX * delta;
		this.Y += this.velocityY * delta;

		this.velocityX *= this.friction;
		this.velocityY *= this.friction;

		this.velocityX = Math.round(this.velocityX * 1000) / 1000;
		this.velocityY = Math.round(this.velocityY * 1000) / 1000;
		if(Math.abs(this.velocityX) == 0.001) this.velocityX = 0;
		if(Math.abs(this.velocityY) == 0.001) this.velocityY = 0;
	}
	update(delta) {
		this.collisions();
		this.updatePosition(delta);
	}
	moveUp() {
		this.velocityY += this.speed;
	}
	moveDown() {
		this.velocityY -= this.speed;
	}
	moveLeft() {
		this.velocityX -= this.speed;
	}
	moveRight(al) {
		this.velocityX += this.speed;
	}
	resetPosition() {}
	reset() {
		this.resetPosition();
	}
}
class Player extends Component {
	constructor(x, y, width, height, color, speed, friction) {
		super(x, y, width, height, color);
		this.speed = speed;
		this.friction = friction;
		this.score = 0;
	}
	get data() { return this.score; }
	draw() {
		var ctx = gameArea.context;
		ctx.fillStyle = this.color;
		ctx.fillRect(
			(this.X - this.width / 2)		* gameArea.screenRatio()[0],
			(this.Y - this.height / 2)	* gameArea.screenRatio()[1],
			this.width  								* gameArea.screenRatio()[0],
			this.height 								* gameArea.screenRatio()[1]
		);
	}
	update(delta) {
		super.update(delta);
	}
	collisions() {
		var t = this.height / 2;
		var b = 100 - this.height / 2;
		if(this.Y < t) {
			this.Y = t;
			this.velocityY = 0;
		}
		if(this.Y > b) {
			this.Y = b;
			this.velocityY = 0;
		}
	}
	addPoint() {
		this.score++;
	}
	resetPosition() {
		this.Y = 50;
		this.velocityY = 0;
	}
	reset() {
		super.reset();
		this.score = 0;
	}
}
class Ball extends Component {
	constructor(x, y, width, height, color, speed) {
		super(x, y, width, height, color);

		//this.velocityX = speed * (Math.random() < 0.5 ? -1 : 1);
		//this.velocityY = 0;
		this.speed = speed;
		this.rotation = 0;
		//this.velocityX = speed * (Math.random() * 2 - 1);
		//this.velocityY = speed * (Math.random() * 2 - 1);
		this.newDirection();

	}
	draw() {
		var ctx = gameArea.context;
		ctx.save();
		ctx.translate(
			(this.X + this.width / 2)	* gameArea.screenRatio()[0],
			(this.Y + this.height / 2)	* gameArea.screenRatio()[1]
		);
		ctx.rotate(this.rotation * Math.PI / 180);
		this.rotation += 2;

		ctx.fillStyle = this.color;
		ctx.fillRect(
			(-this.width / 2)		* gameArea.screenRatio()[0],
			(-this.height / 2)	* gameArea.screenRatio()[1],
			this.width  								* gameArea.screenRatio()[0],
			this.height 								* gameArea.screenRatio()[1]
		);
		ctx.restore();
	}
	update(delta) {
		super.update(delta);
		console.log(
			Math.atan2(this.velocityY, this.velocityX) / (Math.PI/180) + " " +
			//Math.atan2(this.velocitYX, this.velocityX) + " " +
			//(270 + Math.atan2(this.velocityX, this.velocityY) / (Math.PI/180)) % 360 + " " +
			Math.sqrt(this.velocityX*this.velocityX + this.velocityY*this.velocityY)
		);
	}
	collisions() {
		var t = this.height / 2;
		var b = 100 - this.height / 2;
		var l = this.width / 2;
		var r = 100 - this.width / 2;

		if(this.Y < t) {
			this.velocityY *= -1;
			this.Y = t;
		}
		if(this.Y > b) {
			this.velocityY *= -1;
			this.Y = b;
		}
	}
	resetPosition() {
		this.X = this.Y = 50;
		//this.velocityX = this.speed * (Math.random() * 2 - 1);
		//this.velocityX = this.speed * (Math.random() < 0.5 ? -1 : 1);
		//this.velocityY = this.speed * (Math.random() * 2 - 1);
		//this.velocityY = 0;
		//this.velocityX = -1;
		this.newDirection();
	}
	reset() {
		super.reset();
	}
	newDirection() {
		this.velocityX = this.speed * (Math.random() < 0.5 ? -1 : 1);
		this.velocityY = this.speed * (Math.random() * 2 - 1);
	}
}

function updateGameInfo() {
	var con = document.getElementById("gameInfo");
	if(!showConsole) {
		con.setAttribute("style", "display: none;");
	}
	else {
		con.setAttribute("style", "display: flex;");
		var p1Info = document.getElementById("player1Info");
		p1Info.innerHTML = "\
		<ul> \
			<li><b>Width: </b>" 		+ P1.width + "</li> \
			<li><b>Height: </b>" 		+ P1.height + "</li> \
			<li><b>Velocity: </b>" 	+ P1.velocityY + "</li> \
			<li><b>X: </b>" 				+ P1.X + "</li> \
			<li><b>Y: </b>" 				+ P1.Y + "</li> \
			<li><b>Speed: </b>" 		+ P1.speed + "</li> \
			<li><b>Friction: </b>" 	+ P1.friction + "</li> \
			<li><b>Score: </b>" 	+ P1.score + "</li> \
		</ul> \
		";
		var bInfo = document.getElementById("ballInfo");
		bInfo.innerHTML = "\
		<ul> \
			<li><b>Width: </b>" 		+ B.width + "</li> \
			<li><b>Height: </b>" 		+ B.height + "</li> \
			<li><b>VelocityX: </b>" + B.velocityX + "</li> \
			<li><b>VelocityY: </b>" + B.velocityY + "</li> \
			<li><b>X: </b>" 				+ B.X + "</li> \
			<li><b>Y: </b>" 				+ B.Y + "</li> \
			<li><b>Speed: </b>" 		+ B.speed + "</li> \
			<li><b>Friction: </b>" 	+ B.friction + "</li> \
		</ul> \
		";
		var p2Info = document.getElementById("player2Info");
		p2Info.innerHTML = "\
		<ul> \
			<li><b>Width: </b>" 		+ P2.width + "</li> \
			<li><b>Height: </b>" 		+ P2.height + "</li> \
			<li><b>Velocity: </b>" 	+ P2.velocityY + "</li> \
			<li><b>X: </b>" 				+ P2.X + "</li> \
			<li><b>Y: </b>" 				+ P2.Y + "</li> \
			<li><b>Speed: </b>" 		+ P2.speed + "</li> \
			<li><b>Friction: </b>" 	+ P2.friction + "</li> \
			<li><b>Score: </b>" 		+ P2.score + "</li> \
		</ul> \
		";
	}
}
function gameCollisions() {
	/// Ball & Player
	for(let player of Players) {
		/// Horizontal intersection
		var min = (player.bottom < B.bottom ? player : B);
    var max = (min == player ? B : player);
		if(min.top >= max.bottom) {
			///Vertical intersection
			var min2 = (player.left < B.left ? player : B);
			var max2 = (min2 == player ? B : player);
			if(min2.right >= max2.left) {
				var dif, angle, magn;
				if(player == P1) {
					//B.velocityX *= -1;
					dif = Math.abs(B.Y - player.Y);
					magn = Math.sqrt(B.velocityX * B.velocityX + B.velocityY * B.velocityY);
					angle = (-(dif * 60 / (player.height / 2)) + 180) * Math.sign(B.Y - player.Y);
					B.velocityX = Math.cos(angle * (Math.PI / 180)) * magn;
					B.velocityY = Math.sin(angle * (Math.PI / 180)) * magn;
					B.X = player.left - B.width / 2;
					col_BGMain = col_Title = 'hsl(' + (360 * Math.random()) +', 100%, 50%)';
					break;
				}
				else {
					//B.velocityX *= -1;
					dif = Math.abs(B.Y - player.Y);
					magn = Math.sqrt(B.velocityX * B.velocityX + B.velocityY * B.velocityY);
					angle = (dif * 60 / (player.height / 2)) * Math.sign(B.Y - player.Y);
					B.velocityX = Math.cos(angle * (Math.PI / 180)) * magn;
					B.velocityY = Math.sin(angle * (Math.PI / 180)) * magn;
					B.X = player.right + B.width / 2;
					col_BGMain = col_Title = 'hsl(' + (360 * Math.random()) +', 100%, 50%)';
					break;
				}
			}
		}
	}

	/// Ball & Bounds
	if(B.left < 0) {
		B.resetPosition();
		for(let player of Players) {
			player.resetPosition();
		}
		P1.addPoint();
	}
	if(B.right > 100) {
		B.resetPosition();
		for(let player of Players) {
			player.resetPosition();
		}
		P2.addPoint();
	}
}
function updateObjects(p) {
	gameCollisions();
	P1.update(p);
	P2.update(p);
	B.update(p);

	if (keyStates[38]) { P1.moveDown(); }
	if (keyStates[40]) { P1.moveUp(); }
	if (keyStates[87]) { P2.moveDown(); }
	if (keyStates[83]) { P2.moveUp(); }
}

function drawGameArea() {
	gameArea.clear();
	gameArea.context.beginPath();
	gameArea.context.moveTo(gameArea.canvas.width / 2, 							 			0);
	gameArea.context.lineTo(gameArea.canvas.width / 2, gameArea.canvas.height);
	gameArea.context.strokeStyle = col_BGSec;
	gameArea.context.lineWidth = 2;
	gameArea.context.stroke();
}
function drawUI() {
	p1Score.draw();
	p2Score.draw();
	/*
	document.getElementById("gameTitle")
		.setAttribute("style", "color: " + col_Title + ";");
	*/
}
function drawObjects() {
	P1.draw();
	P2.draw();
	B.draw();
}

window.addEventListener('keydown', function(e) {
		keyStates[e.keyCode || e.which] = true;
		if(e.keyCode == 192) showConsole = !showConsole;
		if(e.keyCode != 116)
			e.preventDefault();
}, true);
window.addEventListener('keyup', function(e) {
    keyStates[e.keyCode || e.which] = false;
		e.preventDefault();
}, true);
window.addEventListener('resize', (event) => {
	if(paused) return;
	/*
	if(window.innerHeight > window.innerWidth / 2) {
		gameArea.canvas.width = window.innerWidth;
		gameArea.canvas.height = window.innerWidth / 2;
	}
	else {
		gameArea.canvas.width = window.innerHeight * 2;
		gameArea.canvas.height = window.innerHeight;
	}*/
	gameArea.resize(gameArea.canvas.parentElement);
});