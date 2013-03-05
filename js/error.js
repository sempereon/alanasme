var elem_error = null;
var canv_error = null;
var ctx_error = null;

var warning_queue = new Array();
var error_queue = new Array();
var clickable = false;

function init_error() {
	elem_error = $("#error");
	canv_error = elem_error[0];
	ctx_error = canv_error.getContext("2d");
	ctx_error.fillStyle = "#fff";
}

function warning(text) {
	warning_queue.push(text);
}

function error(text) {
	error_queue.push(text);
}

function display_warning(callback) {
	if (warning_queue.length > 0) {
		ctx_error.clearRect(0, 0, canv_error.width, canv_error.height);
		ctx_error.font = "bold 34px sans-serif";
		ctx_error.fillText("Warning", 150, 60);
		ctx_error.font = "22px sans-serif";
		var lines = get_lines(ctx_error, warning_queue[0], 280);
		for (var i = 0; i < lines.length; i++) {
			ctx_error.fillText(lines[i], 100, (30 * i) + 125);
		}
		ctx_error.font = "18px sans-serif";
		ctx_error.fillText("Tap to continue.", 150, 300);
		clickable = true;
		elem_error.fadeIn(100, function() {
			elem_error.bind("tap mouseup", function() {
				if (clickable) {
					clickable = false;
					elem_error.fadeOut(100, function() {
						warning_queue.splice(0, 1);
						display_warning(callback);
					});
				}
			});
		});
	} else {
		if ($.isFunction(callback)) {
			callback();
		}
	}
}

function display_errors(callback) {
	if (error_queue.length > 0) {
		ctx_error.clearRect(0, 0, canv_error.width, canv_error.height);
		ctx_error.font = "bold 34px sans-serif";
		ctx_error.fillText("Error", 150, 60);
		ctx_error.font = "22px sans-serif";
		var lines = get_lines(ctx_error, error_queue[0], 280);
		for (var i = 0; i < lines.length; i++) {
			ctx_error.fillText(lines[i], 100, (30 * i) + 125);
		}
	} else {
		display_warning(callback);
	}
}

function display_pause() {
	ctx_error.clearRect(0, 0, canv_error.width, canv_error.height);
	ctx_error.font = "bold 34px sans-serif";
	ctx_error.fillText("Paused", 150, 120);
	ctx_error.font = "18px sans-serif";
	ctx_error.fillText("Tap to resume.", 150, 300);
	clickable = true;
	elem_error.fadeIn(100, function() {
		elem_error.bind("tap", function() {
			if (clickable) {
				clickable = false;
				elem_error.fadeOut(100, function() {
					resume();
				});
			}
		});
	});
}

function force_landscape(callback) {
	if ($("html").hasClass("portrait")) {
		ctx_error.clearRect(0, 0, canv_error.width, canv_error.height);
		ctx_error.font = "bold 34px sans-serif";
		ctx_error.fillText("Warning", 150, 60);
		ctx_error.font = "22px sans-serif";
		var lines = get_lines(ctx_error, "Your display is in portrait orientation. To play this game, rotate the device into landscape orientation.", 280);
		for (var i = 0; i < lines.length; i++) {
			ctx_error.fillText(lines[i], 100, (30 * i) + 125);
		}
		ctx_error.font = "18px sans-serif";
		ctx_error.fillText("Rotate to continue.", 150, 300);
		elem_error.fadeIn(100, function() {
			$(document).bind("orientationchange", function(orientation) {
				if (orientation == "landscape") {
					$(document).unbind("orientationchange");
					$(document).bind("orientationchange", function() {
						force_landscape();
					});
					if ($.isFunction(callback)) {
						callback();
					}
				}
			});
		});
	} else if ($("html").hasClass("landscape")) {
		if ($.isFunction(callback)) {
			callback();
		}
	}
}
