import Sprites from "./sprites";

export default class Canvas{
	constructor({element, width, height, galaxyDiameter}){
		this._canvas = element;
		this._offScreenCanvas = document.createElement("canvas");

		this._canvas.width = width;
		this._canvas.height = height;
		this._offScreenCanvas.width = width;
		this._offScreenCanvas.height = height;

		this._ctx = this._canvas.getContext("2d");
		this._offScreenCtx = this._offScreenCanvas.getContext("2d");

		this._offset = {
			x: 0,
			y: 0
		};
		this._center = {
			x: 0,
			y: 0
		};
		this._scale = 1.5;
		this._scale = Math.min(width / galaxyDiameter, height / galaxyDiameter);
		this._accents = [];
		
		this._sprites = new Sprites();
	}
	get element(){
		return this._canvas;
	}
	get scale(){
		return this._scale;
	}
	get offset(){
		return this._offset;
	}
	get center(){
		return this._center;
	}
	set offset(offsetObj){
		this._offset = offsetObj;
	}
	set scale(num){
		this._scale = num;
	}
	set width(num){
		this._canvas.width = num;
		this._offScreenCanvas.width = num;
	}
	set height(num){
		this._canvas.height = num;
		this._offScreenCanvas.height = num;
	}
	loadSprites(){
		return this._sprites.load();
	}
	centerOn({x, y}){
		const diffX = (x * this._scale - this._canvas.width / 2);
		const diffY = (y * this._scale - this._canvas.height / 2);
		
		this._offset.x = -diffX;
		this._offset.y = -diffY;
		this._center = {x, y};
	}
	draw({stars = [], countries, state}){
		this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
		if(state.needToRedraw){
			this.drawOffScreen({stars, countries, state});
		}
		this._ctx.drawImage(this._offScreenCanvas, 0, 0);
	}
	drawOffScreen({stars = [], countries = [], state}){
		const prefs = {
			context: this._offScreenCtx,
			stars,
			countries
		};
		this._offScreenCtx.clearRect(0, 0, this._offScreenCanvas.width, this._offScreenCanvas.height);
		this.drawBackground(prefs);
		
		this._offScreenCtx.setTransform(this._scale, 0, 0, this._scale, this._offset.x, this._offset.y);
		if(state.drawCountries){
			this.drawBorders(prefs);
			this.drawSpace(prefs);
		}
		if(state.drawHyperlanes){
			this.drawHyperlanes(prefs);
		}
		if(state.drawStars){
			this.drawStars(prefs);
		}
		if(state.drawLabels && this._scale > 4){
			this.drawStarLabels(prefs);
		}

		this._offScreenCtx.resetTransform();
	}
	drawPolygons({polygons = [], color = "red", context}){
		if(polygons.length === 0) return;
		polygons.forEach(polygon => {
			context.beginPath();
			context.moveTo(polygon[0].x, polygon[0].y);
			polygon.forEach(point => {
				context.lineTo(point.x, point.y);
			});
			context.closePath();

			context.fillStyle = color;
			context.fill();
		});
	}
	drawBorders({countries, context}){
		countries.forEach(country => {
			if(!country.isKnown) return;
			context.fillStyle = country.border.color;
			context.fill(country.space.path);
		});
	}
	drawSpace({countries, context}){
		countries.forEach(country => {
			if(!country.isKnown) return;
			context.fillStyle = country.space.color;
			context.fill(country.border.path);
		});
	}
	drawStars({stars, mode, context}){
		stars.forEach(star => {
			if(star.intelLevel < 1) return;

			const size = 4;
			const sprite = this._sprites.starIcons[star.class] || this._sprites.defaultStarIcon;

			if(mode && mode === "simplified"){
				context.beginPath();
				context.arc(star.coords.x, star.coords.y, size / 4, 0, 2 * Math.PI);
				context.fillStyle = "red";
				context.fill();
			}
			else
				context.drawImage(sprite, star.coords.x - size/2, star.coords.y - size/2, size, size);
		});
	}
	drawStarLabels({stars, context}){
		const fontSize = 13;
		const fontSizeInScale = fontSize / this._scale;
		const offset = Math.max(25 / this._scale, 2.8);
		context.font = `${fontSizeInScale}px Roboto`;
		context.textAlign = "center";
		stars.forEach(star => {
			if(star.intelLevel < 1) return;
			if(!star.isImportant){
				context.fillStyle = "white";
				context.fillText(star.name, star.coords.x, star.coords.y + offset);
			}
		});
		stars.forEach(star => {
			if(star.intelLevel < 1) return;
			if(star.isImportant){
				const padding = fontSizeInScale;
				const signWidth = context.measureText(star.name).width + padding * 2;
				const signHeight = fontSizeInScale + 3 / this._scale;
				const nameSignX = star.coords.x - signWidth / 2;
				const nameSignY = star.coords.y + offset - fontSizeInScale;
				if(star.owner === 0)
					context.fillStyle = "#006837";
				else
					context.fillStyle = "#3d3c3c";
				context.fillRect(nameSignX, nameSignY, signWidth, signHeight);
				star.importants.forEach((icon, i) => {
					const iconWidth = 42;
					const iconHeight = iconWidth * 48 / 42;
					const iconHeightInScale = signHeight * Math.sqrt(3);
					const iconWidthInScale = iconHeightInScale * 42 / 48;
					const iconCoordsX = nameSignX + signWidth + iconWidthInScale * i;
					const iconCoordsY = nameSignY + signHeight / 2 - iconHeightInScale / 2;
					const spriteCoord = this._sprites.getSpriteCoords({
						spriteId: icon,
						groupId: star.owner === 0 ? 0 : 1
					});
					const icons = this._sprites.mapIcons;
					context.drawImage(icons, spriteCoord.start, 0, iconWidth, iconHeight, iconCoordsX, iconCoordsY, iconWidthInScale, iconHeightInScale);
				});
				context.fillStyle = "white";
				context.fillText(star.name, star.coords.x, star.coords.y + offset);
			}
		});
	}
	drawHyperlanes({stars, context}){
		stars.forEach(star => {
			const neighbourStars = star.hyperlanes;

			for(let index of neighbourStars){
				context.beginPath();
				context.moveTo(star.coords.x, star.coords.y);
				context.lineTo(stars[index].coords.x, stars[index].coords.y);
				context.lineWidth = 0.1;
				context.strokeStyle = "#0fdbdb";
				context.stroke();
			}
		});
	}
	drawBackground({context}){
		context.rect(0, 0, this._offScreenCanvas.width, this._offScreenCanvas.height);
		context.fillStyle = "black";
		context.fill();
	}
	accent(coords){
		this._accents.push(coords);
	}
	drawAccents({context}){
		this._accents.forEach(coords => {
			this.drawPolygonicCircle({coords, context, r: 2, n: 32});
		});
	}
	drawPolygonicCircle({coords, context, r, n}){
		const angles = [];

		for(let i = 1; i <= n; i++){
			const angle = 2 * Math.PI * i / n;
			angles.push({
				x: coords.x + r * Math.cos(angle),
				y: coords.y + r * Math.sin(angle)
			});
		}

		context.beginPath();
		context.moveTo(angles[0].x, angles[0].y);

		angles.forEach(angle => {
			context.lineTo(angle.x, angle.y);
		});

		context.closePath();

		context.strokeStyle = "blue";
		context.lineWidth = 1;
		context.stroke();
	}
}