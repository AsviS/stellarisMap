export default class Colors{
	static getCountryColor(colorName){
		const defaultColor = "grey";
		const countryColors = {
			"dark_brown": "#593d2d",
			"brown": "#59422d",
			"beige": "#b38b6b",
			"yellow": "#fcb13f",
			"light_orange": "#cc8129",
			"orange": "#b36424",
			"red_orange": "#b3432d",
			"red": "#b3242c",
			"burgundy": "#6b2b46",
			"pink": "#996374",
			"purple": "#754d80",
			"dark_purple": "#592454",
			"indigo": "#2f1380",
			"dark_blue": "#1f4466",
			"blue": "#4d6b99",
			"light_blue": "#7a9bcc",
			"turquoise": "#3dcccc",
			"dark_teal": "#2b6b63",
			"teal": "#59806f",
			"light_green": "#71b36b",
			"green": "#598c54",
			"dark_green": "#2f4d2e",
			"grey": "#828e99",
			"dark_grey": "#3d434d",
			"black": "#2a292e"
		};

		return countryColors[colorName] || defaultColor;
	}
}