(function(){

	/*************************************************************
	 *                                                           *
	 *                     bookmarklet glue                      *
	 *                                                           *
	 *************************************************************/

	var ajaxDataType = 'json';

	/*************************************************************
	 *                                                           *
	 *                   "portable" javascript                   *
	 *                                                           *
	 *************************************************************/

	/*
	 *	restore the blunt end of the Follow/Unfollow button 
	 *	after it was clicked and the click was processed
	 */
	function restoreBorderRadius(radius)
	{
		var link = $('.follow-prompt a');
		var label = link.find('span').html();

		if (label == '' || label == 'Wait...' || label == linkLabel)
		{
			setTimeout(restoreBorderRadius, 100);
			return;
		}

		link.css({ borderRadius: radius + ' 0px 0px ' + radius });
		linkLabel = label;
	}

	/*
	 *	add Follower status, cache the Follow/Unfollow button label
	 */
	var linkLabel;
	var statusDiv;

	function addFollowerStatus()
	{
		var link = $('div.full .follow-prompt a');
		var info = link.parent().parent();
		var radius;

		info.after('<div>&nbsp;</div>');
		statusDiv = info.next();

		if (profile)
		{
			statusDiv.css({
				float: 'left',
				backgroundPosition: '50% 50%, 0 50%',
				backgroundRepeat: 'no-repeat, repeat-x',
				borderRadius: '0 6px 6px 0',
				margin: '5px 7px 0 -3px',
				padding: '7px 0',
				width: '30px'
			}).tipsy({ html: true, fade: true, title: 'status' });

			radius = '6px';
		}
		else
		{
			statusDiv.css({
				float: 'left',
				backgroundPosition: '50% 50%, 0 50%',
				backgroundRepeat: 'no-repeat, repeat-x',
				borderRadius: '0 3px 3px 0',
				margin: '2px 0 0 -2px',
				padding: '3px',
				width: '8px',
				height: '8px',
				overflow: 'hidden'
			}).tipsy({ html: true, fade: true, title: 'status' });

			radius = '3px';
		}

		statusDiv.attr('_bgPos', statusDiv.css('background-position'));

		linkLabel = link.find('span').html();
		link.css({ borderRadius: radius + ' 0px 0px ' + radius });

		$('.follow-prompt a').live('click', function(){ 
			setTimeout(function(){ restoreBorderRadius(radius); }, 100); 
		});

		/*
		 *	ugly, but functional, dedicated to Chrome on OS X
		 */
		var hHave = statusDiv.outerHeight();
		var hWant = link.outerHeight();
		if (hHave != hWant)
			statusDiv.height(statusDiv.height() + hWant - hHave);
	}

	/*
	 *	'p' = processing (ajax in progress)
	 *	'-' = not following
	 *	'+' = following
	 *	'e' = some sort of error
	 */
	function setFollowerStatus(status, progress)
	{
		if (! statusDiv)
			addFollowerStatus();

console.log('setting follower status to ' + status + ' ' + (progress ? progress : ''));

		var tooltip;
		var bgColor;
		var bgImage, overlay;
		var imgBase = 'https://github.com/apankrat/assorted/raw/master/javascript/dribbble/misc/';
		var tipsy = $(document).find('.tipsy-inner');
 
		switch (status)
		{
		case 'p': 
			tooltip = 'Checking if this player<br>is following you...<br>' + progress;
			bgColor = 'white';
			bgImage = 'url("/images/processing.gif")';
			break;
		case 'e':
			tooltip = 'Unable to check if this player is following you';
			bgColor = '#D3D3D3';
			bgImage = 'icon-cross';
			overlay = 'glass-30.png';
			break;
		case '-':
			tooltip = 'This player is not<br>following you';
			bgColor = '#D3D3D3';
			bgImage = 'icon-minus';
			overlay = 'glass-30.png';
			break;
		case '+':
			tooltip = 'This player is<br> following you';
			bgColor = '#8ABA56';
			bgImage = 'icon-check';
			overlay = 'glass-light.png';
			break;
		}

		if (overlay)
		{
			bgImage = 'url("' + imgBase + bgImage + (profile ? '-0' : '-1') + '.png"), ' +
			          'url("/images/' + overlay + '")';

			statusDiv.css({ backgroundPosition: statusDiv.attr('_bgPos') });
		}
		else
		{
			statusDiv.css({ backgroundPosition: '-9px -3px' });
		}

		statusDiv.attr('status', tooltip);
		statusDiv.css({
			backgroundColor: bgColor,
			backgroundImage: bgImage,
		});     

		/*
		 *	deal with the tooltip if it's visible
		 */
		if (tipsy.length)
		{
			switch (status)
			{
			case 'p': 
				tipsy.html(tooltip); 
				break;
			case 'e':
			case '-':
			case '+': 
				statusDiv.tipsy('hide');
				statusDiv.tipsy('show'); 
				break;
			}
		}
	}

	/*
	 *
	 */
	var followers = null;

	function checkFollowerStatus()
	{
		var i;
		for (i=0; i<followers.length; i++)
			if (followers[i] == username)
				break;

		setFollowerStatus( (i < followers.length) ? '+' : '-' );
	}

	/*
	 *
	 */
	var apiCalls = 0;
	var nextCall;

	function realAjaxCall(url, cb)
	{
		$.ajax({
			url:      url,
			dataType: ajaxDataType,
			success:  cb,
			error:    function(){ setFollowerStatus('e'); }
		});
	}

	function makeAjaxCall(url, cb)
	{
		var now = +new Date();
		var noSooner = nextCall;

		/*
		 *	make first 30 calls back to back,
		 *	make next 30 calls at least 250 ms apart,
		 *	space the rest in 1 second intervals
		 */
		apiCalls++;
		nextCall = now + ((apiCalls < 30) ? 0 :
		                 ((apiCalls < 15) ? 250 : 1000));

		if (now < noSooner)
		{
console.log('delaying ajax call by ' + (noSooner - now) + 'ms');
			setTimeout(function(){ realAjaxCall(url, cb); }, noSooner - now);
		}
		else
		{
			realAjaxCall(url, cb);
		}
	}

	/*
	 *
	 */
	var newList;
	var attempts = 0;

	function processFollowersPage(info)
	{
console.log('processing followers page ' + info.page + ' out of ' + info.pages);
console.log(info);

		if (info.total != newList.length)
		{
console.log('followers list appears to have changed, new size = ' + info.total);
			/*
			 *	followers list changed while we were reading it
			 *	-> start again
			 */
			newList = null;
			if (attempts++ < 2)
			{
				updateFollowersList(info.total);
				return;	
			}

			setFollowerStatus('e');
			return;
		}

		var first = (info.page - 1)* info.per_page;

		for (var i=0; i<info.players.length; i++)
		{
			var uname = info.players[i].username;
			var index = newList.length - first - i - 1;

			if (index < followers.length &&
			    newList[index] == uname)
			{
console.log('follower at index ' + index + ' is the same as before, done');
				/*
				 *	this is it, the rest of the list [0..index] is the same
				 */
				break;
			}

			newList[index] = uname;		
		}

		if (i < info.players.length ||
		    info.page == info.pages)
		{
console.log('saving the list');
			followers = newList;
			localStorage.setItem('followers', JSON.stringify(followers));
			localStorage.setItem('followers_mtime', + new Date());
			checkFollowerStatus();
			return;
		}

		/*
		 *
		 */
		fetchFollowersPage(info.page+1, info.pages);
	}

	function fetchFollowersPage(pageNumber, pagesExpected)
	{
console.log('fetching page ' + pageNumber + ' out of ' + pagesExpected);

		setFollowerStatus('p', Math.round(100*pageNumber/(pagesExpected+1)) + '% done');

		makeAjaxCall('http://api.dribbble.com/players/' + myname + '/followers?per_page=30&page=' + pageNumber,
			     processFollowersPage );
	}

	function updateFollowersList(newListSize)
	{
console.log('updating followers list...');

		newList = followers.slice(0, newListSize);
		if (newList.length < newListSize)
				newList[newListSize-1] = null;

		fetchFollowersPage(1, Math.round(newListSize/30+1));
	}

	function processOwnInfo(info)
	{
console.log(info);
		
		var followersNow  = info.followers_count;
		var followersWhen = localStorage.getItem('followers_mtime');

console.log('followers now = ' + followersNow + ', was = ' + followers.length);

		if ( followersNow != followers.length ||
		     followersWhen && (followersWhen + 24*60*60*1000 < + new Date()) )
		{
			setFollowerStatus('p');
			updateFollowersList(followersNow);
			return;	
		}

		checkFollowerStatus();
	}

	function fromUrl(url)
	{
		/*
		 *	"/username" or "/username/"
		 */
		var re = /^\/([^\/]+)\/?$/;
		var m = re.exec(url);
		return (m && m.length == 2) ? m[1] : null;
	}


	/*************************************************************
	 *                                                           *
	 *                  execution starts here                    *
	 *                                                           *
	 *************************************************************/

	var username;
	var myname;
	var profile;

	function main(argc, argv)
	{

		/*
		 *	don't bother with older browsers
		 */
		if (typeof(window.localStorage) == 'undefined')
			return;

		/*
		 *	check we are logged in
		 */
		if ($('#header #t-signin').length > 0)
			return;

		/*
		 *	get our username
		 */
		myname = fromUrl( $('#header #t-profile a').attr('href') );
		if (! myname)
		{
			console.log("can't find myname");
			return;
		}

		/*
		 *	see if it's user's profile page
		 */
		username = fromUrl(window.location.pathname);
		if (username)
		{
			/*
			 *	double check (filter out /shots, /popular, etc)
			 */
			if ($('div.full img.photo').length != 1)
				return;

			profile = true;
		}
		else
		/*
		 *	see if it's user's shot page
		 */
		{
			re = /^\/shots\/([0-9]+-[^\/]+)$/;
			if (! re.exec(window.location.pathname))
				return;

			/*
			 *	extract username
			 */
			username = fromUrl( $('.shot-byline-user a').attr('href') );
			if (! username)
			{
				console.log("can't find username");
				return;
			}

			profile = false;
		}

		console.log("self: " + myname + ", user: " + username);

		/*
		 *	ignore our own profile page
		 */
		if (myname == username)
			return;

		/*
		 *	load cached version of the Followers list
		 */
		followers = localStorage.getItem('followers');
		if (followers)
		{
			try { followers = JSON.parse(followers); } 
			catch(x) { followers = null; }
		}
		followers = followers || new Array();

		/*
		 *	oki-doki, initiate the callback gallore by checking
		 *	if we need to refresh our copy of the Followers list
		 */
		makeAjaxCall('http://api.dribbble.com/players/' + myname, processOwnInfo);
	}

	main();

})();


