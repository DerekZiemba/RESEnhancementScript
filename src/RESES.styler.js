"use strict";

(function RESUS_styler(window, document){
	const styleEl = document.createElement("style");

	styleEl.innerHTML = `
		.side, .listing-chooser .contents { display:none;};
		.sb-track .side, .listing-chooser .sidebar .contents{display: block;}
		.sb-on .sb-track .sb-sled {
			/* width:min-content; */
			display: block;}

		.listing-chooser .grippy {display: none;}

		.sb-off.sidebar {	width: 6px;	}
		.sidebar {
			background-color: rgb(30, 30, 30);
			position: absolute;
			height:100%;
			display: none;
		}
		.sidebar.sb-init {
			display: flex;
		}
			.sidebar:hover {	z-index:50;	}

		#sbRight.sidebar {	right:0;	}
		#sbRight.sb-on.sidebar .sb-handle { margin-left:-5px; 	order: 0;	}

		#sbLeft.sidebar {	left:0;	}
		#sbLeft.sidebar .sb-handle {	position: relative;	order: 1;	}

			.sb-off.sidebar .sb-track {	display: none;	}
			.sidebar .sb-track {	margin-top: 20px;	}
			.sidebar .sb-track .sb-sled {	padding: 3px;	margin:0;	}
			.sidebar .sb-handle:hover {	background-color: rgb(92, 82, 82);	cursor: pointer;	}
			.sidebar .sb-handle {
				position: fixed;
				min-height: 100%;
				width:5px;
				background-color: rgb(63, 58, 58);
			}


		html body.with-listing-chooser .listing-chooser {	position: static; display: none; padding-right:unset;	}
		html body.with-listing-chooser.sidebarman .listing-chooser {	display: block;	}

		html body .content { margin-left: 0px}
		html body.with-listing-chooser>.content,
		html body.with-listing-chooser.listing-chooser-collapsed>.content,
		html body.with-listing-chooser .footer-parent {
			margin-left: 0;
			/* padding-left:8px; */
		}

		.tabmenu{ display: block; }
		.thumbnail.self, .thumbnail.default, .thumbnail.spoiler  { display:none !important; }
		.thing {
			padding: 5px 0 5px 0;
			margin: 7px 0 7px 0;
		}
		.comment .child, .comment .showreplies {
			margin-left: 9px !important;
			margin-top: 3px !important;
		}
		.res-commentBoxes .comment {
			margin-left: 3px !important;
		}
		#allOptionsContainer {
			max-width: 1000%;
		}

			body.goodpost #siteTable .thing.zregistered { display: block !important; }
			body.goodpost #siteTable .thing.zregistered.RESFiltered,
			body.goodpost #siteTable .thing.zregistered.ZFiltered,
			body.goodpost #siteTable .thing.zregistered.isrepost,
			body.goodpost #siteTable .thing.zregistered.iskarmawhore {	display: none !important; }

			body.filteredpost #siteTable .thing.zregistered,
			body.filteredpost #siteTable .thing.zregistered.RESFiltered.isrepost,
			body.filteredpost #siteTable .thing.zregistered.RESFiltered.iskarmawhore,
			body.filteredpost #siteTable .thing.zregistered.ZFiltered.isrepost,
			body.filteredpost #siteTable .thing.zregistered.ZFiltered.iskarmawhore { display: none !important; }

			body.filteredpost #siteTable .thing.zregistered.RESFiltered,
			body.filteredpost #siteTable .thing.zregistered.ZFiltered { display: block !important; }

			body.shitpost #siteTable .thing.zregistered,
			body.shitpost #siteTable .thing.zregistered.RESFiltered,
			body.shitpost #siteTable .thing.zregistered.ZFiltered { display: none !important; }


			body.shitpost #siteTable .thing.zregistered.isrepost,	body.shitpost #siteTable .thing.zregistered.iskarmawhore {	display: block !important; }


		body.goodpost #filtermode .goodpost {	color: lightgreen;	}
		body.shitpost #filtermode .shitpost, body.filteredpost #filtermode .filteredpost {	color: tomato;	}

		body.anti-resfilter .thing:not(.RESFiltered), body.anti-resfilter .thing:not(.ZFiltered) {
			display: none;
		}
		body.anti-resfilter #siteTable .thing.RESFiltered, body.anti-resfilter #siteTable .thing.ZFiltered {
			display: block !important;
		}


		.res-commentBoxes .thing.comment {
			padding: 3px 5px 3px 3px !important;
			margin: 0px 4px 4px 5px !important;
		}

		.content{
			background-color: hsl(0,0%,10%)  !important;
		}
		.thing {
			background: hsl(0,0%,14%) !important;
		}
		.subreddit, .author {
			color: rgba(20, 150, 220, 0.8) !important;
		}
		.domain a {
			color: rgb(173, 216, 230) !important;
		}
		.live-timestamp {
			color: #898963 !important
		}
		.tagline {
			color: #hsl(0, 0%, 53%) !important;
		}
		.RES-keyNav-activeElement,	.RES-keyNav-activeElement .md-container, .res-nightmode.res-commentBoxes .comment.RES-keyNav-activeThing,
		.child>.sitetable> .comment.RES-keyNav-activeThing,
		.child>.sitetable>.comment > .child>.sitetable> .comment.RES-keyNav-activeThing,
		.child>.sitetable>.comment > .child>.sitetable>.comment > .child>.sitetable>.comment > .child>.sitetable > .comment.RES-keyNav-activeThing {
			background-color: hsl(0,5%,15%)  !important;
		}
		.RES-keyNav-activeElement,	.RES-keyNav-activeElement .md-container,	.thing.link.RES-keyNav-activeThing {
			background-color: hsl(0,4%, 11%)  !important;
		}
		.res-nightmode .RES-keyNav-activeElement > .tagline,
		.res-nightmode .RES-keyNav-activeElement .md-container > .md,
		.res-nightmode .RES-keyNav-activeElement .md-container > .md p {
			color: #FFFFFF!important;
		}
		.unvoted, .link .rank {
			color: #c6c6c6 !important;
		}
		.flat-list a {
			color: rgb(158, 158, 158) !important;
		}
		.thing .title:visited, .combined-search-page .search-result a:visited, .combined-search-page .search-result a:visited > mark {
			color: rgb(166, 166, 166);
		}
		.thing .title, h1, h2, h3, h4, p {
			color: rgb(222, 222, 222);
		}

		.res-nightmode .flair, .res-nightmode .linkflairlabel {
			color: white;
		}

		`;

	function appendStyleEl() {
		if (document.head) {
			document.head.appendChild(styleEl);
		} else {
			setTimeout(appendStyleEl, 1);
		}
	}

	appendStyleEl();

}(window, window.document));
