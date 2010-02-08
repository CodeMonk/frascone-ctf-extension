/*
 * The Extension Request Listener
 * request should contain a method for action checking and many other useful arguments
 */
var CTEngine ={
  /*
   * For Chrome extension Request Listener
   * request should at least have a method
   * callback arguments will contain a response object and request
   */
listener: function(request, sender, callback)
          {
            // createTab should have a argument for url
            // sender should have a url
            switch(request.method){
              case 'createTab':
                chrome.tabs.create({url:request.url});
                break;
              case 'ajaxRequest':
                CTEngine.sendAjaxRequest(
                  request.ajaxMethod, request.url, request.async,
                  //successCallback
                  callback);
                break;
              case 'readChromeFile':
                CTEngine.readChromeFile(request.url, callback);
                break;
              case 'getLocalBookmarkTree':
                chrome.bookmarks.getTree(callback);
                break;
            }
          },

          /*
           * Send Ajax Request
           */
sendAjaxRequest: function(method, url, async, successCallback)
                 {
                   var xhr = new XMLHttpRequest();
                   xhr.onreadystatechange = function() {
                     if(xhr.readyState==4){
                       switch(xhr.status){
                         // The html request finish right
                         case 200:
                           successCallback(xhr.responseText);
                           break;
                           // The template file read
                         case 0:
                           successCallback('@ERROR QJGui@');
                           break;
                       }
                     }
                   }
                   xhr.open(method , url, async);
                   xhr.send();
                 },

                 /*
                  * Read chrome File
                  */
readChromeFile: function(url, callback)
                {
                  var xhr = new XMLHttpRequest();
                  xhr.onreadystatechange = function() {
                    if(xhr.readyState==4){
                      switch(xhr.status){
                        case 0:
                          callback(xhr.responseText);
                          break;
                      }
                    }
                  }
                  xhr.open('GET' , url, true);
                  xhr.send();
                }
};
