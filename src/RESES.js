/*global unsafeWindow */ //for greasemonkey
/*global DOMTokenList */


"use strict";

console.time("RESES");

Element.From = Element.From || (function () {
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
  isFirefox: navigator.userAgent.includes("Firefox"),
  get bIsMultireddit() {
		delete this.bIsMultireddit;
		return (this.bIsMultireddit = document.body.classList.contains('multi-page'));
	},
  bIsCommentPage: window.location.pathname.includes('/comments/'),
  bIsUserPage: window.location.pathname.includes('/user/'),
  subreddit: ((m) => m && m[1] ? m[1].toLocaleLowerCase() : null)(/^\/(?:r\/(\w+)\/)/.exec(window.location.pathname)),
  config: (function localSettings() {
    const cache = {};
    function getSetting(key, _default) {
      if (cache[key] !== undefined) { return cache[key]; }
      var setting = JSON.parse(localStorage.getItem('reses-' + key) || _default.toString());
      cache[key] = setting;
      return setting;
    }
    function setSetting(key, value) {
      if (arguments.length === 1) {
        value = cache[key]
      } else {
        cache[key] = value;
      }
      localStorage.setItem('reses-' + key, JSON.stringify(value));
    }

    const config = {
      getSetting,
      setSetting,
      defineSetting: function defineSetting(key, _default) {
        Object.defineProperty(config, key, {
          get: function () { return getSetting(key, _default); },
          set: function (val) { setSetting(key, val); }
        });
      }
    };
    return config;
  })()
};

if (this.window) { this.window.RESES = RESES; }
if (this.unsafeWindow) { this.unsafeWindow.RESES = RESES; }

RESES.extendType(String.prototype, {
	ReplaceAll: function ReplaceAll(sequence, value) {
		 return this.split(sequence).join(value);
  },
  Capitalize: function () { return this.charAt(0).toUpperCase() + this.slice(1); },
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
