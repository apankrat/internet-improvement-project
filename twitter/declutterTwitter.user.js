// ==UserScript==
// @name           Declutter Twitter
// @namespace      http://swapped.cc
// @description    Removes "Who To Follow", "Trends" and the legalese
// @include        http://twitter.com/*
// @include        http://www.twitter.com/*
// @include        https://twitter.com/*
// @include        https://www.twitter.com/*
// @require        http://code.jquery.com/jquery-1.7.1.min.js
// ==/UserScript==

var burst = 30;

function declutterTwitter()
{
	var divs =n
	  $("div.component[data-component-term='user_recommendations']," +
	    "div.component[data-component-term='trends']," +
	    "div.recent-followers-module," +
	    "div.promoted-tweet," +
	    "div.module.trends," +
	    "div.module.Footer," +
	    "div.promptbird," +
	    "div.wtf-module," +
	    "div.site-footer," +
	    "div#js-empty-timeline-recommendations-module-hook," +
	    "li[data-item-type='who_to_follow_entry']");

	divs.hide();
	document.oncontextmenu = null;

	if (divs.length) burst = 30;
	else
	if (burst) burst--;

	setTimeout(declutterTwitter, burst ? 100 : 1000);
}

setTimeout(declutterTwitter, 100);
