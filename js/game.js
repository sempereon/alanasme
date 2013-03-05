var FPS = 30;
var REFRESH = 1000 / FPS; // milliseconds
var SPF = REFRESH / 1000;
var SCREEN_SCALE_REFERENCE_WIDTH = 480;
var SCREEN_SCALE_REFERENCE_HEIGHT = 320;

var storage = null;
var sfx_volume = 1.0;
var music_voume = 1.0;

var elem_background = null;
var canv_background = null;
var ctx_background = null;
var elem_characters = null;
var canv_characters = null;
var ctx_characters = null;
var elem_projectiles = null;
var canv_projectiles = null;
var ctx_projectiles = null;
var elem_shotscreen = null;
var canv_shotscreen = null;
var ctx_shotscreen = null;
var elem_announcement = null;
var canv_announcement = null;
var ctx_announcement = null;

var screen_width = null;
var screen_height = null;

var field_x1 = 0;
var field_x2 = 283;
var field_y1 = 149;
var field_y2 = 300;

var ground_y = 250;

var current_level = 0;
var initial_spawn_delay = 1000; // Time in ms before first enemy in the wave spawns.
var enemies_spawned = 0;
var enemies_remaining = 0;

var player = null;
var enemies_moving = new Array(); // Performance optimisation; reduces number of enemies to check on update().
var target = new Array(); // Coordinates to attack.

var updater = null; // For object position updater.
var enemy_spawn = null; // For enemy spawner.

var lock = false;


function update() {
	// Update the player's heat rating.
	var delta = player.cool_rate / FPS;
	if (player.heat > 0) {
		player.heat -= delta;
	}
	if (player.heat < 0) {
		player.heat = 0;
	}
	if (player.overheating) {
		if (player.heat <= player.heat_tolerance) {
			player.overheating = false;
			console.log("Cooled down!");
		}
	}

	// Update positions of all enemies.
	var sorted_characters = new Array();
	for (var i = 0; i < enemies.length; i++) {
		if (enemies[i] !== undefined) {
			enemies[i].update();
			sorted_characters.push(enemies[i]);
		}
	}
	sorted_characters.push(player.shield);

	// Sort enemy render order to simulate depth.
	sorted_characters.sort(function(a, b) {
		return a.z - b.z;
	});

	// Update positions of all projectiles.
	for (var i = 0; i < projectiles.length; i++) {
		if (projectiles[i] !== undefined) {
			projectiles[i].update();
		}
	}

	ctx_characters.clearRect(0, 0, canv_characters.width, canv_characters.height);

	var z = new Array();
	for (var i = 0; i < sorted_characters.length; i++) {
		while ($.inArray(sorted_characters[i].y, z) > -1) {
			sorted_characters[i].z += 0.1;
		}
		sorted_characters[i].draw(ctx_characters);
	}

	ctx_projectiles.clearRect(0, 0, canv_projectiles.width, canv_projectiles.height);
	for (var i = 0; i < projectiles.length; i++) {
		if (projectiles[i] !== undefined) {
			projectiles[i].draw(ctx_projectiles);
		}
	}
	player.draw(ctx_characters);
}

function announce(text, callback) {
	ctx_announcement.clearRect(0, 0, canv_announcement.width, canv_announcement.height);
	ctx_announcement.fillStyle = "#f00";
	ctx_announcement.lineWidth = 2;
	ctx_announcement.strokeStyle = "#000";
	ctx_announcement.font = "50px sans-serif";
	ctx_announcement.textBaseline = "top";
	ctx_announcement.fillText(text, 0, 0);
	ctx_announcement.strokeText(text, 0, 0);
	elem_announcement.fadeIn(100).delay(200).fadeOut(100, function() { //FIXME: Set delay variables.
		if ($.isFunction(callback)) {
			callback();
		}
	});
}

function pause() {
	if (updater.id) {
		elem_shotscreen.hide();
		for (var i = 0; i < timers.length; i++) {
			timers[i].pause();
		}
		elem_background.stop().fadeTo(100, 0.5);
		//elem_characters.stop().fadeTo(100, 0.5);
		//elem_projectiles.stop().fadeTo(100, 0.5);
		display_pause();
		//updater.pause();
		//enemy_spawn.pause();
	}
}

function resume() {
	if (updater.pause_time) {
		elem_background.stop().fadeTo(100, 1.0);
		//elem_characters.stop().fadeTo(100, 1.0);
		//elem_projectiles.stop().fadeTo(100, 1.0);
		elem_shotscreen.show();
		for (var i = 0; i < timers.length; i++) {
			timers[i].resume();
		}
		//updater.resume();
		//enemy_spawn.resume();
	}
}

function draw_world() {
	var img = new Image();
	img.src = "images/background.png";
	ctx_background.drawImage(img, 0, 0, canv_background.width, canv_background.height);
}

function start_game(wave, upgrades, player_data) {
	if (!lock) {
		lock = true;
		if (player_data !== undefined) {
			//FIXME (CRITICAL): Update game loading to reflect new system.
			var datum = player_data.power;
			if (datum) {
				player.power = parseInt(datum);
			}
			var datum = player_data.integrity;
			if (datum) {
				player.max_integrity = parseInt(datum);
			}
			var datum = player_data.attack_rate;
			if (datum) {
				player.attack_rate = parseInt(datum);
			}
			var datum = player_data.cool_rate;
			if (datum) {
				player.cool_rate = parseInt(datum);
			}
			var datum = player_data.credits;
			if (datum) {
				player.credits = parseInt(datum);
			}

			for (var i = 0; i < player_data.items.length; i++) {
				var datum = parseInt(player_data.items);
				if (player_data.items[i]) {
					purchased[i] = datum;
				}
			}
		}

		elem_mainmenu.fadeOut(100, function() {
			lock = false;
			current_level = wave;
			if (upgrades) {
				draw_upgrades();
				elem_upgrades.fadeIn(100);
			} else {
				start_dialogue(current_level, function() {
					start_wave(current_level);
				});
			}
		});
	}
}

function init() {
	elem_background = $("#background");
	canv_background = elem_background[0];
	ctx_background = canv_background.getContext("2d");
	elem_characters = $("#characters");
	canv_characters = elem_characters[0];
	ctx_characters = canv_characters.getContext("2d");
	elem_projectiles = $("#projectiles");
	canv_projectiles = elem_projectiles[0];
	ctx_projectiles = canv_projectiles.getContext("2d");
	elem_shotscreen = $("#shotscreen");
	canv_shotscreen = elem_shotscreen[0];
	ctx_shotscreen = canv_shotscreen.getContext("2d");
	elem_announcement = $("#announcement");
	canv_announcement = elem_announcement[0];
	ctx_announcement = canv_announcement.getContext("2d");

	init_mainmenu();
	init_upgrades();
	init_dialogue();

	// Dynamically set game screen size.
	//TODO: Fill the display with fullscreen game.
	//var elem_window = $(window);
	//screen_width = elem_window.width();
	//screen_height = elem_window.height();
	screen_width = 480;
	screen_height = 320;
	elem_background.attr({
		"width": screen_width,
		"height": screen_height
	});
	elem_characters.attr({
		"width": screen_width,
		"height": screen_height
	});
	elem_projectiles.attr({
		"width": screen_width,
		"height": screen_height
	});
	elem_shotscreen.attr({
		"width": screen_width,
		"height": screen_height
	});
	elem_announcement.attr({
		"width": screen_width,
		"height": 192
	});
	elem_error.attr({
		"width": screen_width,
		"height": screen_height
	});
	elem_mainmenu.attr({
		"width": screen_width,
		"height": screen_height
	});
	elem_upgrades.attr({
		"width": screen_width,
		"height": screen_height
	});
	elem_upgrades_confirm.attr({
		"width": 380,
		"height": 220
	});
	elem_dialogue.attr({
		"width": screen_width,
		"height": screen_height
	});
	init_error();

	updater = new Timer();
	enemy_spawn = new Timer();

	$.preLoadImages(
	[
		"images/icons.png",
		"images/characters.png",
		"images/background.png",
		"images/alana_kneel.png",
		"images/shield.png",
		"images/projectiles.png",
		"images/alana_dialogue.png",
		"images/sme_dialogue.png"
	], function() {
		draw_mainmenu();
		elem_mainmenu.show();

		player = new Player();

		draw_world();
		draw_upgrades();

		$(window)
			.bind("blur focusout pagehide", function() {
				pause();
			});
		elem_shotscreen
			.bind("mousedown touchstart", function(pos) {
				target = get_coordinates(pos, elem_shotscreen);
				player.shooting = true;
				var coordinates = get_coordinates(pos, elem_shotscreen);
				if (coordinates[0] <= field_x2) {
					target = coordinates;
				} else {
					player.shooting = false;
					player.shielding = true;
				}
				player.attack();
			})
			.bind("mousemove touchmove", function(pos) {
				if (player.shooting || player.shielding) {
					var coordinates = get_coordinates(pos, elem_shotscreen);
					if (coordinates[0] <= field_x2) {
						target = coordinates;
					} else {
						player.shooting = false;
						player.shielding = true;
					}
				}
			})
			.bind("mouseup touchend", function() {
				player.shooting = false;
				player.shielding = false;
			});
			/*.bind("tap", function(pos) {
				if (!player.shooting) {
					target = get_coordinates(pos, elem_shotscreen);
					player.attack();
				}
			});*/
	});
}

window.onload = function() {
	$("canvas").hide();
	init_error();

	// Begin compatibility tests.
	// Test for Canvas support.
	if (Modernizr.canvas) {
		// Test for Canvas text support.
		if (Modernizr.canvastext) {
			force_landscape(function() {
				// Test for localStorage or sessionStorage support.
				if (Modernizr.localstorage) {
					storage = "local";
				} else if (Modernizr.sessionStorage) {
					storage = "session";
				} else {
					warning("Your browser does not support any means of saving and loading games. Your progress cannot be saved.");
				}

				// Test for audio support.
				if (Modernizr.audio) {
					if (storage !== null) {
						var volume = load("sfx_volume");
						if (volume !== undefined) {
							sfx_volume = volume;
						}
						volume = load("music_volume");
						if (volume !== undefined) {
							music_voume = volume;
						}
					}
					//TODO: (optional) Do format checks and support multiple formats (i.e. Ogg, MP3).
				} else {
					sfx_volume = 0.0;
					music_voume = 0.0;
				}

				// Display compatibility test results.
				display_errors(function() {
					// All tests passed. Initialise the game.
					init();
				});
			});
		} else {
			$("#container")
				.css({
					overflow: "visible"
				})
				.html("Your browser does not support text functions in HTML5 Canvas.\
				To play this game, upgrade to a more modern browser which supports \
				HTML5 Canvas text functions.");
		}
	} else {
		$("#container")
			.css({
				overflow: "visible"
			})
			.html("Your browser does not support HTML5 Canvas. To play this game, \
			upgrade to a more modern browser which supports HTML5 Canvas.");
	}
};
