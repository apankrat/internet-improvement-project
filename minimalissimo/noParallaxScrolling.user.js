// ==UserScript==
// @name           Declutter Twitter
// @namespace      http://swapped.cc
// @description    Removes "parallax scrolling" on two-column pages
// @include        http://minimalissimo.com/*
// @include        http://www.minimalissimo.com/*
// @include        https://minimalissimo.com/*
// @include        https://www.minimalissimo.com/*
// @require        http://code.jquery.com/jquery-1.9.1.min.js
// ==/UserScript==

$('.size-1of2').addClass('.size-1of1');
