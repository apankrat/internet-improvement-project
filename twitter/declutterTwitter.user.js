// ==UserScript==
// @name           Declutter Twitter
// @namespace      http://swapped.cc
// @description    Removes "Who To Follow", "Trends" and the legalese
// @include        http://twitter.com/*
// @include        http://www.twitter.com/*
// @include        https://twitter.com/*
// @include        https://www.twitter.com/*
// @require        http://code.jquery.com/jquery-1.9.1.min.js
// ==/UserScript==

var burst = 30;

function declutterTwitter()
{
	var divs = 
	  $("div.component[data-component-term='user_recommendations'], " +
	    "div.component[data-component-term='trends'], " +
	    "div[data-component-context^='generic_activity_MagicRec'], " +
	    "div.ProfileUserList--socialProof, " +
	    "div.recent-followers-module, " +
	    "div.promoted-tweet, " +
	    "div.module.trends," +
	    "div.module.Footer," +
	    "div.promptbird," +
	    "div.wtf-module, " +
	    "div.site-footer, " +
	    "div.module.trends, " +
	    "div#js-empty-timeline-recommendations-module-hook," +
	    "div.ReonboardingCallout," +
	    "li[data-item-type='who_to_follow_entry']," +
	    "li[data-item-type='recap_entry']," +
	    "div.SidebarCommonModules");

	divs.hide();
  
	if (divs.length) burst = 30;
	else
	if (burst) burst--;
	
	document.oncontextmenu = null;

	setTimeout(declutterTwitter, burst ? 100 : 1000);
}

declutterTwitter();
