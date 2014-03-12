// ==UserScript==
// @name           Fix Google
// @namespace      http://swapped.cc
// @description    Strips 'onmousedown' from links, decreases their font-size and puts back the underline
// @include        https://google.com/*
// @include        https://www.google.com/*
// @include        https://*.google.com/*
// @require        https://code.jquery.com/jquery-1.7.1.min.js
// ==/UserScript==

function fix_google()
{
	$('a').each(function(){ $(this).attr('onmousedown',null); });
	$('#res .r a').css({ 'font-size': '16px', 'text-decoration': 'underline' });
}

var fix_timer = null;

function fix_proxy(ev)
{
	if (typeof fix_timer == "number")
	{
        	clearTimeout(fix_timer);
		fix_timer = null;
	}
	fix_timer = setTimeout(fix_google, 333);
}

$("body").bind("DOMSubtreeModified", fix_proxy);
fix_google();
