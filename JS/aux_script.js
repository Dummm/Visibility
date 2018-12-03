
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
window.onload = function() {
    a1 = new Point(1,1,0,4);
    a2 = new Point(1,0,0,4);
    a3 = new Point(0,0,0,4);
    a4 = new Point(1,2,0,4);
    a5 = pointsIntersect(a1,a2,a3,a4);
    console.log(a5.X + ", " + a5.Y);
}