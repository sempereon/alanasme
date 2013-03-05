var enemies = new Array();

function spawn_enemy() {
	var wave = WAVE_META[current_level];
	var random_enemy = choice(wave.enemy_weights);
	var enemy = new CHARACTER_META[random_enemy]["class"]();
	enemy.spawn(); 
	enemies_spawned++;
	enemies_remaining--;
	if (enemies_remaining > 0) {
	var timeout_floor = wave.spawn_rate_floor; 
	var timeout_ceiling = wave.spawn_rate_ceiling; 
	var timeout = rand_range(timeout_ceiling, timeout_floor); 
	enemy_spawn = new Timer();
	enemy_spawn.set_timeout(spawn_enemy, timeout);
	} else {
		enemy_spawn.remove();
	}
}


function Character() {
	this.name = null;
	this.state = "default";
	this.frame = 0;
	this.image = new Image();
	this.sounds = new Array();
	this.max_integrity = null;
	this.integrity = this.max_integrity;
	this.power = null;
	this.may_attack = true;
	this.attack_rate = null; // Shots per second.
	this.x = null;
	this.y = null;
	this.z = null;
	this.width = null;
	this.height = null;
	this.loot = 0; // Credits earned by victor in battle.

	this.load_metadata = function() {
		var metadata = CHARACTER_META[this.name];
		if (metadata !== undefined) {
			this.metadata = metadata;
			if (metadata.sprites) {
				this.sprites = metadata.sprites;
				this.image.src = this.sprites.sheet;
			}
			if (metadata.attack_range) {
				this.attack_range = metadata.attack_range;
			}
			if (metadata.power) {
				this.power = metadata.power;
			}
			if (metadata.move_speed) {
				this.move_speed = metadata.move_speed;
			}
			if (metadata.attack_rate) {
				this.attack_rate = metadata.attack_rate;
			}
			if (metadata.attack_duration) {
				this.attack_duration = metadata.attack_duration;
			}
			if (metadata.loot) {
				this.loot = metadata.loot;
			}
			if (metadata.width) {
				this.width = metadata.width;
			}
			if (metadata.height) {
				this.height = metadata.height;
			}
			return metadata;
		} else {
			return false;
		}
	};
	this.update = function() {
	};
	this.draw = function(ctx) {
		var sprite_data = this.sprites;
		var sprite = sprite_data[this.state][this.frame];
		ctx.drawImage(this.image, sprite.x, sprite.y, sprite.width, sprite.height,
			this.x, this.y, this.width, this.height);
	};
	this.move = function() {
	};
	this.attack = function() {
	};
	this.damage = function(power) {
		this.integrity -= power;
		if (this.integrity <= 0) {
			if (this.sprites.defeat !== undefined) {
				this.state = "defeat";
				this.frame = 0;
			} else {
				this.destruct();
			}
		}
	};
	this.destruct = function() {
	};
}


function Player() {
	this.name = "Alana";
	this.load_metadata();
	this.shield = new Character();
	this.shield.name = "Shield";
	this.shield.load_metadata();

	this.max_integrity_base = 250;
	this.max_integrity = this.max_integrity_base;
	this.credits = 12000;
	this.heat = 0.0; // Heat rating; 1.0 overheats.
	this.cool_rate_base = 0.2;
	this.cool_rate = this.cool_rate_base; // How much heat rating reduces per second.
	this.overheating = false;
	this.heat_tolerance = 0.7; // How much heat will permit operation again after overheating.
	this.select_weapon("Pulse"); // Which weapon is currently active.
	this.may_attack = true;
	this.shooting = false;
	this.shot_cooldown = new Timer();

	this.x = 380;
	this.y = 150;
	this.shield.x = this.x - (this.x / 5);
	this.shield.y = this.y - (this.y / 2);
	this.shield.z = this.shield.y + (this.shield.height / 2);
}
Player.prototype = new Character();
Player.prototype.select_weapon = function(id) {
	var metadata = WEAPON_META[id];
	if (metadata) {
		this.weapon = id;
		this.update_stats();
	}
};
Player.prototype.update_stats = function() {
	var weapon_metadata = WEAPON_META[this.weapon];
	this.power = weapon_metadata.power;
	this.attack_rate = weapon_metadata.attack_rate;

	for (var type in UPGRADE_META) {
		if (type == this.weapon || type == "Miscellaneous") {
			var upgrades = UPGRADE_META[type].items;
			for (var i = 0; i < upgrades.length; i++) {
				var level = get_level(type, i);
				if (level >= 0 && level < upgrades[i].levels.length) {
					var effect = get_effect(type, i, level);
					switch (effect[0]) {
						case "attack_rate":
							this.attack_rate += effect[1];
							break;
						case "max_integrity":
							this.max_integrity = this.max_integrity_base + effect[1];
							break;
						case "cool_rate":
							this.cool_rate = this.cool_rate_base + effect[1];
							break;
					}
				}
			}
		}
	}
};
Player.prototype.attack = function() {
	if (target[0] <= field_x2 && target[1] <= field_y2 && target[1] >= field_y1) {
		if (!this.overheating) {
			if (this.shooting) {
				// Handle shield deboosting.
				if (this.shield.state == "boost") {
					if (this.shield.frame > 0) {
						this.shield.frame--;
					} else {
						this.shield.state = "default";
					}
				}
				if (this.may_attack) {
					var projectile = spawn_projectile(this, this.weapon, [380, 200], [target[0], target[1]]);
					this.heat += projectile.heat;
					if (this.heat > 1.0) {
						this.heat = 1.0;
					}
					if (this.heat < 1.0) {
						this.may_attack = false;
						var thisref = this;
						this.shot_cooldown.set_timeout(function() {
							if (thisref.shooting) {
								thisref.attack();
							} else {
								thisref.may_attack = true;
							}
						}, 1000 / thisref.attack_rate);
						projectile.launch();
					} else {
						this.overheating = true;
						console.log("Overheating!");
					}
				}
			} else if (this.shielding) {
				console.log("Shielding");
				//TODO: Heat up gradually.
				if (this.shield.state != "boost") {
					this.shield.state = "boost";
					this.shield.frame = 0;
				} else {
					if (this.shield.frame + 1 < this.sprites["boost"].length) {
						this.shield.frame++;
					}
				}
			}
		}
	}
};
Player.prototype.destruct = function() {
	announce("Failure", function() {
		$(canvas).fadeOut(100, init);
	});
};


function Enemy() {
	this.name = "Drone";
	this.moving = true;
	this.move_speed = 2; // pixels per second
	this.attack_range = 0; // pixels

	this.shot_cooldown = new Timer();
	this.attack_timer = new Timer();
	this.attacking = false;
}
Enemy.prototype = new Character();
Enemy.prototype.spawn = function() {
	this.id = enemies.length;
	enemies.push(this);
	enemies_moving.push(this);
	this.x = -1 * this.width;
	var yrand = rand_range(field_y1, field_y2 - this.height);
	//this.y = ground_y - this.height;
	this.y = yrand;
	this.z = yrand + this.height;
};
Enemy.prototype.update = function() {
	if (this.moving) {
		this.move();
	} else if (this.state == "defeat") {
		this.frame++;
		if (this.frame >= this.sprites.defeat.length) {
			this.destruct();
		}
	} else {
		this.attack();
	}
};
Enemy.prototype.move = function() {
	var front = this.x + this.width;
	var destination = player.shield.x - this.attack_range;
	var delta = Math.ceil(this.move_speed / FPS);
	if (front + delta <= destination) {
		this.x += delta;
		this.frame++;
		if (this.frame >= this.sprites[this.state].length) {
			this.frame = 0;
		}
	} else {
		if (front < destination) {
			this.x = destination - this.width;
		}
		this.state = "default";
		this.frame = 0;
		this.moving = false;
	}
};
Enemy.prototype.attack = function() {
	if (this.may_attack) {
		if (this.sprites.attack !== undefined) {
			this.state = "attack";
			this.frame = 0;
		}
		this.may_attack = false;
		this.attacking = true;
		var thisref = this;
		this.attack_timer.set_timeout(function() {
			thisref.state = "default";
			thisref.frame = 0;
			thisref.attacking = false;
			thisref.shot_cooldown.set_timeout(function() {
				thisref.may_attack = true;
			}, thisref.attack_rate * 1000);
		}, thisref.attack_duration * 1000);
	} else if (this.attacking) {
		if (this.state == "attack") {
			this.frame++;
			if (this.frame >= this.sprites.attack.length) {
				this.frame = 0;
			}
		}
	}
};
Enemy.prototype.destruct = function() {
	player.credits += this.loot;
	delete enemies[this.id];
	enemies_spawned--;
	if (enemies_remaining == 0 && enemies_spawned == 0) {
		end_wave();
	}
};


function LARD() {
	this.name = "LARD";
	this.load_metadata();

	this.hover_delta = 0;
	this.change_hover = 0;
	this.y1 = 10;
	this.y2 = screen_height - this.height - 10;
	this.ymid = (this.y1 + this.y2) / 2;
	this.hover_speed = this.move_speed * 2;
}
LARD.prototype = new Enemy();
/*LARD.prototype.move = function() {
	var front = this.x + this.width;
	var destination = player.shield.x - this.attack_range;
	if (front != destination) {
		var delta = this.move_speed * SPF;
		if (front + delta <= destination) {
			this.x += delta;
		} else {
			if (front < destination) {
				this.x = destination - this.width;
			}
			this.moving = false;
		}
	}*/

	//FIXME: Hovering is borked.
	// Hovering
	/*if (this.change_hover == 0) {
		var normalised_offset = -1 * ((this.ymid - this.y) / this.ymid);
		if (this.normalised_offset == 0) {
			var floor = -10;
			var ceil = 10;
		} else if (this.normalised_offset > 0) {
			var floor = this.hover_speed - (this.hover_speed * (-1 * normalised_offset));
			var ceil = this.hover_speed * (-1 * normalised_offset);
		} else {
			var floor = this.hover_speed * (-1 * normalised_offset);
			var ceil = this.hover_speed - (this.hover_speed * (-1 * normalised_offset));
		}
		this.hover_delta = rand_range(floor, ceil, 4);
		this.change_hover = rand_range(FPS / 4, FPS / 2);
	} else {
		this.change_hover--;
	}
	this.y += (this.hover_delta * this.move_speed) / FPS;
	if (this.y < this.y1) {
		this.y = this.y1;
		this.change_hover = 0;
	} else if (this.y > this.y2) {
		this.y = this.y2;
		this.change_hover = 0;
	}*/
//};
LARD.prototype.attack = function() {
	if (this.may_attack) {
		var projectile = spawn_projectile(this, "Pulse", [this.x + this.width, this.y + (this.height / 2)], [player.x, player.y]);
		projectile.launch();

		this.may_attack = false;
		var thisref = this;
		this.shot_cooldown.set_timeout(function() {
			thisref.may_attack = true;
		}, 1000 / thisref.attack_rate);
		
	}
};


function DrillDog() {
	this.name = "DrillDog";
	this.load_metadata();
	this.state = "move";
};
DrillDog.prototype = new Enemy();


function HILM() {
	this.name = "HILM";
	this.load_metadata();
	this.state = "move";

	this.shot_cooldown = new Timer();
	this.attack_timer = new Timer();
	this.attacking = false;

}
HILM.prototype = new Enemy();


function Roller() {
	this.name = "Roller";
	this.load_metadata();
	this.state = "move";

}
Roller.prototype = new Enemy();


function Quadtank() {
	this.name = "Quadtank";
	this.load_metadata();
	this.state = "move";
}
Quadtank.prototype = new Enemy();


function RamRunner() {
	this.name = "RamRunner";
	this.load_metadata();
}
RamRunner.prototype = new Enemy();
RamRunner.prototype.attack = function() {
	player.damage(this.power);
	this.state = "defeat";
	console.log(this.state);
	this.frame = 0;
};


function TopHeavy() {
	this.name = "TopHeavy";
	this.load_metadata();
}
TopHeavy.prototype = new Enemy();
TopHeavy.prototype.attack = function() {
	if (this.attacking) {
		if (!this.may_attack) {
			this.frame++;
			if (this.frame >= this.sprites.attack.length) {
				var thisref = this;
				this.attack_timer.set_timeout(function() {
					this.may_attack = true;
				}, 1000 / this.attack_duration);
			}
		} else {
			this.frame--;
			if (this.frame <= 0) {
				this.shot_cooldown.set_timeout(function() {
					this.attacking = false;
				});
			}
		}
	} else {
		if (this.may_attack) {
			this.attacking = true;
			var projectile = spawn_projectile(this, "TopHeavy", [this.x + this.width, this.y + (this.height / 2)], [player.x, player.y]);
			projectile.launch();
		}
	}
};


//FIXME (CRITICAL): Set scale in metadata rather than static width and height.
//var CHARACTER_META = $.getJSON("character_meta.json");
var CHARACTER_META =
{
	"Alana":
	{
		"class": Player,
		"sprites":
		{
			"sheet": "images/alana_kneel.png",
			"default":
			[
				{
					"x": 0,
					"y": 0,
					"width": 103,
					"height": 100
				}
			]
		},
		"width": 103,
		"height": 100
	},
	"Shield": // Meta-character representing Alana's shield.
	{
		"sprites":
		{
			"sheet": "images/shield.png",
			"default":
			[
				{
					"x": 0,
					"y": 0,
					"width": 185,
					"height": 240
				}
			],
			"boost":
			[
				{
					"x": 0,
					"y": 0,
					"width": 185,
					"height": 240
				},
				{
					"x": 191,
					"y": 0,
					"width": 185,
					"height": 240
				},
				{
					"x": 381,
					"y": 0,
					"width": 185,
					"height": 240
				}
			]
		},
		"width": 185,
		"height": 240
	},
	"LARD":
	{
		"class": LARD,
		"sprites":
		{
			"sheet": "images/characters.png",
			"default":
			[
				{
					"x": 0,
					"y": 0,
					"width": 75,
					"height": 40
				}
			],
			"attack":
			[
				{
					"x": 76,
					"y": 0,
					"width": 77,
					"height": 40
				}
			]
		},
		"width": 54,
		"height": 30,
		"attack_range": 50,
		"power": 5,
		"move_speed": 30,
		"attack_rate": 4, // -1 = constant attack
		"attack_duration": -1,
		"loot": 100
	},
	"DrillDog":
	{
		"class": DrillDog,
		"sprites":
		{
			"sheet": "images/characters.png",
			"move":
			[
				{
					"x": 0,
					"y": 45,
					"width": 79,
					"height": 60
				},
				{
					"x": 81,
					"y": 45,
					"width": 79,
					"height": 60
				}
			],
			"attack_head":
			[
				{
					"x": 161,
					"y": 48,
					"width": 81,
					"height": 57
				},
				{
					"x": 244,
					"y": 48,
					"width": 81,
					"height": 57
				}
			],
			"attack_tail":
			[
				{
					"x": 327,
					"y": 58,
					"width": 86,
					"height": 47
				},
				{
					"x": 415,
					"y": 58,
					"width": 86,
					"height": 47
				}
			]
		},
		"loot": 200
	},
	"HILM":
	{
		"class": HILM,
		"sprites":
		{
			"sheet": "images/characters.png",
			"default":
			[
				{
					"x": 0,
					"y": 120,
					"width": 59,
					"height": 60
				}
			],
			"move":
			[
				{
					"x": 64,
					"y": 120,
					"width": 73,
					"height": 60
				},
				{
					"x": 141,
					"y": 120,
					"width": 73,
					"height": 60
				}
			],
			"attack":
			[
				{
					"x": 218,
					"y": 110,
					"width": 107,
					"height": 70
				},
				{
					"x": 330,
					"y": 110,
					"width": 90,
					"height": 70
				},
				{
					"x": 424,
					"y": 110,
					"width": 90,
					"height": 70
				}
			]
		},
		"width": 50,
		"height": 50,
		"attack_range": 0,
		"power": 15,
		"move_speed": 80,
		"attack_rate": 3, // Seconds of pausing between attacks.
		"attack_duration": 2, // Seconds of attacking between pauses.
		"loot": 300
	},
	"Roller":
	{
		"class": Roller,
		"sprites":
		{
			"sheet": "images/characters.png",
			"default":
			[
				{
					"x": 0,
					"y": 185,
					"width": 64,
					"height": 80
				}
			],
			"move":
			[
				{
					"x": 0,
					"y": 185,
					"width": 64,
					"height": 80
				},
				{
					"x": 70,
					"y": 185,
					"width": 64,
					"height": 80
				},
				{
					"x": 140,
					"y": 185,
					"width": 64,
					"height": 80
				}
			],
			"attack":
			[
				{
					"x": 210,
					"y": 185,
					"width": 72,
					"height": 83
				},
				{
					"x": 285,
					"y": 185,
					"width": 64,
					"height": 80
				}
			]
		},
		"width": 47,
		"height": 60,
		"attack_range": 100,
		"power": 5,
		"move_speed": 100,
		"attack_rate": 3,
		"attack_duration": 2,
		"loot": 400
	},
	"Quadtank":
	{
		"class": Quadtank,
		"sprites":
		{
			"sheet": "images/characters.png",
			"default":
			[
				{
					"x": 0,
					"y": 283,
					"width": 106,
					"height": 100
				}
			],
			"move":
			[
				{
					"x": 0,
					"y": 273,
					"width": 106,
					"height": 100
				},
				{
					"x": 110,
					"y": 273,
					"width": 108,
					"height": 99
				}
			],
			"attack":
			[
				{
					"x": 222,
					"y": 273,
					"width": 113,
					"height": 102
				},
				{
					"x": 340,
					"y": 273,
					"width": 121,
					"height": 110
				},
				{
					"x": 465,
					"y": 273,
					"width": 117,
					"height": 104
				}
			]
		},
		"width": 121,
		"height": 110,
		"attack_range": 150,
		"power": 30,
		"move_speed": 30,
		"attack_rate": 5,
		"attack_duration": 1,
		"loot": 800
	},
	"RamRunner":
	{
		"class": RamRunner,
		"sprites":
		{
			"sheet": "images/characters.png",
			"default":
			[
				{
					"x": 0,
					"y": 439,
					"width": 109,
					"height": 80
				}
			],
			"defeat":
			[
				{
					"x": 113,
					"y": 388,
					"width": 167,
					"height": 139
				},
				{
					"x": 340,
					"y": 273,
					"width": 67,
					"height": 69
				}
			]
		},
		"width": 109,
		"height": 80,
		"attack_range": -1,
		"power": 50,
		"move_speed": 150,
		"attack_rate": 0,
		"attack_duration": 0,
		"loot": 1000
	},
	"TopHeavy":
	{
		"class": TopHeavy,
		"sprites":
		{
			"sheet": "images/characters.png",
			"default":
			[
				{
					"x": 0,
					"y": 535,
					"width": 103,
					"height": 140
				}
			],
			"attack":
			[
				{
					"x": 107,
					"y": 532,
					"width": 91,
					"height": 143
				},
				{
					"x": 202,
					"y": 535,
					"width": 110,
					"height": 140
				},
				{
					"x": 317,
					"y": 569,
					"width": 110,
					"height": 106
				}
			]
		},
		"width": 103,
		"height": 140,
		"attack_range": 200,
		"power": 40,
		"move_speed": 20,
		"attack_rate": 10,
		"attack_duration": 1,
		"loot": 900
	}
}
