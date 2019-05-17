import smooth from "smooth-polyline";

export default function Smooth(points, smoothing){
	const step = (points, smoothing) => {
		if(smoothing <= 0)
			return points;

		const smoothedPoints = smooth(points);
		return step(smoothedPoints, smoothing - 1);
	};
	const pointToArray = point => [point.x, point.y];
	const pointToObject = point => ({x: point[0], y: point[1]});

	if(smoothing <= 0)
		return points;
	
	const pointsAsArray = points.map(pointToArray);

	return step(pointsAsArray, smoothing).map(pointToObject);
}