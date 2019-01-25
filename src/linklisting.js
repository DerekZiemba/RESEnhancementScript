/// <reference path="RESES.js" />
/// <reference path="core.js" />
/*global RESES */

"use strict";

RESES.linkRegistry = (() => {
	const _links = {};
	var _blockedUrlsCache = null;

	const LinkRegistry = {
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
		checkIfBlockedUrl: function checkIfBlockedUrl(url) {
			return LinkRegistry.blockedUrls.includes(url);
		},
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

})();


RESES.LinkListing = ((window) => {
	function _updateThumbnail(post) {
		if (post.thumbnail) { post.thumbnail.style.display = post.isExpanded ? 'none' : ''; }
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
			} else {
				if (ev.isTrusted && !post.isAutoDownvoted && post.url) {
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
	function _getHostAndPath(url){
		let end = url.indexOf('?');
		if (end < 0) { end = url.indexOf('#'); }
		if (end < 0) { end = url.length; }
		if (url[end-1] === '/'){ end--; }
		let start = url.indexOf('www.') + 4;
		if (start < 4) { start = url.indexOf('//') + 2; }
		if (start < 2) { start = 0; }
		return url.substr(start, end - start);
	}
	function _sanitizeSubreddit(subreddit) {
		if (subreddit.startsWith('u_')) { subreddit = subreddit.substr(2); }
		return subreddit.toLowerCase();
	}

	const filterData = RESES.filterData;
	const checkIfBlockedUrl = RESES.linkRegistry.checkIfBlockedUrl;
	const registerLinkListing = RESES.linkRegistry.registerLinkListing;
	const wmArrowDown = new WeakMap();

	class LinkListing {
		constructor(post) {
			{ //Setup
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

				this.updateThumbnail = () => _updateThumbnail(this);
				this.handleVoteClick = (ev) => _handleVoteClick(this, ev);

				this.cls.add('zregistered');
			}
			{ //Processing
				if (this.flairLabel) {
					//Due to the getComputedStyle call, this has substantial overhead if not done in animation frame, slowing down the initLinkListings method
					// For 100 posts, overhead is decreased from 60ms to 8ms.
					RESES.doAsync(() => _adjustFlairColor(this));
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

				if (this.bIsRepost) { this.cls.add('isrepost'); }
				if (this.bIsBlockedURL) { this.cls.add('isblockedurl'); }
				if (this.bIsPorn) { this.cls.add('isporn'); }
				if (this.bIsAnime) { this.cls.add('isanime'); }
				if (this.bIsKarmaWhore) { this.cls.add('iskarmawhore'); }
				if (this.bIsAnnoying) { this.cls.add('isannoying'); }
				if (this.bIsShow) { this.cls.add('isshow'); }
				if (this.bIsGame) { this.cls.add('isgame'); }
				if (this.bIsPolitics) { this.cls.add('ispolitics'); }
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
		get voteArrowDown() {
			var arrow = null;
			if (this.midcol !== null) {
				arrow = wmArrowDown.get(this);
				if (!arrow) {
					arrow = this.midcol.getElementsByClassName('arrow')[1] || null;
					wmArrowDown.set(arrow);
				}
			}
			return arrow;
		}
		get age() { return Date.now() - this.timestamp; }
		get ageHours() { return this.age / 3600000; }
		get ageDays() { return this.age / 86400000; }
		get isUpvoted() { return this.mcls === null ? false : this.mcls.contains("likes"); }
		get isDownvoted() { return this.mcls === null ? false : this.mcls.contains("dislikes"); }
		get isUnvoted() { return this.mcls === null ? false : this.mcls.contains("unvoted"); }
		get isExpanded() {
			var expando = this.expandobox;
			if (expando !== null) {
				return expando.dataset.cachedhtml ? expando.style.display !== 'none' :  expando.getAttribute('hidden') === null;
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
		autoDownvotePost() {
			var cfg = RESES.config;
			if (!RESES.bIsUserPage && cfg.bAutoDownvoting && this.isUnvoted  && this.ageDays < 30 && this.voteArrowDown !== null) {
				if (this.bIsBlockedURL || cfg.bRepostDownvoting && this.bIsRepost || cfg.bFilterDownvoting && (this.bMatchesFilter)) {
					this.isAutoDownvoted = true;
					//Since posts are autodownvoted during creation in initLinkListings, calling the click handler now will result in substantial overhead
					// For 100 posts, 3 of which get downvoted, overhead is decreased from 100ms to 8ms.
					RESES.doAsync(() => this.voteArrowDown.click());
				}
				if (this.expandobox) { this.expandobox.hidden = true; }
			}
		}
		removeAutoDownvote() {
			if (this.voteArrowDown && this.isDownvoted && this.isAutoDownvoted) {
				this.isAutoDownvoted = false;
				RESES.doAsync(() => this.voteArrowDown.click());
				if (this.expandobox) { this.expandobox.hidden = false; }
			}
		}
	}


	return LinkListing;
})(window);


RESES.linkListingMgr = ((document) => {
	const LinkListing = RESES.LinkListing;
	const _newLinkListings = [];
	const _listingCollection = Array(1000); _listingCollection.index = 0;
	var linklistingObserver = null;

	function _updateLinkListings() {
		var good = 0, filtered = 0, shit = 0;
		for (var i = 0, len = _listingCollection.index, posts = _listingCollection; i < len; i++) {
			var post = posts[i];
			if (post.isDownvoted) {
				shit++;
			} else if (post.isFilteredByRES) {
				filtered++;
			} else {
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

		RESES.debounceMethod(_updateLinkListings); //a call to updateLinkListings may already be in progress if a post was auto downvoted
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

	RESES.onInit(() => {
		var linklistings = document.getElementsByClassName('linklisting');
		var root = linklistings[0];
		if (root) {
			linklistingObserver = new MutationObserver(_handleLinkListingMutation);
			linklistingObserver.observe(root, { childList: true });

			for (var i = 0, len = linklistings.length; i < len; i++) { _newLinkListings.push(linklistings[i]); }
			_processNewLinkListings();

			var showimages = document.getElementsByClassName('res-show-images')[0];
			if (showimages) {
				showimages.addEventListener('click', () => {
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

