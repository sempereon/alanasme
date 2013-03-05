var timers = new Array(); // Holds all the timers in the game.


function Timer() {
	this.id = null ;
	this.repeat = null;
	this.func = null;
	this.interval = null;
	this.start_time = null;
	this.pause_time = null;
	timers.push(this);

	this.set_timeout = function(func, overflow) {
		if (!this.id) {
			this.repeat = 0;
			this.func = func;
			this.interval = overflow;
			var thisref = this;
			this.id = window.setTimeout(function() {
				func();
				thisref.remove();
			}, overflow);
			this.start_time = (new Date()).getTime();
		}
	};

	this.set_interval = function(func, overflow) {
		if (!this.id) {
			this.repeat = 1;
			this.func = func;
			var func2 = function(instance) {
				func();
				instance.start_time = (new Date()).getTime();
			};
			var thisref = this;
			this.interval = overflow;
			this.id = window.setInterval(function() {
				func2(thisref);
			}, overflow);
			this.start_time = (new Date()).getTime();
		}
	};

	this.remove = function() {
		if (this.repeat) {
			window.clearInterval(this.id);
		} else {
			window.clearTimeout(this.id);
		}
		this.id = null;
	};

	this.pause = function() {
		if (!this.pause_time) {
			if (this.id) {
				this.pause_time = (new Date()).getTime();
				this.remove();
			}
		}
	};

	this.resume = function() {
		if (this.pause_time) {
			var delta = this.pause_time - this.start_time;
			if (this.repeat) {
				var thisref = this;
				(new Timer()).set_timeout(function() {
					thisref.set_interval(thisref.func, thisref.interval);
				}, delta);
			} else {
				this.set_timeout(this.func, delta);
			}
			this.pause_time = null;
		}
	};
}

