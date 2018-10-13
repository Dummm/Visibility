var Players = [];
var myScore;

function startGame() {
	myScore = new component("30px", "Consolas", "black", 280, 40, "text");

	P1 = new Player(2,  50, 1, 20, "#FF0000", .2, .65);
	P2 = new Player(98, 50, 1, 20, "#FF0000", .2, .65);
	B =  new Ball	 (50, 50, 2, 4,  "#000000",  .5);

	Players.push(P1);
	Players.push(P2);
}

var gameArea = {
	//canvas : document.createElement("canvas"),
	canvas : document.getElementById("gameArea"),
	start : function() {
		if(window.innerHeight > window.innerWidth / 2) {
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerWidth / 2;
		}
		else {
			this.canvas.width = window.innerHeight * 2;
			this.canvas.height = window.innerHeight;
		}
		this.context = this.canvas.getContext("2d");

		//document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		window.clearInterval(this.interval);
		this.interval = setInterval(updateGameArea, 2);
	},
	clear : function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	screenRatio : function() {
		return [(this.canvas.width  / 100), (this.canvas.height / 100)];
	}
}

function component(width, height, color, x, y, type) {
	this.type = type;
	this.score = 0;
	this.width = width;
	this.height = height;

	this.speed = .2;
	//this.maxSpeed = 2
	this.velocityX = 0;
	this.velocityY = 0;
	this.friction = 0.65;

	this.X = x;
	this.Y = y;

	this.update = function() {
		ctx = gameArea.context;
		if (this.type == "text") {
			ctx.font = this.width + " " + this.height;
			ctx.fillStyle = color;
			ctx.fillText(
				this.text,
				this.X * gameArea.screenRatio()[0],
				this.Y * gameArea.screenRatio()[1]);
		} else {
			ctx.fillStyle = color;
			//ctx.fillRect(this.X, this.Y, this.width, this.height);
			ctx.fillRect(
				(this.X - this.width / 2)		* gameArea.screenRatio()[0],
				(this.Y - this.height / 2)	* gameArea.screenRatio()[1],
				this.width  								* gameArea.screenRatio()[0],
				this.height 								* gameArea.screenRatio()[1]
			);
		}

		this.velocityX = Math.round(this.velocityX * 1000) / 1000;
		this.velocityY = Math.round(this.velocityY * 1000) / 1000;
		if(Math.abs(this.velocityX) == 0.001) this.velocityX = 0;
		if(Math.abs(this.velocityY) == 0.001) this.velocityY = 0;
	}
	this.moveUp = function(val) {
		this.velocityY += this.speed;
	}
	this.moveDown = function(val) {
		this.velocityY -= this.speed;
	}
	this.moveLeft = function(val) {
		this.velocityX -= this.speed;
	}
	this.moveRight = function(val) {
		this.velocityX += this.speed;
	}
	this.newPos = function() {
		this.X += this.velocityX;
		this.Y += this.velocityY;

		this.velocityY *= this.friction;
		this.velocityX *= this.friction;

		if(this.type != "ball") {
			this.hitBottom();
			this.hitTop();
		}
		else {

		}
	}
	this.ricochet = function() {

	}
	this.hitBottom = function() {
		var b = 100 - this.height / 2;
		if (this.Y > b) {
			this.Y = b;
			this.velocityY = 0;
		}
	}
	this.hitTop = function() {
		var t = this.height / 2;
		if (this.Y < t) {
			this.Y = t;
			this.velocityY = 0;
		}
	}
	this.crashWith = function(otherobj) {
		var myleft = this.X;
		var myright = this.X + (this.width);
		var mytop = this.Y;
		var mybottom = this.Y + (this.height);
		var otherleft = otherobj.X;
		var otherright = otherobj.X + (otherobj.width);
		var othertop = otherobj.Y;
		var otherbottom = otherobj.Y + (otherobj.height);
		var crash = true;
		if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
			crash = false;
		}
		return crash;
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
	}

	get top() 		{ return this.Y + this.height / 2;}
	get bottom() 	{ return this.Y - this.height / 2;}
	get left() 		{ return this.X - this.width / 2;}
	get right() 	{ return this.X + this.width / 2;}

	draw() {}
	collisions() {}
	updatePosition() {
		this.X += this.velocityX;
		this.Y += this.velocityY;

		this.velocityX *= this.friction;
		this.velocityY *= this.friction;

		this.velocityX = Math.round(this.velocityX * 1000) / 1000;
		this.velocityY = Math.round(this.velocityY * 1000) / 1000;
		if(Math.abs(this.velocityX) == 0.001) this.velocityX = 0;
		if(Math.abs(this.velocityY) == 0.001) this.velocityY = 0;

		this.collisions();
	}
	update() {}
	moveUp(val) {
		this.velocityY += this.speed;
	}
	moveDown(val) {
		this.velocityY -= this.speed;
	}
	moveLeft(val) {
		this.velocityX -= this.speed;
	}
	moveRight(val) {
		this.velocityX += this.speed;
	}
}

class Player extends Component {
	constructor(x, y, width, height, color, speed, friction) {
		super(x, y, width, height, color);
		this.speed = speed;
		this.friction = friction;
	}
	draw() {
		ctx = gameArea.context;
		ctx.fillStyle = this.color;
		ctx.fillRect(
			(this.X - this.width / 2)		* gameArea.screenRatio()[0],
			(this.Y - this.height / 2)	* gameArea.screenRatio()[1],
			this.width  								* gameArea.screenRatio()[0],
			this.height 								* gameArea.screenRatio()[1]
		);
	}
	update() {
		super.update();
		super.updatePosition();
		this.collisions();
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
};

class Ball extends Component {
	constructor(x, y, width, height, color, velocity) {
		super(x, y, width, height, color);

		//this.velocityX = velocity * (Math.random() < 0.5 ? -1 : 1);
		//this.velocityY = 0;
		this.velocityX = velocity * (Math.random() * 2 - 1);
		this.velocityY = velocity * (Math.random() * 2 - 1);

	}
	draw() {
		ctx = gameArea.context;
		ctx.fillStyle = this.color;
		ctx.fillRect(
			(this.X - this.width / 2)		* gameArea.screenRatio()[0],
			(this.Y - this.height / 2)	* gameArea.screenRatio()[1],
			this.width  								* gameArea.screenRatio()[0],
			this.height 								* gameArea.screenRatio()[1]
		);
	}
	update() {
		super.update();
		super.updatePosition();
		this.collisions();
	}
	collisions() {
		var t = this.height / 2;
		var b = 100 - this.height / 2;
		var l = this.width / 2;
		var r = 100 - this.width / 2;

		if(this.X < l) {
			this.velocityX *=  -1;
			this.X = l;
		}
		if(this.X > r) {
			this.velocityX *=  -1;
			this.X = r;
		}
		if(this.Y < t) {
			this.velocityY *= -1;
			this.Y = t;
		}
		if(this.Y > b) {
			this.velocityY *= -1;
			this.Y = b;
		}
	}
}

function updateGameInfo() {
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
	</ul> \
	";
}

function gameCollisions() {
	for(let player of Players) {
		/// Horizontal intersection
		var min = (player.bottom < B.bottom ? player : B);
    var max = (min == player ? B : player);
		if(min.top >= max.bottom) {
			///Vertical intersection
			var min2 = (player.left < B.left ? player : B);
			var max2 = (min2 == player ? B : player);
				if(min2.right >= max2.left) {
					console.log("uuuuu");
				}
		}
	}
}

function updateGameArea() {
	updateGameInfo();
	gameArea.clear();
	gameArea.context.beginPath();
	gameArea.context.moveTo(gameArea.canvas.width / 2, 							 			0);
	gameArea.context.lineTo(gameArea.canvas.width / 2, gameArea.canvas.height);
	gameArea.context.strokeStyle = "#E2E2E2";
	gameArea.context.lineWidth = 1.5;
	gameArea.context.stroke();
	/*
	myScore.text =
		(player1.X			* gameArea.screenRatio()[0]) + "\n" +
		(player1.Y			* gameArea.screenRatio()[1]) + "\n" +
		(player1.width  * gameArea.screenRatio()[0]) + "\n" +
		(player1.height * gameArea.screenRatio()[1]) + "\n" +
		player1.velocityY;
	*/
	//myScore.text = player1.velocityY;
	myScore.text = "";
	myScore.update();

	gameCollisions();

	P1.update();
	P1.draw();
	P2.update();
	P2.draw();
	B.update();
	B.draw();


	if (keyState[38]) {
		P1.moveDown();
	}
	if (keyState[40]) {
		P1.moveUp();
	}
	if (keyState[87]) {
		P2.moveDown();
	}
	if (keyState[83]) {
		P2.moveUp();
	}
}

var keyState = {};
window.addEventListener('keydown', function(e) {
		keyState[e.keyCode || e.which] = true;
		e.preventDefault();
}, true);
window.addEventListener('keyup', function(e) {
    keyState[e.keyCode || e.which] = false;
		e.preventDefault();
}, true);

window.addEventListener('resize', (event) => {
	if(window.innerHeight > window.innerWidth / 2) {
		gameArea.canvas.width = window.innerWidth;
		gameArea.canvas.height = window.innerWidth / 2;
	}
	else {
		gameArea.canvas.width = window.innerHeight * 2;
		gameArea.canvas.height = window.innerHeight;
	}
	console.log("muie");
});
/*
window.addEventListener('keyup', (event) => {
});
window.addEventListener('keydown', (event) => {
	if(event.keyCode == 13) gameArea.start(), event.preventDefault();
	if(event.keyCode == 38) player1.moveDown(), event.preventDefault();
	if(event.keyCode == 40) player1.moveUp()	, event.preventDefault();
});
*/