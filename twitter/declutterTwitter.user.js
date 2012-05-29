// ==UserScript==
// @name           Declutter Twitter
// @namespace      http://swapped.cc
// @description    Removes promoted tweets, "Who To Follow", "Trends" and the legalese
// @include        http://twitter.com/*
// @include        http://www.twitter.com/*
// @include        https://twitter.com/*
// @include        https://www.twitter.com/*
// @require        http://code.jquery.com/jquery-1.7.1.min.js
// ==/UserScript==

(function(){

	/*************************************************************
	 *                                                           *
	 *                     greasemonkey glue                     *
	 *                                                           *
	 *************************************************************/
	
	/* none required */

	/*************************************************************
	 *                                                           *
	 *                   "portable" javascript                   *
	 *                                                           *
	 *************************************************************/
	var burst = 30;

	function declutterTwitter()
	{
		var divs = 
		  $("div.component[data-component-term='user_recommendations'], " +
			"div.component[data-component-term='trends'], " +
			"div.component[data-component-term='footer'], " +
			"div.promoted-tweet, " + 
			"div#js-empty-timeline-recommendations-module-hook");

		if (divs.remove() != 0) burst = 30;
		else
		if (burst) burst--;

		setTimeout(declutterTwitter, burst ? 100 : 1000);
	}

	setTimeout(declutterTwitter, 100);

})();