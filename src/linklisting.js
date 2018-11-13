/// <reference path="styler.js" />
/// <reference path="RESES.js" />
/// <reference path="core.js" />
/*global RESES */

"use strict";

RESES.linkRegistry = ((window, document) => {
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

})(window, window.document);


RESES.LinkListing = ((window, document) => {

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
		get isExpanded() {
			if (this.expandobox !== null) {
				if (this.expandobox.dataset.cachedhtml) {
					return this.expandobox.style.display !== 'none';
				}
				return this.expandobox.getAttribute('hidden') === null;
			}
			return false;
		}
		get isNSFW() { return this.post.classList.contains('over18'); }
		get isCrosspost() { return this.post.dataset.numCrossposts | 0 > 0; }
		get isFilteredByRES() { return this.post.classList.contains('RESFiltered'); }
		get isAutoDownvoted() { return this.post.classList.contains('autodownvoted'); }
		set isAutoDownvoted(bool) { this.post.classList.toggle('autodownvoted', bool); }
		get bMatchesFilter() { return this.bIsKarmaWhore || this.bIsPorn || this.bIsAnime || this.bIsAnnoying; }
		get shouldBeDownvoted() {
			return this.bIsBlockedURL || (!RESES.bIsMultireddit && (this.bIsRepost || this.bMatchesFilter));
		}
		autoDownvotePost() {
			var cfg = RESES.config;
			if (!RESES.bIsUserPage && cfg.bAutoDownvoting && this.isUnvoted && this.voteArrowDown !== null && this.ageDays < 30) {
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
				this.voteArrowDown.click();
				if (this.expandobox) { this.expandobox.hidden = false; }
			}
		}
		setupPost() {
			var filterData = RESES.filterData;

			this.post.classList.add('zregistered');

			if (this.flairLabel) {
				//Due to the getComputedStyle call, this has substantial overhead if not done in animation frame, slowing down the initLinkListings method
				// For 100 posts, overhead is decreased from 60ms to 8ms.
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

			if (this.bIsRepost) { this.post.classList.add('isrepost'); }
			if (this.bIsBlockedURL) { this.post.classList.add('isblockedurl'); }
			if (this.bIsPorn) { this.post.classList.add('isporn'); }
			if (this.bIsAnime) { this.post.classList.add('isanime'); }
			if (this.bIsKarmaWhore) { this.post.classList.add('iskarmawhore'); }
			if (this.bIsAnnoying) { this.post.classList.add('isannoying'); }
			if (this.shouldBeDownvoted) {
				this.autoDownvotePost();
			}

			if (this.expandobox !== null) {
				this.expandoboxObserver = new MutationObserver(this.updateThumbnail);
				this.expandoboxObserver.observe(this.expandobox, { attributes: true });
			}

			this.updateThumbnail();
		}
	}


	return LinkListing;
})(window, window.document);


RESES.linkListingMgr = ((window, document) => {
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
					_listingCollection[_listingCollection.index++] = new RESES.LinkListing(listing);
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
				if (node.nodeType === 1 && node.id === 'siteTable') {
					_newLinkListings.push(node);
				}
			}
		}
		_processNewLinkListings();
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

})(window, window.document);