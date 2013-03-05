var elem_mainmenu = null;
var canv_mainmenu = null;
var ctx_mainmenu = null;

var mainmenu_buttons = new Array();

function init_mainmenu() {
	elem_mainmenu = $("#mainmenu");
	canv_mainmenu = elem_mainmenu[0];
	ctx_mainmenu = canv_mainmenu.getContext("2d");
	elem_mainmenu.lock = false;
}

function draw_mainmenu() {
	//TODO: Decorate.
	// Background
	ctx_mainmenu.fillStyle = "#C7BDC5";
	ctx_mainmenu.fillRect(0, 0, canv_mainmenu.width, canv_mainmenu.height);

	// Title
	ctx_mainmenu.font = "bold 68px sans-serif"; //FIXME: Use custom font.
	var title = "Defence";
	//var x = get_scaled(100, SCREEN_SCALE_REFERENCE_WIDTH, screen_width);
	var x = (canv_mainmenu.width / 2) - (ctx_mainmenu.measureText(title).width / 2);
	var y = get_scaled(75, SCREEN_SCALE_REFERENCE_HEIGHT, screen_height);
	ctx_mainmenu.fillStyle = "#fff";
	ctx_mainmenu.fillText(title, x, y);
	ctx_mainmenu.lineWidth = 3;
	ctx_mainmenu.strokeStyle = "#000";
	ctx_mainmenu.strokeText(title, x, y);

	// New Game button
	var width = 190;
	var height = 70;
	var x = (canv_mainmenu.width / 2) - (width / 2);
	var y = get_scaled(110, SCREEN_SCALE_REFERENCE_HEIGHT, screen_height);
	var text_x = x + 13;
	var text_y = y + (height / 2);
	var text = "New Game";
	ctx_mainmenu.fillStyle = "#AF4CBA";
	ctx_mainmenu.fillRect(x, y, width, height);
	ctx_mainmenu.strokeRect(x, y, width, height);
	ctx_mainmenu.textBaseline = "middle";
	ctx_mainmenu.font = "bold 32px sans-serif"; //FIXME: Use custom font.
	ctx_mainmenu.fillStyle = "#fff";
	ctx_mainmenu.fillText(text, text_x, text_y);
	ctx_mainmenu.strokeStyle = "#000";
	ctx_mainmenu.lineWidth = 2;
	ctx_mainmenu.strokeText(text, text_x, text_y);
	mainmenu_buttons.push({
		"x": x,
		"y": y,
		"width": width,
		"height": height,
		"id": "newgame"
	});

	// Continue Game button
	var saved_level = load("current_level");
	if (saved_level) {
		y += 100;
		var text = "Continue"
		var text_x = x + 23;
		var text_y = y + (height / 2);
		ctx_mainmenu.lineWidth = 3;
		ctx_mainmenu.fillStyle = "#584991";
		ctx_mainmenu.fillRect(x, y, width, height);
		ctx_mainmenu.strokeRect(x, y, width, height);
		ctx_mainmenu.fillStyle = "#fff";
		ctx_mainmenu.fillText(text, text_x, text_y);
		ctx_mainmenu.strokeStyle = "#000";
		ctx_mainmenu.lineWidth = 2;
		ctx_mainmenu.strokeText(text, text_x, text_y);
		mainmenu_buttons.push({
			"x": x,
			"y": y,
			"width": width,
			"height": height,
			"id": "loadgame"
		});
	}

	elem_mainmenu.click(function(pos) {
		if (!elem_mainmenu.lock) {
			var x = Math.floor(pos.pageX - elem_mainmenu.offset().left);
			var y = Math.floor(pos.pageY - elem_mainmenu.offset().top);
			var clicked = null;
			for (var i = 0; i < mainmenu_buttons.length; i++) {
				var button = mainmenu_buttons[i];
				if (x > button.x && x < button.x + button.width
					&& y > button.y && y < button.y + button.height) {
					clicked = button.id;
					break;
				}
			}
			if (clicked !== null) {
				elem_mainmenu.lock = true;
				if (clicked == "newgame") {
					elem_mainmenu.fadeOut(100, function() {
						start_game(0, false);
					});
				} else if (clicked == "loadgame") {
					var saved_level = load("current_level");
					if (saved_level) {
						elem_mainmenu.fadeOut(100, function() {
							var player_data = {
								"credits": load("player:credits"),
								"power": load("player:power"),
								"integrity": load("player:integrity"),
								"attack_rate": load("player:attack_rate"),
								"cool_rate": load("player:cool_rate")
							};

							player_data.items = new Array();
							for (var i = 0; i < UPGRADE_META.length; i++) {
								player_data.items[i] = load("items:" + i);
							}
							start_game(parseInt(saved_level), load("in_upgrades"), player_data);
						});
					}
				}
			}
		}
	});
}

