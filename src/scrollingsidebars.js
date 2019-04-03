/// <reference path="RESES.js" />
/// <reference path="core.js" />
/*global RESES */


"use strict";
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
			} else if (sledBounds.height > window.innerHeight) {
				var bottomGap = window.innerHeight - sledBounds.bottom;
				var topGap = sledBounds.top - (ss.track.getBoundingClientRect().top + yscroll);
				if (bottomGap >= 0) {
					margintop += bottomGap - (ydiff >= 0 ? 1 : 0);
				} else if (topGap >= 0) {
					margintop += -topGap - (ydiff >= 0 ? 1 : 0);
				}
			} else {
				margintop += ydiff;
			}

			if (margintop != ss.marginTop) { ss.sled.style.marginTop = (ss.marginTop = margintop) + 'px'; }
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
			if (!target) { return; }
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
		if (ssleft.sled) { style.paddingLeft = Math.max(8, ssleft.el.scrollWidth); }
		if (ssright.sled) { style.paddingRight = Math.max(8, ssright.el.scrollWidth); }
		document.querySelectorAll('.content[role=main], .footer-parent').CSS(style);
  }

  function sideBarMgrInit() {
		ssleft = new RESES.ScrollingSidebar('sbLeft', _update);
    ssright = new RESES.ScrollingSidebar('sbRight', _update);
    // ssheader = new RESES.ScrollingSidebar('sbHeader', _update);
  }

  function sideBarMgrReady() {
		document.querySelectorAll('.listing-chooser .grippy').Remove();
		ssleft.init(document.querySelector('.listing-chooser .contents'));
    ssright.init(document.getElementsByClassName('side')[0]);
    // ssheader.init(document.getElementById('header'));
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

