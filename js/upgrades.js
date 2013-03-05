var elem_upgrades = null;
var canv_upgrades = null;
var ctx_upgrades = null;
var elem_upgrades_confirm = null;
var canv_upgrades_confirm = null;
var ctx_upgrades_confirm = null;

var upgrades_buttons = new Array();
var upgrades_confirm_buttons = new Array();

var selected_item = null;
var level_alpha = 0.5;
var last_level_alpha = level_alpha;
var level_alpha_change_rate = 0.3; // Alpha per second.
var level_alpha_max = 0.5;
var level_alpha_min = 0.2;
var level_alpha_changer = null; // For level alpha dimming timer.

var purchased = new Array();

function init_upgrades() {
	elem_upgrades = $("#upgrades");
	canv_upgrades = elem_upgrades[0];
	ctx_upgrades = canv_upgrades.getContext("2d");
	elem_upgrades_confirm = $("#upgrades_confirm");
	canv_upgrades_confirm = elem_upgrades_confirm[0];
	ctx_upgrades_confirm = canv_upgrades_confirm.getContext("2d");

	elem_upgrades.click(function(pos) {
		var x = Math.floor(pos.pageX - elem_upgrades.offset().left);
		var y = Math.floor(pos.pageY - elem_upgrades.offset().top);
		var clicked = null;
		for (var i = 0; i < upgrades_buttons.length; i++) {
			var button = upgrades_buttons[i];
			if (x > button.x && x < button.x + button.width
				&& y > button.y && y < button.y + button.height) {
				clicked = button.id;
				break;
			}
		}
		if (clicked !== null) {
			if (clicked.indexOf("product:") > -1) {
				var stuff = clicked.parse(":");
				var row = stuff[1];
				var column = stuff[2];
				selected_item = new Array(row, column);
				show_confirmation(UPGRADE_META[row].items[column]);
			} else if (clicked == "nextwave") {
				elem_upgrades.fadeOut(100, function() {
					current_level++;
					start_dialogue(current_level, function() {
						start_wave(current_level);
					});
				});
			} else if (clicked == "quit") {
				elem_upgrades.fadeOut(100, init);
			} else if (clicked.indexOf("weaponselect") > -1) {
				player.select_weapon(clicked.substr(clicked.indexOf(":") + 1));
				draw_upgrades();
			}
		}
	});

	elem_upgrades_confirm.click(function(pos) {
		var x = Math.floor(pos.pageX - elem_upgrades_confirm.offset().left);
		var y = Math.floor(pos.pageY - elem_upgrades_confirm.offset().top);
		var clicked = null;
		for (var i = 0; i < upgrades_confirm_buttons.length; i++) {
			var button = upgrades_confirm_buttons[i];
			if (x > button.x && x < button.x + button.width
				&& y > button.y && y < button.y + button.height) {
				clicked = button.id;
				break;
			}
		}
		if (clicked !== null) {
			if (clicked == "buy") {
				var row = selected_item[0];
				var column = selected_item[1];
				var item = UPGRADE_META[row].items[column];
				player.credits -= item.levels[get_level(selected_item[0], selected_item[1]) + 1].price;
				purchased[row][column] = get_level(row, column) + 1;
				save("item:" + row, column);

				//FIXME (CRITICAL): Update upgrade saving to reflect new system.
				if (item.power) {
					player.power = item.power;
					save("player:weapon", player.weapon);
				}
				if (item.integrity) {
					player.max_integrity = item.integrity;
					save("player:integrity", player.max_integrity);
				}
				if (item.attack_rate) {
					player.attack_rate = item.attack_rate;
					save("player:attack_rate", player.attack_rate);
				}
				if (item.cool_rate) {
					player.cool_rate = item.cool_rate;
					save("player:cool_rate", player.cool_rate);
				}
				save("player:credits", player.credits);

				player.update_stats();
				draw_upgrades();
			}
			selected_item = null;
			elem_upgrades_confirm.fadeOut(100);
		}
	});
}

function draw_upgrades() {
	ctx_upgrades.strokeStyle = "#000";
	ctx_upgrades.lineWidth = 1;

	ctx_upgrades.clearRect(0, 0, canv_upgrades.width, canv_upgrades.height);
	//TODO: Decorate.
	// Background
	ctx_upgrades.fillStyle = "#ccc";
	ctx_upgrades.fillRect(0, 0, canv_upgrades.width, canv_upgrades.height);

	// Upgrades title
	var text = "UPGRADES";
	var x = 147;
	var y = 95;
	ctx_upgrades.font = "bold 32px sans-serif";
	ctx_upgrades.fillStyle = "#fff";
	ctx_upgrades.fillText(text, x, y);
	ctx_upgrades.strokeText(text, x, y);

	ctx_upgrades.font = "bold 24px sans-serif";

	// Main Menu button
	var x = 2;
	var y = 2;
	var width = 100;
	var height = 100;
	ctx_upgrades.fillStyle = "#F24CE4";
	ctx_upgrades.fillRect(x, y, width, height);
	ctx_upgrades.strokeRect(x, y, width, height);
	ctx_upgrades.fillStyle = "#fff";
	ctx_upgrades.fillText("Main", x + 20, y + 38);
	ctx_upgrades.fillText("Menu", x + 17, y + 67);
	ctx_upgrades.strokeStyle = "#000";
	ctx_upgrades.strokeText("Main", x + 20, y + 38);
	ctx_upgrades.strokeText("Menu", x + 17, y + 67);
	upgrades_buttons.push({
		"x": x,
		"y": y,
		"width": width,
		"height": height,
		"id": "quit"
	});

	// Next Wave button
	var x = 378;
	var y = 2;
	var width = 100;
	var height = 100;
	ctx_upgrades.fillStyle = "#FFE6A2";
	ctx_upgrades.fillRect(x, y, width, height);
	ctx_upgrades.strokeRect(x, y, width, height);
	ctx_upgrades.fillStyle = "#fff";
	ctx_upgrades.fillText("Next", x + 24, y + 38);
	ctx_upgrades.fillText("Wave", x + 20, y + 67);
	ctx_upgrades.strokeStyle = "#000";
	ctx_upgrades.strokeText("Next", x + 24, y + 38);
	ctx_upgrades.strokeText("Wave", x + 20, y + 67);
	upgrades_buttons.push({
		"x": x,
		"y": y,
		"width": width,
		"height": height,
		"id": "nextwave"
	});

	// Player stats
	//TODO: Factor in upgrades for all the stats.
	ctx_upgrades.font = "20px sans-serif";
	var metadata = ICON_META.stats;
	ctx_upgrades.textBaseline = "middle";
	var x_offset = 45;
	var icon = metadata.power;
	var x = 5;
	var y = 180;
	var width = icon.width;
	var height = icon.height;
	ctx_upgrades.drawImage(icons, icon.x, icon.y, width, height, x, y, width - 15, height - 5);
	var text =  player.power;
	ctx_upgrades.fillText(text, x + x_offset, y + ((height - 5) * 0.5));
	ctx_upgrades.strokeText(text, x + x_offset, y + ((height - 5) * 0.5));

	var icon = metadata.integrity;
	var y = 215;
	var width = icon.width;
	var height = icon.height;
	ctx_upgrades.drawImage(icons, icon.x, icon.y, width, height, x, y, width - 5, height - 5);
	var text = player.max_integrity;
	ctx_upgrades.fillText(text, x + x_offset, y + ((height - 5) * 0.5));
	ctx_upgrades.strokeText(text, x + x_offset, y + ((height - 5) * 0.5));

	var icon = metadata.attack_rate;
	var y = 250;
	var width = icon.width;
	var height = icon.height;
	ctx_upgrades.drawImage(icons, icon.x, icon.y, width, height, x, y, width - 5, height - 5);
	var text = player.attack_rate;
	ctx_upgrades.fillText(text, x + x_offset, y + ((height - 5) * 0.5));
	ctx_upgrades.strokeText(text, x + x_offset, y + ((height - 5) * 0.5));

	var icon = metadata.cool_rate;
	var y = 285;
	var width = icon.width;
	var height = icon.height;
	ctx_upgrades.drawImage(icons, icon.x, icon.y, width, height, x, y, width - 5, height - 5);
	var text = Math.floor((player.cool_rate * 100));
	ctx_upgrades.fillText(text, x + x_offset, y + ((height - 5) * 0.5));
	ctx_upgrades.strokeText(text, x + x_offset, y + ((height - 5) * 0.5));

	// Currency display
	ctx_upgrades.font = "25px sans-serif";
	ctx_upgrades.fillStyle = "#fff";
	var y = 140;
	var text = "¤ " + player.credits;
	ctx_upgrades.fillText(text, x, y);
	ctx_upgrades.strokeText(text, x, y);

	// Alana portrait
	var image = new Image();
	image.src = "images/alana_dialogue.png";
	ctx_upgrades.drawImage(image, 390, 120, 73, 195);

	// Catalogue categories and item columns
	var count = 0;
	for (var a in UPGRADE_META) {
		var category = UPGRADE_META[a];

		// Category icon
		/*var x = (87 * a) + 140;
		var icon = ICON_META.weapons[category.icon];
		if (icon) {
			var y = 115;
			var width = icon.width;
			var height = icon.height;
			ctx_upgrades.drawImage(icons, icon.x, icon.y, width, height, x, y, width * 0.75, height * 0.75);
		}*/
		if (category) {
			// Weapon select buttons
			var size = 50;
			var y = 2;
			if (a in WEAPON_META) {
				var x = (90 * count) + 125;
				if (player.weapon != a) {
					ctx_upgrades.globalAlpha = 0.2;
				} else {
					ctx_upgrades.globalAlpha = 1.0;
				}
				ctx_upgrades.fillStyle = category.colour;
				ctx_upgrades.fillRect(x, y, size, size);
				ctx_upgrades.lineWidth = 2;
				var icon = WEAPON_META[a].icon;
				if (icon) {
					ctx_upgrades.drawImage(icons, icon.x, icon.y, icon.width, icon.height, x, y, size, size);
				}
				ctx_upgrades.globalAlpha = 1.0;
				ctx_upgrades.strokeRect(x, y, size, size);
				upgrades_buttons.push({
					"x": x,
					"y": y,
					"width": size,
					"height": size,
					"id": "weaponselect:" + a
				});
			}
		}
		count++;
	}
	// Product buttons
	draw_product_buttons(true);
	if (level_alpha_changer == null) {
		level_alpha_changer = new Timer();
	}
	level_alpha_changer.remove();
	level_alpha_changer.set_interval(function() {
		if (last_level_alpha > level_alpha) {
			var new_alpha = level_alpha - (level_alpha_change_rate / FPS);
			if (new_alpha <= level_alpha_min) {
				last_level_alpha = level_alpha_min - 1.0;
			} else {
				last_level_alpha = level_alpha;
			}
		} else {
			var new_alpha = level_alpha + (level_alpha_change_rate / FPS);
			if (new_alpha >= level_alpha_max) {
				last_level_alpha = level_alpha_max + 1.0;
			} else {
				last_level_alpha = level_alpha;
			}
		}
		level_alpha = new_alpha;
		draw_product_buttons(false);
	}, FPS);

	//TODO: Draw lines.
	ctx_upgrades.lineWidth = 1;
	var x1 = 102;
	var x2 = 378;
	var y1 = 102;
	var y2 = 320;
	ctx_upgrades.moveTo(x1, y1);
	ctx_upgrades.lineTo(x1, y2);
	ctx_upgrades.moveTo(x2, y1);
	ctx_upgrades.lineTo(x2, y2);
	var y = 60;
	ctx_upgrades.moveTo(x1, y);
	ctx_upgrades.lineTo(x2, y);
	ctx_upgrades.stroke();
}

function draw_product_buttons(register) {
	var num_icons = ICON_META.numbers;
	var count = 0;
	for (var a in UPGRADE_META) {
		var category = UPGRADE_META[a];
		var weapon = false;
		if (category) {
			//FIXME: Handle custom category placement better.
			if (a in WEAPON_META) {
				weapon = true;
				var x = (90 * count) + 125;
			}
			for (var b = 0; b < category.items.length; b++) {
				var item = category.items[b];
				if (item) {
					if (weapon) {
						var y = (65 * b) + 130;
					} else {
						var x = (90 * b) + 125;
						var y = 265;
					}
					var size = 45;
					ctx_upgrades.clearRect(x, y, size, size);
					ctx_upgrades.fillStyle = "#ccc";
					ctx_upgrades.fillRect(x, y, size, size);

					// Button outline
					ctx_upgrades.fillStyle = category.colour;
					ctx_upgrades.fillRect(x, y, size, size);

					// Product icon
					var icon = ICON_META.upgrades[item.icon];
					if (icon) {
						var width = icon.width;
						var height = icon.height;
						ctx_upgrades.drawImage(icons, icon.x, icon.y, width, height, x + (size / 2) - (width / 2), y + (size / 2) - (height / 2), width, height);
					}

					var level = get_level(a, b) + 1;
					// Level indicator
					if (level > 0) {
						var icon = ICON_META.numbers[level];
						var width = icon.width;
						var height = icon.height;
						ctx_upgrades.globalAlpha = level_alpha;
						ctx_upgrades.font = "46px sans-serif";
						ctx_upgrades.textBaseline = "middle";
						ctx_upgrades.drawImage(icons, icon.x, icon.y, width, height, x + ((size - width) * 0.5), y + ((size - height) * 0.5), width, height);
						ctx_upgrades.globalAlpha = 1.0;
					}
					ctx_upgrades.strokeRect(x, y, size, size);

					if (register) {
						upgrades_buttons.push({
							"x": x,
							"y": y,
							"width": width,
							"height": height,
							"id": "product:" + a + ":" + b
						});
					}
				}
			}
		}
		count++;
	}
}


function show_confirmation(item) {
	ctx_upgrades_confirm.clearRect(0, 0, canv_upgrades_confirm.width, canv_upgrades_confirm.height);
	ctx_upgrades_confirm.fillStyle = "#9F7DB0";
	ctx_upgrades_confirm.fillRect(0, 0, canv_upgrades_confirm.width, canv_upgrades_confirm.height);

	ctx_upgrades_confirm.lineWidth = 2;
	ctx_upgrades_confirm.strokeStyle = "#000";

	var level = get_level(selected_item[0], selected_item[1]);
	if (level + 1 >= item.levels.length) {
		var x = 50;
		var y = 210;
		var text = "Maximum level reached!";
		ctx_upgrades_confirm.fillStyle = "#E01B4C";
		ctx_upgrades_confirm.font = "bold 26px sans-serif";
		ctx_upgrades_confirm.fillText(text, x, y)
		ctx_upgrades_confirm.lineWidth = 1;
		ctx_upgrades_confirm.strokeText(text, x, y)
	} else {
	//if (purchased[selected_item[0]] < selected_item[1]) {
		if (player.credits > item.levels[level + 1].price) {
			// Buy button
			var x = 135;
			var y = 175;
			var width = 100;
			var height = 40;
			ctx_upgrades_confirm.fillStyle = "#1BE01E";
			ctx_upgrades_confirm.fillRect(x, y, width, height);
			ctx_upgrades_confirm.strokeRect(x, y, width, height);
			upgrades_confirm_buttons.push({
				"x": x,
				"y": y,
				"width": width,
				"height": height,
				"id": "buy"
			});
		} else {
			var x = 70;
			var y = 210;
			var text = "Not enough money!";
			ctx_upgrades_confirm.fillStyle = "#E01B4C";
			ctx_upgrades_confirm.font = "bold 26px sans-serif";
			ctx_upgrades_confirm.fillText(text, x, y)
			ctx_upgrades_confirm.lineWidth = 1;
			ctx_upgrades_confirm.strokeText(text, x, y)
		}
	/*} else {
		var x = 70;
		var y = 210;
		var text = "Already purchased!";
		ctx_upgrades_confirm.fillStyle = "#1BE01E";
		ctx_upgrades_confirm.font = "bold 26px sans-serif";
		ctx_upgrades_confirm.fillText(text, x, y)
		ctx_upgrades_confirm.lineWidth = 1;
		ctx_upgrades_confirm.strokeText(text, x, y)
	}*/
	}

	// Back button
	var x = 330;
	var y = 10;
	var width = 40;
	var height = 40;
	ctx_upgrades_confirm.fillStyle = "#E01B4C";
	ctx_upgrades_confirm.fillRect(x, y, width, height);
	ctx_upgrades_confirm.strokeRect(x, y, width, height);
	upgrades_confirm_buttons.push({
		"x": x,
		"y": y,
		"width": width,
		"height": height,
		"id": "back"
	});

	elem_upgrades_confirm.fadeIn(100);
}

function get_level(name, upgrade) {
	return purchased[name][upgrade];
}

function get_effect(name, upgrade, level) {
	var metadata = UPGRADE_META[name].items[upgrade].levels[level];
	var effect = new Array(metadata.affects, metadata.value);
	return effect;
}

var UPGRADE_META =
{
	"Pulse":
	{
		"icon": "pulse",
		"colour": "#016E03",
		"items":
		[
			{ // Rate of fire
				"icon": "rate_of_fire",
				"levels":
				[
					{
						"affects": "attack_rate",
						"value": 1,
						"price": 100
					},
					{
						"affects": "attack_rate",
						"value": 2,
						"price": 200
					},
					{
						"affects": "attack_rate",
						"value": 3,
						"price": 400
					},
					{
						"affects": "attack_rate",
						"value": 4,
						"price": 800
					},
					{
						"affects": "attack_rate",
						"value": 5,
						"price": 1600
					}
				]
			},
			{ // Spread
				"icon": "spread",
				"levels":
				[
					{
						"value": 1,
						"price": 100
					},
					{
						"value": 2,
						"price": 200
					},
					{
						"value": 3,
						"price": 400
					},
					{
						"value": 4,
						"price": 800
					},
					{
						"value": 5,
						"price": 1600
					}
				]
			}
			/*{
				"name": "Cybrontek Megashell",
				"price": 100,
				"integrity": 350
			},
			{
				"name": "Cybrontek Gigashell"
			},
			{
			}*/
		]
	},
	"Beam":
	{
		"icon": "beam",
		"colour": "#6C0094",
		"items":
		[
			{ // Width of projectile
				"icon": "projectile_width",
				"levels":
				[
					{
						"value": 6,
						"price": 100
					},
					{
						"value": 7,
						"price": 200
					},
					{
						"value": 8,
						"price": 400
					},
					{
						"value": 9,
						"price": 800
					},
					{
						"value": 10,
						"price": 1600
					}
				]
			},
			{ // Projectile lifespan
				"icon": "projectile_lifespan",
				"levels":
				[
					{
						"value": 6,
						"price": 100
					},
					{
						"value": 7,
						"price": 200
					},
					{
						"value": 8,
						"price": 400
					},
					{
						"value": 9,
						"price": 800
					},
					{
						"value": 10,
						"price": 1600
					}
				]
			}
			/*{
				"name": "Cybrontek Megashell",
				"price": 100,
				"integrity": 350
			},
			{
				"name": "Cybrontek Gigashell"
			},
			{
			}*/
		]
	},
	"Explosive":
	{
		"icon": "explosive",
		"colour": "#8C0728",
		"items":
		[
			{ // Area of effect
				//"name": "Cybrontek PowerAmp", //TODO (optional): Support upgrade names.
				"icon": "area_of_effect",
				"levels":
				[
					{
						"value": 6,
						"price": 100
					},
					{
						"value": 7,
						"price": 200
					},
					{
						"value": 8,
						"price": 400
					},
					{
						"value": 9,
						"price": 800
					},
					{
						"value": 10,
						"price": 1600
					}
				]
			},
			{ // Speed of projectile
				"icon": "projectile_speed",
				"levels":
				[
					{
						"value": 6,
						"price": 100
					},
					{
						"value": 7,
						"price": 200
					},
					{
						"value": 8,
						"price": 400
					},
					{
						"value": 9,
						"price": 800
					},
					{
						"value": 10,
						"price": 1600
					}
				]
			}
		]
	},
	"Miscellaneous":
	{
		/*"icon":
		{
			"x": 55,
			"y": 0,
			"width": 40,
			"height": 40
		},*/
		"colour": "#07078C",
		"items":
		[
			{ // Shield (max) integrity
				"icon": "shield_integrity",
				"levels":
				[
					{
						"affects": "max_integrity",
						"value": 150,
						"price": 100
					},
					{
						"affects": "max_integrity",
						"value": 300,
						"price": 200
					},
					{
						"affects": "max_integrity",
						"value": 450,
						"price": 400
					},
					{
						"affects": "max_integrity",
						"value": 600,
						"price": 800
					},
					{
						"affects": "max_integrity",
						"value": 750,
						"price": 1600
					}
				]
			},
			{ // Cool rate
				"icon": "cool_rate",
				"levels":
				[
					{
						"affects": "cool_rate",
						"value": 0.1,
						"price": 100
					},
					{
						"affects": "cool_rate",
						"value": 0.2,
						"price": 200
					},
					{
						"affects": "cool_rate",
						"value": 0.3,
						"price": 400
					},
					{
						"affects": "cool_rate",
						"value": 0.4,
						"price": 800
					},
					{
						"affects": "cool_rate",
						"value": 0.5,
						"price": 1600
					}
				]
			},
			{ // HMD features
				"icon": "hmd",
				"levels":
				[
					{
						"value": 6,
						"price": 100
					},
					{
						"value": 7,
						"price": 200
					},
					{
						"value": 8,
						"price": 400
					},
					{
						"value": 9,
						"price": 800
					},
					{
						"value": 10,
						"price": 1600
					}
				]
			}
		]
	}
}

var row = 0;
for (var a in UPGRADE_META) {
	purchased[a] = new Array();
	var column = 0;
	for (var b in UPGRADE_META[a].items) {
		purchased[a][column] = -1;
		column++;
	}
	row++;
}
