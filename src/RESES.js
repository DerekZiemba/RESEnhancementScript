/// <reference path="styler.js" />
/*global unsafeWindow */ //for greasemonkey
/*global DOMTokenList */


"use strict";

const RESES = window.RESES = (unsafeWindow | window).RESES = {
	extendType: (function () {
		const defProp = Object.defineProperty;
		const assign = Object.assign;

		function defineOne(proto, name, prop, options, obj) {
			if (name in proto) {
				if (options.override) {
					defProp(proto, name, prop);
				} else if (options.merge) {
					var target = proto[name];
					var src = obj[name];
					extendType(target, src, options);
				}
			} else {
				defProp(proto, name, prop);
			}
		}
		function defineSeveral(proto, name, prop, options, obj) {
			for (var i = 0, len = proto.length; i < len; i++) {
				defineOne(proto[i], name, prop, options, obj);
			}
		}

		function extendType(proto, obj, options) { //jshint ignore:line
			if (!options) { options = { enumerable: false, configurable: undefined, writable: undefined, override: true, merge: false }; }
			var define = proto instanceof Array ? defineSeveral : defineOne;
			var descriptors = Object.getOwnPropertyDescriptors(obj);

			for (var name in descriptors) {
				var opts = options.hasOwnProperty(name) ? assign({}, options, options[name]) : options;
				var prop = descriptors[name];

				prop.enumerable = opts.enumerable ? true : false;
				if (opts.configurable === false) { prop.configurable = false; } else if (opts.configurable === true) { prop.configurable = true; }
				if ('value' in prop) {
					if (opts.writable === false) { prop.writable = false; } else if (opts.writable === true) { prop.writable = true; }
				}

				define(proto, name, prop, opts, obj);
			}
		}
		return extendType;
	}()),

	Color: (function () {
		function toHex(num, padding) { return num.toString(16).padStart(padding || 2); }
		function parsePart(value) {
			var perc = value.lastIndexOf('%');
			return perc < 0 ? value : value.substr(0, perc);
		}
		function Color(data) {
			if (arguments.length > 1) {
				this[0] = arguments[0];
				this[1] = arguments[1];
				this[2] = arguments[2];
				if (arguments.length > 3) { this[3] = arguments[3]; }
			} else if (data instanceof Color || Array.isArray(data)) {
				this[0] = data[0];
				this[1] = data[1];
				this[2] = data[2];
				this[3] = data[3];
			} else if (typeof data === "string") {
				data = data.trim();
				if (data[0] === '#') {
					switch (data.length) {
						case 4:
							this[0] = parseInt(data[1], 16); this[0] = (this[0] << 4) | this[0];
							this[1] = parseInt(data[2], 16); this[1] = (this[1] << 4) | this[1];
							this[2] = parseInt(data[3], 16); this[2] = (this[2] << 4) | this[2];
							break;
						case 9:
							this[3] = parseInt(data.substr(7, 2), 16); //jshint ignore:line
						case 7:
							this[0] = parseInt(data.substr(1,2), 16);
							this[1] = parseInt(data.substr(3,2), 16);
							this[2] = parseInt(data.substr(5,2), 16);
							break;
					}
				} else if (data.startsWith("rgb")) {
					var parts = data.substr(data[3] === "a" ? 5 : 4, data.length - (data[3] === "a" ? 6 : 5)).split(',');
					this.r = parsePart(parts[0]);
					this.g = parsePart(parts[1]);
					this.b = parsePart(parts[2]);
					if (parts.length > 3) { this.a = parsePart(parts[3]); }
				}
			}
		}
		Color.prototype = {
			constructor: Color,
			0: 255,
			1: 255,
			2: 255,
			3: 255,
			get r() { return this[0];	},
			set r(value) { this[0] = value == null ? 0 : Math.max(Math.min(parseInt(value), 255), 0); },
			get g() { return this[1];	},
			set g(value) { this[1] = value == null ? 0 : Math.max(Math.min(parseInt(value), 255), 0); },
			get b() { return this[2];	},
			set b(value) { this[2] = value == null ? 0 : Math.max(Math.min(parseInt(value), 255), 0); },
			get a() { return this[3] / 255;	},
			set a(value) { this[3] = value == null ? 255 : Math.max(Math.min(value > 1 ? value : parseFloat(value) * 255, 255), 0); },
			get luma() { return .299 * this.r + .587 * this.g + .114 * this.b; },
			get inverted() { return new Color(255-this[0], 255-this[1], 255-this[2], this[3]); },
			toString: function (option) {
				if (option === 16) {
					return '#' + toHex(this.r) + toHex(this.g) + toHex(this.b) + (this[3] === 255 ? '' : toHex(this[3]));
				} else if (option === '%') {
					if (this.a !== 1) {
						return `rgba(${this.r/255*100}%, ${this.b/255*100}%, ${this.g/255*100}%, ${this.a/255})`;
					} else {
						return `rgb(${this.r/255*100}%, ${this.b/255*100}%, ${this.g/255*100})%`;
					}
				} else {
					if (this.a !== 1) {
						return `rgba(${this.r}, ${this.b}, ${this.g}, ${this.a})`;
					} else {
						return `rgb(${this.r}, ${this.b}, ${this.g})`;
					}
				}
			}
		};

		return Color;
	}()),

	getNonStandardWindowProperties: function getNonStandardWindowProperties(bAsArray) {
		var iframe = document.createElement('iframe'); iframe.style.display = 'none';
		document.body.appendChild(iframe);
		var result = Object.getOwnPropertyNames(window).filter(name => !iframe.contentWindow.hasOwnProperty(name));
		if (!bAsArray) {
			result = result.reduce((dict, name) => { dict[name] = window[name]; return dict; }, {});
		}
		document.body.removeChild(iframe);
		return result;
	},

	/** requestAnimationFrame doesn't work when the tab is in the background. This ensures the operation will happen regardless. */
	doAsync: function doAsync(func) {
		if (document.hidden) {
			window.setTimeout(func, 0);
		} else {
			window.requestAnimationFrame(func);
		}
	},

	/** deboucnes redundant calls that will happen in the same animation frame */
	debounceMethod: (() => {
		const wm = new WeakMap();

		class Operation {
			constructor(method) {
				this.func = () => {
					method();
					wm.delete(method);
				};
				this.timer = 0 | 0;
				this.hidden = false;
			}
			cancel() {
				this.hidden === true ? window.clearTimeout(this.timer) : window.cancelAnimationFrame(this.timer); //jshint ignore:line
			}
			start() {
				this.hidden = document.hidden;
				this.timer = this.hidden === true ? window.setTimeout(this.func, 0) : window.requestAnimationFrame(this.func);
			}
		}

		return function debounceMethod(method) {
			var op = wm.get(method);
			if (op !== undefined) {
				op.cancel();
			} else {
				op = new Operation(method);
				wm.set(method, op);
			}
			op.start();
		};
	})(),
};

(function initListeners(window, document, RESES) {
	var _preinitCalls = [];
	var _initCalls = [];

	function initialize() {
		while (_initCalls.length > 0) {
			var func = _initCalls.shift();
			RESES.doAsync(func);
		}
		_initCalls = null;
	}

	function preinitialize() {
		if (_preinitCalls !== null) {
			while (_preinitCalls.length > 0) {
				var func = _preinitCalls.shift();
				func();
			}
			_preinitCalls = null;

			if (document.readyState === 'loading') {
				window.addEventListener("DOMContentLoaded", initialize);
			} else {
				initialize();
			}
		} else {
			throw new Error("PreInit Already Executed");
		}
	}

	RESES.extendType(RESES, {
		onPreInit: function (method) {
			if (_preinitCalls !== null) {
				_preinitCalls.push(method);
				RESES.debounceMethod(preinitialize);
			} else {
				throw new Error("Initialization already in progress. To late to call onPreInit.");
			}
		},
		onInit: function (method) {
			if (_preinitCalls !== null) {
				_initCalls.push(method);
				RESES.debounceMethod(preinitialize);
			} else {
				throw new Error("Initialization already in progress. Too late to call onInit.");
			}
		}
	});

})(window, window.document, RESES);


/**NOTE: Custom methods that are added to existing types are purposely capitalized. */
RESES.extendType(Element, {
	From: (function () {
		 const doc = window.document;
		 const rgx = /(\S+)=(["'])(.*?)(?:\2)|(\w+)/g;
		 return function CreateElementFromHTML(html) { //Almost 3x performance compared to jQuery and only marginally slower than manually creating element: https://jsbench.github.io/#02fe05ed4fdd9ff6582f364b01673425
				var innerHtmlStart = html.indexOf('>') + 1;
				var elemStart = html.substr(0, innerHtmlStart);
				var match = rgx.exec(elemStart)[4];
				var elem = doc.createElement(match);
				while ((match = rgx.exec(elemStart)) !== null) {
					 if (match[1] === undefined) {
							elem.setAttribute(match[4], "");
					 } else {
							elem.setAttribute(match[1], match[3]);
					 }
				}
				elem.innerHTML = html.substr(innerHtmlStart, html.lastIndexOf('<') - innerHtmlStart);
				rgx.lastIndex = 0;
				return elem;
		 };
	}())
});


RESES.extendType(String.prototype, {
	ReplaceAll: function ReplaceAll(sequence, value) {
		 return this.split(sequence).join(value);
	},
	Trim: (function () {
		 const rgxBoth = /^\s+|\s+$/g;
		 const rgxStart = /^\s+/;
		 const rgxEnd = /\s+$/;
		 function whitespaceTrim(str, option) {
				if ((option & 3) === 3) { return str.replace(rgxBoth, ''); }
				if ((option & 1) === 1) { return str.replace(rgxStart, ''); }
				if ((option & 2) === 2) { return str.replace(rgxEnd, ''); }
				return str;
		 }
		 function specialTrim(str, ch, option, maxcount) {
			var len = ch.length;
			var left = 0, right = str.length, pos = 0, iter = maxcount;
			if ((option & 1) === 1) {
				iter = maxcount;
				while ((pos = str.indexOf(ch, left)) === left && (iter === -1 || iter > 0)) { left = pos + len; iter--; }
			}
			if ((option & 2) === 2) {
				iter = maxcount;
				while ((pos = str.lastIndexOf(ch, right)) === right - len && (iter === -1 || iter > 0)) { right = pos; iter--; }
			}
			return left > 0 || right < str.length ? str.substr(left, right - left) : str;
		 }
		return function trim(chars, option, maxcount) {
			var max = maxcount | -1;
			if (option == null) { option = 3; }
			if (chars || max > 0) {
				return specialTrim(this, chars ? chars : " ", option, max);
			}
			return whitespaceTrim(this, option);
		};
	}()),
	TrimStart: function(ch, maxcount) {
		 return this.Trim(ch, 1, maxcount);
	},
	TrimEnd: function(ch, maxcount) {
		 return this.Trim(ch, 2, maxcount);
	},
	SubstrBefore: function(sequence, bIncludeSequence) {
		 var idx = this.indexOf(sequence);
		 if (idx >= 0) {
				if (bIncludeSequence) { idx += sequence.length; }
				if (idx <= this.length) { return this.substr(0, idx); }
		 }
		 return this;
	},
	SubstrAfter: function(sequence, bIncludeSequence) {
		 var idx = this.indexOf(sequence);
		 if (idx >= 0) {
				if (!bIncludeSequence) { idx += sequence.length; }
				if (idx <= this.length) { return this.substr(idx); }
		 }
		 return this;
	},
	SubstrBeforeLast: function(sequence, bIncludeSequence) {
		 var idx = this.lastIndexOf(sequence);
		 if (idx >= 0) {
				if (bIncludeSequence) { idx += sequence.length; }
				if (idx <= this.length) { return this.substr(0, idx); }
		 }
		 return this;
	},
	SubstrAfterLast: function(sequence, bIncludeSequence) {
		 var idx = this.lastIndexOf(sequence);
		 if (idx >= 0) {
				if (!bIncludeSequence) { idx += sequence.length; }
				if (idx <= this.length) { return this.substr(idx); }
		 }
		 return this;
	}
});


RESES.extendType([NodeList.prototype, HTMLCollection.prototype], {
	Remove: (function () {
		 const matches = Element.prototype.matches;
		 function Remove(selector) {
				var i = 0, len = 0;
				if (selector == null) {
					 for (i = 0, len = this.length; i < len; i++) {
							this[i].remove();
					 }
				} else if (typeof selector === 'string') {
					 for (i = 0, len = this.length; i < len; i++) {
							if (matches.call(this[i], selector)) { this[i].remove(); }
					 }
				} else if (selector instanceof Array) {
					 for (i = 0, len = selector.length; i < len; i++) {
							Remove.call(this, selector[i]);
					 }
				}
		 }
		 return Remove;
	}()),
	CSS: function (style) {
		 if (style) {
				var keys = Object.getOwnPropertyNames(style);
				for (var i = 0, len = this.length; i < len; i++) {
					 for (var k = 0, klen = keys.length; k < klen; k++) {
							var key = keys[k], value = style[key];
							if (typeof value === 'number') { value = value + 'px'; }
							this[i].style[key] = value;
					 }
				}
		 }
	}
});


RESES.extendType(DOMTokenList.prototype, {
	ContainsAny: function () {
		for (var i = 0, len = arguments.length; i < len; i++) {
			if (this.contains(arguments[i])){ return true; }
		}
		return false;
	}
});
