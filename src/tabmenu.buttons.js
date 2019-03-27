
/// <reference path="RESES.js" />
/*global RESES */

"use strict";
RESES.addTabMenuButton = function addTabMenuButton(el) {
	var tabbar = document.getElementsByClassName('tabmenu')[0];
	if (tabbar) { tabbar.appendChild(el); }
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
		} else if (cls.contains('filteredpost')) {
			cls.replace('filteredpost', 'shitpost');
		} else if (cls.contains('shitpost')) {
			cls.replace('shitpost', 'goodpost');
		}
		RESES.debounceMethod(RESES.linkListingMgr.updateLinkListings);
	});

	btn.querySelector('#downvoteFiltered').addEventListener('click', () => {
		RESES.linkListingMgr.listingCollection.forEach((post) => {
			if (post.isFilteredByRES) {
        RESES.doAsync(() => post.autoDownvotePost());
			}
		});
		RESES.debounceMethod(RESES.linkListingMgr.updateLinkListings);
	});

	btn.querySelector('#removeDownvotes').addEventListener('click', () => {
    RESES.linkListingMgr.listingCollection.forEach((post) => {
      RESES.doAsync(() => post.removeAutoDownvote());
		});
		RESES.debounceMethod(RESES.linkListingMgr.updateLinkListings);
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
		} else {
			elDisableFilterDownvoting.parentElement.style.display = 'none';
		}
		if (RESES.config.bRepostDownvoting) {
			elEnableRepostDownvoting.parentElement.style.display = 'none';
		} else {
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
	RESES.onReady(tabMenuReady, -10);

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


