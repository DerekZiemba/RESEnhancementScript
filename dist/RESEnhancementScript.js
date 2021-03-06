"use strict";
console.time("RESES");
Element.From = Element.From || (function () {
    const rgx = /(\S+)=(["'])(.*?)(?:\2)|(\w+)/g;
    return function CreateElementFromHTML(html) {
        var innerHtmlStart = html.indexOf('>') + 1;
        var elemStart = html.substr(0, innerHtmlStart);
        var match = rgx.exec(elemStart)[4];
        var elem = window.document.createElement(match);
        while ((match = rgx.exec(elemStart)) !== null) {
            if (match[1] === undefined) {
                elem.setAttribute(match[4], "");
            }
            else {
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
            bAsArray = win;
            win = window;
        }
        else if (win === null || win === undefined) {
            win = window;
        }
        var iframe = document.createElement('iframe');
        iframe.style.display = 'none';
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
            if (cache[key] !== undefined) {
                return cache[key];
            }
            var setting = JSON.parse(localStorage.getItem('reses-' + key) || _default.toString());
            cache[key] = setting;
            return setting;
        }
        function setSetting(key, value) {
            if (arguments.length === 1) {
                value = cache[key];
            }
            else {
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
if (this.window) {
    this.window.RESES = RESES;
}
if (this.unsafeWindow) {
    this.unsafeWindow.RESES = RESES;
}
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
                if ((option & 3) === 3) {
                    return str.replace(rgxBoth, '');
                }
                if ((option & 1) === 1) {
                    return str.replace(rgxStart, '');
                }
                if ((option & 2) === 2) {
                    return str.replace(rgxEnd, '');
                }
                return str;
            }
            function specialTrim(str, ch, option, maxcount) {
                var len = ch.length;
                var left = 0, right = str.length, pos = 0, iter = maxcount;
                if ((option & 1) === 1) {
                    iter = maxcount;
                    while ((pos = str.indexOf(ch, left)) === left && (iter === -1 || iter > 0)) {
                        left = pos + len;
                        iter--;
                    }
                }
                if ((option & 2) === 2) {
                    iter = maxcount;
                    while ((pos = str.lastIndexOf(ch, right)) === right - len && (iter === -1 || iter > 0)) {
                        right = pos;
                        iter--;
                    }
                }
                return left > 0 || right < str.length ? str.substr(left, right - left) : str;
            }
            return function Trim(chars, option, maxcount) {
                var max = maxcount | -1;
                if (option == null) {
                    option = 3;
                }
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
                if (bIncludeSequence) {
                    idx += sequence.length;
                }
                if (idx <= this.length) {
                    return this.substr(0, idx);
                }
            }
            return this;
        }
    },
    SubstrAfter: {
        enumerable: false, writable: false,
        value: function SubstrAfter(sequence, bIncludeSequence) {
            var idx = this.indexOf(sequence);
            if (idx >= 0) {
                if (!bIncludeSequence) {
                    idx += sequence.length;
                }
                if (idx <= this.length) {
                    return this.substr(idx);
                }
            }
            return this;
        }
    },
    SubstrBeforeLast: {
        enumerable: false, writable: false,
        value: function SubstrBeforeLast(sequence, bIncludeSequence) {
            var idx = this.lastIndexOf(sequence);
            if (idx >= 0) {
                if (bIncludeSequence) {
                    idx += sequence.length;
                }
                if (idx <= this.length) {
                    return this.substr(0, idx);
                }
            }
            return this;
        }
    },
    SubstrAfterLast: {
        enumerable: false, writable: false,
        value: function SubstrAfterLast(sequence, bIncludeSequence) {
            var idx = this.lastIndexOf(sequence);
            if (idx >= 0) {
                if (!bIncludeSequence) {
                    idx += sequence.length;
                }
                if (idx <= this.length) {
                    return this.substr(idx);
                }
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
                    }
                    else if (typeof selector === 'string') {
                        for (i = 0, len = this.length; i < len; i++) {
                            if (matches.call(this[i], selector)) {
                                this[i].remove();
                            }
                        }
                    }
                    else if (selector instanceof Array) {
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
                            if (typeof value === 'number') {
                                value = value + 'px';
                            }
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
        }
        get remaining() { return Math.trunc(this.delay - (this.current - this.start)); }
        get elapsedTotal() { return fix(this.current - this.start); }
        cancel() {
            this.background === true ? window.clearTimeout(this.timer) : window.cancelAnimationFrame(this.timer);
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
            if (this.remaining > 0 || this.count == 0) {
                this.begin();
            }
            else {
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
            if (!this.longest || op.elapsedTotal > this.longest.elapsedTotal) {
                this.longest = op;
            }
            if (!this.currentLongest || op.elapsedTotal > this.currentLongest.elapsedTotal) {
                this.currentLongest = op;
            }
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
            }
            else {
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
    let context = RESES.AsyncCtx.default;
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
        }
        else {
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
        if (!RESES.isFirefox) {
            windowLoaded();
        }
    }
    function windowLoaded() {
        if (_readyCalls !== null) {
            RESES.onReady(windowLoaded, 1000);
        }
        else {
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
        }
        else {
            console.error("Initialization already in progress. Too late to call onInit.", method, _initCalls);
            method();
        }
    };
    RESES.onReady = function (method, priority = 100) {
        if (_readyCalls !== null) {
            _readyCalls.push({ priority, method });
        }
        else {
            context.doAsync(method);
        }
    };
    RESES.onLoaded = function (method, priority = 100) {
        if (_loadedCalls !== null) {
            _loadedCalls.push({ priority, method });
        }
        else {
            context.doAsync(method);
        }
    };
    window.addEventListener("load", windowLoaded);
    if (document.readyState !== "loading") {
        console.info("RESES loaded in late state.", document.readyState);
        setTimeout(documentReady, 0);
    }
    else {
        window.addEventListener("DOMContentLoaded", documentReady);
    }
})(RESES);
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
        if (value == null || isNaN(value)) {
            return 0;
        }
        return value > 255 ? 255 : (value < 0 ? 0 : value);
    }
    function Color(data) {
        if (!(data === undefined || data === null || isNaN(data))) {
            if (arguments.length > 1) {
                this.r = arguments[0];
                this.g = arguments[1];
                this.b = arguments[2];
                if (arguments.length > 3) {
                    this.a = arguments[3];
                }
            }
            else if (typeof data === 'string') {
                data = data.trim().toLowerCase();
                if (data[0] === '#') {
                    switch (data.length) {
                        case 9:
                            this[3] = parseInt(data.substr(7, 2), 16);
                        case 7:
                            this[0] = parseInt(data.substr(1, 2), 16);
                            this[1] = parseInt(data.substr(3, 2), 16);
                            this[2] = parseInt(data.substr(5, 2), 16);
                            break;
                        case 4:
                            this[0] = parseInt(data[1], 16);
                            this[0] = (this[0] << 4) | this[0];
                            this[1] = parseInt(data[2], 16);
                            this[1] = (this[1] << 4) | this[1];
                            this[2] = parseInt(data[3], 16);
                            this[2] = (this[2] << 4) | this[2];
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
                    if (parts.length > 3) {
                        this.a = parsePart(parts[3]);
                    }
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
                if (data.length > 3) {
                    this.a = data[3];
                }
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
                if (value < 1) {
                    value = value * 255;
                }
                value = Math.floor(value);
                this[3] = value > 255 ? 255 : (value < 0 ? 0 : value);
            }
        },
        get luma() { return .299 * this.r + .587 * this.g + .114 * this.b; },
        get inverted() { return new Color(255 - this[0], 255 - this[1], 255 - this[2], this[3]); },
        toString: function (option) {
            if (option === 16) {
                return '#' + toHex(this.r) + toHex(this.g) + toHex(this.b) + (this[3] === 255 ? '' : toHex(this[3]));
            }
            else if (option === '%') {
                if (this.a !== 1) {
                    return `rgba(${this.r / 255 * 100}%, ${this.b / 255 * 100}%, ${this.g / 255 * 100}%, ${this.a / 255})`;
                }
                else {
                    return `rgb(${this.r / 255 * 100}%, ${this.b / 255 * 100}%, ${this.g / 255 * 100})%`;
                }
            }
            else {
                if (this.a !== 1) {
                    return `rgba(${this.r}, ${this.b}, ${this.g}, ${this.a})`;
                }
                else {
                    return `rgb(${this.r}, ${this.b}, ${this.g})`;
                }
            }
        }
    };
    return Color;
}());
RESES.filterData = {
    karmawhore: [
        'SlimJones123', 'Ibleedcarrots', 'deathakissaway', 'pepsi_next', 'BunyipPouch', 'Sumit316',
        'KevlarYarmulke', 'D5R', 'dickfromaccounting', 'icant-chooseone'
    ].map(x => x && x.toLowerCase()),
    pornsub: ["18_19", "2busty2hide", "60fpsporn", "aa_cups", "abelladanger", "adorableporn", "afrodisiac", "alathenia", "alexandradaddario",
        "alteredbuttholes", "altgonewild", "alwaystheshyones", "amateur", "amateurcumsluts", "amateurgirlsbigcocks", "anacheriexclusive", "anal_gifs",
        "angelawhite", "angievaronalegal", "animebooty", "animegifs", "animemidriff", "animemilfs", "animewallpaper", "anna_faith", "araragi", "arielwinter",
        "armoredwomen", "ashihentai", "asianbabes", "asiancuties", "asianladyboners", "asiannsfw", "asshole", "assholebehindthong", "assholegonewild",
        "assinthong", "astolfo", "avaaddams", "awwnime", "azerothporn", "baecongw", "bamboofever", "bananatits", "barbarapalvin", "batty", "bbcsluts",
        "bbypocahontas", "bdsmgw", "bigareolas", "bigasses", "bigboobsgonewild", "bigbrothernsfw", "biggerthanherhead", "biggerthanyouthought", "bigtiddygothgf",
        "bigtitsinbikinis", "bikinis", "bimbofetish", "blackchickswhitedicks", "blancnoir", "blowjobgifs", "blowjobs", "bodyperfection", "bodyshots",
        "bois", "bokunoeroacademia", "bokunoheroacademia", "boltedontits", "bondage", "bonermaterial", "boobbounce", "boobs", "bottomless_vixens", "boutinela",
        "breastenvy", "breeding", "breedingmaterial", "brogress", "broslikeus", "bryci", "burstingout", "bustyasians", "bustypetite", "buttplug", "buttsandbarefeet",
        "buttsharpies", "canthold", "celebhub", "celebritybutts", "celebs", "celebsnaked", "celebsnudess", "celebswithbigtits", "changingrooms", "chavgirls",
        "chesthairporn", "chloebennet", "cinnamonmermaids", "cleavage", "collegeamateurs", "collegesluts", "confusedboners", "consentacles", "cosplay",
        "cosplaybutts", "couplesgonewild", "creampie", "cubbixoxo", "cuckold", "cumfetish", "cumhaters", "curvy", "cutelittlebutts", "cutelittlefangs",
        "cutemodeslutmode", "cyberpunk2069", "darkangels", "darlinginthefranxx", "datgap", "ddlc", "dekaihentai", "demilovato", "dirtysmall", "dollywinks",
        "dontforgettheballs", "ebony", "ecchi", "elizabethzaks", "emiliaclarke", "emilybloom", "emmastone", "enf", "engorgedveinybreasts", "erinashford",
        "escafrisky", "evangelion", "exxxtras", "facedownassup", "facefuck", "fantasygirls", "fayereagan", "feet", "femdomgonewild", "femyiff", "festivalsluts",
        "fire_emblem_r34", "fitandnatural", "fitdrawngirls", "fitgirls", "fitwomengifs", "flashingandflaunting", "flashinggirls", "freckledgirls", "freeuse",
        "freeusehentai", "funsized", "funsizedasian", "furry", "futanari", "fuxtaposition", "gamindustri", "gangbang", "gape", "gaybears", "gaybrosgonemild",
        "gaymers", "gayporn", "geekygirls", "genesismialopez", "gentlemanbonersgifs", "gentlemengw", "gettingherselfoff", "gfriend", "gfur", "giannamichaels",
        "gifsgonewild", "ginger", "girlbg", "girlsdoporngifs", "girlsfinishingthejob", "girlsfrontine", "girlsinyogapants", "girlskissing", "girlswithglasses",
        "girlswithneonhair", "givemeaboner", "goddesses", "godpussy", "goneerotic", "gonemild", "gonewildchubby", "gonewildcouples", "gonewildhairy",
        "gonewildmetal", "gonewildscrubs", "gonewildsmiles", "groupofnudegirls", "gsspot", "guysfrombehind", "hairypussy", "handholding",
        "happyembarrassedgirls", "hardbodies", "hardcoreaww", "hentai_gif", "hentai_irl", "hentaibondage", "hesquats", "highresnsfw", "himikotoga",
        "hipcleavage", "holdthemoan", "homegrowntits", "homemadexxx", "hopelesssofrantic", "hot_women_gifs", "hotchickswithtattoos", "hugeboobs",
        "hugedicktinychick", "hugenaturals", "humanporn", "hungrybutts", "impressedbycum", "inappropriatehug", "indianbabes", "indiansgonewild",
        "innie", "internetstars", "jacking", "javdownloadcenter", "jaydenjaymes", "jenna_jade", "jessicanigri", "jessicanigri2", "jigglefuck",
        "jilling", "jobuds", "justforyou95", "justhotwomen", "justpeachyy", "kahoshibuya", "kateupton", "kawaiiikitten", "kemonomimi", "kinksters_gone_wild",
        "kitsunemimi", "konosuba", "kpics", "kpop", "kpopfap", "kuroihada", "labiagw", "ladyladyboners", "latinacuties", "latinas", "latinasgw",
        "legalteens", "legs", "leotards", "liamariejohnson", "lilyivy", "lindseypelas", "lingerie", "lionessintherain", "lipsthatgrip", "lovenikki",
        "lovetowatchyouleave", "mangonewild", "massivetitsnass", "megane", "megturney", "megumin", "melissadebling", "mewforyes", "milanavayntrub",
        "milfie", "missionarysoles", "mixedracegirls", "models", "monstergirl", "monstermusume", "morganhultgren", "ms_modestly_immodest", "muchihentai",
        "mylittlechar", "naruto", "nekoirl", "nekomimi", "nextdoorasians", "nintendowaifus", "niykeeheaton", "normalnudes", "nsfw", "nsfw2", "nsfw_amateurs",
        "nsfw_gif", "nsfw_gifs", "nsfw_html5", "nsfw_japan", "nsfw_snapchat", "nsfwcelebs", "nsfwcosplay", "nsfwfashion", "nsfwoutfits", "nsfwsports",
        "o_faces", "ohgeelizzyp", "ohlympics", "ohnomomwentwild", "oilporn", "oldschoolcelebs", "oldschoolcoolnsfw", "omad", "onepiece", "onmww",
        "onstagegw", "oppailove", "oralcreampie", "oregairusnafu", "overwatch_porn", "overwatchnsfw", "paag", "page3glamour", "paizuri", "palegirls",
        "pandr", "pantsu", "patreonbabes", "patriciaprice", "pawgtastic", "pegging", "pelfie", "penis", "perfect_nsfw", "perfectpussies",
        "petitegonewild", "piercednipples", "piercednsfw", "pixiv", "pokies", "porn", "porn_gifs", "porninfifteenseconds", "pornstarhq",
        "pornstarlethq", "preggoporn", "prettygirls", "pronebone", "publichentai", "puffies", "pussymound", "pussyrating", "quiver", "rachelcook",
        "randomsexiness", "randomsexygifs", "realahegao", "realasians", "realgirls", "realmoms", "realpublicnudity", "rearpussy", "redditlaqueristas",
        "redheadgifs", "redheads", "remylacroix", "repressedgonewild", "rileyreid", "rule34", "rule34lol", "rule34overwatch", "rule34rainbowsix",
        "rwbynsfw", "sabrinalynn", "sabrinalynnci", "saggy", "sarah_xxx", "sarajunderwood", "sashagrey", "selenagomez", "sexinfrontofothers",
        "sexybutnotporn", "sexyflowerwater", "sexyfrex", "sexygirls", "sexytummies", "shelikesitrough", "shorthairchicks", "shorthairedhotties",
        "shorthairedwaifus", "showerbeer", "sidestripeshorts", "simps", "skinnywithabs", "skirtnoshirt", "slightlychubby", "slimthick", "slutwife",
        "snapchat_nudes", "snapchat_sluts", "snapleaks", "snowwhites", "sophiemudd", "splatoon", "spreadem", "squirting", "steinsgate", "stockings",
        "straightgirlsplaying", "stripgirls", "sukebei", "superheroporn", "swingersgw", "tailplug", "takimotohifumi", "tanlines", "teentitansporn",
        "tentai", "tessafowler", "thehangingboobs", "thelostwoods", "theratio", "theslutwholived", "thick", "thicker", "thickthighs", "thighhighs",
        "tightdresses", "tinytits", "titfuck", "tittyfest", "tittyfuck", "torpedotits", "traphentai", "trashyboners", "treesgonewild", "truefmk",
        "tuckedinkitties", "twinks", "twobestfriendsplay", "unashamed", "underweargw", "upskirthentai", "voluptuous", "waifusgonewild",
        "watchitfortheplot", "weddingringsshowing", "weddingsgonewild", "whenitgoesin", "whooties", "wincest", "womenofcolor", "workgonewild",
        "wrestlewiththeplot", "wtsstadamit", "xsmallgirls", "yanetgarcia", "yuri", "zettairyouiki", "BigAnimeTiddies", "Ifyouhadtopickone",
        "FrogButt", "FutanariPegging", "WesternHentai", "thick_hentai", "EmbarrassedHentai", "BBW", "keriberry_420", "fitdrawngirls", "thick_hentai",
        "tight_shorts", "outercourse", "cutefutanari", "The_Best_NSFW_GIFS", "AmandaCerny", "patriciacaprice", "Hitomi_Tanaka", "40plusGoneWild", "mewforyew",
        "lactation", "AnimeFeet", "nsfwcyoa", "animelegs", "HugeHangers", "PublicFlashing", "Annoyedtobenude", "TooCuteForPorn",
        "abelladanger", "BoltedOnMaxed", "Balls", "WhipItOut", "AnaCheri", "GirlsinSchoolUniforms", "RateMyNudeBody", "snakes", "AsianAmericanPorn",
        "JailyneOjedaOchoa", "ImpresssedByCum", "Playboy", "StormiMaya", "ElsieHewitt", "vgb", "TheRareOnes", "sissypersonals", "ComplexionExcellence",
        "twerking", "deepthroat", "nsfwcyoa", "doujinshi", "Miakhalifa", "damngoodinterracial", "downblouse", "HappyEmbarrassedGirls",
        "femalepov", "Re_Zero", "SocialMediaSluts", "CelebrityPussy", "forcedorgasms", "Saber", "NostalgiaFapping", "Nekomimi",
        "ShingekiNoKyojin", "JemWolfie", "AlexisRen", "HoneySavage", "Sabrina_Nichole", "annakendrick", "SommerRay", "Amateur",
        "FGOcomics", "thickloads", "ForeheadCum", "VolleyballGirls", "OnOffCelebs", "GillianBarnes", "DDLCRule34", "DemiRoseMawby",
        "ScarlettJohansson", "LoveLive", "omgbeckylookathiscock", "Momokun_MariahMallad", "girlswhoride", "coltish", "classysexy", "crossdressing",
        "NieceWaidhofer", "Nipples", "cottontails", "emmaglover", "TSonFM", "2Booty", "Voltron", "YovannaVentura", "Sierra_Skye", "JerkOffToCelebs",
        "passionx", "kendalljenner", "CumshotSelfies", "PantiesToTheSide", "iwanttobeher", "Femdom", "ClothedTitfuck",
        "JenniferLawrence", "KimKardashianPics", "RugsOnly", "jade_grobler", "madison_ivy", "cfnm", "LexiBelle", "slightcellulite", "barelylegalteens",
        "buttsthatgrip", "ChonoBlackofficial", "SummerLynnHart", "pornID", "swimsuitsuccubus", "sophiedee", "FunWithFriends", "TributeMe", "EmilyRatajkowski",
        "JennaJade", "seethru", "LenaPaul", "petitepeaches", "KylieJenner", "YuzuMiko", "wholesomehentai", "booty", "CedehsGifs", "GirlsHumpingThings",
        "AzureLane", "asiangirlsbeingcute", "WorkIt", "IRLgirls", "fuckdoll", "secretbridgexxx", "AdorableNeonGirls", "GirlsFinishingTheJob",
        "Death_By_SnuSnu", "anriokita", "JapanesePorn2", "GirlsWithToys", "AlahnaLy_", "animeplot", "k_on", "Moescape", "Anal_witch",
        "laurenpisciotta", "AmateurGotBoobs", "collared", "touhou", "HighMileageHoles", "iWantToFuckHer", "dillion_harper", "SchoolIdolFestival",
        "vickili", "Xsome", "LittleWitchAcademia", "AlexisTexas", "animelegwear", "secretlittle", "AgedBeauty", "Squatfuck", "FitNakedGirls",
        "NSFW_Korea", "JustFitnessGirls", "SFandFslavegirls", "Sharktits", "LisaAnn", "Malmalloy", "DadsGoneWild", "Pee", "lanarhoades", "NadyaNabakova",
        "animeponytails", "swingersr4r", "BrowserWaifus_irl", "starwarsnsfw", "cock", "CrossfitGirls", "HairyArmpits", "CelebsMX", "HentaiPetgirls",
        "TightsAndTightClothes", "LingerieGW", "foreskin", "mycleavage", "SonicPorn", "Bustyfit", "lucypinder", "doublepenetration",
        "IsabelaFernandez", "ChurchOfMinaAshido", "danganronpa", "WomenBendingOver", "SlimeGirls", "cosplaybabes", "AnimeSketch",
        "MoundofVenus", "BreastExpansion", "gentlefemdom", "CarlieJo", "HelplessHentai", "NotSafeForNature", "NicoletteShea", "LittleKaylie",
        "NatalieGibson", "ratemycock", "feetpics", "Upshorts", "skinnytail", "chastity", "hangers", "AzureLane", "gay_irl", "ainbow", "bowsette",
        "virtualgeisha", "BeautifulFemales", "snapchatgw", "SluttyConfessions", "SexyWomanOfTheDay", "streetmoe",
        "PantyPeel", "PornstarsHD", "anllelasagra", "SpiceandWolf", "Incest_Gifs", "Pinup", "cutegirlgifs", "PetaJensen", "prettyaltgirls",
        "Hucow", "KizunaA_Irl", "GalinaDubenenko", "SophieM", "GayGifs", "realsexyselfies", "Tori_Black", "IWantToSuckCock",
        "helgalovekaty", "MissAlice_18", "Sexsells", "cameltoe", "MeganRain", "Reiinapop", "JerkOffToCelebs", "fortyfivefiftyfive",
        "solesandholes", "sportsbrasGW", "Fay_Suicide", "tanime", "IceCreamWaifu", "Coralinne_Suicide", "Booette",
        "WhyEvenWearAnything", "Kendra_Sunderland", "blowjobsandwich", "HotStuffNSFW", "LabiaGW", "HENTAI_GIF", "PetiteGoneWild",
        "swordartonline", "AbigailRatchford", "Choker", "RuinedOrgasms", "PublicBoys", "SchoolGirlSkirts", "BustyPetite",
        "TTDSWAD", "AmateurWifes", "SpitRoasted", "IrinaSabetskaya", "BelleDelphine", "AreolasGW", "butterface", "TinyTits",
        "NSFWCostumes", "SheMakesHerSuck", "BaileyJay", "Ladybonersgonecuddly", "GaySoundsShitposts", "Alkethadea", "latexcosplay",
        "AuroraXoxo", "victoriajustice", "TwinGirls", "asaakira", "TaylorSwiftsLegs", "realitydicks", "amazingtits",
        "ThickChixxx", "AdrianaChechik", "KatyuskaMoonFox", "tightsqueeze", "Skullgirls", "AmateurDeepthroat", "WatchItForThePlot",
        "TheMomNextDoor", "NSFW_Plowcam", "ModelsGoneMild", "leahgotti", "gag_spit", "ettaplace", "juliakelly", "RealGirls",
        "geekboners", "OctaviaMay", "girlsfrontline", "MasterOfAnal", "LarkinLoveXXX", "YogaPants", "iskralawrence", "loliconsunite",
        "ArianaGrande", "UpvotedBecauseButt", "CelebrityCandids", "SunDressesGoneWild", "FFNBPS", "uncommonposes", "VintageBabes",
        "CharlotteMcKinney", "jennettemccurdy", "KellyBrook", "GalGadot", "FuckingPerfect", "katyperry", "LegalTeens",
        "leannecrow", "japanpornstars", "onetrueidol", "InstaThots", "MalenaMorgan", "DarshelleCosplay", "titstouchingtits",
        "AmandaEliseLee", "spreading", "FacialFun", "Rolyat", "TaylorSwiftPictures", "MensHighJinx", "BoobsBetweenArms",
        "chickswithchokers", "braless", "KatherynWinnick", "DarkestWomen", "HorsecockFuta", "IrineMeier", "CamSluts",
        "Neonkisses", "StephClaireSmith", "GirlsinWrupPants", "MoeMorphism", "MandyMuse", "BBW_Chubby", "spreadeagle", "sexyhair",
        "FireCrotch", "ImaginaryBoners", "AnastasiyaKvitko", "HentaiParadise", "badwomensanatomy", "curlyhair",
        "AnadeArmas", "HunterXHunter", "ElizabethOlsen", "twicemedia", "chloegracemoretz", "mylittlepony", "petite", "laidbackcamp",
        "MiaMalkova", "ProgressiveGrowth", "creampiegifs", "bigtitsmallnip", "Gloryholes", "bigclit",
        "churchoffutaba", "thefullbush", "NudeCelebsOnly", "girlsdoingstuffnaked", "Produce48", "SFWRedheads", "xoobruna",
        "JuliaJAV", "AvatarPorn", "GIRLSundPANZER", "AsianPorn", "PinkChocolate", "CumHentai", "analgonewild", "Eliza_cs",
        "Jessica_Clements", "BorednIgnored", "SuddenlyGay", "Splitview", "JennaLynnMeowri", "distension", "STPeach", "Amateurincest",
        "MiaMelano", "BanGDream", "notgayporn", "StreamersGoneWild", "ElsaJean", "StreetFighter", "pm_your_pokemon_team",
        "facesitting", "satania", "diives", "javdreams", "samespecies", "rule34_comics", "NakedAdventures", "gay",
        "thighdeology", "pawg", "legendarylootz", "fatestaynight", "wolfgirlanon", "NatalieDormer", "cumcoveredfucking",
        "SluttyHalloween", "AthleticGirls", "bisexual", "MiddleEasternHotties", "alvajay", "CosplayLewd", "BreakingTheSeal",
        "womenofcolorXXX", "WhiteCheeks", "BustyNaturals", "tzuyu", "MaryElizabethWinstead", "Holly_Peers",
        "JustOneBoob", "BigBlackBootyGIFS", "Hentai_memes", "cumonclothes", "CumFromAnal", "ThickDick", "Rihanna",
        "KaylaErinCosplay", "animearmpits", "JynxMaze", "SaraJay", "milkyteaa", "alvajay", "Anna_Louise", "LegalTeensXXX",
        "blonde", "gilf", "Tiger_Chilli", "Bulges", "Beardsandboners", "tits", "hugefutanari", "EnjiNight",
        "yiff", "katebeckinsale", "mariorule34", "DoveCameron", "Liya_Silver", "JennaFischer", "SarahHyland", "celebritylegs",
        "CumKiss", "manass", "SourcePornMaker", "CelebrityNipples", "rule34feet", "Nicki_Minaj", "PrettyGirlsUglyFaces",
        "ShemalesParadise", "myChippyLipton", "HaileeSteinfeld", "breastsucking", "whaletail", "Cyberbooty", "CuteTraps",
        "blakelively", "Dominated", "fuckmeat", "ClassyPornstars", "maisiewilliams", "cassiebrown", "MasturbationHentai",
        "selfie", "PaolaSkye", "oldschoolhot", "hentaifemdom", "LiaraRoux", "PaigeSpiranac", "Hilary_Duff", "forearmporn",
        "candiceswanepoel", "XChangePill", "bigonewild", "pulsatingcumshots", "CasualJiggles", "janicegriffith", "KelsiMonroe",
        "BigAndMuscular", "ChristyMack", "areolas", "EnhancedFucktoys", "DaniDaniels", "before_after_cumsluts",
        "nicoleaniston", "panties", "ChristianGirls", "FaceofPain", "Alison_Tyler", "KendraLust", "ToplessInJeans",
        "BoltedOnBooty", "throatbarrier", "BrandiLove", "porninaminute", "metart", "kristenbell", "NSFW_Hardbodies",
        "SoHotItHurts", "Lesbian_gifs", "Presenting", "EraserNipples", "NintendoWaifus", "extramile", "berpl", "KeilahKang",
        "pegging_unkinked", "RetrousseTits", "hotclub", "smashbros34", "DegradingHoles", "blacktears", "TheRedFox", "Shadman",
        "nsfwedit", "MissPrincessKay", "whoredrobe", "Rikka_Takarada", "NakedOnStage", "pizzadare", "SubwayHentai",
        "Hotdogging", "DraculaBiscuits", "wifepictrading", "CedehsHentai", "VerifiedFeet", "AzurLewd", "miskhalifa",
        "kaibasmistress", "DeliciousTraps", "mila_azul", "FauxBait", "MyCherryCrush", "Alisai", "GifsOfRemoval",
        "HarliLotts", "BigBoobsWithFriends", "gothsluts", "chickswearingchucks", "Atago", "CelebrityPenis",
        "fuckingmachines", "IShouldBuyABoat", "CosplayBoobs", "taboofans", "emogirls", "HighHeels", "AbusePorn2",
        "leannadecker", "asiangirlswhitecocks", "Pushing", "maturemilf", "Lordosis", "deathmetalgfclub",
        "WhiteAndThick", "GirlsWearingVS", "MyCalvins", "CollegeInitiation", "joeyfisher", "FitGirlsFucking",
        "mila_azul", "sex_comics", "KateeOwen", "Hotwife", "EroticLuxury", "WrestleFap", "PickOne", "OliviaMunn",
        "Titties", "Humongousaurustits", "sissyhypno", "CelebsBR", "dontslutshame", "AdultNeeds", "GodPussy",
        "assholegonewild", "workgonewild", "LiyaSilver", "CuteTraps"
    ].map(x => x && x.toLowerCase()),
    pornaccount: [
        "lilmshotstuff", "Bl0ndeB0i", "Alathenia", "kinkylilkittyy", "Immediateunmber", "justsomegirlidk", "serenityjaneee",
        "Urdadstillwantsme", "therealtobywong", "sarah-xxx", "RubyLeClaire", "chickpeasyx", "rizzzzzy",
        "clarabelle_says", "Telari_Love", "purplehailstorm", "Peach_Legend", "NetflixandChillMe", "xrxse",
        "alomaXsteele", "BeaYork", "Littlebitdramatic", "fitchers_bird", "CalicoKitty19", "ILikeMakingPornGifs",
        "FreshBeaver", "liz_103", "CalicoKitty19", "petitenudist413", "hastalapasta96", "pumpkinbread717",
        "Your_Little_Angel"
    ].map(x => x && x.toLowerCase()),
    animesub: [
        "FireEmblemHeroes", "RWBY", "digimon", "Itasha", "Haruhi", "DragaliaLost", "awwnimate", "TokyoGhoul", "animenocontext",
        "TheTempleOfOchako", "senrankagura", "furry_irl", "GoblinSlayer", "ImaginaryWarhammer", "characterdrawing",
        "criticalrole", "ImaginaryCharacters", "alternativeart", "SoulCaliburCreations", "BokuNoMetaAcademia",
        "GoblinSlayer", "comicbookart", "Paladins", "initiald", "bleach", "MonsterHunterWorld", "Vocaloid",
        "Gunime", "VirtualCosplay", "DragonballLegends", "PERSoNA", "ChurchofKawakami", "shitpostemblem",
        "ImaginaryWitches", "BokuNoMetaAcademia", "Animemes", "MonsterHunter", "darkestdungeon", "Gunpla",
        "stevenuniverse", "dbz", "wholesomeanimemes", "Xenoblade_Chronicles", "ffxiv", "yiff", "nier", "fireemblem",
        "Persona5", "OnePunchMan", "Art", "overlord", "FullmetalAlchemist", "heroesofthestorm", "AceAttorney",
        "ChurchofFroppy", "Xcom", "PuzzleAndDragons", "FinalFantasy", "Spiderman", "Dragonballsuper", "MapleStory2",
        "notdisneyvacation", "TheDragonPrince", "DestinyFashion", "berserklejerk", "venturebros", "ImaginaryMonsterGirls",
        "FortniteFashion", "EstateofMomo", "CellsAtWork", "HighschoolDxD", "BokuNoShipAcademia", "Tsunderes",
        "ImaginaryOverwatch", "ImaginarySliceOfLife", "MadokaMagica", "SeishunButaYarou", "yuruyuri", "houkai3rd",
        "Megaten", "Saber", "Metroid", "osugame", "grandorder", "yugioh", "attackontitan", "megane", "OneTrueBiribiri",
        "pouts", "MyHeroAcademia", "ImaginaryMonsters", "dragonballfighterz", "kancolle", "ReasonableFantasy",
        "minipainting", "salty", "HollowKnight", "ShitPostCrusaders", "Sekiro", "TsundereSharks", "DomesticGirlfriend"
    ].map(x => x && x.toLowerCase()),
    annoyingflair: [
        "Art", "Artwork", "FanArt", "Fan Art", "Fan Work"
    ].map(x => x && x.toLowerCase()),
    annoyingsub: [
        "uglyduckling", "guineapigs", "Rats", "happy", "Blep", "tattoos", "forbiddensnacks", "PrequelMemes",
        "BoneAppleTea", "deadbydaylight", "Eyebleach", "vegan", "boottoobig", "pitbulls",
        "drawing", "piercing", "Illustration", "curledfeetsies", "brushybrushy", "aww", "rarepuppers", "surrealmemes",
        "antiMLM", "vaxxhappened", "bonehurtingjuice", "meirl", "me_irl", "inthesoulstone", "thanosdidnothingwrong",
        "sneks", "2meirl4meirl", "corgi", "sweden", "Catloaf", "SupermodelCats", "CatTaps", "PenmanshipPorn", "catbellies",
        "blackcats", "intermittentfasting", "fasting"
    ].map(x => x && x.toLowerCase()),
    show: [
        "TheSimpsons", "gravityfalls"
    ].map(x => x && x.toLowerCase()),
    game: [
        "deadbydaylight", "smashbros", "DestinyTheGame", "destiny2", "Warframe", "NintendoSwitch", "Warhammer40k", "PathOfExile",
        "zelda", "starcraft", "Competitiveoverwatch", "overwatch", "FortNiteBR", "Overwatch_Memes", "Deltarune",
        "ACPocketCamp"
    ].map(x => x && x.toLowerCase()),
    politics: [
        "AgainstHateSubreddits", "AntiTrumpAlliance", "BannedFromThe_Donald", "esist", "Fuckthealtright", "Impeach_Trump",
        "LateStageCapitalizm", "MarcheAgainstTrump", "MarchAgainstNazis", "Political_Revolution", "politics", "RussiaLago",
        "ShitThe_DonaldSays", "The_Dotard", "Trumpgret", "PoliticalHumor", "The_Mueller", "SandersForPresident",
        "EnoughTrumpSpam", "TrumpCriticizesTrump", "MurderedByWords"
    ].map(x => x && x.toLowerCase())
};
RESES.linkRegistry = (() => {
    const _links = {};
    var _rgxGetHostName = /(\w{1,})(?=(?:\.[a-z]{2,4}){0,2}$)/;
    var _rgxSplitURL = /\/|\?/;
    function splitUrl(url) {
        var parts = url.split(_rgxSplitURL);
        try {
            parts[0] = _rgxGetHostName.exec(parts[0])[0];
        }
        catch (e) {
            console.error(url, parts, e);
            throw e;
        }
        return parts;
    }
    function getNode(parts) {
        var blocked = LinkRegistry.dictBlocked;
        for (var i = 0, len = parts.length - 1; i < len; i++) {
            let node = blocked[parts[i]];
            if (!node) {
                node = blocked[parts[i]] = {};
            }
            blocked = node;
        }
        return blocked;
    }
    function saveBlocked() {
        RESES.config.setSetting("dictblocked");
    }
    const LinkRegistry = {
        get links() {
            return _links;
        },
        get dictBlocked() { return RESES.config.getSetting('dictblocked', '{}'); },
        get toArray() {
            function recurser(root) {
                var arr = [];
                Object.keys(root).forEach(key => {
                    let node = root[key];
                    if (node === 1) {
                        arr.push(key);
                    }
                    else {
                        var children = recurser(node);
                        children.forEach(x => {
                            var url = key + "/" + x;
                            arr.push(url);
                        });
                    }
                });
                return arr;
            }
            var results = recurser(this.dictBlocked).sort();
            return results;
        },
        addBlockedUrl: function addBlockedUrl(url, nosave) {
            var parts = splitUrl(url);
            var last = parts[parts.length - 1];
            var node = getNode(parts);
            if (last in node) {
                console.error("Duplicate Blocked Url.", url);
            }
            else {
                node[last] = 1;
                !nosave && RESES.debounce(saveBlocked, 30);
            }
        },
        removeBlockedUrl: function removeBlockedUrl(url) {
            var parts = splitUrl(url);
            var last = parts[parts.length - 1];
            var node = getNode(parts);
            if (last in node) {
                delete node[last];
                RESES.debounce(saveBlocked, 30);
            }
            else {
                console.error("Blocked Url Does not Exist and cannot be removed.", url);
            }
        },
        import: function (json) {
            var urls = JSON.parse(json);
            urls.forEach(x => this.addBlockedUrl(x, true));
            saveBlocked();
            return this.dictBlocked;
        },
        checkIfBlockedUrl: function checkIfBlockedUrl(url) {
            var parts = splitUrl(url);
            var blocked = LinkRegistry.dictBlocked;
            for (var i = 0, len = parts.length; i < len; i++) {
                if (!(blocked = blocked[parts[i]])) {
                    return false;
                }
            }
            return true;
        },
        registerLinkListing: function registerLinkListing(post) {
            if (post.url in _links) {
                var entry = _links[post.url];
                if (Array.isArray(entry)) {
                    entry.push(post);
                }
                else {
                    _links[post.url] = [entry, post];
                }
                return true;
            }
            else {
                _links[post.url] = post;
                return false;
            }
        }
    };
    return LinkRegistry;
})();
RESES.posts = new Map();
RESES.LinkListing = (() => {
    const asyncctx = new RESES.AsyncCtx("LinkListing");
    function _updateThumbnail(post) {
        if (post.thumbnail) {
            post.thumbnail.style.display = post.isExpanded ? 'none' : '';
        }
    }
    function _handleVoteClick(post, ev) {
        if (ev.target === post.voteArrowDown) {
            if (!post.isDownvoted) {
                if (post.isExpanded) {
                    let btn = post.post.getElementsByClassName('expando-button')[0];
                    if (btn) {
                        btn.click();
                    }
                }
                if (ev.isTrusted && !post.isAutoDownvoted && post.url) {
                    RESES.linkRegistry.addBlockedUrl(post.url);
                }
            }
            else {
                if (ev.isTrusted && !post.isAutoDownvoted && post.url) {
                    RESES.linkRegistry.removeBlockedUrl(post.url);
                }
            }
            post.bPending = false;
        }
        RESES.debounce(RESES.linkListingMgr.updateLinkListings);
    }
    function _adjustFlairColor(label) {
        var style = window.getComputedStyle(label);
        var background = new RESES.Color(style['background-color']);
        var text = new RESES.Color(style['color']);
        if (Math.abs(background.luma - text.luma) < 100) {
            label.style.color = text.inverted.toString();
        }
    }
    function _getHostAndPath(url) {
        let end = url.indexOf('#');
        if (end < 0) {
            end = url.length;
        }
        let start = url.indexOf('www.') + 4;
        if (start < 4) {
            start = url.indexOf('//') + 2;
        }
        if (start < 2) {
            start = 0;
        }
        if (url[start] === "/") {
            start += 1;
        }
        return url.substr(start, end - start);
    }
    function _sanitizeSubreddit(subreddit) {
        if (subreddit.startsWith('u_')) {
            subreddit = subreddit.substr(2);
        }
        return subreddit.toLowerCase();
    }
    const filterData = RESES.filterData;
    const checkIfBlockedUrl = RESES.linkRegistry.checkIfBlockedUrl;
    const registerLinkListing = RESES.linkRegistry.registerLinkListing;
    const wm = new WeakMap();
    const all_filters = [];
    let bodyclasslist = null;
    class LinkListing {
        constructor(post) {
            RESES.posts.set(post.id, this);
            this.post = post;
            this.cls = post.classList;
            this.thumbnail = post.getElementsByClassName('thumbnail')[0] || null;
            this.midcol = post.getElementsByClassName('midcol')[0] || null;
            this.expandobox = post.getElementsByClassName('res-expando-box')[0] || post.getElementsByClassName('expando')[0] || null;
            let ds = post.dataset;
            this.url = ds.url || null;
            this.subreddit = ds.subreddit || null;
            this.author = ds.author || null;
            this.age = Date.now() - Number(ds.timestamp);
            this.bIsTextPost = this.thumbnail !== null && (this.cls.contains('self') || this.cls.contains('default')) || this.expandobox === null;
            this.bPending = false;
            this.arrPendingOps = [];
            this.updateThumbnail = () => _updateThumbnail(this);
            this.handleVoteClick = (ev) => _handleVoteClick(this, ev);
            this.cls.add('registered');
            if (this.midcol !== null) {
                this.midcol.addEventListener('click', this.handleVoteClick);
            }
            if (this.url !== null) {
                this.url = _getHostAndPath(this.url);
                if (this.url.length > 0) {
                    if (this.isBlockedURL = checkIfBlockedUrl(this.url)) {
                        console.log("Autodownvoting blocked url: " + this.url, this);
                    }
                    this.isRepost = registerLinkListing(this);
                }
            }
            if (this.subreddit !== null) {
                this.subreddit = _sanitizeSubreddit(this.subreddit);
                if (!this.bIsTextPost) {
                    this.isPornsub = filterData.pornsub.includes(this.subreddit);
                    this.isPornaccount = filterData.pornaccount.includes(this.subreddit);
                }
                this.isAnimesub = filterData.animesub.includes(this.subreddit);
                this.isAnnoyingsub = filterData.show.includes(this.subreddit);
                this.isShow = filterData.show.includes(this.subreddit);
                this.isGame = filterData.game.includes(this.subreddit);
                this.isPolitics = filterData.politics.includes(this.subreddit);
            }
            if (this.author !== null) {
                this.author = this.author.toLowerCase();
                this.isKarmawhore = filterData.karmawhore.includes(this.author);
                if (!this.bIsTextPost) {
                    this.isPornaccount = filterData.pornaccount.includes(this.author);
                }
            }
            if (post.classList.contains("linkFlair")) {
                let label = post.getElementsByClassName('linkflairlabel')[0];
                let text = label.title.toLowerCase();
                this.isAnnoyingflair = filterData.annoyingflair.includes(text);
                if (!this.isAnnoyingflair && !this.isAnnoyingsub) {
                    this.arrPendingOps.push(() => _adjustFlairColor(label));
                }
            }
            if (this.shouldBeDownvoted) {
                this.autoDownvotePost();
            }
            if (this.expandobox !== null) {
                new MutationObserver(this.updateThumbnail).observe(this.expandobox, { attributes: true });
            }
            this.updateThumbnail();
        }
        get ageHours() { return this.age / 3600000; }
        get ageDays() { return this.age / 86400000; }
        get isUpvoted() { return Boolean(this.hasClass("likes") ^ this.bPending); }
        get isUnvoted() { return Boolean(this.hasClass("unvoted") ^ this.bPending); }
        get isDownvoted() { return Boolean(this.hasClass("dislikes") ^ this.bPending); }
        get isExpanded() {
            var expando = this.expandobox;
            return expando && expando.firstElementChild && expando.firstElementChild.firstElementChild && !(expando.style.display === 'none' || expando.hasAttribute('hidden'));
        }
        get isCrosspost() { return parseInt(this.post.dataset.numCrossposts) > 0; }
        get isNSFW() { return this.cls.contains('over18'); }
        get isFilteredByRES() { return this.cls.contains('RESFiltered'); }
        get bMatchesFilter() {
            let filters = all_filters;
            for (var len = filters.length, i = 0; i < len; i++) {
                var filter = filters[i];
                if (this[filter.use]) {
                    return true;
                }
            }
            return false;
        }
        get shouldBeDownvoted() {
            return this.subreddit !== RESES.subreddit && (!RESES.bIsMultireddit && (this.bRepost || this.bMatchesFilter));
        }
        get voteArrowDown() {
            var item = null;
            if (this.midcol !== null) {
                item = wm.get(this.midcol);
                if (!item) {
                    item = this.midcol.getElementsByClassName('arrow')[1] || null;
                    item && wm.set(this.midcol, item);
                }
            }
            return item;
        }
        hasClass(classes) {
            for (let i = 0, len = arguments.length; i < len; i++) {
                let cls = arguments[i];
                if (this.cls.contains(cls) || this.midcol && this.midcol.classList.contains(cls)) {
                    return true;
                }
            }
            return false;
        }
        clickDownvoteArrow() {
            if (this.midcol !== null) {
                this.bPending = true;
                this.arrPendingOps.push(() => this.voteArrowDown.click());
            }
        }
        autoDownvotePost() {
            var cfg = RESES.config;
            if (!RESES.bIsUserPage && cfg.bAutoDownvoting && this.isUnvoted && this.ageDays < 30) {
                if (this.bBlockedURL || cfg.bDownvoteReposts && this.bRepost || cfg.bDownvoteFiltered && (this.bMatchesFilter)) {
                    this.isAutoDownvoted = true;
                    this.clickDownvoteArrow();
                }
                if (this.expandobox) {
                    this.expandobox.hidden = true;
                }
            }
        }
        removeAutoDownvote() {
            if (this.isDownvoted && this.isAutoDownvoted) {
                this.isAutoDownvoted = false;
                this.clickDownvoteArrow();
                if (this.expandobox) {
                    this.expandobox.hidden = false;
                }
            }
        }
    }
    function generateCSS_GetterSetter(cssIs) {
        return {
            configurable: false, enumerable: false,
            get: function () { return this.cls.contains(cssIs); },
            set: function (bool) { this.cls.toggle(cssIs, bool); }
        };
    }
    function generateCSS_BodyGetter(cssFilter, cssIs) {
        return {
            configurable: false, enumerable: false,
            get: function () { return bodyclasslist.contains(cssFilter) && this.cls.contains(cssIs); }
        };
    }
    function defineFilter(key) {
        let filter = {
            key: key,
            cssFilter: "filter_" + key,
            cssIs: "is_" + key,
            jsIs: "is" + key.Capitalize(),
            use: "b" + key.Capitalize()
        };
        Object.defineProperties(LinkListing.prototype, {
            [filter.jsIs]: generateCSS_GetterSetter(filter.cssIs),
            [filter.use]: generateCSS_BodyGetter(filter.cssFilter, filter.cssIs),
        });
        all_filters.push(filter);
    }
    ;
    defineFilter("repost");
    defineFilter("blockedURL");
    Object.keys(RESES.filterData).forEach(defineFilter);
    Object.defineProperties(LinkListing, {
        filters: { configurable: false, enumerable: false, writable: false, value: all_filters },
        defineFilter: { configurable: false, enumerable: false, writable: false, value: defineFilter }
    });
    RESES.onReady(function generateCSSRules() {
        bodyclasslist = document.body.classList;
        document.head.parentElement.classList.add('reses');
        document.head.parentElement.classList.add('res-filters-disabled');
        let arr = [];
        all_filters.forEach(filter => {
            arr.push(`html.res.reses body #siteTable .thing.registered.${filter.cssIs} { display: block !important; }`);
            arr.push(`html.res.reses body.${filter.cssFilter} #siteTable .thing.registered.${filter.cssIs} { display: none !important; }`);
        });
        let style = Element.From(`<style id="reses_FilterRules">
      ${arr.join("\n")}
    </style>`);
        document.head.appendChild(style);
    });
    return LinkListing;
})();
RESES.linkListingMgr = (() => {
    const LinkListing = RESES.LinkListing;
    const _newLinkListings = [];
    const _listingCollection = Array(2000);
    var idx_end = 0;
    var linklistingObserver = null;
    var block_updateLinkListings = false;
    function _updateLinkListings() {
        if (!block_updateLinkListings) {
            processListingsAsChunks();
            var good = 0, filtered = 0, shit = 0;
            for (var i = 0, len = idx_end, posts = _listingCollection; i < len; i++) {
                var post = posts[i];
                if (post.isDownvoted) {
                    shit++;
                }
                else if (post.bMatchesFilter) {
                    filtered++;
                }
                else {
                    good++;
                }
            }
            RESES.btnFilterPost.update({ good, filtered, shit });
        }
    }
    function _processNewLinkListings() {
        block_updateLinkListings = true;
        console.time("ProcessNewLinkListings");
        var linklisting = _newLinkListings.pop();
        while (linklisting) {
            var children = linklisting.children;
            for (var i = 0, len = children.length; i < len; i++) {
                var listing = children[i];
                if (listing.classList.contains('link')) {
                    _listingCollection[idx_end++] = new LinkListing(listing);
                }
            }
            linklisting = _newLinkListings.pop();
        }
        block_updateLinkListings = false;
        _updateLinkListings();
        console.timeEnd("ProcessNewLinkListings");
    }
    function _handleLinkListingMutation(mutations) {
        for (var i = 0, len = mutations.length; i < len; i++) {
            var adds = mutations[i].addedNodes;
            for (var k = 0, l2 = adds.length; k < l2; k++) {
                var node = adds[k];
                if (node.nodeType === 1 && node.classList.contains('sitetable')) {
                    _newLinkListings.push(node);
                }
            }
        }
        RESES.debounce(_processNewLinkListings);
    }
    function linkListingReady() {
        var linklistings = document.getElementsByClassName('linklisting');
        var root = linklistings[0];
        if (root) {
            linklistingObserver = new MutationObserver(_handleLinkListingMutation);
            linklistingObserver.observe(root, { childList: true });
            for (var i = 0, len = linklistings.length; i < len; i++) {
                _newLinkListings.push(linklistings[i]);
            }
            RESES.debounce(_processNewLinkListings);
            var showimages = document.getElementsByClassName('res-show-images')[0];
            if (showimages) {
                showimages.addEventListener('click', () => _updateLinkListings());
            }
        }
    }
    RESES.onLoaded(linkListingReady, 0);
    function processChunk(from, to, what) {
        let collection = _listingCollection;
        while (from < to) {
            var post = collection[from];
            while (post.arrPendingOps.length) {
                var op = post.arrPendingOps.shift();
                try {
                    op();
                }
                catch (ex) {
                    debugger;
                    console.error(ex, op);
                }
            }
            what && what.call(collection[from]);
            ++from;
        }
    }
    function processListingsChunk(from, to, what) {
        window.requestAnimationFrame(() => processChunk(from, to, what));
    }
    function processListingsAsChunks(what) {
        for (var i = 0, len = idx_end; i < len; i += 20) {
            processListingsChunk(i, Math.min(i + 20, len), what);
        }
        window.requestAnimationFrame(() => RESES.debounce(RESES.linkListingMgr.updateLinkListings));
    }
    return {
        listings: _listingCollection,
        processListingsAsChunks,
        updateLinkListings: _updateLinkListings
    };
})();
RESES.ScrollingSidebar = (() => {
    function _toggleSidebar(ss, bState) {
        var cls = ss.el.classList;
        cls.add('sb-init');
        ss.bShowing = bState !== undefined ? cls.toggle('sb-on', !cls.toggle('sb-off', !bState)) : cls.toggle('sb-on', !cls.toggle('sb-off'));
        ss.handleScroll();
        ss.cbStateChange(bState);
        return ss;
    }
    function _handleScroll(ss) {
        if (ss.sled != null && ss.bShowing) {
            var margintop = ss.marginTop;
            var yscroll = window.scrollY;
            var ydiff = yscroll - ss.yprev;
            var sledBounds = ss.sled.getBoundingClientRect();
            if (yscroll === 0) {
                margintop = 0;
            }
            else if (sledBounds.height > window.innerHeight) {
                var bottomGap = window.innerHeight - sledBounds.bottom;
                var topGap = sledBounds.top - (ss.track.getBoundingClientRect().top + yscroll);
                if (bottomGap >= 0) {
                    margintop += bottomGap - (ydiff >= 0 ? 1 : 0);
                }
                else if (topGap >= 0) {
                    margintop += -topGap - (ydiff >= 0 ? 1 : 0);
                }
            }
            else {
                margintop += ydiff;
            }
            if (margintop != ss.marginTop) {
                ss.sled.style.marginTop = (ss.marginTop = margintop) + 'px';
            }
            ss.yprev = yscroll;
            ss.bGuard = false;
        }
    }
    function _handleScrollGuarded(ss) {
        if (ss.bShowing && ss.bGuard === false) {
            ss.bGuard = true;
            RESES.doAsync(ss.handleScroll);
        }
    }
    class ScrollingSidebar {
        constructor(id, cbStateChange) {
            this.id = id;
            this.cbStateChange = cbStateChange;
            this.handleScrollGuarded = () => _handleScrollGuarded(this);
            this.handleScroll = () => _handleScroll(this);
            this.toggleSidebar = (bool) => { RESES.doAsync(() => { _toggleSidebar(this, bool); }); };
            this.el = Element.From(`
				<div id='${id}' class='sidebar'>
					<div class='sb-handle'></div>
					<div class='sb-track'></div>
				</div>`);
            this.handle = this.el.firstElementChild;
            this.track = this.el.lastElementChild;
            this.sled = null;
            this.yprev = 0;
            this.marginTop = 0;
            this.timer = 0;
            this.bGuard = false;
            this.bShowing = true;
        }
        init(target) {
            if (!target) {
                return;
            }
            var parent = target.parentElement;
            parent.insertBefore(this.el, target);
            this.sled = parent.removeChild(target);
            this.sled.classList.add('sb-sled');
            this.track.append(this.sled);
            this.handle.addEventListener('click', () => this.toggleSidebar());
            window.addEventListener('scroll', this.handleScrollGuarded);
            this.toggleSidebar(false);
        }
    }
    return ScrollingSidebar;
})();
RESES.sideBarMgr = (() => {
    var ssleft, ssright, ssheader;
    function _update() {
        var style = {};
        if (ssleft.sled) {
            style.paddingLeft = Math.max(8, ssleft.el.scrollWidth);
        }
        if (ssright.sled) {
            style.paddingRight = Math.max(8, ssright.el.scrollWidth);
        }
        document.querySelectorAll('.content[role=main], .footer-parent').CSS(style);
    }
    function sideBarMgrInit() {
        ssleft = new RESES.ScrollingSidebar('sbLeft', _update);
        ssright = new RESES.ScrollingSidebar('sbRight', _update);
    }
    function sideBarMgrReady() {
        document.querySelectorAll('.listing-chooser .grippy').Remove();
        ssleft.init(document.querySelector('.listing-chooser .contents'));
        ssright.init(document.getElementsByClassName('side')[0]);
        document.body.classList.add('sidebarman');
    }
    RESES.onInit(sideBarMgrInit, -5);
    RESES.onReady(sideBarMgrReady, -5);
    return {
        get leftSidebar() { return ssleft; },
        get rightSidebar() { return ssright; },
        get header() { return ssheader; }
    };
})();
RESES.btnFilterPost = (() => {
    const btn = Element.From(`
		<li id="resesMenuButton">
			<style type="text/css" scoped>
        body.goodthings #filtermode .goodthings {	color: lightgreen;	}
        body.filteredthings #filtermode .filteredthings, body.badthings #filtermode .badthings {	color: tomato;	}
        #btnDropdown:hover #resesCfg { display: block; }
        #resesCfg { display:none; width: 100%; position: absolute; min-width: 160px; z-index:10;
          background-color: rgb(50, 50, 50);
        }
        #resesCfg li { margin: 0; }
        #resesCfg li:hover { filter: brightness(125%); }
        .resesddl li {
          display: block;
          cursor: pointer;
          width: auto;
        }
        .resesddl li a {
          margin: 5px;
          padding: 4px;
          width: auto;
          display: block;
        }
        .resesddl .resesddl {
          border-left: medium solid slateblue;
          margin-left: 8px;
        }

        .setting a::after { content: "enabled"; float: right; }
        .setting.disabled a::after { content: "disabled" }
        .setting.disabled a { color: red; }
        .setting.disabled setting { display: none; }
			</style>
			<div id="btnDropdown" style="position:relative; display: inline-block;">
				<a id="filtermode" href="#2">
					<span class='goodpost'>GoodPosts(<span></span>)</span>&nbsp-&nbsp
					<span class='filteredpost'>Filtered(<span></span>)</span>&nbsp-&nbsp
					<span class='shitpost'>Downvoted(<span></span>)</span>
        </a>
        <div id="resesCfg">
          <ul class='resesddl'>
            <li><a id="downvoteFiltered"><span>Downvote all filtered content</span></a></li>
            <li><a id="removeDownvotes"><span>Remove Auto Downvotes</span></a></li>
          </ul>
        </div>
			</div>
    </li>`);
    const dropdown = btn.querySelector('#btnDropdown');
    function addToggle(parent, filter, _default = true, onChange) {
        let id = typeof filter === 'string' ? filter : filter.cssFilter;
        RESES.config.defineSetting(id, _default);
        const setting = Element.From(`<li id="${id}" class="setting">
                                      <a><span>${id}</span></a>
                                  </li>`);
        setting.toggle = (val) => setting.classList.toggle('disabled', !document.body.classList.toggle(id, val));
        setting.addEventListener('click', (ev) => {
            ev.stopPropagation();
            let value = RESES.config[id] = document.body.classList.toggle(id);
            setting.classList.toggle('disabled', !value);
            onChange && onChange.call(setting, value, ev);
            RESES.linkListingMgr.updateLinkListings();
        });
        let ul = parent.getElementsByTagName('ul')[0];
        if (!ul) {
            parent.appendChild(ul = Element.From(`<ul class='resesddl'></ul>`));
        }
        ul.appendChild(setting);
        if (typeof filter !== 'string') {
            filter.setting = setting;
        }
        RESES.onInit(() => {
            setting.toggle(RESES.config[id]);
        });
        return setting;
    }
    btn.querySelector('#filtermode').addEventListener('click', function onFilterModeClick() {
        var cls = document.body.classList;
        if (cls.contains('goodpost')) {
            cls.replace('goodpost', 'filteredpost');
        }
        else if (cls.contains('filteredpost')) {
            cls.replace('filteredpost', 'shitpost');
        }
        else if (cls.contains('shitpost')) {
            cls.replace('shitpost', 'goodpost');
        }
        RESES.debounce(RESES.linkListingMgr.updateLinkListings);
    });
    btn.querySelector('#downvoteFiltered').addEventListener('click', function downvoteFiltered() {
        RESES.linkListingMgr.processListingsAsChunks(RESES.LinkListing.prototype.autoDownvotePost);
    });
    btn.querySelector('#removeDownvotes').addEventListener('click', function removeDownvotes() {
        RESES.linkListingMgr.processListingsAsChunks(RESES.LinkListing.prototype.removeAutoDownvote);
    });
    const ddlAutoDownvoting = addToggle(dropdown, 'bAutoDownvoting');
    addToggle(ddlAutoDownvoting, 'bDownvoteReposts', true);
    addToggle(ddlAutoDownvoting, 'bDownvoteFiltered', true);
    const ddlFilters = addToggle(dropdown, 'bFilterPosts', true, (value) => {
        RESES.LinkListing.filters.forEach(filter => {
            filter.setting.toggle(value);
        });
    });
    RESES.LinkListing.filters.forEach(filter => {
        addToggle(ddlFilters, filter, true);
    });
    RESES.onReady(function tabMenuReady() {
        if (!RESES.bIsCommentPage && !RESES.bIsUserPage) {
            document.body.classList.add('goodpost');
            var tabbar = document.getElementsByClassName('tabmenu')[0];
            if (tabbar) {
                tabbar.appendChild(btn);
            }
        }
    }, 10);
    const elGoodposts = btn.querySelector('.goodpost span');
    const elFilteredposts = btn.querySelector('.filteredpost span');
    const elShitposts = btn.querySelector('.shitpost span');
    return {
        get btn() { return btn; },
        update: function (counters) {
            elGoodposts.textContent = counters.good;
            elFilteredposts.textContent = counters.filtered;
            elShitposts.textContent = counters.shit;
        }
    };
})();
console.timeEnd("RESES");
