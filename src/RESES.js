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

Object.defineProperties(String.prototype, {
  ReplaceAll: { enumerable: false, writable: false,
    value: function ReplaceAll(sequence, value) {
      return this.split(sequence).join(value);
    }
  },
  Capitalize: {
    enumerable: false, writable: false,
    value: function Capitalize() { return this.charAt(0).toUpperCase() + this.slice(1); }
  },
  Trim: {
    enumerable: false, writable: false,
    value: (function () {
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
     return function Trim(chars, option, maxcount) {
       var max = maxcount | -1;
       if (option == null) { option = 3; }
       if (chars || max > 0) {
         return specialTrim(this, chars ? chars : " ", option, max);
       }
       return whitespaceTrim(this, option);
     };
   }())
  },
  TrimStart: {
    enumerable: false, writable: false,
    value: function TrimStart(ch, maxcount) { return this.Trim(ch, 1, maxcount); }
  },
  TrimEnd: {
    enumerable: false, writable: false,
    value: function TrimEnd(ch, maxcount) { return this.Trim(ch, 2, maxcount); }
  },
  SubstrBefore: {
    enumerable: false, writable: false,
    value: function SubstrBefore(sequence, bIncludeSequence) {
      var idx = this.indexOf(sequence);
      if (idx >= 0) {
         if (bIncludeSequence) { idx += sequence.length; }
         if (idx <= this.length) { return this.substr(0, idx); }
      }
      return this;
   }
  },
  SubstrAfter: {
    enumerable: false, writable: false,
    value: function SubstrAfter(sequence, bIncludeSequence) {
      var idx = this.indexOf(sequence);
      if (idx >= 0) {
         if (!bIncludeSequence) { idx += sequence.length; }
         if (idx <= this.length) { return this.substr(idx); }
      }
      return this;
   }
  },
  SubstrBeforeLast: {
    enumerable: false, writable: false,
    value: function SubstrBeforeLast(sequence, bIncludeSequence) {
      var idx = this.lastIndexOf(sequence);
      if (idx >= 0) {
         if (bIncludeSequence) { idx += sequence.length; }
         if (idx <= this.length) { return this.substr(0, idx); }
      }
      return this;
   }
  },
  SubstrAfterLast: {
    enumerable: false, writable: false,
    value: function SubstrAfterLast(sequence, bIncludeSequence) {
      var idx = this.lastIndexOf(sequence);
      if (idx >= 0) {
         if (!bIncludeSequence) { idx += sequence.length; }
         if (idx <= this.length) { return this.substr(idx); }
      }
      return this;
   }
  }
});

Object.defineProperties(Array.prototype, {
  last: {
    enumerable: false, writable: false,
    get last() { return this[this.length - 1]; },
    set last(value) { this[this.length - 1] = value; }
  },
  Chunk: {
    enumerable: false, writable: false,
    value: function Chunk(size) {
      let arrays = [];
      for (var i = 0, len = this.length; i < len; i += size) {
        arrays.push(this.slice(i, i + size));
      }
      return arrays;
    }
  }
});


(function () {
  const descriptor = {
    Remove: {
      enumerable: false, writable: false,
      value: (function () {
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
      }())
    },
    CSS: {
      enumerable: false, writable: false,
      value: function CSS(style) {
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
    }
  };
  Object.defineProperties(NodeList.prototype, descriptor);
  Object.defineProperties(HTMLCollection.prototype, descriptor);
}());
