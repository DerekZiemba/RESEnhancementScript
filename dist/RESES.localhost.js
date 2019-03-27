// ==UserScript==
// @name         RESEnhancementScript
// @version      1.0.3
// @description	 Enhances RedditEnhancementSuite.  Adds hideable scrolling sidebars. Removes thumbnails on expanded posts. Auto Filters content and downvotes as necessary.
// @author       Derek Ziemba
// @include        *://*.reddit.*/*
// @noframes
// @run-at		document-start
// @require     https://localhost/.js/RESEnhancementScript/dist/RESEnhancementScript.js
// @resource    customCSS https://localhost/.js/RESEnhancementScript/src/styles.css
// @grant       GM_addStyle
// @grant       GM_getResourceText

// ==/UserScript==

GM_addStyle(GM_getResourceText("customCSS"));
