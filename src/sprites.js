export default class Sprites{
	constructor(){
		this._starIcons = {
			"sc_b": new Image(),
			"sc_a": new Image(),
			"sc_f": new Image(),
			"sc_g": new Image(),
			"sc_k": new Image(),
			"sc_m": new Image(),
			"sc_m_giant": new Image(),
			"sc_t": new Image(),
			"sc_black_hole": new Image(),
			"sc_neutron_star": new Image(),
			"sc_pulsar": new Image(),
			"sc_binary_1": new Image(),
			"sc_binary_2": new Image(),
			"sc_binary_3": new Image(),
			"sc_binary_4": new Image(),
			"sc_binary_5": new Image(),
			"sc_binary_6": new Image(),
			"sc_binary_7": new Image(),
			"sc_binary_8": new Image(),
			"sc_binary_9": new Image(),
			"sc_binary_10": new Image(),
			"sc_trinary_1": new Image(),
			"sc_trinary_2": new Image(),
			"sc_trinary_3": new Image(),
			"sc_trinary_4": new Image()
		};
		this._mapIcons = new Image();
	}
	get starIcons(){
		return this._starIcons;
	}
	get mapIcons(){
		return this._mapIcons;
	}
	get defaultStarIcon(){
		return this._starIcons["sc_g"];
	}
	getSpriteCoords({spriteId, groupId = 0}){
		const width = 42;
		const sprites = {
			"gateway_final": 0,
			"gateway_restored": 0,
			"gateway_ruined": 0,
			"wormhole": 1,
			"lgate_base": 2,
			"starbase_level_outpost": 3,
			"starbase_level_starport": 4,
			"starbase_level_starhold": 5,
			"starbase_level_starfortress": 6,
			"starbase_level_citadel": 7,
			"starbase_level_swarm": 7,
			"starbase_level_ai": 7,
			"starbase_level_exd": 7,
			"starbase_level_marauder": 7,
			"starbase_level_gatebuilders": 7,
			"starbase_level_caravaneer": 7,
			"megastructure": 8
		};
		const length = 9;
		const index = sprites[spriteId] + length * groupId;

		if(index === undefined)
			return null;

		return {
			start: index * width,
			end: index * width + width
		};
	}
	async load(){
		function spriteLoaded(image){
			return new Promise(resolve => {
				image.onload = resolve;
			});
		}
		const loaded = [];
		const starIconsPaths = {
			"sc_b": "./img/b_star.png",
			"sc_a": "./img/a_star.png",
			"sc_f": "./img/f_star.png",
			"sc_g": "./img/g_star.png",
			"sc_k": "./img/k_star.png",
			"sc_m": "./img/m_star.png",
			"sc_m_giant": "./img/sc_m_giant.png",
			"sc_t": "./img/t_star.png",
			"sc_black_hole": "./img/black_hole.png",
			"sc_neutron_star": "./img/neutron_star.png",
			"sc_pulsar": "./img/pulsar.png",
			"sc_binary_1": "./img/e_binary_star.png",
			"sc_binary_2": "./img/e_binary_star.png",
			"sc_binary_3": "./img/c_binary_star.png",
			"sc_binary_4": "./img/c_binary_star.png",
			"sc_binary_5": "./img/a_binary_star.png",
			"sc_binary_6": "./img/d_binary_star.png",
			"sc_binary_7": "./img/d_binary_star.png",
			"sc_binary_8": "./img/d_binary_star.png",
			"sc_binary_9": "./img/a_binary_star.png",
			"sc_binary_10": "./img/a_binary_star.png",
			"sc_trinary_1": "./img/a_trinary_star.png",
			"sc_trinary_2": "./img/a_trinary_star.png",
			"sc_trinary_3": "./img/a_trinary_star.png",
			"sc_trinary_4": "./img/a_trinary_star.png"
		};

		for(let starType in starIconsPaths){
			this._starIcons[starType].src = starIconsPaths[starType];
			loaded.push(spriteLoaded(this._starIcons[starType]));
		}
		this._mapIcons.src = "./img/map-icons.png";
		loaded.push(spriteLoaded(this._mapIcons));

		return Promise.all(loaded);
	}
}