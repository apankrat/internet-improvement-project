// ==UserScript==
// @name           Declutter Twitter
// @namespace      http://swapped.cc
// @description    Removes junk elements from Twitter pages
// @include        http://twitter.com/*
// @include        http://www.twitter.com/*
// @include        https://twitter.com/*
// @include        https://www.twitter.com/*
// @require        http://code.jquery.com/jquery-1.9.1.min.js
// ==/UserScript==

var burst = 30;

function declutterTwitter()
{
	var divs;
  
	divs = $(
	  "div.tweet > div.context > div.tweet-context > span.Icon--heartBadge"
	);
  
	divs = divs.parent().parent().parent();
    
	divs = divs.add(
	  "div.component[data-component-term='user_recommendations'], " +
	  "div.component[data-component-term='trends'], " +
	  "div[data-component-context^='generic_activity_MagicRec'], " +
	  "div[data-item-type='who_to_follow_entry'], " +
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
	  "div.SidebarCommonModules," +
	  "div[aria-label='Timeline: Trending now']," +
	  "article[aria-labelledby='tweet-promoted-label']"
	);

	hmmm = $(
	  "aside[aria-label='Who to follow']," +
	  "nav[aria-label='Footer'], " +
	  "div[data-testid='placementTracking']"
	);
  
	divs = divs.add(hmmm.parent());
  
	if (divs.length)
	{
		divs.hide();
		console.log("Removed " + divs.length + " junk item(s)");
		burst = 30;
	}
	else
	{
		if (burst) burst--;
	}
	
	document.oncontextmenu = null;

	setTimeout(declutterTwitter, burst ? 100 : 1000);
}

declutterTwitter();
