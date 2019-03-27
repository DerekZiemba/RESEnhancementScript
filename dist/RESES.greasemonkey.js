/** Paste the following into greasemoneky or tampermonkey to use. */

// ==UserScript==
// @name         RESEnhancementScript
// @version      0.5.1
// @description  Enhances RedditEnhancementSuite.  Adds hideable scrolling sidebars. Removes thumbnails on expanded posts. Auto Filters content and downvotes as necessary.
// @author       Derek Ziemba
// @include      *://*.reddit.*/*
// @noframes
// @run-at       document-start

/** Uncomment out the @require to github and point to your local directory to run your own version of the script */
// @require      https://raw.githubusercontent.com/DerekZiemba/RESEnhancementScript/master/dist/RESEnhancementScript.js
// // @require      file:///A:/Dropbox/Scripts/.js/RESEnhancementScript/dist/RESEnhancementScript.js

// ==/UserScript==




// ==UserScript==
// @name         RESEnhancementScript
// @version      1.0.0
// @description	 Enhances RedditEnhancementSuite.  Adds hideable scrolling sidebars. Removes thumbnails on expanded posts. Auto Filters content and downvotes as necessary.
// @author       Derek Ziemba
// @include        *://*.reddit.*/*
// @noframes
// @run-at			 document-start
// @require     https://localhost/.js/RESEnhancementScript/dist/RESEnhancementScript.js
// @resource    customCSS https://localhost/.js/RESEnhancementScript/src/styles.css
// @grant       GM_addStyle
// @grant       GM_getResourceText

// ==/UserScript==

var newCSS = GM_getResourceText("customCSS");
GM_addStyle (newCSS);
