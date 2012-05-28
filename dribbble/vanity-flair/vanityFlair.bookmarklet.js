javascript:

(function(){

	/*************************************************************
	 *                                                           *
	 *                     bookmarklet glue                      *
	 *                                                           *
	 *************************************************************/

	if (window.vanityFlairInstalled)
		return;
	window.vanityFlairInstalled = true;

	var ajaxDataType = 'jsonp';

	/*************************************************************
	 *                                                           *
	 *                   "portable" javascript                   *
	 *                                                           *
	 *************************************************************/

	function realAjaxCall(url, cb)
	{
		$.ajax({
			url:      url,
			dataType: ajaxDataType,
			success:  cb,
			error:    function(jqXHR, rc, err) { 
			             setRanking('<em>Not available (server error)</em>'); 
			          }
		});
	}

	function setRanking(left)
	{
		var viewCount = $('div.meta-act.meta-act-views');

		var html = 
			'<div class=\"meta-act meta-act-views\">' +
			'	<span rel=\"tipsy\" original-title=\"Rank on the Popular list\">&nbsp;</span>' +
			'	<span class=\"meta-act-link meta-views\">' + left + '</span>' +
			'</div>';

		viewCount.after(html);

		rankInfo = viewCount.next();

		var icon = rankInfo.find('[rel=tipsy]');
		var text = rankInfo.find('span.meta-act-link');

		icon.tipsy({fade: true, gravity: 's'});

		icon.css({
			'display': 'inline-block',
			'width': '35px',
			'height': '100%',
			'background-repeat' : 'no-repeat',
			'background-position' : '12px 50%',
			'background-image': 'url(data:image/png;base64,'+
				'iVBORw0KGgoAAAANSUhEUgAAAA8AAAAOCAYAAADwikb'+
				'vAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1QAADd'+
				'UBPdZY8QAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjY'+
				'XBlLm9yZ5vuPBoAAAA6SURBVCiRY/z//z8DAwMDw6JF'+
				'iyAMEgATqRoGh2ZGmJ/JASwwBjEBFhcXx4jMHw0wJIA'+
				'eONjAEA0wACr4E/oFjISXAAAAAElFTkSuQmCC)',
			'cursor' : 'default'
		});

		text.css({
			'padding-left': 0,
			'padding-right': 0,
			'display': 'inline-block',
			'background-image': 'none'
		});
	}

	function humanize(num)
	{
		switch (num % 10)
		{
		case 1: return num + 'st';
		case 2: return num + 'nd';
		case 3: return num + 'rd';
		}
		return num + 'th';
	}

	function processResponse(info)
	{
		if (info.rc == 200)
		{
			if (info.rank_highest == info.rank_current)
			{
				setRanking( '<em>Currently </em> ' + humanize(info.rank_current) );
			}
			else
			if (info.rank_current != -1)
			{
				setRanking(humanize(info.rank_highest) + ' <em>highest &nbsp;/&nbsp; </em> ' +
						   humanize(info.rank_current) + ' <em>now</em>');
			}
			else
			{
				setRanking(humanize(info.rank_highest) + ' <em>highest</em>');
			}
		}
		else
		if (info.rc == 404)
		{
			setRanking('<em>Below 100th</em>');
		}
		else
		{
			setRanking('Unavailable');
		}
	}

	/*************************************************************
	 *                                                           *
	 *                  execution starts here                    *
	 *                                                           *
	 *************************************************************/

	function main(argc, argv)
	{
		/*
		 *  check we are on the /shots/xxx page (and not rebounds)
		 */
		var re = /^\/shots\/([0-9]+)-[^\/]+\/?$/;
		var m = re.exec(window.location.pathname);
		if (!m || m.length != 2)
			return;

		var shotId = m[1];

		/*
		 *
		 */
		if (shotId < 570000)
		{
			setRanking('<em>Not available</em>');
			return;
		}

		/*
		 *	don't bother with shots with 5 likes or less
		 */
		var likes = $('#like-section > div > a');

		if (likes.length == 0)
		{
			setRanking('<em>Below 100th</em>');
			return;
		}

		var re = /^([0-9]+)/;
		var m = re.exec(likes.html());
		if (m && m.length == 2 && m[1] < 6)
		{
			setRanking('<em>Below 100th</em>');
			return;
		}

		realAjaxCall('http://api.swapped.cc/dribbble/shots/' + shotId + '/rank?gm', processResponse);
	}

	main();

})();

