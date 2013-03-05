function start_wave(id) {
	if (!start_wave.lock) {
		start_wave.lock = true;
		current_level = id;
		projectiles = new Array();
		enemies = new Array();
		enemies_remaining = WAVE_META[current_level].enemy_count;
		enemies_spawned = 0;

		save("current_level", current_level);
		save("in_upgrades", "");

		elem_background.fadeIn(100, function() {
			elem_characters.fadeIn(0, function() {
				elem_projectiles.fadeIn(0, function() {
					announce("Wave " + (current_level + 1), function() {
						elem_shotscreen.fadeIn(0, function() {
							enemy_spawn = new Timer();
							enemy_spawn.set_timeout(spawn_enemy, initial_spawn_delay);
							updater = new Timer();
							updater.set_interval(update, REFRESH);
							start_wave.lock = false;
						});
					});
				});
			});
		});
	}
}

function end_wave() {
	save("player:credits", player.credits);
	save("in_upgrades", "true");

	announce("Wave Complete!", function() {
		elem_shotscreen.fadeOut(0, function() {
			elem_characters.fadeOut(0, function() {
				elem_projectiles.fadeOut(0, function() {
					updater.remove();
					elem_background.fadeOut(100, function() {
						draw_upgrades();
						elem_upgrades.fadeIn(100);
					});
				});
			});
		});
	});
}


var WAVE_META = new Array(
	{
		"enemy_count": 1,
		"enemy_weights":
		{
			"LARD": 1
		},
		"spawn_rate_floor": 300,
		"spawn_rate_ceiling": 1000
	},
	{
		"enemy_count": 15,
		"enemy_weights":
		{
			"LARD": 2,
			"DrillDog": 2,
			"HILM": 2,
			"Roller": 2,
			"Quadtank": 2,
			"RamRunner": 2,
			"TopHeavy": 2
		},
		"spawn_rate_floor": 2000,
		"spawn_rate_ceiling": 1000
	}
);
