// ==UserScript==
// @name           Selectivity for HN
// @namespace      http://swapped.cc/iip
// @description    Adds a "hide" option to the stories on the Hacker News front page.
// @include        http://news.ycombinator.com/*
// @require        http://code.jquery.com/jquery-1.5.2.min.js
// @require        https://raw.github.com/apankrat/internet-improvement-project/master/_shared/js/gm-xhr.js
// @require        https://raw.github.com/apankrat/internet-improvement-project/master/_shared/js/jquery.color.min.js
// ==/UserScript==

(function(){

	/*************************************************************
	 *                                                           *
	 *                     greasemonkey glue                     *
	 *                                                           *
	 *************************************************************/
	$.ajaxSetup({ xhr: function(){ 
			var foo = new GM_XHR; 
			foo.setRequestHeader('Cookie', document.cookie);
			return foo;
		} 
	});

	var ajaxDataType = 'json';

	/*************************************************************
	 *                                                           *
	 *                   "portable" javascript                   *
	 *                                                           *
	 *************************************************************/

	var hiddenOpacity = 0.9;
	var hiddenBackColor = '#EAEAE2';
	var spinnerImage = 'https://github.com/apankrat/internet-improvement-project/raw/master/hn/hn-spinner.gif';

	var placeholderHeight = 0;
	var itemCache = new Array();
	var nextPage = null;

	/*
	 *
	 */
	function fetchId(a, rc)
	{
			var re = /^item\?id=([0-9]+)$/;
			var m = re.exec($(a).attr('href'));
			return m ? m[1] : rc;
	}

	function getItemId(td)
	{
		var id = null;
		td.find('a').each(function(){ 
			id = fetchId(this, id);
		});
		if (id)
			return id;

		/*
		 *	comment-less posts, like job postings - id by the url
		 */
		return td.parent().prev().find('a').attr('href');
	}

	/*
	 *
	 */
	function insertPlaceholder()
	{
		var where = $('table#hnx-content tr').eq(-2);
		
		where.before(
			'<tr class="hnx-placeholder hnx-busy">' +
					 '<td class="title" align="right" valign="top">&nbsp;</td>' +
					 '<td></td>' +
					 '<td class="title hnx-message"></td>' +
			'</tr>');
		var tr = where.prev();
		
		tr.find('td').hide();
		tr.height(0);

		tr.animate({ height: placeholderHeight + 'px' }, function(){
			processPlaceholder(tr);
		});
	}
	
	function processPlaceholder(tr)
	{
		insertHiddenItems(tr);

		if (itemCache.length < 3)
		{
			var tds = tr.find('td');

			tds.eq(0).html('??.');
			tds.eq(2).html('Loading...<br><span class="subtext hnx-spinner"></span>');

			tds.fadeIn(function(){
				tr.removeClass('hnx-busy');
				runPlaceholderQueue();
			});
		}
		else
		{
			tr.removeClass('hnx-busy');
			runPlaceholderQueue();
		}
	}

	function runPlaceholderQueue()
	{
		var tr = $('tr.hnx-placeholder');

		tr.each(function(){

			var pl = $(this);

			insertHiddenItems(pl);
			
			if (itemCache.length < 3)
			{
				fetchMoreItems();
				return false;
			}

			if (pl.hasClass('hnx-busy'))
			{
				// a new placeholder being expanded, let it finish,
				// processPlaceholder() will call this function again
				return false;
			}

			pl.before(itemCache.shift());
			pl.before(itemCache.shift()); 
			injectHideLinks(pl.prev().find('td.subtext'));
			pl.before(itemCache.shift());
			pl.remove();

		});
	}

	function insertHiddenItems(pl)
	{
		while (itemCache.length >= 3)
		{
			var re = /item\?id=([0-9]+)/;
			var m = re.exec(itemCache[1]);

			if (! m)
				return; // wtf

			if (! localStorage.getItem(m[1]))
				break;

			/*
			 *	add and hide previously hidden item
			 */
			var tr;

			pl.before(itemCache.shift()); 
			tr = pl.prev();

			pl.before(itemCache.shift()); 
			tr = tr.add(pl.prev());
			injectHideLinks(pl.prev().find('td.subtext'));

			pl.before(itemCache.shift());
			tr = tr.add(pl.prev());

			//
			tr.addClass('hnx-hidden');

			if (! $('#unhide').hasClass('topsel'))
			{
				tr.css({ opacity: 0 });
				tr.find('td').hide();
				tr.height(0).hide();
			}
			else
			{
				tr.css({ opacity: hiddenOpacity, backgroundColor: hiddenBackColor });
			}

			tr.find('a.hnx-hide').html('show');
		}
	}

	/*
	 *
	 */
	function hideItem(td)
	{
		var tr = td.parent();

		if (tr.hasClass('hnx-hidden'))
			return; // wtf

		var item = getItemId(td);
		if (! item)
			return; // wtf

		localStorage.setItem(item, true);

		tr = tr.add(tr.prev()).add(tr.next());

		placeholderHeight = 0;

		tr.each(function(){ 
			this.heightOrg = $(this).height(); 
			$(this).height(this.heightOrg);
			placeholderHeight += this.heightOrg;
		});

		tr.addClass('hnx-hidden');

		var once = true;

		if (! $('#unhide').hasClass('topsel'))
		{
			tr.animate({ opacity: 0 }, function(){
				if (once) { once = false; insertPlaceholder(); }
				$(this).find('td').hide();
				td.find('a.hnx-hide').html('show');
				$(this).animate({ height: '0px' }, function(){
					$(this).hide();
				});
			});
		}
		else
		{
			tr.animate({ opacity: hiddenOpacity, backgroundColor: hiddenBackColor });
			td.find('a.hnx-hide').html('show');
		}
	}

	function showItem(td)
	{
		var tr = td.parent();

		if (! tr.hasClass('hnx-hidden'))
			return; // wtf

		if (! $('#unhide').hasClass('topsel'))
			return; // wtf

		var item = getItemId(td);
		if (! item)
			return; // wtf

		localStorage.removeItem(item);

		tr = tr.add(tr.prev()).add(tr.next());

		tr.removeClass('hnx-hidden');

		tr.animate({ opacity: 1.0, backgroundColor: '#F6F6EF' });

		td.find('a.hnx-hide').html('hide');
	}

	/*
	 *
	 */
	function showHiddenItems()
	{
		var items = $('table#hnx-content tr.hnx-hidden');

		items.each(function(){
			$(this)
			.show()
			.animate({ height: this.heightOrg }, function(){
				$(this).find('td').show().last().css({ width: '100%' });
				$(this).animate({ opacity: hiddenOpacity, backgroundColor: hiddenBackColor });
			});
		});
	}

	function hideHiddenItems()
	{
		var items = $('table#hnx-content tr.hnx-hidden');

		items.animate({ opacity: 0 }, function(){
				$(this).find('td').hide();
				$(this).animate({ height: '0px' }, function(){
					$(this).hide();
				});
		});
	}

	/*
	 *
	 */
	function injectHideLinks(items)
	{
		var link = ' <a class="hnx-hide" href=# style="outline:none">hide</a>';

		items.each(function(){
			var i = $(this);
			var org = i.html();
			var re = /^(.*\|)+(.*)$/;
			var m = re.exec(org);
			if (m)
				i.html(m[1] + link + ' | ' + m[2]);
			else
				i.html(org + ' |' + link);
		});

		items.find('.hnx-hide').click(function(){

			if ($(this).html() == 'hide')
				hideItem( $(this).parent() );
			else
				showItem( $(this).parent() );

			return false;
		});
	}

	/*
	 *
	 */
	var ajaxing = false;
	var broken = null;

	function fetchFailed(reason)
	{
		$('tr.hnx-placeholder td.hnx-message')
			.html(
				'<span style="color: #c40">Error retrieving the item</span><br>' +
				'<span class="subtext">' + reason + ' | ' +
				'<a href=# onclick="window.location.reload(); return false;">reload</a></span>');

		broken = reason;
	}

	function parseMoreItems(msg)
	{
		if (msg == 'Unknown or expired link.')
		{
			fetchFailed('unknown or expired link');
			return;
		}

		if (msg == 'Unknown.')
		{
			fetchFailed('404');
			return;
		}

		var re = /<table border=0 cellpadding=0 cellspacing=0>(.*?)<\/table>/;
		var bulk = re.exec(msg);
		if (! bulk)
		{
			fetchFailed('malformed index page (no table)');
			return;
		}

		var newItems = new Array();
		bulk = bulk[1];

		re = /<tr.*?<\/tr>/g;
		while (row = re.exec(bulk))
			newItems.push(row[0]);

		if (newItems.length % 3 != 2)
		{
			fetchFailed('malformed index page (wrong row count)');
			return;
		}

		var more = newItems.pop();
		newItems.pop();

		itemCache = itemCache.concat(newItems);

		$('table#hnx-content tr').eq(-1).find('a').attr('href', nextPage);

		re = /href="(.*?)"/;
		url = re.exec(more);
		nextPage = url[1];

		runPlaceholderQueue()
	}

	function fetchMoreItems()
	{
		if (ajaxing)
			return;

		if (broken)
		{
			fetchFailed(broken);
			return;
		}

		ajaxing = true;

		$.ajax({
			type: "GET",
			url: nextPage,
			success:  function(msg) {
				ajaxing = false;
				parseMoreItems(msg);
			},
			error: function(request, textStatus, errorThrown) {
				ajaxing = false;
				fetchFailed('ajax error (' + textStatus + ')');
			}
		});
	}

	function addCssRules(def)
	{
		/*
		 *	http://www.phpied.com/dynamic-script-and-style-elements-in-ie/
		 */
		var ss1 = document.createElement('style');
		ss1.setAttribute("type", "text/css");
		var hh1 = document.getElementsByTagName('head')[0];
		hh1.appendChild(ss1);
		if (ss1.styleSheet)
		{
			ss1.styleSheet.cssText = def;
		} 
		else // all other browsers
		{
			var tt1 = document.createTextNode(def);
			ss1.appendChild(tt1);
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
		 *	don't bother with older browsers
		 */
		if (typeof(window.localStorage) == 'undefined')
		{
			console.log('Selectivity for HN - not running, localStorage is unavailable (which is odd)');
			return;
		}

		/*
		 *	check it's an index page
		 */
		var tables = $('center > table > tbody > tr table');
		if (tables.length != 3)
		{
			console.log('Selectivity for HN - not running, not an index page');
			return;
		}

		var id = $(tables[1]).find('tr td').eq(0).html();
		var re = /^[0-9]+\.$/;

		if (! re.exec(id))
		{
			console.log('Selectivity for HN - not running, not an index page');
			return;
		}

		console.log('Selectivity for HN - active');


		/*
		 *	patch it up - name tables
		 */
		$(tables[0]).attr('id', 'hnx-header');
		$(tables[1]).attr('id', 'hnx-content');

		/*
		 *	preload spinner
		 */
		var preload = new Image;
		preload.src = spinnerImage;

		/*
		 *	add css rules
		 */
		addCssRules(
			'tr.hnx-placeholder {' +
			'  height: 0px; }' +
			'tr.hnx-placeholder td {' +
			'  display: none; ' +
			'  vertical-align: top; }' + 
			'.hnx-spinner {' +
			'  display: inline-block;' +
			'  width: 12px;' +
			'  height: 12px;' +
			'  background-image: url(' + spinnerImage + ');' +
			'}'); 

		/*
		 *
		 */
		var items = $('table#hnx-content td.subtext');
		injectHideLinks(items);

		nextPage = $('table#hnx-content tr').eq(-1).find('a').attr('href');
		
		/*
		 *
		 */
		var top = $('table#hnx-header span.pagetop');
		top = $(top[0]);
		top.html( top.html() + ' | <span id=unhide><a href=# style="outline:none">show all</a></span>');

		$('#unhide a').click(function(){
			var link = $(this).parent();

			if (! link.hasClass('topsel'))
			{
				link.addClass('topsel');
				showHiddenItems();
			}
			else
			{
				link.removeClass('topsel');
				hideHiddenItems();
			}
			return false;
		});

		/*
		 *
		 */
		items.each(function(){
			var id = getItemId( $(this) );
			if (localStorage.getItem(id))
				hideItem( $(this) );				
		});
	}

	main();

})();
