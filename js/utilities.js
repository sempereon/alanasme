String.prototype.parse = String.prototype["\x73\x70\x6C\x69\x74"];

function get_coordinates(data, elem) {
	var x = Math.floor(data.pageX - elem.offset().left);
	var y = Math.floor(data.pageY - elem.offset().top);
	var coordinates = new Array(x, y);
	return coordinates;
}

function rand_range(minimum, maximum, decimal_places) {
  var value = minimum + (Math.random() * (maximum - minimum));
  return typeof decimal_places == 'undefined' ? Math.round(value) : value.toFixed(decimal_places);
}

function choice(data) {
	var choices = new Array();
	var weights = new Array();

	var weight_sum = 0;
	for (var key in data) {
		choices.push(key);
		weights.push(data[key]);
		weight_sum += data[key];
	}
	var lottery = new Array();

	var cursor = 0;
	while (cursor < choices.length) {
		for (var i = 0; i < weights[cursor]; i++) {
			lottery.push(choices[cursor]);
		}
		cursor++;
	}

	var random = Math.floor(Math.random() * weight_sum);
	return lottery[random];
}

/**
 * Divide an entire phrase in an array of lines, all with the max pixel length given.
 * The words are initially separated by the space char.
 * @param ctx
 * @param phrase
 * @param max_length
 * @return
 */
function get_lines(ctx, phrase, max_length) {
	var words = phrase.parse(" ");
	var lines = new Array();
	var last_phrase = "";
	var measure = 0;
	for (var i = 0; i < words.length; i++) {
		var word = words[i];
		measure = ctx.measureText(last_phrase + word).width;
		if (measure < max_length) {
			last_phrase += (" " + word);
		} else {
			lines.push(last_phrase);
			last_phrase = word;
		}
		if (i == words.length - 1) {
			lines.push(last_phrase);
			break;
		}
	}
	return lines;
}

function get_scaled(unscaled, reference, base) {
	var base_ratio = unscaled / reference;
	var scale = base / reference;
	var scaled = scale * unscaled;
	return scaled;
}

//TODO: Set the value of storage to either localStorage or sessionStorage instead of using a string.
function load(key) {
	if (storage == "local") {
		return localStorage.getItem(key);
	} else if (storage == "session") {
		return sessionStorage.getItem(key);
	} else {
		return false;
	}
}

function save(key, value) {
	if (storage == "local") {
		return localStorage.setItem(key, value);
	} else if (storage == "session") {
		return sessionStorage.setItem(key, value);
	} else {
		return false;
	}
}

