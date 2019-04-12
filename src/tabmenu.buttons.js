
/// <reference path="RESES.js" />
/// <reference path="linklisting.js" />
/*global RESES */

"use strict";

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
    setting.toggle(RESES.config[id]);

    setting.addEventListener('click', (ev) => {
      ev.stopPropagation();
      let value = RESES.config[id] = document.body.classList.toggle(id);
      setting.classList.toggle('disabled', !value);
      onChange && onChange.call(setting, value, ev);
    });

    let ul = parent.getElementsByTagName('ul')[0];
    if (!ul) { parent.appendChild(ul = Element.From(`<ul class='resesddl'></ul>`)); }
    ul.appendChild(setting);

    if (typeof filter !== 'string') { filter.setting = setting; }

    return setting;
  }

	btn.querySelector('#filtermode').addEventListener('click', () => {
		var cls = document.body.classList;
		if (cls.contains('goodpost')) {
			cls.replace('goodpost', 'filteredpost');
		} else if (cls.contains('filteredpost')) {
			cls.replace('filteredpost', 'shitpost');
		} else if (cls.contains('shitpost')) {
			cls.replace('shitpost', 'goodpost');
		}
		RESES.debounce(RESES.linkListingMgr.updateLinkListings);
	});

  btn.querySelector('#downvoteFiltered').addEventListener('click', () => {
    RESES.doAsync(() => {
      RESES.linkListingMgr.listingCollection.forEach((post) => {
        if (post.isFilteredByRES) {
          RESES.doAsync(() => post.autoDownvotePost());
        }
      });
      RESES.debounce(RESES.linkListingMgr.updateLinkListings);
    });
	});

  btn.querySelector('#removeDownvotes').addEventListener('click', () => {
    RESES.doAsync(() => {
      RESES.linkListingMgr.listingCollection.forEach((post) => {
        RESES.doAsync(() => post.removeAutoDownvote());
      });
      RESES.debounce(RESES.linkListingMgr.updateLinkListings);
    });
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
      if (tabbar) { tabbar.appendChild(btn); }
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

// RESES.btnLoadAllComments = (() => {
// 	var arr = null, coms = null, scrollX = 0, scrollY = 0, bGuard = false;
// 	const btn = Element.From(`<li><a id="loadAllComments" href="#3"/a><span>Load All Comments</span></li>`);

// 	function doClick() {
// 		if (arr.length > 0 && bGuard === false) {
// 			bGuard = true;
// 			scrollX = window.scrollX;
// 			scrollY = window.scrollY;
// 			var el = arr.pop();
// 			el.click();
// 			window.scroll(scrollX, scrollY);
// 		}
// 	}
// 	function handleInserted(ev) {
// 		if (arr.length > 0) {
// 			var target = ev.target;
// 			if (target.nodeName === "DIV" && target.classList.contains('thing')) {
// 				bGuard = false;
// 			}
// 			doClick();
// 		} else {
// 			coms.removeEventListener('DOMNodeInserted', handleInserted);
// 		}
// 	}
// 	function handleClick() {
// 		coms = document.querySelector('.commentarea');
// 		arr = Array.from(coms.querySelectorAll('.morecomments a')).reverse();
// 		coms.addEventListener('DOMNodeInserted', handleInserted);
// 		doClick();
// 	}

// 	btn.addEventListener('click', handleClick);

// 	RESES.onReady(() => {
// 		if (RESES.bIsCommentPage) {
// 			RESES.addTabMenuButton(btn);
// 		}
// 	});

// 	return {
// 		get btn() { return btn; }
// 	};
// })();


