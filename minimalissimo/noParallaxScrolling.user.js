// ==UserScript==
// @name           Disable Parallax Scrolling
// @namespace      http://swapped.cc
// @description    Removes "parallax scrolling" on two-column pages
// @include        http://minimalissimo.com/*
// @include        http://www.minimalissimo.com/*
// @include        https://minimalissimo.com/*
// @include        https://www.minimalissimo.com/*
// ==/UserScript==


setTimeout(function(){
	var c = document.getElementsByClassName('size-1of2');
	for (var i=0; i<c.length; i++)
	{
		c[i].className += ' size-1of1';
		c[i].removeAttribute('style');    // transform: ...
	}
}, 1000);
