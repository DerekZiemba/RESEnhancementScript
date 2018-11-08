"use strict";
(function RESUS_styler(window, document) {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = `
		.side, .listing-chooser .contents { display:none;};
		.sb-track .side, .listing-chooser .sidebar .contents{display: block;}
		.sb-on .sb-track .sb-sled {
			/* width:min-content; */
			display: block;}

		.listing-chooser .grippy {display: none;}

		.sb-off.sidebar {	width: 6px;	}
		.sidebar {
			background-color: rgb(30, 30, 30);
			position: absolute;
			height:100%;
			display: none;
		}
		.sidebar.sb-init {
			display: flex;
		}
			.sidebar:hover {	z-index:50;	}

		#sbRight.sidebar {	right:0;	}
		#sbRight.sb-on.sidebar .sb-handle { margin-left:-5px; 	order: 0;	}

		#sbLeft.sidebar {	left:0;	}
		#sbLeft.sidebar .sb-handle {	position: relative;	order: 1;	}

			.sb-off.sidebar .sb-track {	display: none;	}
			.sidebar .sb-track {	margin-top: 20px;	}
			.sidebar .sb-track .sb-sled {	padding: 3px;	margin:0;	}
			.sidebar .sb-handle:hover {	background-color: rgb(92, 82, 82);	cursor: pointer;	}
			.sidebar .sb-handle {
				position: fixed;
				min-height: 100%;
				width:5px;
				background-color: rgb(63, 58, 58);
			}


		html body.with-listing-chooser .listing-chooser {	position: static; display: none; padding-right:unset;	}
		html body.with-listing-chooser.sidebarman .listing-chooser {	display: block;	}

		html body .content { margin-left: 0px}
		html body.with-listing-chooser>.content,
		html body.with-listing-chooser.listing-chooser-collapsed>.content,
		html body.with-listing-chooser .footer-parent {
			margin-left: 0;
			/* padding-left:8px; */
		}

		.tabmenu{ display: block; }
		.thumbnail.self, .thumbnail.default, .thumbnail.spoiler  { display:none !important; }
		.thing {
			padding: 5px 0 5px 0;
			margin: 7px 0 7px 0;
		}
		.comment .child, .comment .showreplies {
			margin-left: 9px !important;
			margin-top: 3px !important;
		}
		.res-commentBoxes .comment {
			margin-left: 3px !important;
		}
		#allOptionsContainer {
			max-width: 1000%;
		}

			body.goodpost #siteTable .thing.zregistered { display: block !important; }
			body.goodpost #siteTable .thing.zregistered.RESFiltered,
			body.goodpost #siteTable .thing.zregistered.ZFiltered,
			body.goodpost #siteTable .thing.zregistered.isrepost,
			body.goodpost #siteTable .thing.zregistered.iskarmawhore {	display: none !important; }

			body.filteredpost #siteTable .thing.zregistered,
			body.filteredpost #siteTable .thing.zregistered.RESFiltered.isrepost,
			body.filteredpost #siteTable .thing.zregistered.RESFiltered.iskarmawhore,
			body.filteredpost #siteTable .thing.zregistered.ZFiltered.isrepost,
			body.filteredpost #siteTable .thing.zregistered.ZFiltered.iskarmawhore { display: none !important; }

			body.filteredpost #siteTable .thing.zregistered.RESFiltered,
			body.filteredpost #siteTable .thing.zregistered.ZFiltered { display: block !important; }

			body.shitpost #siteTable .thing.zregistered,
			body.shitpost #siteTable .thing.zregistered.RESFiltered,
			body.shitpost #siteTable .thing.zregistered.ZFiltered { display: none !important; }


			body.shitpost #siteTable .thing.zregistered.isrepost,	body.shitpost #siteTable .thing.zregistered.iskarmawhore {	display: block !important; }


		body.goodpost #filtermode .goodpost {	color: lightgreen;	}
		body.shitpost #filtermode .shitpost, body.filteredpost #filtermode .filteredpost {	color: tomato;	}

		body.anti-resfilter .thing:not(.RESFiltered), body.anti-resfilter .thing:not(.ZFiltered) {
			display: none;
		}
		body.anti-resfilter #siteTable .thing.RESFiltered, body.anti-resfilter #siteTable .thing.ZFiltered {
			display: block !important;
		}


		.res-commentBoxes .thing.comment {
			padding: 3px 5px 3px 3px !important;
			margin: 0px 4px 4px 5px !important;
		}

		.content{
			background-color: hsl(0,0%,10%)  !important;
		}
		.thing {
			background: hsl(0,0%,14%) !important;
		}
		.subreddit, .author {
			color: rgba(20, 150, 220, 0.8) !important;
		}
		.domain a {
			color: rgb(173, 216, 230) !important;
		}
		.live-timestamp {
			color: #898963 !important
		}
		.tagline {
			color: #hsl(0, 0%, 53%) !important;
		}
		.RES-keyNav-activeElement,	.RES-keyNav-activeElement .md-container, .res-nightmode.res-commentBoxes .comment.RES-keyNav-activeThing,
		.child>.sitetable> .comment.RES-keyNav-activeThing,
		.child>.sitetable>.comment > .child>.sitetable> .comment.RES-keyNav-activeThing,
		.child>.sitetable>.comment > .child>.sitetable>.comment > .child>.sitetable>.comment > .child>.sitetable > .comment.RES-keyNav-activeThing {
			background-color: hsl(0,5%,15%)  !important;
		}
		.RES-keyNav-activeElement,	.RES-keyNav-activeElement .md-container,	.thing.link.RES-keyNav-activeThing {
			background-color: hsl(0,4%, 11%)  !important;
		}
		.res-nightmode .RES-keyNav-activeElement > .tagline,
		.res-nightmode .RES-keyNav-activeElement .md-container > .md,
		.res-nightmode .RES-keyNav-activeElement .md-container > .md p {
			color: #FFFFFF!important;
		}
		.unvoted, .link .rank {
			color: #c6c6c6 !important;
		}
		.flat-list a {
			color: rgb(158, 158, 158) !important;
		}
		.thing .title:visited, .combined-search-page .search-result a:visited, .combined-search-page .search-result a:visited > mark {
			color: rgb(166, 166, 166);
		}
		.thing .title, h1, h2, h3, h4, p {
			color: rgb(222, 222, 222);
		}

		.res-nightmode .flair, .res-nightmode .linkflairlabel {
			color: white;
		}

		`;
    function appendStyleEl() {
        if (document.head) {
            document.head.appendChild(styleEl);
        }
        else {
            setTimeout(appendStyleEl, 1);
        }
    }
    appendStyleEl();
}(window, window.document));
const RESES = window.RESES = {
    _preinitList: [],
    _initList: [],
    extendType: (function () {
        const defProp = Object.defineProperty;
        const assign = Object.assign;
        function defineOne(proto, name, prop, options, obj) {
            if (name in proto) {
                if (options.override) {
                    defProp(proto, name, prop);
                }
                else if (options.merge) {
                    var target = proto[name];
                    var src = obj[name];
                    extendType(target, src, options);
                }
            }
            else {
                defProp(proto, name, prop);
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
                var opts = options.hasOwnProperty(name) ? assign({}, options, options[name]) : options;
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
                if (arguments.length > 3) {
                    this[3] = arguments[3];
                }
            }
            else if (data instanceof Color || Array.isArray(data)) {
                this[0] = data[0];
                this[1] = data[1];
                this[2] = data[2];
                this[3] = data[3];
            }
            else if (typeof data === "string") {
                data = data.trim();
                if (data[0] === '#') {
                    switch (data.length) {
                        case 4:
                            this[0] = parseInt(data[1], 16);
                            this[0] = (this[0] << 4) | this[0];
                            this[1] = parseInt(data[2], 16);
                            this[1] = (this[1] << 4) | this[1];
                            this[2] = parseInt(data[3], 16);
                            this[2] = (this[2] << 4) | this[2];
                            break;
                        case 9:
                            this[3] = parseInt(data.substr(7, 2), 16);
                        case 7:
                            this[0] = parseInt(data.substr(1, 2), 16);
                            this[1] = parseInt(data.substr(3, 2), 16);
                            this[2] = parseInt(data.substr(5, 2), 16);
                            break;
                    }
                }
                else if (data.startsWith("rgb")) {
                    var parts = data.substr(data[3] === "a" ? 5 : 4, data.length - (data[3] === "a" ? 6 : 5)).split(',');
                    this.r = parsePart(parts[0]);
                    this.g = parsePart(parts[1]);
                    this.b = parsePart(parts[2]);
                    if (parts.length > 3) {
                        this.a = parsePart(parts[3]);
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
            get r() { return this[0]; },
            set r(value) { this[0] = value == null ? 0 : Math.max(Math.min(parseInt(value), 255), 0); },
            get g() { return this[1]; },
            set g(value) { this[1] = value == null ? 0 : Math.max(Math.min(parseInt(value), 255), 0); },
            get b() { return this[2]; },
            set b(value) { this[2] = value == null ? 0 : Math.max(Math.min(parseInt(value), 255), 0); },
            get a() { return this[3] / 255; },
            set a(value) { this[3] = value == null ? 255 : Math.max(Math.min(value > 1 ? value : parseFloat(value) * 255, 255), 0); },
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
    getNonStandardWindowProperties: function getNonStandardWindowProperties(bAsArray) {
        var iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        var result = Object.getOwnPropertyNames(window).filter(name => !iframe.contentWindow.hasOwnProperty(name));
        if (!bAsArray) {
            result = result.reduce((dict, name) => { dict[name] = window[name]; return dict; }, {});
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
                this.hidden === true ? window.clearTimeout(this.timer) : window.cancelAnimationFrame(this.timer);
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
            }
            else {
                op = new Operation(method);
                wm.set(method, op);
            }
            op.start();
        };
    })()
};
if (unsafeWindow !== undefined) {
    unsafeWindow.RESES = RESES;
}
RESES.extendType(Element, {
    From: (function () {
        const doc = window.document;
        const rgx = /(\S+)=(["'])(.*?)(?:\2)|(\w+)/g;
        return function CreateElementFromHTML(html) {
            var innerHtmlStart = html.indexOf('>') + 1;
            var elemStart = html.substr(0, innerHtmlStart);
            var match = rgx.exec(elemStart)[4];
            var elem = doc.createElement(match);
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
RESES.extendType(DOMTokenList.prototype, {
    ContainsAny: function () {
        for (var i = 0, len = arguments.length; i < len; i++) {
            if (this.contains(arguments[i])) {
                return true;
            }
        }
        return false;
    }
});
RESES.filterData = {
    karmawhores: [
        'SlimJones123', 'GallowBoob', 'Ibleedcarrots', 'deathakissaway', 'pepsi_next', 'BunyipPouch', 'Sumit316',
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
        "kaibasmistress", "DeliciousTraps"
    ].map(x => x && x.toLowerCase()),
    pornaccounts: [
        "lilmshotstuff", "Bl0ndeB0i", "Alathenia", "kinkylilkittyy", "Immediateunmber", "justsomegirlidk", "serenityjaneee",
        "Urdadstillwantsme", "therealtobywong", "sarah-xxx", "RubyLeClaire", "chickpeasyx", "rizzzzzy",
        "clarabelle_says", "Telari_Love", "purplehailstorm", "Peach_Legend", "NetflixandChillMe", "xrxse",
        "alomaXsteele", "BeaYork", "Littlebitdramatic", "fitchers_bird"
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
        "pouts", "MyHeroAcademia"
    ].map(x => x && x.toLowerCase()),
    annoyingflairs: [
        "Art", "Artwork", "FanArt", "Fan Art", "Fan Work"
    ].map(x => x && x.toLowerCase()),
    annoyingsubs: [
        "uglyduckling", "guineapigs", "Rats", "happy", "Blep", "tattoos", "forbiddensnacks", "PrequelMemes",
        "BoneAppleTea", "deadbydaylight", "Eyebleach", "vegan", "The_Mueller", "boottoobig", "politics",
        "drawing", "piercing", "Illustration", "curledfeetsies", "brushybrushy"
    ].map(x => x && x.toLowerCase())
};
RESES.extendType(RESES, {
    bIsCommentPage: window.location.pathname.includes('/comments/'),
    bIsUserPage: window.location.pathname.includes('/user/'),
    get bIsMultireddit() {
        delete this.bIsMultireddit;
        return this.bIsMultireddit = document.body.classList.contains('multi-page');
    },
    addTabBarButton: function addTabBarButton(el) {
        var tabbar = document.getElementsByClassName('tabmenu')[0];
        if (tabbar) {
            tabbar.appendChild(el);
        }
    },
    config: (function localSettings() {
        var _cachedEnableAutoDownvoting = null;
        return {
            get bEnableAutoDownvoting() {
                return _cachedEnableAutoDownvoting !== null ? _cachedEnableAutoDownvoting : (_cachedEnableAutoDownvoting =
                    JSON.parse(localStorage.getItem('reses-enableautodownvoting') || 'false'));
            },
            set bEnableAutoDownvoting(value) { localStorage.setItem('reses-enableautodownvoting', JSON.stringify(_cachedEnableAutoDownvoting = value)); }
        };
    })(),
    btnFilterPost: ((window, document, RESES) => {
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
						<li><a id="enableAutoDownvoting"><span>Enable Auto Downvoting</span></a></li>
						<li><a id="disableAutoDownvoting"><span>Disable Auto Downvoting</span></a></li>
					</ul>
				</div>
			</li>`);
        const elGoodposts = btn.querySelector('.goodpost span');
        const elFilteredposts = btn.querySelector('.filteredpost span');
        const elShitposts = btn.querySelector('.shitpost span');
        const elEnableAutoDownvoting = btn.querySelector('#enableAutoDownvoting');
        const elDisableAutoDownvoting = btn.querySelector('#disableAutoDownvoting');
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
            RESES.debounceMethod(RESES.linkListingMgr.updateLinkListings);
        });
        btn.querySelector('#downvoteFiltered').addEventListener('click', () => {
            RESES.linkListingMgr.listingCollection.forEach((post) => {
                if (post.isFilteredByRES || post.isFilteredByZ) {
                    post.autoDownvotePost();
                }
            });
            RESES.debounceMethod(RESES.linkListingMgr.updateLinkListings);
        });
        btn.querySelector('#removeDownvotes').addEventListener('click', () => {
            RESES.linkListingMgr.listingCollection.forEach((post) => {
                post.removeAutoDownvote();
            });
            RESES.debounceMethod(RESES.linkListingMgr.updateLinkListings);
        });
        elEnableAutoDownvoting.addEventListener('click', () => {
            RESES.config.bEnableAutoDownvoting = true;
            elDisableAutoDownvoting.parentElement.style.display = "block";
            elEnableAutoDownvoting.parentElement.style.display = "none";
        });
        elDisableAutoDownvoting.addEventListener('click', () => {
            RESES.config.bEnableAutoDownvoting = false;
            elDisableAutoDownvoting.parentElement.style.display = "none";
            elEnableAutoDownvoting.parentElement.style.display = "block";
        });
        RESES._preinitList.push(() => {
            if (RESES.config.bEnableAutoDownvoting) {
                elEnableAutoDownvoting.parentElement.style.display = "none";
            }
            else {
                elDisableAutoDownvoting.parentElement.style.display = "none";
            }
        });
        RESES._initList.push(() => {
            if (!RESES.bIsCommentPage && !RESES.bIsUserPage) {
                document.body.classList.add('goodpost');
                RESES.addTabBarButton(btn);
            }
        });
        return {
            get btn() { return btn; },
            update: function (counters) {
                elGoodposts.textContent = counters.good;
                elFilteredposts.textContent = counters.filtered;
                elShitposts.textContent = counters.shit;
            }
        };
    })(window, window.document, window.RESES),
    btnLoadAllComments: ((window, document, RESES) => {
        var arr = null, coms = null, scrollX = 0, scrollY = 0, bGuard = false;
        const btn = Element.From(`<li><a id="loadAllComments" href="#3"/a><span>Load All Comments</span></li>`);
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
        RESES._initList.push(() => {
            if (RESES.bIsCommentPage) {
                RESES.addTabBarButton(btn);
            }
        });
        return {
            get btn() { return btn; }
        };
    })(window, window.document, window.RESES),
    ScrollingSidebar: ((window, document, RESES) => {
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
    })(window, window.document, window.RESES),
    sideBarMgr: ((window, document, RESES) => {
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
        RESES._preinitList.push(() => {
            ssleft = new RESES.ScrollingSidebar('sbLeft', _update);
            ssright = new RESES.ScrollingSidebar('sbRight', _update);
        });
        RESES._initList.push(() => {
            document.querySelectorAll('.listing-chooser .grippy').Remove();
            ssleft.init(document.querySelector('.listing-chooser .contents'));
            ssright.init(document.getElementsByClassName('side')[0]);
            document.body.classList.add('sidebarman');
        });
        return {
            get leftSidebar() { return ssleft; },
            get rightSidebar() { return ssright; }
        };
    })(window, window.document, window.RESES),
    linkRegistry: ((window, document, RESES) => {
        const _links = {};
        var _blockedUrlsCache = null;
        const LinkRegistry = {
            get links() { return _links; },
            get blockedUrls() { return _blockedUrlsCache || (_blockedUrlsCache = JSON.parse(localStorage.getItem('reses-blockedurls') || '[]')); },
            saveBlockedUrls: function saveBlockedUrls() { localStorage.setItem('reses-blockedurls', JSON.stringify(_blockedUrlsCache)); },
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
            checkIfBlockedUrl: function checkIfBlockedUrl(url) { return LinkRegistry.blockedUrls.includes(url); },
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
    })(window, window.document, window.RESES),
    LinkListing: ((window, document, RESES) => {
        const expandoboxObserverOptions = { attributes: true };
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
                    if (ev.isTrusted && !post.bAutoDownvoted && post.url) {
                        RESES.linkRegistry.addBlockedUrl(post.url);
                    }
                }
                else {
                    if (ev.isTrusted && !post.bAutoDownvoted && post.url) {
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
        class LinkListing {
            constructor(post) {
                this.post = post;
                this.expandoboxObserver = null;
                this.updateThumbnail = () => _updateThumbnail(this);
                this.handleVoteClick = (ev) => _handleVoteClick(this, ev);
                this.thumbnail = post.getElementsByClassName('thumbnail')[0] || null;
                this.expandobox = post.getElementsByClassName('res-expando-box')[0] || post.getElementsByClassName('expando')[0] || null;
                this.midcol = post.getElementsByClassName('midcol')[0] || null;
                this.voteArrows = this.midcol && this.midcol.getElementsByClassName('arrow') || null;
                this.flairLabel = post.getElementsByClassName('linkflairlabel')[0] || null;
                this.flairLabelText = (this.flairLabel !== null && this.flairLabel.title.toLowerCase()) || null;
                this.url = this.post.dataset.url || null;
                this.subreddit = this.post.dataset.subreddit || null;
                this.author = this.post.dataset.author || null;
                this.timestamp = Number(this.post.dataset.timestamp);
                this.bIsTextPost = this.expandobox === null || this.thumbnail !== null && (this.thumbnail.classList.ContainsAny('self', 'default'));
                this.bIsRepost = false;
                this.bIsBlockedURL = false;
                this.bIsKarmaWhore = false;
                this.bIsPorn = false;
                this.bIsAnime = false;
                this.bIsAnnoying = false;
                this.bAutoDownvoted = false;
                this.setupPost();
            }
            get age() { return Date.now() - this.timestamp; }
            get ageHours() { return this.age / 3600000; }
            get ageDays() { return this.age / 86400000; }
            get voteArrowUp() { return (this.voteArrows !== null && this.voteArrows.length > 1 && this.voteArrows[0]) || null; }
            get voteArrowDown() { return (this.voteArrows !== null && this.voteArrows.length > 1 && this.voteArrows[1]) || null; }
            get isUpvoted() { return this.midcol !== null && this.midcol.classList.contains("likes"); }
            get isDownvoted() { return this.midcol !== null && this.midcol.classList.contains("dislikes"); }
            get isUnvoted() { return this.midcol !== null && this.midcol.classList.contains("unvoted"); }
            get isExpanded() { return this.expandobox !== null && this.expandobox.getAttribute('hidden') === null ? true : false; }
            get isNSFW() { return this.post.classList.contains('over18'); }
            get isCrosspost() { return this.post.dataset.numCrossposts | 0 > 0; }
            get isFilteredByRES() { return this.post.classList.contains('RESFiltered'); }
            set isFilteredByRES(bool) { this.post.classList.toggle('RESFiltered', bool); }
            get isFilteredByZ() { return this.post.classList.contains('ZFiltered'); }
            set isFilteredByZ(bool) { this.post.classList.toggle('ZFiltered', bool); }
            get shouldBeDownvoted() {
                return this.bIsBlockedURL || (!RESES.bIsMultireddit && (this.bIsRepost || this.bIsKarmaWhore || this.bIsPorn || this.bIsAnime || this.bIsAnnoying));
            }
            autoDownvotePost() {
                if (!RESES.bIsUserPage && RESES.config.bEnableAutoDownvoting && this.isUnvoted && this.voteArrowDown !== null && this.ageDays < 30) {
                    this.bAutoDownvoted = true;
                    RESES.doAsync(() => this.voteArrowDown.click());
                    if (this.expandobox) {
                        this.expandobox.hidden = true;
                    }
                }
            }
            removeAutoDownvote() {
                if (this.voteArrowDown && this.isDownvoted && this.bAutoDownvoted) {
                    this.bAutoDownvoted = false;
                    this.voteArrowDown.click();
                    if (this.expandobox) {
                        this.expandobox.hidden = false;
                    }
                }
            }
            setupPost() {
                var filterData = RESES.filterData;
                this.post.classList.add('zregistered');
                if (this.flairLabel) {
                    RESES.doAsync(() => _adjustFlairColor(this));
                }
                if (this.midcol !== null) {
                    this.midcol.addEventListener('click', this.handleVoteClick);
                }
                if (this.url !== null) {
                    this.url = this.url.SubstrBefore("?").SubstrBefore("#").SubstrAfter("//").TrimEnd('/').SubstrAfter("www.");
                    if (this.url.length > 0) {
                        this.bIsBlockedURL = RESES.linkRegistry.checkIfBlockedUrl(this.url);
                        this.bIsRepost = RESES.linkRegistry.registerLinkListing(this);
                    }
                }
                if (this.subreddit !== null) {
                    this.subreddit = this.subreddit.TrimStart("u_", 1).toLowerCase();
                    if (!this.bIsTextPost) {
                        this.bIsPorn = filterData.pornsubs.includes(this.subreddit) || filterData.pornaccounts.includes(this.subreddit);
                    }
                    this.bIsAnime = filterData.animesubs.includes(this.subreddit);
                    this.bIsAnnoying = filterData.annoyingsubs.includes(this.subreddit);
                }
                if (this.author !== null) {
                    this.author = this.author.toLowerCase();
                    this.bIsKarmaWhore = filterData.karmawhores.includes(this.author);
                    if (!this.bIsTextPost) {
                        this.bIsPorn |= filterData.pornaccounts.includes(this.author);
                    }
                }
                if (this.flairLabelText !== null) {
                    this.bisAnnoying |= filterData.annoyingflairs.includes(this.flairLabelText);
                }
                if (this.bIsRepost) {
                    this.post.classList.add('isrepost');
                }
                if (this.bIsBlockedURL) {
                    this.post.classList.add('isblockedurl');
                }
                if (this.bIsPorn) {
                    this.post.classList.add('isporn');
                }
                if (this.bIsAnime) {
                    this.post.classList.add('isanime');
                }
                if (this.bIsKarmaWhore) {
                    this.post.classList.add('iskarmawhore');
                }
                if (this.bIsAnnoying) {
                    this.post.classList.add('isannoying');
                }
                if (this.shouldBeDownvoted) {
                    this.isFilteredByZ = true;
                    this.autoDownvotePost();
                }
                if (this.expandobox !== null) {
                    this.expandoboxObserver = new MutationObserver(this.updateThumbnail);
                    this.expandoboxObserver.observe(this.expandobox, expandoboxObserverOptions);
                }
                this.updateThumbnail();
            }
        }
        return LinkListing;
    })(window, window.document, window.RESES),
    linkListingMgr: ((window, document, RESES) => {
        var observer = null;
        const _newLinkListings = [];
        const _listingCollection = Array(1000);
        var _listingCollectionIndex = 0;
        function updateLinkListings() {
            var good = 0, filtered = 0, shit = 0;
            for (var i = 0, len = _listingCollectionIndex, posts = _listingCollection; i < len; i++) {
                var _p = posts[i];
                if (_p.isDownvoted) {
                    shit++;
                }
                else if (_p.isFilteredByRES) {
                    _p.isFilteredByRES = false;
                    _p.isFilteredByZ = true;
                    filtered++;
                }
                else if (_p.isFilteredByZ) {
                    filtered++;
                }
                else {
                    good++;
                }
            }
            RESES.btnFilterPost.update({ good, filtered, shit });
        }
        function initLinkListings() {
            console.time("initLinkListings");
            var linklisting = _newLinkListings.pop();
            while (linklisting) {
                var children = linklisting.children;
                for (var i = 0, len = children.length; i < len; i++) {
                    var listing = children[i];
                    if (listing.classList.contains('link')) {
                        _listingCollection[_listingCollectionIndex++] = new RESES.LinkListing(listing);
                    }
                }
                linklisting = _newLinkListings.pop();
            }
            RESES.debounceMethod(RESES.linkListingMgr.updateLinkListings);
            console.timeEnd("initLinkListings");
        }
        function handleLinkListingMutation(mutations) {
            for (var i = 0, len = mutations.length; i < len; i++) {
                var adds = mutations[i].addedNodes;
                for (var k = 0, l2 = adds.length; k < l2; k++) {
                    var node = adds[k];
                    if (node.nodeType === 1 && node.id === 'siteTable') {
                        _newLinkListings.push(node);
                    }
                }
            }
            initLinkListings();
        }
        RESES._initList.push(() => {
            var linklistings = document.getElementsByClassName('linklisting');
            var root = linklistings[0];
            if (root) {
                observer = new MutationObserver(handleLinkListingMutation);
                observer.observe(root, { childList: true });
                for (var i = 0, len = linklistings.length; i < len; i++) {
                    _newLinkListings.push(linklistings[i]);
                }
                initLinkListings();
                var showimages = document.getElementsByClassName('res-show-images')[0];
                if (showimages) {
                    showimages.addEventListener('click', () => {
                        RESES.doAsync(RESES.linkListingMgr.updateLinkListings);
                    });
                }
            }
        });
        return {
            get listingCollection() { return _listingCollection; },
            updateLinkListings
        };
    })(window, window.document, window.RESES),
});
(function RESESInitializer(window, document, RESES) {
    while (RESES._preinitList.length > 0) {
        var func = RESES._preinitList.shift();
        func();
    }
    function initialize() {
        while (RESES._initList.length > 0) {
            var func = RESES._initList.shift();
            RESES.doAsync(func);
        }
    }
    if (document.readyState === 'loading') {
        window.addEventListener("DOMContentLoaded", initialize);
    }
    else {
        initialize();
    }
})(window, window.document, window.RESES);
