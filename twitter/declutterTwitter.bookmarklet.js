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
			"div.promoted-tweet, " + 
			"div#js-empty-timeline-recommendations-module-hook");

		if (divs.remove() != 0) burst = 30;
		else
		if (burst) burst--;

		setTimeout(declutterTwitter, burst ? 100 : 1000);
	}

	setTimeout(declutterTwitter, 100);

})();

