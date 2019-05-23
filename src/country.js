import {polygon} from "polygon-tools";
import Colors from "./colors";

export default class Country{
	constructor({id, stars, relations, colors}){
		this._id = id;
		this._stars = stars.filter(star => star.owner === id);
		this._space = this.spacePolygons;
		this._border = this.borderPolygons;
		this._hasRelations = relations.includes(id);
		this._colors = colors.find(color => color.id === id);
		this._paths = {
			border: {
				path: null,
				color: Colors.getCountryColor(this._colors.border)
			},
			space: {
				path: null,
				color: Colors.getCountryColor(this._colors.space)
			}
		};
		this.setPaths();
	}
	get id(){
		return this._id;
	}
	get isKnown(){
		return this._id === 0 || this._hasRelations;
	}
	get borderColor(){
		return this._colors.border;
	}
	get spaceColor(){
		return this._colors.space;
	}
	get space(){
		return this._paths.space;
	}
	get border(){
		return this._paths.border;
	}
	get spacePolygons(){
		if(this._stars.length === 0) return [];

		const spacePolygons = this._stars.map(star => star.pointsOfInfluence);
		return Country.unitePolygons(spacePolygons);
	}
	get borderPolygons(){
		if(this._stars.length === 0) return [];

		const borderPolygons = this._stars.map(star => star.border);
		return Country.unitePolygons(borderPolygons);
	}
	clear(){
		delete this._space;
		delete this._border;
		delete this._config;
	}
	setPaths(){
		this._border.forEach(polygon=> {
			const pathBorders = new Path2D();
			polygon.forEach((point, i, arr) => {
				if(i === 0){
					pathBorders.moveTo(point.x, point.y);
				}
				else{
					pathBorders.lineTo(point.x, point.y);
				}
				if(i === arr.length - 1){
					pathBorders.closePath();
				}
			});
			if(!this._paths.border.path){
				this._paths.border.path = pathBorders;
			}
			else{
				this._paths.border.path.addPath(pathBorders);
			}
		});
		this._space.forEach(polygon=> {
			const pathSpace = new Path2D();
			polygon.forEach((point, i, arr) => {
				if(i === 0){
					pathSpace.moveTo(point.x, point.y);
				}
				else{
					pathSpace.lineTo(point.x, point.y);
				}
				if(i === arr.length - 1){
					pathSpace.closePath();
				}
			});
			if(!this._paths.space.path){
				this._paths.space.path = pathSpace;
			}
			else{
				this._paths.space.path.addPath(pathSpace);
			}
		});
	}
	static optimizeArcs(polygons, stars){
		return polygons.map(points => {
			const distancesFromStar = points.map(point => {
				return stars.reduce((acc, curr) => {
					const dx = point.x - curr.coords.x;
					const dy = point.y - curr.coords.y;
					const distance = Math.hypot(dx, dy);
	
					if(distance < acc.distance)
						return {
							distance,
							star: curr
						};
					else return acc;
				}, {distance: Infinity});
			});
			// console.log(distancesFromStar);
			distancesFromStar.forEach(({distance, star}, i, arr) => {
				const looseEquals = (a, b, eps) => Math.abs(a - b) < eps;
				const EPS = 0.1;
				const currDist = distance;
				const nextDist = arr[i+1] ? arr[i+1].distance : null;
				const isPartOfArc = looseEquals(currDist, nextDist, EPS);
	
				if(nextDist && isPartOfArc){
					if(!points[i].isRedundant){
						points[i].isArcBeginning = true;
						points[i].cx = star.coords.x;
						points[i].cy = star.coords.y;
						points[i].angle = Math.atan2(points[i].y - star.coords.y, points[i].x - star.coords.x);
						points[i].anticlockwise = 
							(points[i].x > points[i+1].x && points[i].y > points[i+1].y) ||
							(points[i].x < points[i+1].x && points[i].y < points[i+1].y);
						
						points[i+1].isArcEnding = true;
						points[i+1].angle = Math.atan2(points[i+1].y - star.coords.y, points[i+1].x - star.coords.x);
					}
					if(points[i].isArcEnding){
						points[i].isArcEnding = false;
						points[i].isRedundant = true;
					}
				}
			});
			return points.filter(point => !point.isRedundant);
		});
	}
	static optimizeArcsUpdate(stars){
		stars.forEach(star => {
			const points = [...star.pointsOfInfluence];
			points.forEach((currPoint, i, arr) => {
				const nextPoint = arr[i+1];
				if(nextPoint && nextPoint.onInitPosition){
					if(currPoint.onInitPosition && !currPoint.isRedundant){
						const dxCurrent = star.coords.x - currPoint.x;
						const dyCurrent = star.coords.y - currPoint.y;
						const dxNext = star.coords.x - nextPoint.x;
						const dyNext = star.coords.y - nextPoint.y;

						currPoint.isArcBeginning = true;
						currPoint.cx = star.coords.x;
						currPoint.cy = star.coords.y;
						currPoint.angle = Math.atan2(dyCurrent, dxCurrent);

						nextPoint.isArcEnding = true;
						nextPoint.angle = Math.atan2(dyNext, dxNext);
					}
					if(currPoint.isArcEnding){
						currPoint.isArcEnding = false;
						currPoint.isRedundant = true;
					}
				}
			});
		});
	}
	static unitePolygons(polygons){
		const objToArrPoint = point => [point.x, point.y];
		const arrToObjPoint = point => ({x: point[0], y: point[1]});
		const objToArrPolygon = polygon => polygon.map(objToArrPoint);
		const arrToObjPolygon = polygon => polygon.map(arrToObjPoint);

		const facadePolygons = polygons.map(objToArrPolygon);
		const union = polygon.union(...facadePolygons);

		return union.map(arrToObjPolygon);
	}
	static getHollowSpace(polygons, id){
		const objToArrPoint = point => [point.x, point.y];
		const arrToObjPoint = point => ({x: point[0], y: point[1]});
		const objToArrPolygon = polygon => polygon.map(objToArrPoint);
		const arrToObjPolygon = polygon => polygon.map(arrToObjPoint);
		const isNotNull = x => x !== null;
		const intersect = (poly, i, arr) => {
			if(arr[i+1]){
				const intersection = polygon.intersection(poly, arr[i+1]);
				if(intersection.length === 0)
					return null;
				return intersection;
			}
			return null;
		};

		return polygons
			.map(objToArrPolygon)
			.map(intersect)
			.filter(isNotNull)
			.map(arrToObjPolygon);
	}
	static get({stars, relations, colors}){
		const owners = stars
			.filter(star => star.owner !== undefined)
			.map(star => star.owner);
		const ownersUnique = [...new Set(owners)];
		return ownersUnique.map(ownerId => new Country({id: ownerId, stars, relations, colors}));
	}
}