/*global unsafeWindow */ //for greasemonkey
/*global DOMTokenList */


"use strict";

Element.From = (function () {
  const rgx = /(\S+)=(["'])(.*?)(?:\2)|(\w+)/g;
  return function CreateElementFromHTML(html) { //Almost 3x performance compared to jQuery and only marginally slower than manually creating element: https://jsbench.github.io/#02fe05ed4fdd9ff6582f364b01673425
      var innerHtmlStart = html.indexOf('>') + 1;
      var elemStart = html.substr(0, innerHtmlStart);
      var match = rgx.exec(elemStart)[4];
      var elem = window.document.createElement(match);
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
}());

const RESES = window.RESES = {
	extendType: (function () {
    function defineOne(proto, name, prop, options, obj) {
      if (name in proto) {
        if (options.override) {
          Object.defineProperty(proto, name, prop);
        } else if (options.merge) {
          extendType(proto[name], obj[name], options);
        }
      } else {
        Object.defineProperty(proto, name, prop);
      }
    }
    function defineSeveral(proto, name, prop, options, obj) {
      for (var i = 0, len = proto.length; i < len; i++) { defineOne(proto[i], name, prop, options, obj); }
    }
    /**@param {object} options - How to extend.
     * enumerable, configurable, writable are standards: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
     * @param {bool} options.override - Overwrites existing property/function if duplicates
     * @param {bool} options.merge - If duplicate property/function/Type, merges the prototype of each into one.
     */
    function extendType(proto, obj, options) { //jshint ignore:line
      if (!options) { options = { enumerable: undefined, configurable: undefined, writable: undefined, override: true, merge: false }; }
      var define = proto instanceof Array ? defineSeveral : defineOne;
			var keys = Object.keys(obj);
			for (var i = 0, len = keys.length; i < len; i++) {
				var name = keys[i];
				var opts = options.hasOwnProperty(name) ? Object.assign({}, options, options[name]) : options;
				var prop = Object.getOwnPropertyDescriptor(obj, name);
				if (opts.enumerable != null) { prop.enumerable = opts.enumerable; }
				if (opts.configurable != null) { prop.configurable = opts.configurable; }
				if (opts.writable != null && 'value' in prop) { prop.writable = opts.writable; }
				define(proto, name, prop, opts, obj);
			}
    }
    return extendType;
  }()),
	Color: (function () {
		function toHex(num, padding) {
			return num.toString(16).padStart(padding || 2);
		}

		function parsePart(value) {
			value = value.trim();
			var perc = value.lastIndexOf('%');
			return perc < 0 ? value : value.substr(0, perc);
		}

		function normalizeComponent(value) {
			value = parseInt(value);
			if (value == null || isNaN(value)) { return 0; }
			return value > 255 ? 255 : (value < 0 ? 0 : value);
		}

		function Color(data) {
			if (!(data === undefined || data === null || isNaN(data))) {
				if (arguments.length > 1) {
					this.r = arguments[0];
					this.g = arguments[1];
					this.b = arguments[2];
					if (arguments.length > 3) { this.a = arguments[3]; }
				}
				else if (typeof data === 'string') {
					data = data.trim().toLowerCase();
					if (data[0] === '#') {
						switch (data.length) {
							case 9:
								this[3] = parseInt(data.substr(7, 2), 16); //jshint ignore:line
							case 7:
								this[0] = parseInt(data.substr(1, 2), 16);
								this[1] = parseInt(data.substr(3, 2), 16);
								this[2] = parseInt(data.substr(5, 2), 16);
								break;
							case 4:
								this[0] = parseInt(data[1], 16); this[0] = (this[0] << 4) | this[0];
								this[1] = parseInt(data[2], 16); this[1] = (this[1] << 4) | this[1];
								this[2] = parseInt(data[3], 16); this[2] = (this[2] << 4) | this[2];
								break;
							default:
								throw new Error(`Invalid Hex Color: ${data}`);
						}
					}
					else if (data.startsWith("rgb")) {
						var parts = (data[3] === 'a' ? data.substr(5, data.length - 6) : data.substr(4, data.length - 5)).split(',');
						this.r = parsePart(parts[0]);
						this.g = parsePart(parts[1]);
						this.b = parsePart(parts[2]);
						if (parts.length > 3) { this.a = parsePart(parts[3]); }
					}
					else {
						throw new Error(`Invalid Color String: ${data}`);
					}
				}
				else if (data instanceof Color) {
					this[0] = data[0];
					this[1] = data[1];
					this[2] = data[2];
					this[3] = data[3];
				}
				else if (Array.isArray(data)) {
					this.r = data[0];
					this.g = data[1];
					this.b = data[2];
					if (data.length > 3) { this.a = data[3]; }
				}
			}
		}

		Color.prototype = {
			constructor: Color,
			0: 255,
			1: 255,
			2: 255,
			3: 255,
			get length() { return this[3] === 255 ? 3 : 4; },
			get r() { return this[0];	},
			set r(value) { this[0] = normalizeComponent(value); },
			get g() { return this[1];	},
			set g(value) { this[1] = normalizeComponent(value); },
			get b() { return this[2];	},
			set b(value) { this[2] = normalizeComponent(value); },
			get a() { return this[3] / 255;	},
			set a(value) {
				value = parseFloat(value);
				if (!(value == null || isNaN(value))) {
					if (value < 1) { value = value * 255; }
					value = Math.floor(value);
					this[3] = value > 255 ? 255 : (value < 0 ? 0 : value);
				}
			},
			get luma() { return .299 * this.r + .587 * this.g + .114 * this.b; },
			get inverted() { return new Color(255 - this[0], 255 - this[1], 255 - this[2], this[3]); },
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
	getNonStandardWindowProperties: function getNonStandardWindowProperties(win, bAsArray) {
		if (typeof win === 'boolean') {
			bAsArray = win; win = window;
		} else if (win === null || win === undefined) {
			win = window;
		}
		var iframe = document.createElement('iframe'); iframe.style.display = 'none';
		document.body.appendChild(iframe);
		var result = Object.getOwnPropertyNames(win).filter(name => !iframe.contentWindow.hasOwnProperty(name));
		if (!bAsArray) {
			result = result.reduce((dict, name) => { dict[name] = win[name]; return dict; }, {});
		}
		document.body.removeChild(iframe);
		return result;
	},

  AsyncCtx: (() => {
    function fix(num, div = 1000) { return Math.trunc(num * div) / div; }

    class AsyncOp {
      constructor(owner, key, delay, method) {
        this.delay = +(delay || 0);
        this.elapsed = +0;
        this.count = -1 | 0;
        this.background = false;
        this.timer = 0 | 0;

        this.key = key || this;
        this.method = method;
        this.owner = owner;

        this.start = fix(performance.now());
        this.prev = this.start;
        this.current = this.start;

        this.tick = () => this._tick();
        // this.interval = this.delay <= 1 ? 0 : (this.delay <= 10 ? 1 : (this.delay <= 100 ? 10 : 15));
      }
      get remaining() { return Math.trunc(this.delay - (this.current - this.start)); }
      get elapsedTotal() { return fix(this.current - this.start); }
      cancel() {
				this.background === true ? window.clearTimeout(this.timer) : window.cancelAnimationFrame(this.timer); //jshint ignore:line
			}
			begin() {
				this.background = document.hidden;
				this.timer = this.background === true ? window.setTimeout(this.tick, this.delay) : window.requestAnimationFrame(this.tick);
			}
      _tick() {
        this.count++;
        this.prev = this.current;
        this.current = fix(performance.now());
        this.elapsed = fix(this.current - this.prev);
        // if (this.remaining > 0) {
        //   let finished = this.count > 0 ? " Finished" : "";
        //   console.info(`AsyncOp${finished} Cycle(${this.count}): ${this.elapsed}ms. Remaining: ${this.remaining}ms. Elapsed: ${this.elapsedTotal}. Background: ${this.background}`, this, this.method);
        // }
        if (this.remaining > 0 || this.count == 0) {
          this.begin();
        } else {
          this.method(this);
          this.owner.free(this);
        }
      }
    }

    class AsyncCtx {
      constructor(name) {
        this.name = name;
        this.peak = 0;
        this.total = 0;
        this.allTotal = 0;
        this.longest = null;
        this.currentLongest = null;
        this.starttime = 0;
        this.map = new Map();
      }
      get elapsed() { return fix(performance.now() - this.starttime); }
      track(op) {
        if (this.map.size === 0) {
          this.starttime = performance.now();
          this.currentLongest = null;
        }
        this.map.set(op.key, op);
        this.peak = Math.max(this.peak, this.map.size);
        this.total++;
        this.allTotal++;
      }
      free(op) {
        this.map.delete(op.key);
        if (!this.longest || op.elapsedTotal > this.longest.elapsedTotal) { this.longest = op; }
        if (!this.currentLongest || op.elapsedTotal > this.currentLongest.elapsedTotal) { this.currentLongest = op; }
        // if (this.peek !== 0 && this.map.size === 0 && this.elapsed > 5) {
        //   console.info(`AsyncCtx.${this.name} finished evaluating in ${this.elapsed}ms. Peak: ${this.peak}. Total: ${this.total}`, this);
        // }
        if (this.map.size === 0) {
          this.peak = 0;
          this.total = 0;
        }
      }
      doAsync(func, delay) {
        var op = new AsyncOp(this, null, delay, func);
        this.track(op);
        op.tick();
        return op;
      }
      debounce(method, delay) {
        var op = this.map.get(method);
        if (op !== undefined) {
          op.cancel();
        } else {
          op = new AsyncOp(this, method, delay, method);
          this.track(op);
        }
        op.begin();
      }
    }

    AsyncCtx.default = new AsyncCtx("Default");
    AsyncCtx.AsyncOp = AsyncOp;
    return AsyncCtx;
  })(),
  doAsync: function defaultDoAsync(func, delay = 0) {
    return RESES.AsyncCtx.default.doAsync(func, delay);
  },
  debounce: function defaultDebounce(method, delay) {
    return RESES.AsyncCtx.default.debounce(method, delay);
  }
};


(function initListeners(RESES) {
  let context = RESES.AsyncCtx.default; //new RESES.AsyncCtx("Initializer");
	var _initCalls = [];
  var _readyCalls = [];
  var _loadedCalls = [];

  window.addEventListener("load", windowLoaded);

  if (document.readyState !== "loading") {
    console.info("RESES loaded during weird document state.", document.readyState);
    RESES.doAsync(documentReady);
	} else {
		window.addEventListener("DOMContentLoaded", documentReady);
  }

  function comparer(a, b) { return a.priority - b.priority; }

  function initialize() {
    if (_initCalls !== null) {
      _initCalls.sort(comparer);
      while (_initCalls.length > 0) {
        let call = _initCalls.shift();
				let func = call.method;
				func();
			}
			_initCalls = null;
    }
	}

  function documentReady() {
    let h2 = document.body.querySelector("h2");
    if (h2 && h2.textContent === "all of our servers are busy right now") {
      location.reload();
    } else {
      initialize();
      _readyCalls.sort(comparer);
      while (_readyCalls.length > 0) {
        let call = _readyCalls.shift();
				let func = call.method;
        context.doAsync(func);
      }
    }
		_readyCalls = null;
  }

  function windowLoaded() {
    if (_readyCalls !== null) {
      RESES.onReady(windowLoaded, 1000);
    } else {
      if (_loadedCalls !== null) {
        _loadedCalls.sort(comparer);
        while (_loadedCalls.length > 0) {
          let call = _loadedCalls.shift();
          let func = call.method;
          context.doAsync(func);
        }
        _loadedCalls = null;
      }
    }
  }

  RESES.onInit = function (method, priority = 100) {
    if (_initCalls !== null) {
      _initCalls.push({ priority, method });
      context.debounce(initialize);
    } else {
      throw new Error("Initialization already in progress. Too late to call onInit.");
    }
  };
  RESES.onReady = function (method, priority = 100) {
    if (_readyCalls !== null) {
      _readyCalls.push({ priority, method });
    } else {
      context.doAsync(method);
    }
  };
  RESES.onLoaded = function (method, priority = 100) {
    if (_loadedCalls !== null) {
      _loadedCalls.push({ priority, method });
    } else {
      context.doAsync(method);
    }
  };

})(RESES);


/**NOTE: Custom methods that are added to existing types are purposely capitalized. */
// RESES.extendType(Element, {
// 	From: (function () {
// 		 const doc = window.document;
// 		 const rgx = /(\S+)=(["'])(.*?)(?:\2)|(\w+)/g;
// 		 return function CreateElementFromHTML(html) { //Almost 3x performance compared to jQuery and only marginally slower than manually creating element: https://jsbench.github.io/#02fe05ed4fdd9ff6582f364b01673425
// 				var innerHtmlStart = html.indexOf('>') + 1;
// 				var elemStart = html.substr(0, innerHtmlStart);
// 				var match = rgx.exec(elemStart)[4];
// 				var elem = doc.createElement(match);
// 				while ((match = rgx.exec(elemStart)) !== null) {
// 					 if (match[1] === undefined) {
// 							elem.setAttribute(match[4], "");
// 					 } else {
// 							elem.setAttribute(match[1], match[3]);
// 					 }
// 				}
// 				elem.innerHTML = html.substr(innerHtmlStart, html.lastIndexOf('<') - innerHtmlStart);
// 				rgx.lastIndex = 0;
// 				return elem;
// 		 };
// 	}())
// });


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

RESES.extendType(Array.prototype, {
  get last() { return this[this.length - 1]; },
  set last(value) { this[this.length - 1] = value; }
}, { enumerable: false });

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



// if (unsafeWindow) {
// 	unsafeWindow.RESES = RESES;
// }