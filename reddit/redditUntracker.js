// ==UserScript==
// @name           Reddit untracker
// @namespace      http://swapped.cc
// @description    Prevents tracking on-page clicks (reported back via the cookie) and on-screen telemetry reports (reported back via async posts)
// @include        http://reddit.com/*
// @include        http://www.reddit.com/*
// @include        http://old.reddit.com/*
// @include        https://reddit.com/*
// @include        https://www.reddit.com/*
// @include        https://old.reddit.com/*
// ==/UserScript==

function inject(callback)
{
	var script = document.createElement("script");
	script.textContent = "(" + callback.toString() + ")();";
	document.body.appendChild(script);
}

function untrack()
{
	function unbind() { $('a').off('mousedown'); }

	setInterval(unbind, 1000);
	unbind();

	$.ajaxSetup({
		beforeSend: function (xhr,settings)
		{
			if (typeof settings.data != 'undefined' &&
			    settings.data.search('event_type') != -1)
			{
				console.log('block - ' + settings.url);
				return false;
			}
        
			console.log('pass  - ' + settings.url);
			return true;
		}
	});  
}

inject( untrack );
console.log('gm/untracker is on');
