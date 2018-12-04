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

function det(a, b, c, d) {
    /* 2x2 determinant */
    return (a*d - b*c);
}

function onSegment(P, Q, R){
    /* Checks whether point Q is on the segment PR (P,Q,R colinear) */
    return (Q.X <= Math.max(P.X, R.X) && Q.X >= Math.min(P.X, R.X) &&
        Q.Y <= Math.max(P.Y, R.Y) && Q.Y >= Math.min(P.Y, R.Y));
}
function pointsIntersect(A1,A2,A3,A4){
    /* Checks whether 2 A1A2 and A3A4 intersect */
    /* Return values:
        (X, Y) - points of intersection
        (undefined, 0) - segments do not intersect
        TODO: (undefined,undefined) - segments are parallel */
    let a1 = (A2.Y - A1.Y);
    let b1 = -(A2.X - A1.X);
    let c1 = A1.Y*(A2.X-A1.X) - A1.X*(A2.Y-A1.Y);

    let a2 = (A4.Y - A3.Y);
    let b2 = -(A4.X - A3.X);
    let c2 = A3.Y*(A4.X-A3.X) - A3.X*(A4.Y-A3.Y);

    if( det(a1,b1,a2,b2) ) {
        XY = new Point;
        XY.X = det(-c1, b1, -c2, b2)/det(a1,b1,a2,b2);
        XY.Y = det(a1, -c1, a2, -c2)/det(a1,b1,a2,b2);
        if(onSegment(A1, XY, A2) && onSegment(A3,XY,A4)){
            return {
                    X: XY.X,
                    Y: XY.Y
                }        
        } else {
            return {
                X: undefined,
                Y: 0
            }
        }
}
}
//////////////////////////////////////////////////////////////////
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

function findClosestIntersection(Poly, camera){
	/* Finds the closest intersection of the rays and the segments */
    /* Input:
		Poly - A polygon type object.
	/* Return values:
		 intersections - An array of type Points objects.

		*/
	var intersections=[];
	//Calculate the angle of the ray and their respective offsets (+0,00001 and -0,00001);
	var uniquePoints= null;
	var uniqueAngles=[];
	var a=[];
	a=Poly.points;
	var len=a.length;
	for(var j=0;j<len;j++)
	{
		var point1=Poly.points[j];
		var angle=Math.atan2(point1.X-camera.X,point1.Y-camera.Y);
		uniqueAngles.push(angle-0.00001,angle,angle+0,00001);	
		
	}
	//------//
	
	//Finds the component on the x any y axies//
	var dx = Math.cos(angle);
		var dy = Math.sin(angle);
	//--------//
	
	var ray = {
			a:{x:camera.x,y:camera.y}	,
			b:{x:camera.x+dx,y:camera.y+dy}
		}
		var point1=Poly.points[0];
			var point2=Poly.points[1];
		var ray_point_1=new Point(camera.X,camera.Y);
		var ray_point_2=new Point(camera.X+dx,camera.Y+dy);
	//Find closest intersection //
		var closestIntersect=pointsIntersect(ray_point_1,ray_point_2,point1,point2);
			
		for(var j=1;j<len-1;j++)
		{	
			var point1=Poly.points[j];
			var point2=Poly.points[j+1];
			var intersect=pointsIntersect(ray_point_1,ray_point_2,point1,point2);
			
			if(intersect.X!=null && intersect.Y!=null){
				if(!closestIntersect){
					var dist1 = Math.sqrt( Math.pow((intersect.X-camera.X), 2) + Math.pow((intersect.Y-camera.Y), 2) );
					var dist2=  Math.sqrt( Math.pow((closestIntersect.X-camera.X), 2) + Math.pow((closestIntersect.Y-camera.Y), 2) );
					if(dist1<dist2)
						closestIntersect=intersect;
				}
			}
			intersections.push(closestIntersect);
		}
		
		return intersections;
	
}



window.onload = function() {
    a1 = new Point(1,1,0,4);
    a2 = new Point(1,0,0,4);
    a3 = new Point(0,0,0,4);
    a4 = new Point(1,2,0,4);
	var p=[];
	p.push(a1);
	p.push(a2);
	p.push(a3);
	p.push(a4);
    pol=new Polygon(p,4);
	cam=new Point(0.5,0.5,0,0);
	

}