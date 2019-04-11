/// <reference path="RESES.js" />

RESES.Color = (function () {
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
    get r() { return this[0]; },
    set r(value) { this[0] = normalizeComponent(value); },
    get g() { return this[1]; },
    set g(value) { this[1] = normalizeComponent(value); },
    get b() { return this[2]; },
    set b(value) { this[2] = normalizeComponent(value); },
    get a() { return this[3] / 255; },
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
          return `rgba(${this.r / 255 * 100}%, ${this.b / 255 * 100}%, ${this.g / 255 * 100}%, ${this.a / 255})`;
        } else {
          return `rgb(${this.r / 255 * 100}%, ${this.b / 255 * 100}%, ${this.g / 255 * 100})%`;
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
}());