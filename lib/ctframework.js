/*
 * The Chrome Terminal Framework kernel
 */

/*
 ***************************************************************
 * The utilities for Framework
 ***************************************************************
 */
var CTUtils = {
  /*
   * The partial keyboard code map
   */
KEYS:{
       'esc':27, 'escape':27, 'tab':9, 'space':32, 'return':13, 'enter':13, 'backspace':8, 'ctrl':17,

       'scrolllock':145, 'scroll_lock':145, 'scroll':145, 'capslock':20, 'caps_lock':20, 'caps':20, 'numlock':144, 'num_lock':144, 'num':144,

       'pause':19, 'break':19,

       'insert':45, 'home':36, 'delete':46, 'end':35,

       'pageup':33, 'page_up':33, 'pu':33,

       'pagedown':34, 'page_down':34, 'pd':34,

       'left':37, 'up':38, 'right':39, 'down':40,

       'f1':112, 'f2':113, 'f3':114, 'f4':115, 'f5':116, 'f6':117, 'f7':118, 'f8':119, 'f9':120, 'f10':121, 'f11':122, 'f12':123,

       '0':'48', '1':'49', '2':'50', '3':'51', '4':'52', '5':'53', '6':'54', '7':'55', '8':'56', '9':'57',

       'a':'65', 'b':'66', 'c':'67', 'd':'68', 'e':'69', 'f':'70', 'g':'71', 'h':'72', 'i':'73', 'j':'74', 'k':'75', 'l':'76', 'm':'77', 'n':'78', 'o':'79', 'p':'80', 'q':'81', 'r':'82', 's':'83', 't':'84', 'u':'85', 'v':'86', 'w':'87', 'x':'88', 'y':'89', 'z':'90'
     },

     /*
      * The Framework css/div ROOT id
      */
ROOT: 'chrome_terminal',

     /*
      * The timeout of pressing key and active preview action
      * 由普通人的按键速度决定，一般人是每秒钟3次多
      * 1000/3=333 => 400
      * ms
      */
TIMEOUT_OF_PREIEW: 400,

      /*
       * The local storage template directory
       */
      TEMPLATE_DIR: 'templates/',
      /*
       * Get the template url for chrome local storage template file
       */
      getChromeTemplatePath: function(filename)
      {
        return (CTUtils.TEMPLATE_DIR+filename);
      },
      /*
       * Get the Chrome Terminal File
       */
getChromeExtensionFile: function(filename, callback)
                        {
                          var request={};
                          request.method='readChromeFile';
                          request.url = chrome.extension.getURL(filename);
                          chrome.extension.sendRequest(request, callback);
                        },

      /*
       * The url of chrome MANIFEST
       */
MANIFEST_URL: 'manifest.json',

              /*
               * Create a new tab action
               */
              createTab: function(url)
              {
                // Send Request to background engine
                chrome.extension.sendRequest({method: 'createTab', url: url});
              },

              /*
               * XMLHttpRequest(Ajax)
               */
ajaxRequest: function(request, callback)
             {
               if (request.method!=undefined) request.ajaxMethod = request.method;
               request.method = 'ajaxRequest';
               chrome.extension.sendRequest(request, callback);
             },

             /*
              * Process the trimpath template string
              */
processTemplate: function(template, data)
                 {
                   return TrimPath.parseTemplate(template).process(data);
                 },

                 /*
                  * Check the regular match
                  */
regularMatch: function(pattern, str)
              {
                var re = new RegExp('^'+pattern+'$', "gi");
                var m = re.exec(str);
                return m!=null;
              },

              /*
               * Convert text to xml
               */
textToXml: function(text)
           {
             var parser=new DOMParser();
             return parser.parseFromString(text,"text/xml");
           },

           /*
            * Get Local time
            */
toLocalTime: function(year, month, day, hour, minute, sec, offset)
             {
               var y = parseInt(year, 10);
               var mo= parseInt(month, 10);
               var d = parseInt(day, 10);
               var h = parseInt(hour, 10);
               var mi= parseInt(minute, 10);
               var s = parseInt(sec, 10);
               h = (h - parseInt(offset, 10));
               return (new Date(y,mo-1,d,h,mi,s)).toLocaleString();
             },

             /*
              * Google Time translate
              * YYYY-MM-DDThh:mm:ssZ
              * offset = 0
              */
googleLocalTime: function(time)
                 {
                    var timeFormat = /(\d+)\-(\d+)\-(\d+)T(\d+):(\d+):(\d+)Z/;
                    var data= time.match(timeFormat);

                    return CTUtils.toLocalTime(data[1],data[2],data[3],data[4],data[5],data[6],(new Date().getTimezoneOffset())/60);
                 },

                 /*
                  * Get local bookmarks tree
                  */
getLocalBookmarkTree: function(callback)
                      {
                        CTUtils.sendRequest('getLocalBookmarkTree', callback);
                      },

                      /*
                       * Deph-Traveral setting in the tree
                       * isEnd(node)
                       * setValueInTraveral(node, status, depth)
                       * setValueInEnd(node, status, depth)
                       * isValue(value)
                       * getTree(node)
                       */
getDTValues: function(tree, array, isEnd, setValueInTraveral, setValueInEnd, status, isValue, depth, getTree)
             {
               if((tree==null)||(tree==undefined))return;
               for(var i in tree){
                 var node = tree[i];
                 if(isEnd(node)){
                   var value = setValueInEnd(node, status, depth);
                   if(isValue(value)) array.push(value);
                 }else{
                   var value = setValueInTraveral(node, status, depth);
                   if(isValue(value)) array.push(value);
                   CTUtils.getDTValues(getTree(node), array, isEnd, setValueInTraveral, setValueInEnd, status, isValue, depth+1, getTree);
                 }
               }
             },

             /*
              * Use the Google jsapi
              */
useGoogleJSAPI: function(callback)
                {
                  CTUtils.sendRequest('useGoogleJSAPI', callback);
                },

                /*
                 * Send Request to Backengine
                 */
sendRequest: function(method, callback)
             {
               var request={};
               request.method=method;
               chrome.extension.sendRequest(request, callback);
             }
}

/*
 ************************************************************************
 * The chrome Terminal Framework body
 ************************************************************************
 */
var CTerminal = {

  /*
   * The extension manifest
   */
MANIFEST:null,

         /*
          * The terminal DIV selector
          */
         INPUT: '#'+CTUtils.ROOT+' #form form input',
         FORM:'#'+CTUtils.ROOT+' #form form',
         PREVIEW:'#'+CTUtils.ROOT+' #preview',

         /*
          * The status of terminal is open or not
          */
         isOpen: false,

         /*
          * The Preview Action Run time
          */
         time: (new Date()).getTime(),

         /****************************************************
          *************** Shortcut events BEGIN***************
          ****************************************************/
         /*
          * The shortcuts(ctrl+alt+key) Event container
          */
         caShortcutsContainer: {},
         /*
          * Add a new Ctrl + Alt + Key Event
          */
         addShortcut: function(keycode, action)
         {
           return CTerminal.caShortcutsContainer[keycode] ={
             'action': action
           };
         },
         /*
          * Execute shortcut action
          */
exeShortCut: function(keycode)
             {
               for(var i in CTerminal.caShortcutsContainer){
                 if(CTUtils.KEYS[i]==keycode){
                   var action = CTerminal.caShortcutsContainer[i];
                   action['action'](action);
                   return true;
                 }
               }
               return false;
             },
         /****************************************************
          *************** Shortcut events END*****************
          ****************************************************/


         /****************************************************
          *************** CTF Open & Close BEGIN *************
          ****************************************************/
             /*
              * The Window namespace keydown event
              */
handleWindowKeyDown: function(e)
                     {
                        //Esc
                        if( e.keyCode == CTUtils.KEYS['esc']){
                          if(CTerminal.isOpen)
                            CTerminal.close();
                          return;
                        }
                        if( e.ctrlKey&&(e.keyCode == CTUtils.KEYS['space'])){
                          if(!CTerminal.isOpen)
                            CTerminal.open();
                          else
                            CTerminal.close();
                          return;
                        }
                        if(e.ctrlKey&&e.altKey){
                          CTerminal.exeShortCut(e.keyCode);
                        }
                     },

         /*
          * The framework Initialize
          */
initialize: function()
            {
              jQuery(window).keydown(CTerminal.handleWindowKeyDown);
              //set manifest
              CTUtils.getChromeExtensionFile(CTUtils.MANIFEST_URL,
                  function(data){
                    CTerminal.MANIFEST= JSON.parse(data);
                  });
            },

            /*
             * Open terminal
             */
open: function()
      {
        if(!CTerminal.isOpen){
          // Add the terminal div to document
          // CT body.div
          jQuery(document.body).append(
              "<div id='"+CTUtils.ROOT+"'><div id='form'><form><input type='text' maxlength='36'/></form></div><div id='preview'><img src='http://code.google.com/p/ctf-extension/logo?logo_id=1265500628'/></div></div>");

          // to open
          CTerminal.isOpen=true;

          // add the submit to form for enter action
          jQuery(CTerminal.FORM).submit(
              function(fn){
                CTerminal.enterAction(fn);
                return false;
              }
          );

          // add the keyup in input for preview action
          jQuery(CTerminal.INPUT).keyup(
            function(e){
              if(CTerminal.isOpen){
                if(!(e.ctrlKey||e.altKey||(e.keyCode==CTUtils.KEYS['esc'])||(e.keyCode==CTUtils.KEYS['enter']))){
                CTerminal.time=(new Date()).getTime();
                setTimeout(
                  function(e){
                    if((new Date()).getTime()-CTerminal.time>=CTUtils.TIMEOUT_OF_PREIEW){
                      CTerminal.previewAction(e);
                    }
                  },
                  CTUtils.TIMEOUT_OF_PREIEW);
                }
              }
            }
          );

          // Let the focus in INPUT
          jQuery(CTerminal.INPUT).focus();
        }
      },

      /*
       * Close Terminal
       */
close: function()
       {
         if(CTerminal.isOpen){
           jQuery('#'+CTUtils.ROOT).remove();

           //shortcuts event clean
           CTerminal.caShortcutsContainer = {}

           CTerminal.isOpen=false;
         }
       },
       /****************************************************
        *************** CTF Open & Close END ***************
        ****************************************************/

       /*
        * The Preview block journal number
        */
previewJNum: 0,
             /*
              * Return the new Preview block
              */
             getNewPreview: function()
             {
               ++ CTerminal.previewJNum;

               /*
                * The object of preview
                */
               var preview = {
                 // the journal number
previewJNum: CTerminal.previewJNum,
             //Check the preview Journal number
             checkPJN: function()
             {
               return this.previewJNum>=CTerminal.previewJNum-1;
             },

             // Display the str in Preview
preview: function(str)
         {
           if(this.checkPJN()){
             jQuery(CTerminal.PREVIEW).html(str);
           }
         },

         // Display with template
previewTemplate: function(str, data)
                 {
                   if(this.checkPJN()){
                     this.preview(CTUtils.processTemplate(str, data));
                   }
                 },

                 // Display with temlate file name
previewTemplateFile: function(filename, data)
                     {
                       var preObj = this;
                       if(this.checkPJN()){
                         CTUtils.getChromeExtensionFile(CTUtils.getChromeTemplatePath(filename),
                             function(str){
                               preObj.previewTemplate(str,data);
                             });
                       }
                     },

                     //Get current preview html
getCurrentPreview: function()
                   {
                     return jQuery(CTerminal.PREVIEW).html();
                   },

                   //Insert the tip message at the beginning of the preview
insertTip: function(msg)
           {
             this.preview("<p class='ctfxtip'>"+msg+"</p>"+this.getCurrentPreview());
           }
               };

               return preview;
             },

             /*
              * The array container for commands
              */
commandContainer: new Array(),

                  /*
                   * The Enter action
                   */
                  enterAction: function(fn)
                  {
                    var keys = jQuery(CTerminal.INPUT).val();
                    // Remove the prev/after spaces
                    keys = jQuery.trim(keys);
                    // the label for finding command status
                    var findCommand = false;
                    var preview = CTerminal.getNewPreview();

                    for(var i in CTerminal.commandContainer){
                      var item = CTerminal.commandContainer[i];
                      if(CTUtils.regularMatch(item.key, keys)){
                        item.enter(item, keys, preview, CTerminal);
                        findCommand = true;
                        break;
                      }
                    }
                    if(!findCommand){
                      preview.preview('Wrong command.');
                    }
                  },

                  /*
                   * The preview Action
                   */
previewAction: function(fn)
               {
                 var keys = jQuery(CTerminal.INPUT).val();
                 // Remove the prev/after spaces
                 keys = jQuery.trim(keys);
                 // the label for finding command status
                 var findCommand = false;
                 var preview = CTerminal.getNewPreview();

                 for(var i in CTerminal.commandContainer){
                   var item = CTerminal.commandContainer[i];
                   if(CTUtils.regularMatch(item.key, keys)){
                     preview.preview(item.description);
                     item.preview(item, keys, preview, CTerminal);
                     findCommand = true;
                     break;
                   }
                 }
                 if(!findCommand){
                   preview.preview('Command Incomplete...');
                 }
               },

               /*
                * Add New command
                * return the commandContainer's size
                * Command format:
                *   key:value(String of regular)
                *   description:value(String)
                *   preview:function(command, input, preview, terminal)
                *   enter:function(command, input, preview, terminal)
                *   [initialize:function(command)]
                */
addCommand: function(command)
            {
              //check the command format very slow
              //if( ("string"==(typeof command.key))&&
              //    ("string"==(typeof command.description))&&
              //    ("function"==(typeof command.preview))&&
              //    ("function"==(typeof command.enter)) )
              //  return CTerminal.commandContainer.push( command );
              //else
              //  return null;
              if('function'==(typeof command.initialize)){
                command.initialize(command);
              }
              CTerminal.commandContainer.push( command );
            },

            /*
             * Remove a command
             * return the removed command or NULL
             */
removeCommand: function(str)
               {
                 for(var i in CTerminal.commandContainer){
                   var item = CTerminal.commandContainer[i];
                   if(item.key==str){
                     CTerminal.commandContainer.splice(i, 1);
                     return item;
                   }
                 }
                 return null;
               },

               /*
                * Ajax Get Request
                */
ajaxGet: function(url, callback)
         {
           var request = {};
           request.method = 'GET';
           request.url = url;
           request.async = true;

           CTUtils.ajaxRequest(request, callback);
         },

         /*
          * Create Tab the decorator of CTUtils.createTab
          */
createTab: function(url)
           {
             CTUtils.createTab(url);
           },

           /*
            * The preview Ajax Get
            */
previewAjaxGet: function(preview, url, callback)
                {
                  var call = function(data){
                    if(data=='@ERROR QJGui@'){
                      preview.preview('Oops... Network Error or SECURITY Error.');
                    }else{
                      callback(data);
                    }
                  };
                  CTerminal.ajaxGet(url, call);
                }
}

// Initialize the Chrome Terminal Framework
CTerminal.initialize();

/************************ Inline commands begin **********************/
/*
 * about command
 */
var aboutC = {
key: 'about',
     description: 'Chrome Terminal about',
     preview: function(command, input, preview, terminal)
     {
       preview.previewTemplateFile('about.html', {manifest:terminal.MANIFEST});
     },
enter: function(command, input, preview, terminal)
       {
         preview.preview('Aa... Don\'t touch me, I recognize My NICK: QJGui.');
       }

};
CTerminal.addCommand(aboutC);

/*
 * help command
 */
var helpC = {
key: 'help',
     description: 'Chrome Terminal help',
     preview: function(command, input, preview, terminal)
     {
       preview.previewTemplateFile('help.html', {commands:terminal.commandContainer});
     },
enter: function(command, input, preview, terminal)
       {
         terminal.createTab('http://code.google.com/p/ctf-extension/wiki/HowtoUse');
         terminal.close();
       }

};
CTerminal.addCommand(helpC);
/************************ Inline commands end **********************/

