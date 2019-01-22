

(function (window, unsafeWindow, context) {

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

	const style = Element.From(`<link rel="stylesheet" href="https://localhost/.js/RESEnhancementScript/src/styles.css"></link>`);
	const script = Element.From(`<script async="true" src="https://localhost/.js/RESEnhancementScript/dist/RESEnhancementScript.js"></script>`);

	function checkHeadReady() {
		if (window.document.head) {
			window.document.head.append(style);
			window.document.head.append(script);
		} else {
			setTimeout(checkHeadReady, 0);
		}
	}

	checkHeadReady();

}(unsafeWindow ? unsafeWindow : window, unsafeWindow ? unsafeWindow : null, window));