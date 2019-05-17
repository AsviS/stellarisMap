export function circleCircleIntersections({c1: {x: c1x, y: c1y, r: r1}, c2: {x: c2x, y: c2y, r: r2}}){
	const EPS = 1e-6;
	const dx = c1x - c2x;
	const dy = c1y - c2y;
	const d = Math.hypot(dx, dy);

	let R = 0;
	let r = 0;
	let Cx = 0;
	let Cy = 0;

	if(r1 > r2){
		R = r1;
		r = r2;
		Cx = c1x;
		Cy = c1y;
	}
	else{
		R = r2;
		r = r1;
		Cx = c2x;
		Cy = c2y;
	}

	if(d < EPS && Math.abs(r1 - r2) < EPS)
		return [];
	else if(d < EPS)
		return [];
	
	const point = {
		x: (dx / d) * R + Cx,
		y: (dy / d) * R + Cy
	};

	if(Math.abs(r1 + r2 - d) < EPS || Math.abs(R - r + d) < EPS)
		return [point];

	const angle = acosSafe((r**2 - d**2 - R**2)/(-2 * d * R));
	return [
		rotatePoint({point, center: {x: Cx, y: Cy}, angle: +angle}),
		rotatePoint({point, center: {x: Cx, y: Cy}, angle: -angle})
	];
}
export function lineLineIntersection([{x: x1, y: y1}, {x: x2, y: y2}], [{x: x3, y: y3}, {x: x4, y: y4}]){	
	if((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)){
		return null;
	}

	const denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
	if(denominator === 0){
		return null;
	}
	
	const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
	const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

	if (ua < 0 || ua > 1 || ub < 0 || ub > 1){
		return null;
	}

	return {
		x: x1 + ua * (x2 - x1),
		y: y1 + ua * (y2 - y1)
	};
}
function acosSafe(x){
	if(x >= 1) return 0;
	if(x <= -1) return Math.PI;
	return Math.acos(x);
}
function rotatePoint({point: {x: px, y: py}, center: {x: cx, y: cy}, angle}){
	const dx = px - cx;
	const dy = py - cy;

	return {
		x: cx + dx * Math.cos(angle) + dy * Math.sin(angle),
		y: cy + dy * Math.cos(angle) - dx * Math.sin(angle)
	};
}