var elem_dialogue = null;
var canv_dialogue = null;
var ctx_dialogue = null;

var dialogue_buttons = new Array();

var text_box_height = null;
var text_box_y = null;

var current_frame = 0;
var current_script = new Array();
var last_speaker = null;

function init_dialogue() {
	elem_dialogue = $("#dialogue");
	canv_dialogue = elem_dialogue[0];
	ctx_dialogue = canv_dialogue.getContext("2d");
}

function start_dialogue(id, onfinish) {
	//TODO: Find more flexible place to set the size and position variables.
	text_box_height = 80;
	text_box_y = screen_height - text_box_height;

	var dialogue = DIALOGUES[id];
	if (dialogue !== undefined) {
		//TODO: (optional) Transition effect to dialogue screen overlay.
		elem_background.stop().fadeTo(100, 0.5);
		elem_characters.stop().fadeTo(100, 0.5);
		elem_projectiles.stop().fadeTo(100, 0.5);
		elem_dialogue.fadeIn(100);

		current_script = dialogue.script;
		current_frame = 0;
		perform_dialogue(dialogue, current_frame);
		elem_dialogue.bind("tap", function(pos) {
			var coordinates = get_coordinates(pos, elem_dialogue);
			var x = coordinates[0];
			var y = coordinates[1];
			var clicked = null;
			for (var i = 0; i < dialogue_buttons.length; i++) {
				var button = dialogue_buttons[i];
				if (x > button.x && x < button.x + button.width
					&& y > button.y && y < button.y + button.height) {
					clicked = button.id;
					break;
				}
			}
			if (clicked !== null) {
				if (clicked == "skip") {
					current_script = null;
					current_frame = 0;
					end_script(onfinish);
				}
			} else {
				if (y > text_box_y && y < text_box_y + text_box_height) {
					if (elem_dialogue.hasClass("ready")) {
						current_frame++;
						if (current_frame < current_script.length) {
							perform_dialogue(dialogue, current_frame);
						} else {
							end_script(onfinish);
						}
					}
				}
			}
		});
	} else {
		onfinish();
	}
}

function end_script(onfinish) {
	elem_dialogue.removeClass("ready");
	ctx_dialogue.clearRect(0, 0, canv_dialogue.width, canv_dialogue.height);
	elem_dialogue.fadeOut(100, function() {
		if ($.isFunction(onfinish)) {
			elem_background.stop().fadeTo(100, 1.0);
			elem_characters.stop().fadeTo(100, 1.0);
			elem_projectiles.stop().fadeTo(100, 1.0);
			onfinish();
		}
	});
}

function perform_dialogue(dialogue, id) {
	dialogue_buttons = new Array();

	elem_dialogue.removeClass("ready");
	var script = dialogue.script;
	var speaker = script[id].actor;
	var speaker_name = ACTOR_META[speaker].name;

	ctx_dialogue.clearRect(0, 0, canv_dialogue.width, canv_dialogue.height);

	// Skip dialogue button
	var x = 210;
	var y = 20;
	var width = 100;
	var height = 40;
	ctx_dialogue.fillStyle = "#1BE02B";
	ctx_dialogue.fillRect(x, y, width, height);
	ctx_dialogue.lineWidth = 6;
	ctx_dialogue.strokeStyle = "#188021";
	ctx_dialogue.strokeRect(x, y, width, height);
	ctx_dialogue.fillStyle = "#111";
	ctx_dialogue.textBaseline = "middle";
	ctx_dialogue.font = '20px sans-serif';
	ctx_dialogue.fillText("Skip", x + (width / 3), y + (height / 2));
	dialogue_buttons.push({
		"x": x,
		"y": y,
		"width": width,
		"height": height,
		"id": "skip"
	});

	// Actor images
	var actors = dialogue.actors;
	var images = new Array();
	for (var i in actors) {
		var img = new Image();
		img.src = ACTOR_META[actors[i]].sprites["default"]; // FIXME: Make this more flexible for multiple sprites.
		images.push(img);
	}
	//TODO: Make semi-transparent the opposite of actors.indexOf(speaker).
	if (speaker == actors[0]) {
		ctx_dialogue.globalAlpha = 0.5;
		ctx_dialogue.drawImage(images[1], 325, 10, 135, 320);
		ctx_dialogue.globalAlpha = 1.0;
		ctx_dialogue.drawImage(images[0], 10, 10, 229, 480);
	} else {
		ctx_dialogue.globalAlpha = 0.5;
		ctx_dialogue.drawImage(images[0], 10, 10, 229, 480);
		ctx_dialogue.globalAlpha = 1.0;
		ctx_dialogue.drawImage(images[1], 325, 10, 135, 320);
	}

	// Dialogue text
	var name_y = text_box_y - 3;
	var speaker_name = ACTOR_META[speaker].name;

	ctx_dialogue.strokeStyle = "#333";
	ctx_dialogue.lineWidth = 20;
	ctx_dialogue.strokeRect(0, text_box_y + 10, canv_dialogue.width, text_box_height - 10);

	ctx_dialogue.textBaseline = "top";
	ctx_dialogue.fillStyle = "#ccc";
	ctx_dialogue.font = '22px sans-serif';

	if (speaker == actors[0]) {
		var name_x = 20;
		ctx_dialogue.fillText(speaker_name, name_x, name_y);
	} else {
		var name_x = 400;
		ctx_dialogue.fillText(speaker_name, name_x, name_y);
	}

	ctx_dialogue.fillStyle = "#888";
	ctx_dialogue.fillRect(10, text_box_y + 20, canv_dialogue.width - 20, text_box_height - 30);

	ctx_dialogue.fillStyle = "#111";
	ctx_dialogue.font = '20px sans-serif';
	ctx_dialogue.fillText(script[id].text, 15, text_box_y + 30);
	elem_dialogue.addClass("ready");
}


var ACTOR_META =
{
	"player":
	{
		"name": "Alana",
		"sprites":
		{
			"default": "images/alana_dialogue.png"
		}
	},
	"rival":
	{
		"name": "S-Merelda",
		"sprites":
		{
			"default": "images/sme_dialogue.png"
		}
	}
};


var DIALOGUES = new Array(
	{
		"actors": ["rival", "player"],
		"script":
		[
			{
				"actor": "rival",
				"text": "Alana, I demand to see you at once."
			},
			{
				"actor": "player",
				"text": "Hey, ask nicely!"
			},
			{
				"actor": "rival",
				"text": "Just do it."
			},
			{
				"actor": "player",
				"text": "Hmph. Then I'm not coming."
			},
			{
				"actor": "rival",
				"text": "Then I'll have you brought here..."
			},
			{
				"actor": "rival",
				"text": "Drones, get her!"
			},
			{
				"actor": "player",
				"text": "Hah! Just try it!"
			},
		]
	}
);
