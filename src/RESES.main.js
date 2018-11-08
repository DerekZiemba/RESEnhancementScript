/// <reference path="RESES.styler.js" />
/// <reference path="RESES.core.js" />
/// <reference path="RESES.filterData.js" />

"use strict";

RESES.extendType(RESES, {
	bIsCommentPage: window.location.pathname.includes('/comments/'),
	bIsUserPage: window.location.pathname.includes('/user/'),
	get bIsMultireddit() {
		delete this.bIsMultireddit;
		return this.bIsMultireddit = document.body.classList.contains('multi-page');
	},

	addTabBarButton: function addTabBarButton(el) {
		var tabbar = document.getElementsByClassName('tabmenu')[0];
		if (tabbar) { tabbar.appendChild(el); }
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
			} else if (cls.contains('filteredpost')) {
				cls.replace('filteredpost', 'shitpost');
			} else if (cls.contains('shitpost')) {
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
			} else {
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
				elShitposts.textContent =  counters.shit;
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
		function handleInserted(ev){
			if (arr.length > 0) {
				var target = ev.target;
				if (target.nodeName === "DIV" && target.classList.contains('thing')) {
					bGuard = false;
				}
				doClick();
			} else {
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
				} else if (sledBounds.height > window.innerHeight) {
					var bottomGap = window.innerHeight - sledBounds.bottom;
					var topGap = sledBounds.top - (ss.track.getBoundingClientRect().top + yscroll);
					if (bottomGap >= 0) {
						margintop += bottomGap - (ydiff >= 0 ? 1 : 0);
					} else if (topGap >= 0) {
						margintop += -topGap - (ydiff >= 0 ? 1 : 0);
					}
				}	else {
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

				this.handle.addEventListener('click', ()=> this.toggleSidebar());
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
			if (ssleft.sled) { style.paddingLeft = Math.max(8, ssleft.el.scrollWidth); }
			if (ssright.sled) { style.paddingRight = Math.max(8, ssright.el.scrollWidth); }
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
				} else {
					throw new Error("Duplicate Blocked Url. " + url);
				}
			},
			removeBlockedUrl: function removeBlockedUrl(url) {
				var urls = LinkRegistry.blockedUrls;
				var index = urls.indexOf(url);
				if (index >= 0) {
					urls.splice(index, 1);
					LinkRegistry.saveBlockedUrls();
				} else {
					throw new Error("Blocked Url Does not Exist and cannot be removed. " + url);
				}
			},
			checkIfBlockedUrl: function checkIfBlockedUrl(url) { return LinkRegistry.blockedUrls.includes(url); },
			registerLinkListing: function registerLinkListing(post) {
				if (post.url in _links) {
					var entry = _links[post.url];
					if (Array.isArray(entry)) {
						entry.push(post);
					} else {
						_links[post.url] = [entry, post];
					}
					return true;
				} else {
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
			if (post.thumbnail) { post.thumbnail.style.display = post.isExpanded ? 'none' : ''; }
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
				} else {
					if (ev.isTrusted && !post.bAutoDownvoted && post.url) {
						RESES.linkRegistry.removeBlockedUrl(post.url);
					}
				}
			}
			//The downvote button may be clicked several times during initLinkListings when a post is autodownvoted.
			// This will debounce all the calls so only a single call is made
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
					//Since posts are autodownvoted during creation in initLinkListings, calling the click handler now will result in substantial overhead
					// For 100 posts, 3 of which get downvoted, overhead is decreased from 100ms to 8ms.
					RESES.doAsync(()=>this.voteArrowDown.click());
					if (this.expandobox) { this.expandobox.hidden = true; }
				}
			}
			removeAutoDownvote() {
				if (this.voteArrowDown && this.isDownvoted && this.bAutoDownvoted) {
					this.bAutoDownvoted = false;
					this.voteArrowDown.click();
					if (this.expandobox) { this.expandobox.hidden = false; }
				}
			}
			setupPost () {
				var filterData = RESES.filterData;

				this.post.classList.add('zregistered');

				if (this.flairLabel) {
					//Due to the getComputedStyle call, this has substantial overhead if not done in animation frame, slowing down the initLinkListings method
					// For 100 posts, overhead is decreased from 60ms to 8ms.
					RESES.doAsync(() =>_adjustFlairColor(this));
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

				if (this.bIsRepost) { this.post.classList.add('isrepost');  }
				if (this.bIsBlockedURL) { this.post.classList.add('isblockedurl'); }
				if (this.bIsPorn) { this.post.classList.add('isporn'); }
				if (this.bIsAnime) { this.post.classList.add('isanime'); }
				if (this.bIsKarmaWhore) { this.post.classList.add('iskarmawhore'); }
				if (this.bIsAnnoying) { this.post.classList.add('isannoying'); }
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
				} else if (_p.isFilteredByRES) {
					_p.isFilteredByRES = false;
					_p.isFilteredByZ = true;
					filtered++;
				} else if (_p.isFilteredByZ) {
					filtered++;
				} else {
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

			//a call to updateLinkListings may already be in progress if a post was auto downvoted
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
				observer.observe(root, { childList: true});

				for (var i = 0, len = linklistings.length; i < len; i++) { _newLinkListings.push(linklistings[i]); }
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
	} else {
		initialize();
	}

})(window, window.document, window.RESES);


