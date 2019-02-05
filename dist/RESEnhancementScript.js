"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var RESES = window.RESES = {
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
                options = { enumerable: false, configurable: undefined, writable: undefined, override: true, merge: false };
            }
            var define = proto instanceof Array ? defineSeveral : defineOne;
            var descriptors = Object.getOwnPropertyDescriptors(obj);
            for (var name in descriptors) {
                var opts = options.hasOwnProperty(name) ? Object.assign({}, options, options[name]) : options;
                var prop = descriptors[name];
                prop.enumerable = opts.enumerable ? true : false;
                if (opts.configurable === false) {
                    prop.configurable = false;
                }
                else if (opts.configurable === true) {
                    prop.configurable = true;
                }
                if ('value' in prop) {
                    if (opts.writable === false) {
                        prop.writable = false;
                    }
                    else if (opts.writable === true) {
                        prop.writable = true;
                    }
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
            this[0] = 255;
            this[1] = 255;
            this[2] = 255;
            this[3] = 255;
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
                                throw new Error("Invalid Hex Color: " + data);
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
                        throw new Error("Invalid Color String: " + data);
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
                        return "rgba(" + this.r / 255 * 100 + "%, " + this.b / 255 * 100 + "%, " + this.g / 255 * 100 + "%, " + this.a / 255 + ")";
                    }
                    else {
                        return "rgb(" + this.r / 255 * 100 + "%, " + this.b / 255 * 100 + "%, " + this.g / 255 * 100 + ")%";
                    }
                }
                else {
                    if (this.a !== 1) {
                        return "rgba(" + this.r + ", " + this.b + ", " + this.g + ", " + this.a + ")";
                    }
                    else {
                        return "rgb(" + this.r + ", " + this.b + ", " + this.g + ")";
                    }
                }
            }
        };
        var DCol = (function (_super) {
            __extends(DCol, _super);
            function DCol(data) {
                var _this = _super.call(this, data) || this;
                _this.x = 0;
                _this.val = "ok";
                return _this;
            }
            Object.defineProperty(DCol.prototype, "randomgetter", {
                get: function () { return this.val; },
                set: function (val) { this.val = val; },
                enumerable: true,
                configurable: true
            });
            DCol.prototype.doaction = function () { return false; };
            Object.defineProperty(DCol.prototype, "voteArrowDown", {
                get: function () {
                    var arrow = null;
                    if (this.midcol !== null) {
                        arrow = wmArrowDown.get(this);
                        if (!arrow) {
                            arrow = this.midcol.getElementsByClassName('arrow')[1] || null;
                            wmArrowDown.set(arrow);
                        }
                    }
                    return arrow;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DCol.prototype, "age", {
                get: function () { return Date.now() - this.timestamp; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DCol.prototype, "ageHours", {
                get: function () { return this.age / 3600000; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DCol.prototype, "ageDays", {
                get: function () { return this.age / 86400000; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DCol.prototype, "isUpvoted", {
                get: function () { return this.mcls === null ? false : this.mcls.contains("likes"); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DCol.prototype, "isDownvoted", {
                get: function () { return this.mcls === null ? false : this.mcls.contains("dislikes"); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DCol.prototype, "isUnvoted", {
                get: function () { return this.mcls === null ? false : this.mcls.contains("unvoted"); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DCol.prototype, "isExpanded", {
                get: function () {
                    var expando = this.expandobox;
                    if (expando !== null) {
                        return expando.dataset.cachedhtml ? expando.style.display !== 'none' : expando.getAttribute('hidden') === null;
                    }
                    return false;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DCol.prototype, "isCrosspost", {
                get: function () { return parseInt(this.post.dataset.numCrossposts) > 0; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DCol.prototype, "isNSFW", {
                get: function () { return this.cls.contains('over18'); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DCol.prototype, "isFilteredByRES", {
                get: function () { return this.cls.contains('RESFiltered'); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DCol.prototype, "isAutoDownvoted", {
                get: function () { return this.cls.contains('autodownvoted'); },
                set: function (bool) { this.cls.toggle('autodownvoted', bool); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DCol.prototype, "bMatchesFilter", {
                get: function () {
                    return this.bIsKarmaWhore || this.bIsPorn || this.bIsAnime || this.bIsAnnoying || this.bIsPolitics || this.bIsShow || this.bIsGame;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DCol.prototype, "shouldBeDownvoted", {
                get: function () {
                    return (this.bIsBlockedURL || (!RESES.bIsMultireddit && (this.bIsRepost || this.bMatchesFilter))) && this.subreddit !== RESES.subreddit;
                },
                enumerable: true,
                configurable: true
            });
            DCol.prototype.autoDownvotePost = function () {
                var _this = this;
                var cfg = RESES.config;
                if (!RESES.bIsUserPage && cfg.bAutoDownvoting && this.isUnvoted && this.ageDays < 30 && this.voteArrowDown !== null) {
                    if (this.bIsBlockedURL || cfg.bRepostDownvoting && this.bIsRepost || cfg.bFilterDownvoting && (this.bMatchesFilter)) {
                        this.isAutoDownvoted = true;
                        RESES.doAsync(function () { return _this.voteArrowDown.click(); });
                    }
                    if (this.expandobox) {
                        this.expandobox.hidden = true;
                    }
                }
            };
            DCol.prototype.removeAutoDownvote = function () {
                var _this = this;
                if (this.voteArrowDown && this.isDownvoted && this.isAutoDownvoted) {
                    this.isAutoDownvoted = false;
                    RESES.doAsync(function () { return _this.voteArrowDown.click(); });
                    if (this.expandobox) {
                        this.expandobox.hidden = false;
                    }
                }
            };
            DCol.prototype.canDrop = function (aI, aO) { return false; };
            DCol.prototype.cycleCell = function (aR, aC) { return; };
            DCol.prototype.getColumnProperties = function (aCID, aC) { return; };
            DCol.prototype.getImageSrc = function (aR, aC) { return null; };
            DCol.prototype.getLevel = function (aR) { return 0; };
            DCol.prototype.getParentIndex = function (aRI) { return -1; };
            DCol.prototype.getProgressMode = function (aR, aC) { return 3; };
            DCol.prototype.isContainer = function (aR) { return false; };
            DCol.prototype.isEditable = function (aR, aC) { return aC.editable; };
            DCol.prototype.isSeparator = function (aR) { return false; };
            DCol.prototype.isSorted = function () { return (this.sort_col != null); };
            return DCol;
        }(Color));
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
        var result = Object.getOwnPropertyNames(win).filter(function (name) { return !iframe.contentWindow.hasOwnProperty(name); });
        if (!bAsArray) {
            result = result.reduce(function (dict, name) { dict[name] = win[name]; return dict; }, {});
        }
        document.body.removeChild(iframe);
        return result;
    },
    doAsync: function doAsync(func) {
        if (document.hidden) {
            window.setTimeout(func, 0);
        }
        else {
            window.requestAnimationFrame(func);
        }
    },
    debounceMethod: (function () {
        var wm = new WeakMap();
        var Operation = (function () {
            function Operation(method) {
                this.func = function () {
                    method();
                    wm.delete(method);
                };
                this.timer = 0 | 0;
                this.hidden = false;
            }
            Operation.prototype.cancel = function () {
                this.hidden === true ? window.clearTimeout(this.timer) : window.cancelAnimationFrame(this.timer);
            };
            Operation.prototype.start = function () {
                this.hidden = document.hidden;
                this.timer = this.hidden === true ? window.setTimeout(this.func, 0) : window.requestAnimationFrame(this.func);
            };
            return Operation;
        }());
        return function debounceMethod(method) {
            var op = wm.get(method);
            if (op !== undefined) {
                op.cancel();
            }
            else {
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
    var _readyCalls = [];
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
            }
            else {
                initialize();
            }
        }
        else {
            throw new Error("PreInit Already Executed");
        }
    }
    function documentReady() {
        while (_readyCalls.length > 0) {
            var func = _readyCalls.shift();
            RESES.doAsync(func);
        }
        _readyCalls = null;
    }
    if (document.readyState !== "loading") {
        documentReady();
    }
    else {
        window.addEventListener("DOMContentLoaded", documentReady);
    }
    RESES.extendType(RESES, {
        onPreInit: function (method) {
            if (_preinitCalls !== null) {
                _preinitCalls.push(method);
                RESES.debounceMethod(preinitialize);
            }
            else {
                throw new Error("Initialization already in progress. To late to call onPreInit.");
            }
        },
        onInit: function (method) {
            if (_preinitCalls !== null) {
                _initCalls.push(method);
                RESES.debounceMethod(preinitialize);
            }
            else {
                throw new Error("Initialization already in progress. Too late to call onInit.");
            }
        },
        onReady: function (method) {
            if (_readyCalls !== null) {
                _readyCalls.push(method);
            }
            else {
                RESES.doAsync(method);
            }
        }
    });
})(window, window.document, RESES);
RESES.extendType(String.prototype, {
    ReplaceAll: function ReplaceAll(sequence, value) {
        return this.split(sequence).join(value);
    },
    Trim: (function () {
        var rgxBoth = /^\s+|\s+$/g;
        var rgxStart = /^\s+/;
        var rgxEnd = /\s+$/;
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
RESES.extendType([NodeList.prototype, HTMLCollection.prototype], {
    Remove: (function () {
        var matches = Element.prototype.matches;
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
RESES.extendType(RESES, {
    bIsCommentPage: window.location.pathname.includes('/comments/'),
    bIsUserPage: window.location.pathname.includes('/user/'),
    subreddit: (function () { var m = /^\/(?:r\/(\w+)\/)/.exec(window.location.pathname); return m[1] ? m[1].toLocaleLowerCase() : null; })(),
    get bIsMultireddit() {
        delete this.bIsMultireddit;
        return (this.bIsMultireddit = document.body.classList.contains('multi-page'));
    },
    config: (function localSettings() {
        var cache = {};
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
    })(),
});
RESES.filterData = {
    karmawhores: [
        'SlimJones123', 'Ibleedcarrots', 'deathakissaway', 'pepsi_next', 'BunyipPouch', 'Sumit316',
        'KevlarYarmulke', 'D5R', 'dickfromaccounting', 'icant-chooseone'
    ].map(function (x) { return x && x.toLowerCase(); }),
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
        "mila_azul", "sex_comics", "KateeOwen", "Hotwife"
    ].map(function (x) { return x && x.toLowerCase(); }),
    pornaccounts: [
        "lilmshotstuff", "Bl0ndeB0i", "Alathenia", "kinkylilkittyy", "Immediateunmber", "justsomegirlidk", "serenityjaneee",
        "Urdadstillwantsme", "therealtobywong", "sarah-xxx", "RubyLeClaire", "chickpeasyx", "rizzzzzy",
        "clarabelle_says", "Telari_Love", "purplehailstorm", "Peach_Legend", "NetflixandChillMe", "xrxse",
        "alomaXsteele", "BeaYork", "Littlebitdramatic", "fitchers_bird", "CalicoKitty19", "ILikeMakingPornGifs",
        "FreshBeaver", "liz_103", "CalicoKitty19", "petitenudist413", "hastalapasta96", "pumpkinbread717",
        "Your_Little_Angel"
    ].map(function (x) { return x && x.toLowerCase(); }),
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
        "pouts", "MyHeroAcademia", "ImaginaryMonsters", "dragonballfighterz"
    ].map(function (x) { return x && x.toLowerCase(); }),
    annoyingflairs: [
        "Art", "Artwork", "FanArt", "Fan Art", "Fan Work"
    ].map(function (x) { return x && x.toLowerCase(); }),
    annoyingsubs: [
        "uglyduckling", "guineapigs", "Rats", "happy", "Blep", "tattoos", "forbiddensnacks", "PrequelMemes",
        "BoneAppleTea", "deadbydaylight", "Eyebleach", "vegan", "boottoobig", "pitbulls",
        "drawing", "piercing", "Illustration", "curledfeetsies", "brushybrushy", "aww", "rarepuppers", "surrealmemes",
        "antiMLM", "vaxxhappened", "bonehurtingjuice", "meirl", "me_irl", "inthesoulstone", "thanosdidnothingwrong",
        "sneks", "2meirl4meirl", "corgi", "sweden", "Catloaf", "SupermodelCats", "CatTaps", "PenmanshipPorn", "catbellies"
    ].map(function (x) { return x && x.toLowerCase(); }),
    shows: [
        "TheSimpsons"
    ].map(function (x) { return x && x.toLowerCase(); }),
    games: [
        "deadbydaylight", "smashbros", "DestinyTheGame", "destiny2", "Warframe", "NintendoSwitch", "Warhammer40k", "PathOfExile",
        "zelda", "starcraft", "Competitiveoverwatch", "overwatch", "FortNiteBR"
    ].map(function (x) { return x && x.toLowerCase(); }),
    politics: [
        "AgainstHateSubreddits", "AntiTrumpAlliance", "BannedFromThe_Donald", "esist", "Fuckthealtright", "Impeach_Trump",
        "LateStageCapitalizm", "MarcheAgainstTrump", "MarchAgainstNazis", "Political_Revolution", "politics", "RussiaLago",
        "ShitThe_DonaldSays", "The_Dotard", "Trumpgret", "PoliticalHumor", "The_Mueller", "SandersForPresident",
        "EnoughTrumpSpam", "TrumpCriticizesTrump"
    ].map(function (x) { return x && x.toLowerCase(); })
};
RESES.linkRegistry = (function () {
    var _links = {};
    var _blockedUrlsCache = null;
    var LinkRegistry = {
        get links() {
            return _links;
        },
        get blockedUrls() {
            return _blockedUrlsCache || (_blockedUrlsCache = JSON.parse(localStorage.getItem('reses-blockedurls') || '[]'));
        },
        saveBlockedUrls: function saveBlockedUrls() {
            localStorage.setItem('reses-blockedurls', JSON.stringify(_blockedUrlsCache));
        },
        addBlockedUrl: function addBlockedUrl(url) {
            var urls = LinkRegistry.blockedUrls;
            if (!urls.includes(url)) {
                urls.push(url);
                LinkRegistry.saveBlockedUrls();
            }
            else {
                throw new Error("Duplicate Blocked Url. " + url);
            }
        },
        removeBlockedUrl: function removeBlockedUrl(url) {
            var urls = LinkRegistry.blockedUrls;
            var index = urls.indexOf(url);
            if (index >= 0) {
                urls.splice(index, 1);
                LinkRegistry.saveBlockedUrls();
            }
            else {
                throw new Error("Blocked Url Does not Exist and cannot be removed. " + url);
            }
        },
        checkIfBlockedUrl: function checkIfBlockedUrl(url) {
            return LinkRegistry.blockedUrls.includes(url);
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
RESES.LinkListing = (function (window) {
    function _updateThumbnail(post) {
        if (post.thumbnail) {
            post.thumbnail.style.display = post.isExpanded ? 'none' : '';
        }
    }
    function _handleVoteClick(post, ev) {
        if (ev.target === post.voteArrowDown) {
            if (!post.isDownvoted) {
                if (post.isExpanded) {
                    post.post.getElementsByClassName('expando-button')[0].click();
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
        }
        RESES.debounceMethod(RESES.linkListingMgr.updateLinkListings);
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
        var end = url.indexOf('?');
        if (end < 0) {
            end = url.indexOf('#');
        }
        if (end < 0) {
            end = url.length;
        }
        if (url[end - 1] === '/') {
            end--;
        }
        var start = url.indexOf('www.') + 4;
        if (start < 4) {
            start = url.indexOf('//') + 2;
        }
        if (start < 2) {
            start = 0;
        }
        return url.substr(start, end - start);
    }
    function _sanitizeSubreddit(subreddit) {
        if (subreddit.startsWith('u_')) {
            subreddit = subreddit.substr(2);
        }
        return subreddit.toLowerCase();
    }
    var filterData = RESES.filterData;
    var checkIfBlockedUrl = RESES.linkRegistry.checkIfBlockedUrl;
    var registerLinkListing = RESES.linkRegistry.registerLinkListing;
    var wmArrowDown = new WeakMap();
    var LinkListing = (function () {
        function LinkListing(post) {
            var _this = this;
            {
                post.ll = this;
                this.post = post;
                this.expandoboxObserver = null;
                this.thumbnail = post.getElementsByClassName('thumbnail')[0] || null;
                this.midcol = post.getElementsByClassName('midcol')[0] || null;
                this.expandobox = post.getElementsByClassName('res-expando-box')[0] || post.getElementsByClassName('expando')[0] || null;
                this.flairLabel = post.getElementsByClassName('linkflairlabel')[0] || null;
                this.cls = post.classList;
                this.mcls = this.midcol !== null ? this.midcol.classList : null;
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
                this.updateThumbnail = function () { return _updateThumbnail(_this); };
                this.handleVoteClick = function (ev) { return _handleVoteClick(_this, ev); };
                this.cls.add('zregistered');
            }
            {
                if (this.flairLabel) {
                    RESES.doAsync(function () { return _adjustFlairColor(_this); });
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
        Object.defineProperty(LinkListing.prototype, "voteArrowDown", {
            get: function () {
                var arrow = null;
                if (this.midcol !== null) {
                    arrow = wmArrowDown.get(this);
                    if (!arrow) {
                        arrow = this.midcol.getElementsByClassName('arrow')[1] || null;
                        wmArrowDown.set(arrow);
                    }
                }
                return arrow;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LinkListing.prototype, "age", {
            get: function () { return Date.now() - this.timestamp; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LinkListing.prototype, "ageHours", {
            get: function () { return this.age / 3600000; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LinkListing.prototype, "ageDays", {
            get: function () { return this.age / 86400000; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LinkListing.prototype, "isUpvoted", {
            get: function () { return this.mcls === null ? false : this.mcls.contains("likes"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LinkListing.prototype, "isDownvoted", {
            get: function () { return this.mcls === null ? false : this.mcls.contains("dislikes"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LinkListing.prototype, "isUnvoted", {
            get: function () { return this.mcls === null ? false : this.mcls.contains("unvoted"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LinkListing.prototype, "isExpanded", {
            get: function () {
                var expando = this.expandobox;
                if (expando !== null) {
                    return expando.dataset.cachedhtml ? expando.style.display !== 'none' : expando.getAttribute('hidden') === null;
                }
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LinkListing.prototype, "isCrosspost", {
            get: function () { return parseInt(this.post.dataset.numCrossposts) > 0; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LinkListing.prototype, "isNSFW", {
            get: function () { return this.cls.contains('over18'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LinkListing.prototype, "isFilteredByRES", {
            get: function () { return this.cls.contains('RESFiltered'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LinkListing.prototype, "isAutoDownvoted", {
            get: function () { return this.cls.contains('autodownvoted'); },
            set: function (bool) { this.cls.toggle('autodownvoted', bool); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LinkListing.prototype, "bMatchesFilter", {
            get: function () {
                return this.bIsKarmaWhore || this.bIsPorn || this.bIsAnime || this.bIsAnnoying || this.bIsPolitics || this.bIsShow || this.bIsGame;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LinkListing.prototype, "shouldBeDownvoted", {
            get: function () {
                return (this.bIsBlockedURL || (!RESES.bIsMultireddit && (this.bIsRepost || this.bMatchesFilter))) && this.subreddit !== RESES.subreddit;
            },
            enumerable: true,
            configurable: true
        });
        LinkListing.prototype.autoDownvotePost = function () {
            var _this = this;
            var cfg = RESES.config;
            if (!RESES.bIsUserPage && cfg.bAutoDownvoting && this.isUnvoted && this.ageDays < 30 && this.voteArrowDown !== null) {
                if (this.bIsBlockedURL || cfg.bRepostDownvoting && this.bIsRepost || cfg.bFilterDownvoting && (this.bMatchesFilter)) {
                    this.isAutoDownvoted = true;
                    RESES.doAsync(function () { return _this.voteArrowDown.click(); });
                }
                if (this.expandobox) {
                    this.expandobox.hidden = true;
                }
            }
        };
        LinkListing.prototype.removeAutoDownvote = function () {
            var _this = this;
            if (this.voteArrowDown && this.isDownvoted && this.isAutoDownvoted) {
                this.isAutoDownvoted = false;
                RESES.doAsync(function () { return _this.voteArrowDown.click(); });
                if (this.expandobox) {
                    this.expandobox.hidden = false;
                }
            }
        };
        return LinkListing;
    }());
    return LinkListing;
})(window);
RESES.linkListingMgr = (function (document) {
    var LinkListing = RESES.LinkListing;
    var _newLinkListings = [];
    var _listingCollection = Array(1000);
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
        RESES.btnFilterPost.update({ good: good, filtered: filtered, shit: shit });
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
        RESES.debounceMethod(_updateLinkListings);
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
        RESES.debounceMethod(_processNewLinkListings);
    }
    RESES.onInit(function () {
        var linklistings = document.getElementsByClassName('linklisting');
        var root = linklistings[0];
        if (root) {
            linklistingObserver = new MutationObserver(_handleLinkListingMutation);
            linklistingObserver.observe(root, { childList: true });
            for (var i = 0, len = linklistings.length; i < len; i++) {
                _newLinkListings.push(linklistings[i]);
            }
            _processNewLinkListings();
            var showimages = document.getElementsByClassName('res-show-images')[0];
            if (showimages) {
                showimages.addEventListener('click', function () {
                    RESES.doAsync(_updateLinkListings);
                });
            }
        }
    });
    return {
        get listingCollection() { return _listingCollection; },
        updateLinkListings: _updateLinkListings
    };
})(window.document);
RESES.ScrollingSidebar = (function (window, document, RESES) {
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
    var ScrollingSidebar = (function () {
        function ScrollingSidebar(id, cbStateChange) {
            var _this = this;
            this.id = id;
            this.cbStateChange = cbStateChange;
            this.handleScrollGuarded = function () { return _handleScrollGuarded(_this); };
            this.handleScroll = function () { return _handleScroll(_this); };
            this.toggleSidebar = function (bool) { RESES.doAsync(function () { _toggleSidebar(_this, bool); }); };
            this.el = Element.From("\n\t\t\t\t<div id='" + id + "' class='sidebar'>\n\t\t\t\t\t<div class='sb-handle'></div>\n\t\t\t\t\t<div class='sb-track'></div>\n\t\t\t\t</div>");
            this.handle = this.el.firstElementChild;
            this.track = this.el.lastElementChild;
            this.sled = null;
            this.yprev = 0;
            this.marginTop = 0;
            this.timer = 0;
            this.bGuard = false;
            this.bShowing = true;
        }
        ScrollingSidebar.prototype.init = function (target) {
            var _this = this;
            if (!target) {
                return;
            }
            var parent = target.parentElement;
            parent.insertBefore(this.el, target);
            this.sled = parent.removeChild(target);
            this.sled.classList.add('sb-sled');
            this.track.append(this.sled);
            this.handle.addEventListener('click', function () { return _this.toggleSidebar(); });
            window.addEventListener('scroll', this.handleScrollGuarded);
            this.toggleSidebar(false);
        };
        return ScrollingSidebar;
    }());
    return ScrollingSidebar;
})(window, window.document, window.RESES);
RESES.sideBarMgr = (function (window, document, RESES) {
    var ssleft, ssright;
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
    RESES.onPreInit(function () {
        ssleft = new RESES.ScrollingSidebar('sbLeft', _update);
        ssright = new RESES.ScrollingSidebar('sbRight', _update);
    });
    RESES.onInit(function () {
        document.querySelectorAll('.listing-chooser .grippy').Remove();
        ssleft.init(document.querySelector('.listing-chooser .contents'));
        ssright.init(document.getElementsByClassName('side')[0]);
        document.body.classList.add('sidebarman');
    });
    return {
        get leftSidebar() { return ssleft; },
        get rightSidebar() { return ssright; }
    };
})(window, window.document, window.RESES);
RESES.addTabMenuButton = function addTabMenuButton(el) {
    var tabbar = document.getElementsByClassName('tabmenu')[0];
    if (tabbar) {
        tabbar.appendChild(el);
    }
};
RESES.btnFilterPost = (function (window, document, RESES) {
    var btn = Element.From("\n\t\t<li>\n\t\t\t<style type=\"text/css\" scoped>\n\t\t\t\tbody.goodthings #filtermode .goodthings {\tcolor: lightgreen;\t}\n\t\t\t\tbody.filteredthings #filtermode .filteredthings, body.badthings #filtermode .badthings {\tcolor: tomato;\t}\n\t\t\t\t#btnDropdown { position:relative; display: inline-block; }\n\t\t\t\t#btnDropdown:hover .dropdown-content {display: block;}\n\t\t\t\t#btnDropdown:hover .dropbtn {background-color: #3e8e41;}\n\t\t\t\t.dropdown-content { display:none; position: absolute; min-width: 160px; z-index:10; margin-top 5px; background-color: rgb(50, 50, 50); }\n\t\t\t\tul.dropdown-content li, ul.dropdown-content li a {\n\t\t\t\t\tdisplay: block; margin: 2px; min-width: 160px; padding: 5px; background-color: rgb(50, 50, 50);\n\t\t\t\t\tcursor: pointer;\n\t\t\t\t}\n\t\t\t\tul.dropdown-content li:hover { background-color: rgb(70, 70, 70); }\n\t\t\t\tul.dropdown-content li:hover a { background-color: rgb(70, 70, 70); color: lightgreen; }\n\t\t\t\tul.dropdown-content.downvotingenabled li.downvotingdisabled { display: none; }\n\t\t\t\tul.dropdown-content.downvotingdisabled li.downvotingenabled { display: none; }\n\t\t\t</style>\n\t\t\t<div id=\"btnDropdown\">\n\t\t\t\t<a id=\"filtermode\" href=\"#2\">\n\t\t\t\t\t<span class='goodpost'>GoodPosts(<span></span>)</span>&nbsp-&nbsp\n\t\t\t\t\t<span class='filteredpost'>Filtered(<span></span>)</span>&nbsp-&nbsp\n\t\t\t\t\t<span class='shitpost'>Downvoted(<span></span>)</span>\n\t\t\t\t</a>\n\t\t\t\t<ul class='dropdown-content'>\n\t\t\t\t\t<li><a id=\"downvoteFiltered\"><span>Downvote all filtered content</span></a></li>\n\t\t\t\t\t<li><a id=\"removeDownvotes\"><span>Remove Auto Downvotes</span></a></li>\n\n\t\t\t\t\t<li class='downvotingdisabled'><a id=\"enableAutoDownvoting\"><span>Enable Auto Downvoting</span></a></li>\n\t\t\t\t\t<li class='downvotingenabled'><a id=\"disableAutoDownvoting\"><span>Disable Auto Downvoting</span></a></li>\n\n\t\t\t\t\t<li class='downvotingenabled'><a id=\"enableFilterDownvoting\"><span>Enable Filter Based Downvoting</span></a></li>\n\t\t\t\t\t<li class='downvotingenabled'><a id=\"disableFilterDownvoting\"><span>Disable Filter Based Downvoting</span></a></li>\n\n\t\t\t\t\t<li class='downvotingenabled'><a id=\"enableRepostDownvoting\"><span>Enable Repost Downvoting</span></a></li>\n\t\t\t\t\t<li class='downvotingenabled'><a id=\"disableRepostDownvoting\"><span>Disable Repost Downvoting</span></a></li>\n\t\t\t\t</ul>\n\t\t\t</div>\n\t\t</li>");
    btn.querySelector('#filtermode').addEventListener('click', function () {
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
        RESES.debounceMethod(RESES.linkListingMgr.updateLinkListings);
    });
    btn.querySelector('#downvoteFiltered').addEventListener('click', function () {
        RESES.linkListingMgr.listingCollection.forEach(function (post) {
            if (post.isFilteredByRES) {
                post.autoDownvotePost();
            }
        });
        RESES.debounceMethod(RESES.linkListingMgr.updateLinkListings);
    });
    btn.querySelector('#removeDownvotes').addEventListener('click', function () {
        RESES.linkListingMgr.listingCollection.forEach(function (post) {
            post.removeAutoDownvote();
        });
        RESES.debounceMethod(RESES.linkListingMgr.updateLinkListings);
    });
    var elDropdownContent = btn.querySelector('.dropdown-content');
    btn.querySelector('#enableAutoDownvoting').addEventListener('click', function () {
        RESES.config.bAutoDownvoting = true;
        elDropdownContent.classList.remove('downvotingdisabled');
        elDropdownContent.classList.add('downvotingenabled');
    });
    btn.querySelector('#disableAutoDownvoting').addEventListener('click', function () {
        RESES.config.bAutoDownvoting = false;
        elDropdownContent.classList.remove('downvotingenabled');
        elDropdownContent.classList.add('downvotingdisabled');
    });
    var elEnableFilterDownvoting = btn.querySelector('#enableFilterDownvoting');
    var elDisableFilterDownvoting = btn.querySelector('#disableFilterDownvoting');
    elEnableFilterDownvoting.addEventListener('click', function () {
        RESES.config.bFilterDownvoting = true;
        elEnableFilterDownvoting.parentElement.style.display = 'none';
        elDisableFilterDownvoting.parentElement.style.display = 'block';
    });
    elDisableFilterDownvoting.addEventListener('click', function () {
        RESES.config.bFilterDownvoting = false;
        elEnableFilterDownvoting.parentElement.style.display = 'block';
        elDisableFilterDownvoting.parentElement.style.display = 'none';
    });
    var elEnableRepostDownvoting = btn.querySelector('#enableRepostDownvoting');
    var elDisableRepostDownvoting = btn.querySelector('#disableRepostDownvoting');
    elEnableRepostDownvoting.addEventListener('click', function () {
        RESES.config.bRepostDownvoting = true;
        elEnableRepostDownvoting.parentElement.style.display = 'none';
        elDisableRepostDownvoting.parentElement.style.display = 'block';
    });
    elDisableRepostDownvoting.addEventListener('click', function () {
        RESES.config.bRepostDownvoting = false;
        elEnableRepostDownvoting.parentElement.style.display = 'block';
        elDisableRepostDownvoting.parentElement.style.display = 'none';
    });
    RESES.onPreInit(function () {
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
    });
    RESES.onInit(function () {
        if (!RESES.bIsCommentPage && !RESES.bIsUserPage) {
            document.body.classList.add('goodpost');
            RESES.addTabMenuButton(btn);
        }
    });
    var elGoodposts = btn.querySelector('.goodpost span');
    var elFilteredposts = btn.querySelector('.filteredpost span');
    var elShitposts = btn.querySelector('.shitpost span');
    return {
        get btn() { return btn; },
        update: function (counters) {
            elGoodposts.textContent = counters.good;
            elFilteredposts.textContent = counters.filtered;
            elShitposts.textContent = counters.shit;
        }
    };
})(window, window.document, window.RESES);
RESES.btnLoadAllComments = (function (window, document, RESES) {
    var arr = null, coms = null, scrollX = 0, scrollY = 0, bGuard = false;
    var btn = Element.From("<li><a id=\"loadAllComments\" href=\"#3\"/a><span>Load All Comments</span></li>");
    function doClick() {
        if (arr.length > 0 && bGuard === false) {
            bGuard = true;
            scrollX = window.scrollX;
            scrollY = window.scrollY;
            var el = arr.pop();
            el.click();
            window.scroll(scrollX, scrollY);
        }
    }
    function handleInserted(ev) {
        if (arr.length > 0) {
            var target = ev.target;
            if (target.nodeName === "DIV" && target.classList.contains('thing')) {
                bGuard = false;
            }
            doClick();
        }
        else {
            coms.removeEventListener('DOMNodeInserted', handleInserted);
        }
    }
    function handleClick() {
        coms = document.querySelector('.commentarea');
        arr = Array.from(coms.querySelectorAll('.morecomments a')).reverse();
        coms.addEventListener('DOMNodeInserted', handleInserted);
        doClick();
    }
    btn.addEventListener('click', handleClick);
    RESES.onInit(function () {
        if (RESES.bIsCommentPage) {
            RESES.addTabMenuButton(btn);
        }
    });
    return {
        get btn() { return btn; }
    };
})(window, window.document, window.RESES);
