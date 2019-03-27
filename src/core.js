/// <reference path="RESES.js" />
/*global RESES */

"use strict";

RESES.bIsCommentPage = window.location.pathname.includes('/comments/');

RESES.bIsUserPage = window.location.pathname.includes('/user/');

RESES.subreddit = (() => {
	var m = /^\/(?:r\/(\w+)\/)/.exec(window.location.pathname);
	return m && m[1] ? m[1].toLocaleLowerCase() : null;
})();

RESES.config = (function localSettings() {
	const cache = {};

	function getSetting(key, _default) {
		if (cache[key] !== undefined) { return cache[key]; }
		var value = localStorage.getItem('reses-' + key);
		var setting = JSON.parse(value || _default.toString());
		cache[key] = setting;
		return setting;
		// return cache[key] !== null ? cache[key] : (cache[key] = JSON.parse(localStorage.getItem('reses-' + key) || _default.toString()));
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

