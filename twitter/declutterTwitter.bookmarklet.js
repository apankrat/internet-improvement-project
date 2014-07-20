javascript:

(function(){

	/*************************************************************
	 *                                                           *
	 *                     bookmarklet glue                      *
	 *                                                           *
	 *************************************************************/

	if (window.declutterTwitterInstalled)
		return;
	window.declutterTwitterInstalled = true;

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
		    "div.recent-followers-module, " +
		    "div.promoted-tweet, " + 
		    "div.module.trends," + 
		    "div.promptbird," +
		    "div.wtf-module, " +
		    "div.site-footer, " +
		    "div#js-empty-timeline-recommendations-module-hook, " +
		    "div.dashboard-right, " +
		    "div.ProfilePreviewBanner, " + 
		    "div.Footer.roaming-module" );

		if (divs.remove() != 0) burst = 30;
		else
		if (burst) burst--;

		setTimeout(declutterTwitter, burst ? 100 : 1000);
	}

	setTimeout(declutterTwitter, 100);

	$('head').append("<style>\n<!--\n.with-media-forward .cards-base .media-forward { max-height: 0 }\n-->\n</style>");

})();

