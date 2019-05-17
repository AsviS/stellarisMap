import Colors from "./colors";
import {circleCircleIntersections, lineLineIntersection} from "./math";
import getUniqueName from "./initializersNames";

export default class Star{
	constructor({index, name, coordinate, hyperlane = [], bypasses = [], structures = [], star_class, intelLevel = 0, planet, owner, starBaseLevel, gates = [], population = 0}){
		const uniqueName = getUniqueName(name);
		this._index = +index;
		this._name = uniqueName ? uniqueName : name;
		this._coords = {
			x: coordinate.x,
			y: coordinate.y
		};
		this._class = star_class;
		this._hyperlanes = hyperlane.map(hl => hl.to);
		this._planetsIndexes = planet;
		this._owner = owner;
		this._starBaseLevel = starBaseLevel;
		this.importants = [];
		this._intelLevel = intelLevel;
		this._colors = {
			country: "void"
		};
		this._pointsOfInfluence = this.circleOfInfleunce;
		this._border = [];

		if(population > 0 || (starBaseLevel && starBaseLevel !== "starbase_level_outpost")){
			this.isImportant = true;
			this.importants.push(starBaseLevel);
		}
		if(structures.length > 0){
			this.isImportant = true;
			this.importants.push("megastructure");
		}
		if(gates.length > 0){
			this.isImportant = true;
			this.importants.push(...gates.map(gate => gate.type));
		}
		else if(bypasses.length > 0){
			this.isImportant = true;
			this.importants.push("wormhole");
		}
	}
	get index(){
		return this._index;
	}
	get name(){
		return this._name;
	}
	get hyperlanes(){
		return this._hyperlanes;
	}
	get coords(){
		return this._coords;
	}
	get class(){
		return this._class;
	}
	get owner(){
		return this._owner;
	}
	get colors(){
		return this._colors;
	}
	get spaceColor(){
		return this._colors.space;
	}
	get borderColor(){
		return this._colors.border;
	}
	get intelLevel(){
		return this._intelLevel;
	}
	get circleOfInfleunce(){
		const angles = [];
		const pointsAmount = 64;
		const radius = Star.RADIUS_OF_INFLUENCE;

		if(this._owner === undefined) return [];

		for(let i = 1; i <= pointsAmount; i++){
			const angle = 2 * Math.PI * i / pointsAmount;
			angles.push({
				x: this._coords.x + radius * Math.cos(angle),
				y: this._coords.y + radius * Math.sin(angle),
				onInitPosition: true
			});
		}

		return angles;
	}
	get pointsOfInfluence(){
		return this._pointsOfInfluence;
	}
	get border(){
		return this._border;
	}
	set pointsOfInfluence(pointsArr){
		this._pointsOfInfluence = pointsArr;
	}
	set border(pointsArr){
		this._border = pointsArr;
	}
	clear(){
		delete this._colors;
		delete this._pointsOfInfluence;
		delete this._border;
	}
	static get RADIUS_OF_INFLUENCE(){
		return 30;
	}
	static setCountryColor(stars, countries){
		stars.forEach(star => {
			if(star.owner === undefined) return;
			const country = countries[star.owner];
			star.colors.space = Colors.getCountryColor(country.flag.colors[1]);
			star.colors.border = Colors.getCountryColor(country.flag.colors[0]);
		});
	}
	static initStars(gameData){
		Star.setCountryColor(gameData.stars, gameData.countries);
		return gameData.stars;
	}
	static solveInfluenceCollisions(stars){
		// for each point in range of each neighbour of each star
		// if necessary move the point in the middle of two stars
		// while keeping the angle of the "point-star" vector the same
		stars.forEach(star => {
			const getDistance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
			const isNeighbour = (a, b) => {
				return getDistance(a.coords, b.coords) <= Star.RADIUS_OF_INFLUENCE * 2;
			};
			const hasAnotherOwner = (a, b) => a.owner !== b.owner;
			const currStar = star;
			const neighbourStars = stars.filter(star => {
				return isNeighbour(star, currStar) && hasAnotherOwner(star, currStar);
			});
			const r = Star.RADIUS_OF_INFLUENCE;
			
			const supressedCoords = star.pointsOfInfluence.map(point => {
				return neighbourStars.reduce((acc, neighbour) => {
					if(getDistance(acc, neighbour.coords) >= r){
						return acc;
					}
					const circlesIntersections = circleCircleIntersections({
						c1: {
							...currStar.coords,
							r
						},
						c2: {
							...neighbour.coords,
							r
						}
					});
					const starToPoint = [star.coords, acc];
					return lineLineIntersection(circlesIntersections, starToPoint) || {...acc, onInitPosition: false};
				}, point);
			});
			star.pointsOfInfluence = Star.optimizePoints(supressedCoords);
		});
	}
	static optimizePoints(points){
		const normalizeLines = points => {
			const EPS = 1 * Math.PI / 180;

			points.forEach((point, i, arr) => {
				const nextPoint = arr[i+1];
				const afterNextPoint = arr[i+2];

				if(nextPoint && afterNextPoint){
					const dxNext = point.x - nextPoint.x;
					const dyNext = point.y - nextPoint.y;
					const dxAfterNext = point.x - afterNextPoint.x;
					const dyAfterNext = point.y - afterNextPoint.y;
					const angleToNext = Math.atan2(dyNext, dxNext);
					const angleToAfterNext = Math.atan2(dyAfterNext, dxAfterNext);

					if(Math.abs(angleToNext - angleToAfterNext) < EPS){
						nextPoint.isRedundant = true;
					}
				}
			});
			return points.filter(point => !point.isRedundant);
		};
		return normalizeLines(points);
	}
	static setBorder(stars, borderWidth){
		stars.forEach(star => {
			star.border = star.pointsOfInfluence.map(point => {
				const dx = star.coords.x - point.x;
				const dy = star.coords.y - point.y;
				const distance = Math.hypot(dx, dy);
				const angle = Math.atan2(dy, dx) + Math.PI;

				return {
					x: star.coords.x + (distance - borderWidth) * Math.cos(angle),
					y: star.coords.y + (distance - borderWidth) * Math.sin(angle)
				};
			});
		});
	}
}