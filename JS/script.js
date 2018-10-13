var player1;
var player2;
var ball;
var myScore;

function startGame() {
	player1 = new component(1, 20, "#000000", 2, 50);
	player2 = new component(1, 20, "#000000", 98, 50);
	ball = 		new component(2, 4,	 "#000000", 50, 50);
	myScore = new component("30px", "Consolas", "black", 280, 40, "text");
}

var myGameArea = {
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
		this.interval = setInterval(updateGameArea, 5);

		player1.y = player2.y = 50;

		//player1.x = 0;
		//player1.y = (window.innerHeight - player1.height) / 2;
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

	this.x = x;
	this.y = y;

	this.update = function() {
		ctx = myGameArea.context;
		if (this.type == "text") {
			ctx.font = this.width + " " + this.height;
			ctx.fillStyle = color;
			ctx.fillText(
				this.text,
				this.x * myGameArea.screenRatio()[0],
				this.y * myGameArea.screenRatio()[1]);
		} else {
			ctx.fillStyle = color;
			//ctx.fillRect(this.x, this.y, this.width, this.height);
			ctx.fillRect(
				(this.x - this.width / 2)		* myGameArea.screenRatio()[0],
				(this.y - this.height / 2)	* myGameArea.screenRatio()[1],
				this.width  								* myGameArea.screenRatio()[0],
				this.height 								* myGameArea.screenRatio()[1]
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
		this.x += this.velocityX;
		this.y += this.velocityY;

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
		if (this.y > b) {
			this.y = b;
			this.velocityY = 0;
		}
	}
	this.hitTop = function() {
		var t = this.height / 2;
		if (this.y < t) {
			this.y = t;
			this.velocityY = 0;
		}
	}
	this.crashWith = function(otherobj) {
		var myleft = this.x;
		var myright = this.x + (this.width);
		var mytop = this.y;
		var mybottom = this.y + (this.height);
		var otherleft = otherobj.x;
		var otherright = otherobj.x + (otherobj.width);
		var othertop = otherobj.y;
		var otherbottom = otherobj.y + (otherobj.height);
		var crash = true;
		if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
			crash = false;
		}
		return crash;
	}
}

function updateGameInfo() {
	var p1Info = document.getElementById("player1Info");
	p1Info.innerHTML = "\
	<ul> \
		<li><b>Width: </b>" 		+ player1.width + "</li> \
		<li><b>Height: </b>" 		+ player1.height + "</li> \
		<li><b>Velocity: </b>" 	+ player1.velocityY + "</li> \
		<li><b>X: </b>" 				+ player1.x + "</li> \
		<li><b>Y: </b>" 				+ player1.y + "</li> \
		<li><b>Speed: </b>" 		+ player1.speed + "</li> \
		<li><b>Friction: </b>" 	+ player1.friction + "</li> \
	</ul> \
	";var p1Info = document.getElementById("player1Info");

	var p2Info = document.getElementById("player2Info");
	p2Info.innerHTML = "\
	<ul> \
		<li><b>Width: </b>" 		+ player2.width + "</li> \
		<li><b>Height: </b>" 		+ player2.height + "</li> \
		<li><b>Velocity: </b>" 	+ player2.velocityY + "</li> \
		<li><b>X: </b>" 				+ player2.x + "</li> \
		<li><b>Y: </b>" 				+ player2.y + "</li> \
		<li><b>Speed: </b>" 		+ player2.speed + "</li> \
		<li><b>Friction: </b>" 	+ player2.friction + "</li> \
	</ul> \
	";
}

function updateGameArea() {
	updateGameInfo();
	myGameArea.clear();
	/*
	myScore.text =
		(player1.x			* myGameArea.screenRatio()[0]) + "\n" +
		(player1.y			* myGameArea.screenRatio()[1]) + "\n" +
		(player1.width  * myGameArea.screenRatio()[0]) + "\n" +
		(player1.height * myGameArea.screenRatio()[1]) + "\n" +
		player1.velocityY;
	*/
	//myScore.text = player1.velocityY;
	myScore.text = "";
	myScore.update();
	player1.newPos();
	player1.update();
	player2.newPos();
	player2.update();
	ball.newPos();
	ball.update();


	if (keyState[38]) {
		player1.moveDown();
	}
	if (keyState[40]) {
		player1.moveUp();
	}
	if (keyState[87]) {
		player2.moveDown();
	}
	if (keyState[83]) {
		player2.moveUp();
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
		myGameArea.canvas.width = window.innerWidth;
		myGameArea.canvas.height = window.innerWidth / 2;
	}
	else {
		myGameArea.canvas.width = window.innerHeight * 2;
		myGameArea.canvas.height = window.innerHeight;
	}
	console.log("muie");
});
/*
window.addEventListener('keyup', (event) => {
});
window.addEventListener('keydown', (event) => {
	if(event.keyCode == 13) myGameArea.start(), event.preventDefault();
	if(event.keyCode == 38) player1.moveDown(), event.preventDefault();
	if(event.keyCode == 40) player1.moveUp()	, event.preventDefault();
});
*/