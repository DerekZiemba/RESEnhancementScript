/// <reference path="RESES.js" />

console.time("RESES.initialize");
console.time("RESES.documentReady");
console.time("RESES.windowLoaded");

RESES.AsyncCtx = (() => {
  function fix(num, div = 1000) { return Math.trunc(num * div) / div; }

  class AsyncOp {
    constructor(owner, key, delay, method) {
      this.delay = +(delay || 0);
      this.elapsed = +0;
      this.count = -1 | 0;
      this.timer = 0 | 0;
      this.background = false;

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
    begin(forceBackground) {
      this.background = forceBackground || document.hidden;
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
    debounce(method, delay, forceBackground) {
      var op = this.map.get(method);
      if (op !== undefined) {
        op.cancel();
      } else {
        op = new AsyncOp(this, method, delay, method);
        this.track(op);
      }
      op.begin(forceBackground);
    }
  }

  AsyncCtx.default = new AsyncCtx("Default");
  AsyncCtx.AsyncOp = AsyncOp;

  return AsyncCtx;
})();

(function initializer(RESES) {
  let context = RESES.AsyncCtx.default; //new RESES.AsyncCtx("Initializer");
	var _initCalls = [];
  var _readyCalls = [];
  var _loadedCalls = [];

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
      console.timeEnd("RESES.initialize");
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
      console.timeEnd("RESES.documentReady");
    }
    _readyCalls = null;
    if (!RESES.isFirefox) { windowLoaded(); }
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
        console.timeEnd("RESES.windowLoaded");
      }
    }
  }

  RESES.doAsync = function defaultDoAsync(func, delay = 0) {
    return context.doAsync(func, delay);
  };
  RESES.debounce = function defaultDebounce(method, delay, forceBackground) {
    return context.debounce(method, delay, forceBackground);
  };
  RESES.onInit = function (method, priority = 100) {
    if (_initCalls !== null) {
      _initCalls.push({ priority, method });
      context.debounce(initialize, 0, true);
    } else {
      console.error("Initialization already in progress. Too late to call onInit.", method, _initCalls);
      method();
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

  window.addEventListener("load", windowLoaded);

  if (document.readyState !== "loading") {
    console.info("RESES loaded in late state.", document.readyState);
    setTimeout(documentReady, 0);
	} else {
		window.addEventListener("DOMContentLoaded", documentReady);
  }

})(RESES);