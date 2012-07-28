/*
 *	http://ryangreenberg.com/archives/2010/03/greasemonkey_jquery.php
 *	https://gist.github.com/999065
 */
function GM_XHR() {
    this.type = null;
    this.url = null;
    this.async = null;
    this.username = null;
    this.password = null;
    this.status = null;
    this.headers = {};
    this.readyState = null;

    this.abort = function() {
        this.readyState = 0;
    };

    this.getAllResponseHeaders = function(name) {
      if (this.readyState!=4) return "";
      return this.rspHeaders;
    };

    this.getResponseHeader = function(name) {
      var regexp = new RegExp('^'+name+': (.*)$','im');
      var match = regexp.exec(this.rspHeaders);
      if (match) { return match[1]; }
      return '';
    };

    this.open = function(type, url, async, username, password) {
        this.type = type ? type : null;
        this.url = url ? url : null;
        this.async = async ? async : null;
        this.username = username ? username : null;
        this.password = password ? password : null;
        this.readyState = 1;
    };
    
    this.setRequestHeader = function(name, value) {
        this.headers[name] = value;
    };

    this.send = function(data) {
        this.data = data;
        var that = this;
        // http://wiki.greasespot.net/GM_xmlhttpRequest
        GM_xmlhttpRequest({
            method: this.type,
            url: this.url,
            headers: this.headers,
            data: this.data,
            onload: function(rsp) {
                // Populate wrapper object with returned data
                // including the Greasemonkey specific "rspHeaders"
                for (k in rsp) {
                    that[k] = rsp[k];
                }
                // now we call onreadystatechange
                that.onreadystatechange();
            },
            onerror: function(rsp) {
                for (k in rsp) {
                    that[k] = rsp[k];
                }
            }
        });
    };
};
