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

})();

