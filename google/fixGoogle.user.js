// ==UserScript==
// @name           Fix Google
// @namespace      http://swapped.cc
// @description    Strips 'onmousedown' from links, decreases their font-size and puts back the underline
// @include        https://google.com/*
// @include        https://www.google.com/*
// @include        https://*.google.com/*
// @require        https://code.jquery.com/jquery-1.7.1.min.js
// ==/UserScript==

var busy = 0;

function fix_google()
{
	busy++;
	$('a').each(function(){ $(this).attr('onmousedown',null); });
	$('#res .r a, #newsbox a').css({ 'font-size': '16px', 'text-decoration': 'underline' });
	busy--;
}

var timer = null;

function fix_proxy(ev)
{
	if (busy)
		return; // don't react to own's changes

	if (typeof timer == "number")
	{
        	clearTimeout(timer);
		timer = null;
	}
	timer = setTimeout(fix_google, 333);
}

$("body").bind("DOMSubtreeModified", fix_proxy);
fix_google();
