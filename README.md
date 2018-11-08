# RESEnhancementScript

* Requires RES-Nightmode and Greasemonkey/Tampermonkey
* Enhances RedditEnhancementSuite.
* Sidebars can be hidden and they scroll down the page with you.
* Thumbnails are removed on expanded posts so there's more room for content.
* Link Flair colors are always readable in nightmode. If the contrast is not enough, the text color is changed.
* Auto downvotes and sorts filtered content based on filter rules (filters mostly target porn and anime, then auto downvote).
* Automatic repost downvoting with downvote history to downvote previously downvoted content.
* Altered color scheme for better readability and navigation.


### Scrolling/Hideable Sidebars:
![Scrolling Sidebars](https://i.imgur.com/qCVo6Sg.gif)

### Collapsable Thumbnails:
![Collapsable Thumnails](https://i.imgur.com/Qjtf1MT.gif)

### Filter based sorting and options menu:
![Filtered Content](https://i.imgur.com/o8EUlEL.gif)

## Installation
Create a new greasemonkey script and past the following:
```
// ==UserScript==
// @name         RESEnhancementScript
// @version      0.5.1
// @description  Enhances RedditEnhancementSuite.  Adds hideable scrolling sidebars. Removes thumbnails on expanded posts. Auto Filters content and downvotes as necessary.
// @author       Derek Ziemba
// @include      *://*.reddit.*/*
// @noframes
// @run-at       document-start
// @require      https://raw.githubusercontent.com/DerekZiemba/RESEnhancementScript/master/dist/RESEnhancementScript.js
// ==/UserScript==
````
Alternatively, paste the contents of https://raw.githubusercontent.com/DerekZiemba/RESEnhancementScript/master/dist/RESEnhancementScript.js with the following at the top:
```
// ==UserScript==
// @name         RESEnhancementScript
// @version      0.5.1
// @description  Enhances RedditEnhancementSuite.  Adds hideable scrolling sidebars. Removes thumbnails on expanded posts. Auto Filters content and downvotes as necessary.
// @author       Derek Ziemba
// @include      *://*.reddit.*/*
// @noframes
// @run-at       document-start
// ==/UserScript==
````
