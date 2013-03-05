var icons = new Image();
icons.src = "images/icons.png";

//FIXME: Figure out a better way to handle icon management; perhaps image management in general.
var ICON_META =
{
	"stats":
	{
		"power":
		{
			"x": 209,
			"y": 50,
			"width": 56,
			"height": 30
		},
		"integrity":
		{
			"x": 267,
			"y": 50,
			"width": 32,
			"height": 30
		},
		"cool_rate":
		{
			"x": 300,
			"y": 50,
			"width": 30,
			"height": 30
		},
		"attack_rate":
		{
			"x": 331,
			"y": 50,
			"width": 30,
			"height": 30
		}
	},
	"weapons":
	{
		"explosive":
		{
			"x": 0,
			"y": 0,
			"width": 40,
			"height": 40
		},
		"pulse":
		{
			"x": 157,
			"y": 0,
			"width": 40,
			"height": 40
		},
		"beam":
		{
			"x": 313,
			"y": 0,
			"width": 40,
			"height": 40
		}
	},

	"upgrades":
	{
		"area_of_effect":
		{
			"x": 52,
			"y": 0,
			"width": 40,
			"height": 40
		},
		"projectile_speed":
		{
			"x": 105,
			"y": 0,
			"width": 40,
			"height": 40
		},
		"rate_of_fire":
		{
			"x": 209,
			"y": 0,
			"width": 40,
			"height": 40
		},
		"spread":
		{ 
			"x": 261,
			"y": 0,
			"width": 40,
			"height": 40
		},
		"projectile_width":
		{
			"x": 365,
			"y": 0,
			"width": 40,
			"height": 40
		},
		"projectile_lifespan":
		{
			"x": 418,
			"y": 0,
			"width": 40,
			"height": 40
		},
		"shield_integrity":
		{
			"x": 469,
			"y": 0,
			"width": 40,
			"height": 40
		},
		"cool_rate":
		{
			"x": 521,
			"y": 0,
			"width": 40,
			"height": 40
		},
		"hmd":
		{
			"x": 572,
			"y": 0,
			"width": 40,
			"height": 40
		}
	},

	"numbers":
	[
		{
			"x": 0,
			"y": 40,
			"width": 33,
			"height": 40
		},
		{
			"x": 35,
			"y": 40,
			"width": 29,
			"height": 40
		},
		{
			"x": 66,
			"y": 40,
			"width": 36,
			"height": 40
		},
		{
			"x": 104,
			"y": 40,
			"width": 34,
			"height": 40
		},
		{
			"x": 140,
			"y": 40,
			"width": 34,
			"height": 40
		},
		{
			"x": 176,
			"y": 40,
			"width": 33,
			"height": 40
		}
	]
};
