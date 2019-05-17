import SaveFileReader from "./saveFileReader";
import GameData from "./gameData";
import Canvas from "./canvas";
import Star from "./star";
import Country from "./country";
import {saveAs} from "file-saver";

window.addEventListener("load", main);

async function main(){
	const saveReader = new SaveFileReader({});

	document.addEventListener("drop", e => {
		e.stopPropagation();
		e.preventDefault();

		saveReader
			.getSaveObj(e)
			.then(onSaveReady);
	});
	//prevent default on dragover needed for a proper work of the drop event
	document.addEventListener("dragover", e => e.preventDefault());

	const saveObj = await mockSaveObj();
	onSaveReady(saveObj);
	// const map = await mockMap();
	// onMapLoad(map);
}
async function mockSaveObj(){
	const obj = await fetch("./saveObj.json")
		.then(resp => resp.json())
		.then(obj => obj)
		.catch(e => console.log(e));
	return obj;
}
async function mockMap(){
	const obj = await fetch("./map.json")
		.then(resp => resp.json())
		.then(obj => obj)
		.catch(e => console.log(e));
	return obj;
}
async function onMapLoad(obj){
	if(!obj) return;

	const safeGalaxyRadius = obj.safeGalaxyRadius;
	const canvasConfig = {
		element: document.getElementById("app"),
		width: window.innerWidth,
		height: window.innerHeight,
		galaxyDiameter: safeGalaxyRadius * 2
	};
	const canvas = new Canvas(canvasConfig);
	const stars = obj.starConfigs.map(config => new Star(config));
	Star.solveInfluenceCollisions(stars, canvas);
	Star.setBorder(stars, 3);
	const countries = Country.get(stars);

	console.log(countries);

	const coords = stars.map(star => star.coords);
	const midX = coords.reduce((acc, {x}) => x + acc, 0)/coords.length;
	const midY = coords.reduce((acc, {y}) => y + acc, 0)/coords.length;
	
	const state = {
		needToRedraw: true
	};
	await canvas.loadSprites();

	countries.forEach(country => country.clear());
	canvas.centerOn({x: midX, y: midY});
	draw({canvas, stars, countries, state});
	setEventListeners({canvas, state});
}
async function onSaveReady(obj){
	const gameData = new GameData(obj);
	const safeGalaxyRadius = gameData.safeGalaxyRadius;
	const canvasConfig = {
		element: document.getElementById("app"),
		width: window.innerWidth,
		height: window.innerHeight,
		galaxyDiameter: safeGalaxyRadius * 2
	};
	const canvas = new Canvas(canvasConfig);
	const stars = Star.initStars(gameData);
	const starConfigs = gameData.starConfigs;
	Star.solveInfluenceCollisions(stars, canvas);
	Star.setBorder(stars, 3);
	const countries = Country.get(stars);
	const countryConfigs = Country.configs(countries);

	const coords = stars.map(star => star.coords);
	const midX = coords.reduce((acc, {x}) => x + acc, 0)/coords.length;
	const midY = coords.reduce((acc, {y}) => y + acc, 0)/coords.length;
	
	const state = {
		needToRedraw: true
	};

	console.log(gameData.data);

	await canvas.loadSprites();


	gameData.clear();
	stars.forEach(star => star.clear());
	countries.forEach(country => country.clear());

	canvas.centerOn({x: midX, y: midY});
	
	draw({canvas, stars, countries, state});
	setEventListeners({canvas, state});
	// downloadMap({starConfigs, safeGalaxyRadius});
}
function setEventListeners({canvas, state}){
	const keys = {
		up: false,
		down: false,
		right: false,
		left: false
	};

	canvas.element.addEventListener("wheel", zoom({canvas, state}));
	canvas.element.addEventListener("click", onClick({canvas, state}));
	document.addEventListener("keydown", move({canvas, keys, mode: "down", state}));
	document.addEventListener("keyup", move({canvas, keys, mode: "up", state}));
	window.addEventListener("resize", onResize({canvas, state}));
}
function downloadMap({starConfigs, safeGalaxyRadius}){
	const file = new File([JSON.stringify({starConfigs, safeGalaxyRadius})], "map.json", {type: "application/json"});
	saveAs(file, "map.json");
}
function screenToCanvasCoords({screenCoords, scale, offset}){
	return {
		x: screenCoords.x / scale - offset.x / scale,
		y: screenCoords.y / scale - offset.y / scale,
	};
}
function draw({canvas, stars, countries, state}){
	canvas.draw({stars, countries, state});
	state.needToRedraw = false;
	requestAnimationFrame(() => draw({canvas, stars, countries, state}));
}
function onResize({canvas, state}){
	return function(){
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		canvas.centerOn(canvas.center);
		state.needToRedraw = true;
	};
}
function onMouseMove({canvas, state}){
	return function(e){
		const canvasCoords = screenToCanvasCoords({
			screenCoords: {x: e.clientX, y: e.clientY},
			scale: canvas.scale,
			offset: canvas.offset
		});
		const accent = [canvasCoords];

		// canvas._accents = accent;
		state.needToRedraw = true;
	};
}
function onClick({canvas, state}){
	return function(e){
		const canvasCoords = screenToCanvasCoords({
			screenCoords: {x: e.clientX, y: e.clientY},
			scale: canvas.scale,
			offset: canvas.offset
		});
		console.log(canvasCoords);
	};
}
function move({canvas, keys, mode, state}){
	return function(e){
		const speed = 5 / canvas.scale;

		if(e.code === "KeyW"){
			if(mode === "down") keys.up = true;
			else keys.up = false;
		}
		if(e.code === "KeyS"){
			if(mode === "down") keys.down = true;
			else keys.down = false;
		}
		if(e.code === "KeyA"){
			if(mode === "down") keys.left = true;
			else keys.left = false;
		}
		if(e.code === "KeyD"){
			if(mode === "down") keys.right = true;
			else keys.right = false;
		}

		if(keys.up) canvas.centerOn({
			x: canvas.center.x,
			y: canvas.center.y - speed
		});
		if(keys.down) canvas.centerOn({
			x: canvas.center.x,
			y: canvas.center.y + speed
		});
		if(keys.left) canvas.centerOn({
			x: canvas.center.x - speed,
			y: canvas.center.y
		});
		if(keys.right) canvas.centerOn({
			x: canvas.center.x + speed,
			y: canvas.center.y
		});
		state.needToRedraw = true;
	};
}
function zoom({canvas, state}){
	return function(e){
		e.preventDefault();
		const MAX_SCALE = 15;
		const MIN_SCALE = 1;
		const OFFSET_COEF = 10 / canvas.scale;
		const scrollDirection = Math.sign(e.deltaY);
		const scroll = -scrollDirection * 100;
		const scrollSpeed = Math.max(1, canvas.scale) / 1000;
		const scrollsToMax = Math.max((MAX_SCALE - canvas.scale) / (scroll * scrollSpeed), 1);
		const newCenter = screenToCanvasCoords({
			screenCoords: {x: e.clientX, y: e.clientY},
			scale: canvas.scale,
			offset: canvas.offset
		});

		if(canvas.scale >= MAX_SCALE && scroll > 0){
			return;
		}
		if(canvas.scale <= MIN_SCALE && scroll < 0){
			return;
		}
		
		canvas.scale += scroll * scrollSpeed;
		if(scrollsToMax > 1){
			canvas.centerOn({
				x: canvas.center.x + OFFSET_COEF * (newCenter.x - canvas.center.x) / scrollsToMax,
				y: canvas.center.y + OFFSET_COEF * (newCenter.y - canvas.center.y) / scrollsToMax
			});
		}
		else{
			canvas.centerOn(canvas.center);
		}
		state.needToRedraw = true;
		state.needToZoom = true;
	};
}