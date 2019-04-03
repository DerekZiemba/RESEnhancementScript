"use strict";
Element.From = (function () {
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
    extendType: (function () {
        function defineOne(proto, name, prop, options, obj) {
            if (name in proto) {
                if (options.override) {
                    Object.defineProperty(proto, name, prop);
                }
                else if (options.merge) {
                    extendType(proto[name], obj[name], options);
                }
            }
            else {
                Object.defineProperty(proto, name, prop);
            }
        }
        function defineSeveral(proto, name, prop, options, obj) {
            for (var i = 0, len = proto.length; i < len; i++) {
                defineOne(proto[i], name, prop, options, obj);
            }
        }
        function extendType(proto, obj, options) {
            if (!options) {
                options = { enumerable: undefined, configurable: undefined, writable: undefined, override: true, merge: false };
            }
            var define = proto instanceof Array ? defineSeveral : defineOne;
            var keys = Object.keys(obj);
            for (var i = 0, len = keys.length; i < len; i++) {
                var name = keys[i];
                var opts = options.hasOwnProperty(name) ? Object.assign({}, options, options[name]) : options;
                var prop = Object.getOwnPropertyDescriptor(obj, name);
                if (opts.enumerable != null) {
                    prop.enumerable = opts.enumerable;
                }
                if (opts.configurable != null) {
                    prop.configurable = opts.configurable;
                }
                if (opts.writable != null && 'value' in prop) {
                    prop.writable = opts.writable;
                }
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
    }()),
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
            }
            get remaining() { return Math.trunc(this.delay - (this.current - this.start)); }
            get elapsedTotal() { return fix(this.current - this.start); }
            cancel() {
                this.background === true ? window.clearTimeout(this.timer) : window.cancelAnimationFrame(this.timer);
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
            debounce(method, delay) {
                var op = this.map.get(method);
                if (op !== undefined) {
                    op.cancel();
                }
                else {
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
    let context = RESES.AsyncCtx.default;
    var _initCalls = [];
    var _readyCalls = [];
    var _loadedCalls = [];
    window.addEventListener("load", windowLoaded);
    if (document.readyState !== "loading") {
        console.info("RESES loaded during weird document state.", document.readyState);
        RESES.doAsync(documentReady);
    }
    else {
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
        }
        else {
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
            }
        }
    }
    RESES.onInit = function (method, priority = 100) {
        if (_initCalls !== null) {
            _initCalls.push({ priority, method });
            context.debounce(initialize);
        }
        else {
            throw new Error("Initialization already in progress. Too late to call onInit.");
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
})(RESES);
RESES.extendType(String.prototype, {
    ReplaceAll: function ReplaceAll(sequence, value) {
        return this.split(sequence).join(value);
    },
    Trim: (function () {
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
        return function trim(chars, option, maxcount) {
            var max = maxcount | -1;
            if (option == null) {
                option = 3;
            }
            if (chars || max > 0) {
                return specialTrim(this, chars ? chars : " ", option, max);
            }
            return whitespaceTrim(this, option);
        };
    }()),
    TrimStart: function (ch, maxcount) {
        return this.Trim(ch, 1, maxcount);
    },
    TrimEnd: function (ch, maxcount) {
        return this.Trim(ch, 2, maxcount);
    },
    SubstrBefore: function (sequence, bIncludeSequence) {
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
    },
    SubstrAfter: function (sequence, bIncludeSequence) {
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
    },
    SubstrBeforeLast: function (sequence, bIncludeSequence) {
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
    },
    SubstrAfterLast: function (sequence, bIncludeSequence) {
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
    }()),
    CSS: function (style) {
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
});
RESES.bIsCommentPage = window.location.pathname.includes('/comments/');
RESES.bIsUserPage = window.location.pathname.includes('/user/');
RESES.subreddit = (() => {
    var m = /^\/(?:r\/(\w+)\/)/.exec(window.location.pathname);
    return m && m[1] ? m[1].toLocaleLowerCase() : null;
})();
RESES.config = (function localSettings() {
    const cache = {};
    function getSetting(key, _default) {
        if (cache[key] !== undefined) {
            return cache[key];
        }
        var value = localStorage.getItem('reses-' + key);
        var setting = JSON.parse(value || _default.toString());
        cache[key] = setting;
        return setting;
    }
    function setSetting(key, value) {
        cache[key] = value;
        localStorage.setItem('reses-' + key, JSON.stringify(value));
    }
    return {
        get bAutoDownvoting() { return getSetting('autoDownvoting', false); },
        set bAutoDownvoting(value) { setSetting('autoDownvoting', value); },
        get bFilterDownvoting() { return getSetting('filterDownvoting', true); },
        set bFilterDownvoting(value) { setSetting('filterDownvoting', value); },
        get bRepostDownvoting() { return getSetting('repostDownvoting', false); },
        set bRepostDownvoting(value) { setSetting('repostDownvoting', value); },
    };
})();
RESES.extendType(RESES, {
    get bIsMultireddit() {
        delete this.bIsMultireddit;
        return (this.bIsMultireddit = document.body.classList.contains('multi-page'));
    }
});
RESES.filterData = {
    karmawhores: [
        'SlimJones123', 'Ibleedcarrots', 'deathakissaway', 'pepsi_next', 'BunyipPouch', 'Sumit316',
        'KevlarYarmulke', 'D5R', 'dickfromaccounting', 'icant-chooseone'
    ].map(x => x && x.toLowerCase()),
    pornsubs: ["18_19", "2busty2hide", "60fpsporn", "aa_cups", "abelladanger", "adorableporn", "afrodisiac", "alathenia", "alexandradaddario",
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
        "assholegonewild"
    ].map(x => x && x.toLowerCase()),
    pornaccounts: [
        "lilmshotstuff", "Bl0ndeB0i", "Alathenia", "kinkylilkittyy", "Immediateunmber", "justsomegirlidk", "serenityjaneee",
        "Urdadstillwantsme", "therealtobywong", "sarah-xxx", "RubyLeClaire", "chickpeasyx", "rizzzzzy",
        "clarabelle_says", "Telari_Love", "purplehailstorm", "Peach_Legend", "NetflixandChillMe", "xrxse",
        "alomaXsteele", "BeaYork", "Littlebitdramatic", "fitchers_bird", "CalicoKitty19", "ILikeMakingPornGifs",
        "FreshBeaver", "liz_103", "CalicoKitty19", "petitenudist413", "hastalapasta96", "pumpkinbread717",
        "Your_Little_Angel"
    ].map(x => x && x.toLowerCase()),
    animesubs: [
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
        "minipainting", "salty", "HollowKnight", "ShitPostCrusaders"
    ].map(x => x && x.toLowerCase()),
    annoyingflairs: [
        "Art", "Artwork", "FanArt", "Fan Art", "Fan Work"
    ].map(x => x && x.toLowerCase()),
    annoyingsubs: [
        "uglyduckling", "guineapigs", "Rats", "happy", "Blep", "tattoos", "forbiddensnacks", "PrequelMemes",
        "BoneAppleTea", "deadbydaylight", "Eyebleach", "vegan", "boottoobig", "pitbulls",
        "drawing", "piercing", "Illustration", "curledfeetsies", "brushybrushy", "aww", "rarepuppers", "surrealmemes",
        "antiMLM", "vaxxhappened", "bonehurtingjuice", "meirl", "me_irl", "inthesoulstone", "thanosdidnothingwrong",
        "sneks", "2meirl4meirl", "corgi", "sweden", "Catloaf", "SupermodelCats", "CatTaps", "PenmanshipPorn", "catbellies",
        "blackcats", "intermittentfasting"
    ].map(x => x && x.toLowerCase()),
    shows: [
        "TheSimpsons", "gravityfalls"
    ].map(x => x && x.toLowerCase()),
    games: [
        "deadbydaylight", "smashbros", "DestinyTheGame", "destiny2", "Warframe", "NintendoSwitch", "Warhammer40k", "PathOfExile",
        "zelda", "starcraft", "Competitiveoverwatch", "overwatch", "FortNiteBR"
    ].map(x => x && x.toLowerCase()),
    politics: [
        "AgainstHateSubreddits", "AntiTrumpAlliance", "BannedFromThe_Donald", "esist", "Fuckthealtright", "Impeach_Trump",
        "LateStageCapitalizm", "MarcheAgainstTrump", "MarchAgainstNazis", "Political_Revolution", "politics", "RussiaLago",
        "ShitThe_DonaldSays", "The_Dotard", "Trumpgret", "PoliticalHumor", "The_Mueller", "SandersForPresident",
        "EnoughTrumpSpam", "TrumpCriticizesTrump"
    ].map(x => x && x.toLowerCase())
};
RESES.linkRegistry = (() => {
    const _links = {};
    var _newBlockedCache = null;
    var _rgxGetHostName = /(\w{1,})(?=(?:\.[a-z]{2,4}){0,2}$)/;
    function splitUrl(url) {
        var parts = url.split("/").filter(x => x);
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
        localStorage.setItem('reses-dictblocked', JSON.stringify(_newBlockedCache));
    }
    const LinkRegistry = {
        get links() {
            return _links;
        },
        get dictBlocked() {
            return _newBlockedCache || (_newBlockedCache = JSON.parse(localStorage.getItem('reses-dictblocked') || '{}'));
        },
        addBlockedUrl: function addBlockedUrl(url, nosave) {
            var parts = splitUrl(url);
            var last = parts[parts.length - 1];
            var node = getNode(parts);
            if (last in node) {
                console.error("Duplicate Blocked Url.", url);
            }
            else {
                console.info("Blocking URL", url);
                node[last] = 1;
                !nosave && RESES.debounce(saveBlocked, 30);
            }
        },
        removeBlockedUrl: function removeBlockedUrl(url) {
            var parts = splitUrl(url);
            var last = parts[parts.length - 1];
            var node = getNode(parts);
            if (last in node) {
                console.info("Removing Blocked URL", url);
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
RESES.posts = [];
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
    function _adjustFlairColor(post) {
        var style = window.getComputedStyle(post.flairLabel);
        var background = new RESES.Color(style['background-color']);
        var text = new RESES.Color(style['color']);
        if (Math.abs(background.luma - text.luma) < 100) {
            post.flairLabel.style.color = text.inverted.toString();
        }
    }
    function _getHostAndPath(url) {
        let end = url.indexOf('?');
        if (end < 0) {
            end = url.indexOf('#');
        }
        if (end < 0) {
            end = url.length;
        }
        if (url[end - 1] === '/') {
            end--;
        }
        let start = url.indexOf('www.') + 4;
        if (start < 4) {
            start = url.indexOf('//') + 2;
        }
        if (start < 2) {
            start = 0;
        }
        if (url[0] === "/") {
            start = 1;
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
    class LinkListing {
        constructor(post) {
            {
                this.post = post;
                this.expandoboxObserver = null;
                this.thumbnail = post.getElementsByClassName('thumbnail')[0] || null;
                this.midcol = post.getElementsByClassName('midcol')[0] || null;
                this.flairLabel = post.getElementsByClassName('linkflairlabel')[0] || null;
                var ds = post.dataset;
                this.flairLabelText = (this.flairLabel !== null && this.flairLabel.title.toLowerCase()) || null;
                this.url = ds.url || null;
                this.subreddit = ds.subreddit || null;
                this.author = ds.author || null;
                this.timestamp = Number(ds.timestamp);
                this.bIsTextPost = this.thumbnail !== null && (this.cls.contains('self') || this.cls.contains('default')) || this.expandobox === null;
                this.bIsRepost = false;
                this.bIsBlockedURL = false;
                this.bIsKarmaWhore = false;
                this.bIsPorn = false;
                this.bIsAnime = false;
                this.bIsAnnoying = false;
                this.bIsPolitics = false;
                this.bIsShow = false;
                this.bIsGame = false;
                this.bPending = false;
                this.updateThumbnail = () => _updateThumbnail(this);
                this.handleVoteClick = (ev) => _handleVoteClick(this, ev);
                this.cls.add('zregistered');
            }
            {
                if (this.flairLabel) {
                    asyncctx.doAsync(() => _adjustFlairColor(this));
                }
                if (this.midcol !== null) {
                    this.midcol.addEventListener('click', this.handleVoteClick);
                }
                if (this.url !== null) {
                    this.url = _getHostAndPath(this.url);
                    if (this.url.length > 0) {
                        this.bIsBlockedURL = checkIfBlockedUrl(this.url);
                        this.bIsRepost = registerLinkListing(this);
                    }
                }
                if (this.subreddit !== null) {
                    this.subreddit = _sanitizeSubreddit(this.subreddit);
                    if (!this.bIsTextPost) {
                        this.bIsPorn = filterData.pornsubs.includes(this.subreddit) || filterData.pornaccounts.includes(this.subreddit);
                    }
                    this.bIsAnime = filterData.animesubs.includes(this.subreddit);
                    this.bIsAnnoying = filterData.annoyingsubs.includes(this.subreddit);
                    this.bIsShow = filterData.shows.includes(this.subreddit);
                    this.bIsGame = filterData.games.includes(this.subreddit);
                    this.bIsPolitics = filterData.politics.includes(this.subreddit);
                }
                if (this.author !== null) {
                    this.author = this.author.toLowerCase();
                    this.bIsKarmaWhore = filterData.karmawhores.includes(this.author);
                    if (!this.bIsTextPost) {
                        this.bIsPorn = this.bIsPorn || filterData.pornaccounts.includes(this.author);
                    }
                }
                if (!this.bisAnnoying && this.flairLabelText !== null) {
                    this.bisAnnoying = filterData.annoyingflairs.includes(this.flairLabelText);
                }
                if (this.bIsRepost) {
                    this.cls.add('isrepost');
                }
                if (this.bIsBlockedURL) {
                    this.cls.add('isblockedurl');
                }
                if (this.bIsPorn) {
                    this.cls.add('isporn');
                }
                if (this.bIsAnime) {
                    this.cls.add('isanime');
                }
                if (this.bIsKarmaWhore) {
                    this.cls.add('iskarmawhore');
                }
                if (this.bIsAnnoying) {
                    this.cls.add('isannoying');
                }
                if (this.bIsShow) {
                    this.cls.add('isshow');
                }
                if (this.bIsGame) {
                    this.cls.add('isgame');
                }
                if (this.bIsPolitics) {
                    this.cls.add('ispolitics');
                }
                if (this.shouldBeDownvoted) {
                    this.autoDownvotePost();
                }
                if (this.expandobox !== null) {
                    this.expandoboxObserver = new MutationObserver(this.updateThumbnail);
                    this.expandoboxObserver.observe(this.expandobox, { attributes: true });
                }
            }
            this.updateThumbnail();
        }
        get expandobox() {
            var item = wm.get(this);
            if (!item) {
                item = this.post.getElementsByClassName('res-expando-box')[0] || this.post.getElementsByClassName('expando')[0] || null;
                item && wm.set(this, item);
            }
            return item;
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
        get cls() { return this.post.classList; }
        get age() { return Date.now() - this.timestamp; }
        get ageHours() { return this.age / 3600000; }
        get ageDays() { return this.age / 86400000; }
        get isUpvoted() { return this.hasClass("likes") ^ this.bPending; }
        get isUnvoted() { return this.hasClass("unvoted") ^ this.bPending; }
        get isDownvoted() { return this.hasClass("dislikes") ^ this.bPending; }
        get isExpanded() {
            var expando = this.expandobox;
            if (expando !== null) {
                return expando.dataset.cachedhtml ? expando.style.display !== 'none' : expando.getAttribute('hidden') === null;
            }
            return false;
        }
        get isCrosspost() { return parseInt(this.post.dataset.numCrossposts) > 0; }
        get isNSFW() { return this.cls.contains('over18'); }
        get isFilteredByRES() { return this.cls.contains('RESFiltered'); }
        get isAutoDownvoted() { return this.cls.contains('autodownvoted'); }
        set isAutoDownvoted(bool) { this.cls.toggle('autodownvoted', bool); }
        get bMatchesFilter() {
            return this.bIsKarmaWhore || this.bIsPorn || this.bIsAnime || this.bIsAnnoying || this.bIsPolitics || this.bIsShow || this.bIsGame;
        }
        get shouldBeDownvoted() {
            return (this.bIsBlockedURL || (!RESES.bIsMultireddit && (this.bIsRepost || this.bMatchesFilter))) && this.subreddit !== RESES.subreddit;
        }
        hasClass(classes) {
            for (let i = 0, len = arguments.length; i < len; i++) {
                let cls = arguments[i];
                if (this.post.classList.contains(cls) || this.midcol && this.midcol.classList.contains(cls)) {
                    return true;
                }
            }
            return false;
        }
        clickDownvoteArrow() {
            if (this.midcol !== null) {
                this.bPending = true;
                asyncctx.doAsync(() => this.voteArrowDown.click());
            }
        }
        autoDownvotePost() {
            var cfg = RESES.config;
            if (!RESES.bIsUserPage && cfg.bAutoDownvoting && this.isUnvoted && this.ageDays < 30) {
                if (this.bIsBlockedURL || cfg.bRepostDownvoting && this.bIsRepost || cfg.bFilterDownvoting && (this.bMatchesFilter)) {
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
    return LinkListing;
})();
RESES.linkListingMgr = (() => {
    const LinkListing = RESES.LinkListing;
    const _newLinkListings = [];
    const _listingCollection = Array(1000);
    _listingCollection.index = 0;
    var linklistingObserver = null;
    function _updateLinkListings() {
        var good = 0, filtered = 0, shit = 0;
        for (var i = 0, len = _listingCollection.index, posts = _listingCollection; i < len; i++) {
            var post = posts[i];
            if (post.isDownvoted) {
                shit++;
            }
            else if (post.isFilteredByRES) {
                filtered++;
            }
            else {
                good++;
            }
        }
        RESES.btnFilterPost.update({ good, filtered, shit });
    }
    function _processNewLinkListings() {
        console.time("ProcessNewLinkListings");
        var linklisting = _newLinkListings.pop();
        while (linklisting) {
            var children = linklisting.children;
            for (var i = 0, len = children.length; i < len; i++) {
                var listing = children[i];
                if (listing.classList.contains('link')) {
                    _listingCollection[_listingCollection.index++] = new LinkListing(listing);
                }
            }
            linklisting = _newLinkListings.pop();
        }
        RESES.debounce(_updateLinkListings);
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
                showimages.addEventListener('click', () => {
                    RESES.doAsync(_updateLinkListings);
                });
            }
        }
    }
    RESES.onLoaded(linkListingReady, 0);
    return {
        get listingCollection() { return _listingCollection; },
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
RESES.addTabMenuButton = function addTabMenuButton(el) {
    var tabbar = document.getElementsByClassName('tabmenu')[0];
    if (tabbar) {
        tabbar.appendChild(el);
    }
};
RESES.btnFilterPost = (() => {
    const btn = Element.From(`
		<li>
			<style type="text/css" scoped>
				body.goodthings #filtermode .goodthings {	color: lightgreen;	}
				body.filteredthings #filtermode .filteredthings, body.badthings #filtermode .badthings {	color: tomato;	}
				#btnDropdown { position:relative; display: inline-block; }
				#btnDropdown:hover .dropdown-content {display: block;}
				#btnDropdown:hover .dropbtn {background-color: #3e8e41;}
				.dropdown-content { display:none; position: absolute; min-width: 160px; z-index:10; margin-top 5px; background-color: rgb(50, 50, 50); }
				ul.dropdown-content li, ul.dropdown-content li a {
					display: block; margin: 2px; min-width: 160px; padding: 5px; background-color: rgb(50, 50, 50);
					cursor: pointer;
				}
				ul.dropdown-content li:hover { background-color: rgb(70, 70, 70); }
				ul.dropdown-content li:hover a { background-color: rgb(70, 70, 70); color: lightgreen; }
				ul.dropdown-content.downvotingenabled li.downvotingdisabled { display: none; }
				ul.dropdown-content.downvotingdisabled li.downvotingenabled { display: none; }
			</style>
			<div id="btnDropdown">
				<a id="filtermode" href="#2">
					<span class='goodpost'>GoodPosts(<span></span>)</span>&nbsp-&nbsp
					<span class='filteredpost'>Filtered(<span></span>)</span>&nbsp-&nbsp
					<span class='shitpost'>Downvoted(<span></span>)</span>
				</a>
				<ul class='dropdown-content'>
					<li><a id="downvoteFiltered"><span>Downvote all filtered content</span></a></li>
					<li><a id="removeDownvotes"><span>Remove Auto Downvotes</span></a></li>

					<li class='downvotingdisabled'><a id="enableAutoDownvoting"><span>Enable Auto Downvoting</span></a></li>
					<li class='downvotingenabled'><a id="disableAutoDownvoting"><span>Disable Auto Downvoting</span></a></li>

					<li class='downvotingenabled'><a id="enableFilterDownvoting"><span>Enable Filter Based Downvoting</span></a></li>
					<li class='downvotingenabled'><a id="disableFilterDownvoting"><span>Disable Filter Based Downvoting</span></a></li>

					<li class='downvotingenabled'><a id="enableRepostDownvoting"><span>Enable Repost Downvoting</span></a></li>
					<li class='downvotingenabled'><a id="disableRepostDownvoting"><span>Disable Repost Downvoting</span></a></li>
				</ul>
			</div>
		</li>`);
    btn.querySelector('#filtermode').addEventListener('click', () => {
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
    btn.querySelector('#downvoteFiltered').addEventListener('click', () => {
        RESES.linkListingMgr.listingCollection.forEach((post) => {
            if (post.isFilteredByRES) {
                RESES.doAsync(() => post.autoDownvotePost());
            }
        });
        RESES.debounce(RESES.linkListingMgr.updateLinkListings);
    });
    btn.querySelector('#removeDownvotes').addEventListener('click', () => {
        RESES.linkListingMgr.listingCollection.forEach((post) => {
            RESES.doAsync(() => post.removeAutoDownvote());
        });
        RESES.debounce(RESES.linkListingMgr.updateLinkListings);
    });
    const elDropdownContent = btn.querySelector('.dropdown-content');
    btn.querySelector('#enableAutoDownvoting').addEventListener('click', () => {
        RESES.config.bAutoDownvoting = true;
        elDropdownContent.classList.remove('downvotingdisabled');
        elDropdownContent.classList.add('downvotingenabled');
    });
    btn.querySelector('#disableAutoDownvoting').addEventListener('click', () => {
        RESES.config.bAutoDownvoting = false;
        elDropdownContent.classList.remove('downvotingenabled');
        elDropdownContent.classList.add('downvotingdisabled');
    });
    const elEnableFilterDownvoting = btn.querySelector('#enableFilterDownvoting');
    const elDisableFilterDownvoting = btn.querySelector('#disableFilterDownvoting');
    elEnableFilterDownvoting.addEventListener('click', () => {
        RESES.config.bFilterDownvoting = true;
        elEnableFilterDownvoting.parentElement.style.display = 'none';
        elDisableFilterDownvoting.parentElement.style.display = 'block';
    });
    elDisableFilterDownvoting.addEventListener('click', () => {
        RESES.config.bFilterDownvoting = false;
        elEnableFilterDownvoting.parentElement.style.display = 'block';
        elDisableFilterDownvoting.parentElement.style.display = 'none';
    });
    const elEnableRepostDownvoting = btn.querySelector('#enableRepostDownvoting');
    const elDisableRepostDownvoting = btn.querySelector('#disableRepostDownvoting');
    elEnableRepostDownvoting.addEventListener('click', () => {
        RESES.config.bRepostDownvoting = true;
        elEnableRepostDownvoting.parentElement.style.display = 'none';
        elDisableRepostDownvoting.parentElement.style.display = 'block';
    });
    elDisableRepostDownvoting.addEventListener('click', () => {
        RESES.config.bRepostDownvoting = false;
        elEnableRepostDownvoting.parentElement.style.display = 'block';
        elDisableRepostDownvoting.parentElement.style.display = 'none';
    });
    function tabMenuInit() {
        elDropdownContent.classList.add(RESES.config.bAutoDownvoting ? 'downvotingenabled' : 'downvotingdisabled');
        if (RESES.config.bFilterDownvoting) {
            elEnableFilterDownvoting.parentElement.style.display = 'none';
        }
        else {
            elDisableFilterDownvoting.parentElement.style.display = 'none';
        }
        if (RESES.config.bRepostDownvoting) {
            elEnableRepostDownvoting.parentElement.style.display = 'none';
        }
        else {
            elDisableRepostDownvoting.parentElement.style.display = 'none';
        }
    }
    function tabMenuReady() {
        if (!RESES.bIsCommentPage && !RESES.bIsUserPage) {
            document.body.classList.add('goodpost');
            RESES.addTabMenuButton(btn);
        }
    }
    RESES.onInit(tabMenuInit, -10);
    RESES.onLoaded(tabMenuReady, -10);
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
