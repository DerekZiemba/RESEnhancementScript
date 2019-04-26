/// <reference path="RESES.js" />
/// <reference path="filterdata.js" />
/*global RESES */

"use strict";

RESES.linkRegistry = (() => {
	const _links = {};
  var _rgxGetHostName = /(\w{1,})(?=(?:\.[a-z]{2,4}){0,2}$)/;
  var _rgxSplitURL = /\/|\?/;
  function splitUrl(url) {
    var parts = url.split(_rgxSplitURL);
    try {
      parts[0] = _rgxGetHostName.exec(parts[0])[0];
    } catch (e) {
      console.error(url, parts, e);
      throw e;
    }
    return parts;
  }
  function getNode(parts) {
    var blocked = LinkRegistry.dictBlocked;
    for (var i = 0, len = parts.length - 1; i < len; i++) {
      let node = blocked[parts[i]];
      if (!node) { node = blocked[parts[i]] = {}; }
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
          } else {
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
      } else {
        // console.info("Blocking URL", url);
        node[last] = 1;
        !nosave && RESES.debounce(saveBlocked, 30);
      }
		},
    removeBlockedUrl: function removeBlockedUrl(url) {
      var parts = splitUrl(url);
      var last = parts[parts.length - 1];
      var node = getNode(parts);
      if (last in node) {
        // console.info("Removing Blocked URL", url);
        delete node[last];
        RESES.debounce(saveBlocked, 30);
      } else {
        console.error("Blocked Url Does not Exist and cannot be removed.", url);
      }
    },
    import: function (json) {
      var urls = JSON.parse(json);
      urls.forEach(x => this.addBlockedUrl(x, true)); //localStorage.getItem('reses-blockedurls')
      saveBlocked();
      return this.dictBlocked;
    },
    checkIfBlockedUrl: function checkIfBlockedUrl(url) {
      var parts = splitUrl(url);
      var blocked = LinkRegistry.dictBlocked;
      for (var i = 0, len = parts.length; i < len; i++) {
        if (!(blocked = blocked[parts[i]])) { return false; }
      }
      return true;
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

RESES.posts = new Map();
RESES.LinkListing = (() => {
  const asyncctx = new RESES.AsyncCtx("LinkListing");

	function _updateThumbnail(post) {
		if (post.thumbnail) { post.thumbnail.style.display = post.isExpanded ? 'none' : ''; }
	}

	function _handleVoteClick(post, ev) {
    if (ev.target === post.voteArrowDown) {
			if (!post.isDownvoted) {
        if (post.isExpanded) {
          let btn = post.post.getElementsByClassName('expando-button')[0];
          if (btn) { btn.click(); }
				}
				if (ev.isTrusted && !post.isAutoDownvoted && post.url) {
					RESES.linkRegistry.addBlockedUrl(post.url);
				}
			} else {
				if (ev.isTrusted && !post.isAutoDownvoted && post.url) {
					RESES.linkRegistry.removeBlockedUrl(post.url);
				}
      }
      post.bPending = false;
		}
		//The downvote button may be clicked several times during initLinkListings when a post is autodownvoted.
		// This will debounce all the calls so only a single call is made
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
	function _getHostAndPath(url){
		let end = url.indexOf('#');
		if (end < 0) { end = url.length; }
		let start = url.indexOf('www.') + 4;
		if (start < 4) { start = url.indexOf('//') + 2; }
    if (start < 2) { start = 0; }
    if (url[start] === "/") { start += 1; }
		return url.substr(start, end - start);
	}
	function _sanitizeSubreddit(subreddit) {
		if (subreddit.startsWith('u_')) { subreddit = subreddit.substr(2); }
		return subreddit.toLowerCase();
	}

	const filterData = RESES.filterData;
	const checkIfBlockedUrl = RESES.linkRegistry.checkIfBlockedUrl;
	const registerLinkListing = RESES.linkRegistry.registerLinkListing;
	const wm = new WeakMap();
	class LinkListing {
    constructor(post) {
      RESES.posts.set(post.id, this);
      this.post = post;
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

      this.updateThumbnail = () => _updateThumbnail(this);
      this.handleVoteClick = (ev) => _handleVoteClick(this, ev);

      this.cls.add('registered');

      if (this.midcol !== null) {
        this.midcol.addEventListener('click', this.handleVoteClick);
      }

      if (this.url !== null) {
        this.url = _getHostAndPath(this.url);
        if (this.url.length > 0) {
          if (this.isBlockedURL = checkIfBlockedUrl(this.url)) { console.log("Autodownvoting blocked url: " + this.url, this); }
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
          //Due to the getComputedStyle call, this has substantial overhead if not done in animation frame, slowing down the initLinkListings method
          // For 100 posts, overhead is decreased from 60ms to 8ms.
          asyncctx.doAsync(() => _adjustFlairColor(label));
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
		get cls() { return this.post.classList; }
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
      let filters = LinkListing.filters;
      for (var len = filters.length, i = 0; i < len; i++) {
        var filter = filters[i];
        if (this[filter.use]) { return true; }
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
        if (this.post.classList.contains(cls) || this.midcol && this.midcol.classList.contains(cls)) { return true; }
      }
      return false;
    }
    clickDownvoteArrow() {
      if (this.midcol !== null) {
        this.bPending = true;
        asyncctx.doAsync(()=> this.voteArrowDown.click());
      }
    }
		autoDownvotePost() {
			var cfg = RESES.config;
			if (!RESES.bIsUserPage && cfg.bAutoDownvoting && this.isUnvoted  && this.ageDays < 30) {
				if (this.bBlockedURL || cfg.bDownvoteReposts && this.bRepost || cfg.bDownvoteFiltered && (this.bMatchesFilter)) {
					this.isAutoDownvoted = true;
					//Since posts are autodownvoted during creation in initLinkListings, calling the click handler now will result in substantial overhead
					// For 100 posts, 3 of which get downvoted, overhead is decreased from 100ms to 8ms.
          this.clickDownvoteArrow();
				}
				if (this.expandobox) { this.expandobox.hidden = true; }
			}
		}
		removeAutoDownvote() {
			if (this.isDownvoted && this.isAutoDownvoted) {
        this.isAutoDownvoted = false;
        this.clickDownvoteArrow();
				if (this.expandobox) { this.expandobox.hidden = false; }
			}
		}
  }

  LinkListing.filters = [];
  LinkListing.defineFilter = function defineFilter(key) {
    let filter = {
      key: key,
      cssFilter: "filter_" + key,
      cssIs: "is_" + key,
      jsIs: "is" + key.Capitalize(),
      use: "b" + key.Capitalize()
    };
    LinkListing.filters.push(filter);
    Object.defineProperty(LinkListing.prototype, filter.jsIs, {
      get: function () { return this.cls.contains(filter.cssIs); },
      set: function (bool) { this.cls.toggle(filter.cssIs, bool); }
    });

    Object.defineProperty(LinkListing.prototype, filter.use, {
      get: function () { return document.body.classList.contains(filter.cssFilter) && this[filter.jsIs]; }
    });
  };

  LinkListing.defineFilter("repost");
  LinkListing.defineFilter("blockedURL");

  Object.keys(RESES.filterData).forEach(LinkListing.defineFilter);

  RESES.onReady(function generateCSSRules() {
    document.head.parentElement.classList.add('reses');
    document.head.parentElement.classList.add('res-filters-disabled');
    let arr = [];
    LinkListing.filters.forEach(filter => {
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
	const _listingCollection = Array(1000); _listingCollection.index = 0;
  var linklistingObserver = null;
  var block_updateLinkListings = false;

  function _updateLinkListings() {
    if (!block_updateLinkListings) {
      var good = 0, filtered = 0, shit = 0;
      for (var i = 0, len = _listingCollection.index, posts = _listingCollection; i < len; i++) {
        var post = posts[i];
        if (post.isDownvoted) {
          shit++;
        } else if (post.bMatchesFilter) {
          filtered++;
        } else {
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
          _listingCollection[_listingCollection.index++] = new LinkListing(listing);
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

			for (var i = 0, len = linklistings.length; i < len; i++) { _newLinkListings.push(linklistings[i]); }
			RESES.debounce(_processNewLinkListings);

			var showimages = document.getElementsByClassName('res-show-images')[0];
			if (showimages) {
				showimages.addEventListener('click', () => _updateLinkListings());
			}
		}
  }

	RESES.onLoaded(linkListingReady, 0);

	return {
		get listingCollection() { return _listingCollection; },
		updateLinkListings: _updateLinkListings
	};

})();

