import Star from "./star";
import getUniqueName from "./initializersNames";

export default class GameData{
	constructor(saveObj){
		this._data = saveObj;
		this._planets = this.parsePlanets();
		this._stars = this.parseStars();
	}
	get data(){
		return this._data;
	}
	get stars(){
		return this._stars;
	}
	get safeGalaxyRadius(){
		const padding = 35;
		return this._data.galaxy_radius + padding;
	}
	get planets(){
		return this._planets;
	}
	get megastructures(){
		if(this._megastructures)
			return this._megastructures;

		const megastructures = this._data.megastructures;
		const megastructuresArr = [];

		for(let index in megastructures){
			const type = megastructures[index].type;
			const isMegastructure = [
				(/ring_world/g).test(type),
				(/dyson_sphere/g).test(type),
				(/spy_orb/g).test(type),
				(/think_tank/g).test(type),
				(/matter_decompressor/g).test(type),
				(/strategic_coordination_center/g).test(type),
				(/mega_art_installation/g).test(type),
				(/interstellar_assembly/g).test(type)
			].includes(true);
			if(isMegastructure)
				megastructuresArr.push(megastructures[index]);
		}

		this._megastructures = megastructuresArr.map(structure => ({
			type: structure.type,
			starIndex: structure.coordinate.origin
		}));
		return this._megastructures;
	}
	get starGates(){
		if(this._starGates)
			return this._starGates;
		
		const megastructures = this._data.megastructures;
		const gatesArr = [];

		for(let index in megastructures){
			const type = megastructures[index].type;
			const isGate = ["lgate_base", "gateway_ruined", "gateway_restored", "gateway_final"].includes(type);
			if(isGate)
				gatesArr.push(megastructures[index]);
		}

		this._starGates = gatesArr.map(gate => ({
			type: gate.type,
			starIndex: gate.coordinate.origin
		}));
		return this._starGates;
	}
	get starBases(){
		if(this._starbases)
			return this._starbases;
		
		const basesObj = this._data.starbases;
		const basesArr = [];

		for(let index in basesObj){
			basesArr.push(basesObj[index]);
		}

		this._starbases = basesArr.map(base => ({
			system: base.system,
			owner: base.owner, 
			starBaseLevel: base.level
		}));
		return this._starbases;
	}
	get intelLevel(){
		return this._data.country[0].intel_level;
	}
	get hyperlaneSystems(){
		return this._data.country[0].hyperlane_systems;
	}
	get countries(){
		return this._data.country;
	}
	get starConfigs(){
		const galacticObjects = this._data.galactic_object;
		const starBases = this.starBases;
		const starGates = this.starGates;
		const megastructures = this.megastructures;
		const configs = [];

		for(let index in galacticObjects){
			const currentObject = galacticObjects[index];
			const base = starBases.find(base => base.system === +index) || {};
			const gates = starGates.filter(gate => gate.starIndex === +index);
			const structures = megastructures.filter(structure => structure.starIndex === +index);
			const planets = Array.from(currentObject.planet).map(planetIndex => this.planets[planetIndex]);
			const population = planets.reduce((acc, curr) => curr.pop + acc, 0);
			const intelLevel = this.intelLevel[index];
			if(currentObject.type && currentObject.type === "star"){
				configs.push({
					index,
					...currentObject,
					coordinate: this.toCanvasCoords(currentObject.coordinate),
					population,
					gates,
					structures,
					intelLevel,
					...base
				});
			}
		}
		return configs;
	}
	get relations(){
		const playerCountry = this._data.country[0];
		if(playerCountry.relations_manager && playerCountry.relations_manager.relation){
			const relations = playerCountry.relations_manager.relation;
			return relations.map(relation => relation.country);
		}
		else{
			return [];
		}
	}
	get colors(){
		const colors = [];
		const countries = this.countries;
		for(let index in countries){
			if(countries[index].flag){
				const border = countries[index].flag.colors[0];
				const space = countries[index].flag.colors[1];
				colors.push({id: +index, space, border});
			}
		}
		return colors;
	}
	parseStars(){
		const configs = this.starConfigs;

		return configs.map(config => new Star(config));
	}
	parsePlanets(){
		const planets = [];

		for(let index in this._data.planet){
			const planet = this._data.planet[index];
			const uniqueName = getUniqueName(planet.name);

			planets.push({
				name: uniqueName ? uniqueName : planet.name,
				pop: planet.pop ? planet.pop.length : 0,
			});
		}

		return planets;
	}
	toCanvasCoords({x, y}){
		return {
			x: -x + this.safeGalaxyRadius,
			y: y + this.safeGalaxyRadius
		};
	}
	getStarByIndex(index){
		return this._data.galactic_object[index];
	}
	clear(){
		delete this._data;
	}
}