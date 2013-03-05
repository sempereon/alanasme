var projectiles = new Array();

function spawn_projectile(shooter, type, origin, target) {
	var weapon = WEAPON_META[type];
	if (weapon !== undefined) {
		var projectile = new weapon["class"]();
		projectile.shooter = shooter;
		projectile.origin = origin;
		projectile.dest_x = target[0];
		projectile.dest_y = target[1];
		return projectile;
	} else {
		return null;
	}
}


function Projectile() { //TODO: Set valid targets.
	this.id = null;
	this.type = null;
	this.state = "default";
	this.frame = 0;
	this.image = new Image();
	this.shooter = null;
	this.origin = null;
	this.loc_x = null;
	this.loc_y = null;
	this.dest_x = null;
	this.dest_y = null;
	this.width = 10;
	this.height = 10;
	this.speed = 1000; // pixels per second
	this.velocity = null;
	this.heat = 0.1;

	this.load_metadata = function() {
		var metadata = WEAPON_META[this.type];
		if (metadata !== undefined) {
			this.metadata = metadata;
			if (metadata.sprites) {
				this.sprites = metadata.sprites;
				this.image.src = this.sprites.sheet;
			}
			return metadata;
		} else {
			return false;
		}
	};

	this.draw = function(ctx) {
		if (this.sprites !== undefined) {
			var sprite_data = this.sprites;
			var sprite = sprite_data[this.state][this.frame];
			ctx.drawImage(this.image, sprite.x, sprite.y, sprite.width, sprite.height, this.loc_x - (sprite.width * 0.5), this.loc_y - (sprite.height * 0.5), sprite.width, sprite.height);
		} else {
			ctx.fillStyle = "#ff0";
			ctx.fillRect(this.loc_x - (this.width * 0.5), this.loc_y - (this.height * 0.5), this.width, this.height);
		}
	};

	this.calculate_velocity = function() {
		this.loc_x = this.origin[0];
		this.loc_y = this.origin[1];
		var vector = new Array(this.dest_x - this.origin[0], this.dest_y - this.origin[1]);
		var vector_length = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
		if (vector_length > 0) {
			vector = [vector[0] / vector_length * this.speed * SPF, vector[1] / vector_length * this.speed * SPF];
			this.velocity = vector;
		}
	};

	this.launch = function() {
		this.id = projectiles.length;
		this.calculate_velocity();
		projectiles.push(this);
	};

	this.update = function() {
		this.loc_x += this.velocity[0];
		this.loc_y += this.velocity[1];
		if (this.loc_x < 0 || this.loc_y < 0
			|| this.loc_x > screen_width || this.loc_y > screen_height) {
			delete projectiles[this.id];
		} else {
			/*NOTE: Uncomment the commented lines below to require projectiles
			 *      to reach their destinations before running impact checks.
			 */
			//if (this.loc_x < this.dest_y) {
			//	this.location = this.destination;
			//}
			//if (this.location == this.destination) {
				var centre = new Array(this.loc_x + (this.width * 0.5), this.loc_y + (this.height * 0.5));
				for (var j = 0; j < enemies.length; j++) {
					var enemy = enemies[j];
					if (enemy !== undefined) {
						if (enemy.x < centre[0] && enemy.x + enemy.width >= centre[0]
							&& enemy.y < centre[1] && enemy.y + enemy.height > centre[1]) {
								var power = this.shooter.power;
								enemy.damage(power);
								delete projectiles[this.id];
								break;
						}
					}
				}
			//delete projectiles[this.id];
		//}
		}
	};
}


function Pulse() {
	this.type = "Pulse";
	this.load_metadata();

	/*//TODO: Make this upgrade detection system better.
	var bonus1_level = purchased[0][0];
	if (bonus1_level > 0) {
		var bonus1 = UPGRADE_META[0].items[0].levels[bonus1_level].value;
		if (bonus1 > 0) {
			this.attack_rate += bonus1;
		}
	}*/
}
Pulse.prototype = new Projectile();

function Beam() {
	this.type = "Beam";
	this.load_metadata();
}
Beam.prototype = new Projectile();

function Explosive() {
	this.type = "Explosive";
	this.load_metadata();
}
Explosive.prototype = new Projectile();


var WEAPON_META =
{
	"Pulse":
	{
		"class": Pulse,
		"icon": ICON_META.weapons.pulse,
		"sprites":
		{
			"sheet": "images/projectiles.png",
			"default":
			[
				{
					"x": 86,
					"y": 146,
					"width": 39,
					"height": 20
				}
			]
		},
		"power": 10,
		"attack_rate": 5
	},
	"Beam":
	{
		"class": Beam,
		"icon": ICON_META.weapons.beam,
		"sprites":
		{
			"sheet": "images/projectiles.png",
			"default":
			[
				{
					"x": 186,
					"y": 0,
					"width": 558,
					"height": 55
				},
				{
					"x": 186,
					"y": 56,
					"width": 558,
					"height": 55
				},
				{
					"x": 186,
					"y": 112,
					"width": 558,
					"height": 55
				}
			]
		},
		"power": 20,
		"attack_rate": 1
	},
	"Explosive":
	{
		"class": Explosive,
		"icon": ICON_META.weapons.explosive,
		"sprites":
		{
			"default":
			[
				{
					"x": 81,
					"y": 103,
					"width": 41,
					"height": 40
				}
			],
			"detonate":
			[
				{
					"x": 39,
					"y": 0,
					"width": 102,
					"height": 100
				}
			]
		},
		"power": 100,
		"attack_rate": 0.5
	},
	"Quadtank":
	{
		"sprites":
		{
			"default":
			[
				{
					"x": 0,
					"y": 0,
					"width": 35,
					"height": 62
				}
			]
		}
	},
	"TopHeavy":
	{
		"sprites":
		{
			"default":
			[
				{
					"x": 0,
					"y": 0,
					"width": 35,
					"height": 62
				}
			]
		}
	}
};
