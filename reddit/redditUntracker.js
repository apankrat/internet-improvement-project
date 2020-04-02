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
  function unbind()
  {
    $('a').off('mousedown');
  }

  setInterval(unbind, 1000);
  unbind();

  var sendWas = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function(body)
  {
        if (body.search('event_type'))
        {
          console.log('gm/untracker - blocked, event_type');
          return;
        }

        sendWas.call(this, body);
  };
}

inject( untrack );
console.log('gm/untracker is on');
