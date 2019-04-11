// ==UserScript==
// @name         RESEnhancementScript-Debuggable
// @version      1.0.10
// @description	 Enhances RedditEnhancementSuite.  Adds hideable scrolling sidebars. Removes thumbnails on expanded posts. Auto Filters content and downvotes as necessary.
// @author       Derek Ziemba
// @include        *://*.reddit.*/*
// @noframes
// @run-at			 document-start
// @resource    customCSS https://localhost/.js/RESEnhancementScript/src/styles.css
// @grant       GM_addStyle
// @grant       GM_getResourceText
// ==/UserScript==

'use strict';

Element.From = (function () {
  const rgx = /(\S+)=(["'])(.*?)(?:\2)|(\w+)/g;
  return function CreateElementFromHTML(html) { //Almost 3x performance compared to jQuery and only marginally slower than manually creating element: https://jsbench.github.io/#02fe05ed4fdd9ff6582f364b01673425
      var innerHtmlStart = html.indexOf('>') + 1;
      var elemStart = html.substr(0, innerHtmlStart);
      var match = rgx.exec(elemStart)[4];
      var elem = window.document.createElement(match);
      while ((match = rgx.exec(elemStart)) !== null) {
          if (match[1] === undefined) {
              elem.setAttribute(match[4], "");
          } else {
              elem.setAttribute(match[1], match[3]);
          }
      }
      elem.innerHTML = html.substr(innerHtmlStart, html.lastIndexOf('<') - innerHtmlStart);
      rgx.lastIndex = 0;
      return elem;
  };
}());


(function (window) {
  const CSSDebug = false;

  !CSSDebug && GM_addStyle(GM_getResourceText("customCSS"));
  const style = CSSDebug && Element.From(`<link rel="stylesheet" href="https://localhost/.js/RESEnhancementScript/src/styles.css"></link>`);
  const script = Element.From(`<script async="true" src="https://localhost/.js/RESEnhancementScript/dist/RESEnhancementScript.js"></script>`);

  function checkHeadReady() {
      if (window.document.head) {
          CSSDebug && window.document.head.append(style);
          window.document.head.append(script);
      } else {
          setTimeout(checkHeadReady, 0);
      }
  }

  checkHeadReady();

}(this.unsafeWindow ? this.unsafeWindow : this.window));