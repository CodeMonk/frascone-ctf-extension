/*
 * Google bookmark command
 */
var gbk_c = {
nums: '123456789a',
// Initialize the key
initialize: function(command)
{
  command.key = 'gbk( [^:]*)?(:['+command.nums+']?)?';
},
     description: 'Google bookmark',
     preview: function(command, input, preview, terminal)
     {
       preview.preview('Search Google bookmark...');
       CTUtils.regularMatch(command.key, input);
       var keyword = RegExp.$1;
       var url = "https://www.google.com/bookmarks/find?output=xml&q="+(keyword);
       terminal.previewAjaxGet(preview, url, function(data){
           var data = CTUtils.textToXml(data);
           var pre = preview;

           // Set the value for template of details
           var title = 'Google bookmark Search result';
           var time = (new Date()).toLocaleString();
           var emptyMsg = 'No bookmark found.';

           var bookmarks = jQuery('bookmark',data).get();

           // Set the value for template of details
           var summaries = [];
           summaries.push({msg:'Keyword:',tip:keyword});
           summaries.push({msg:'Result size:',tip:bookmarks.length});

           var nums=command.nums;
           bookmarks = bookmarks.splice(0,nums.length);
           summaries.push({msg:'Display size:',tip:bookmarks.length});

           // Set the value for template of details
           var details = [];
           for(var i in bookmarks) {
             // Add shortcut action
             var action = CTerminal.addShortcut(nums.charAt(i),function(action){ CTerminal.createTab(action['url']); });
             bookmarks[i].key = nums.charAt(i);

             action['url']=jQuery('url',bookmarks[i]).get(0).textContent;
             var labels =[];
             var xmlLabels = jQuery('label',bookmarks[i]).get();
             for(var j in xmlLabels){
               var label = xmlLabels[j];
               labels.push(label.textContent);
             }
             details.push({msg:bookmarks[i].key+': '+jQuery('title',bookmarks[i]).get(0).textContent,tag:labels.join(',')});
           }

           pre.previewTemplateFile('details.html',{title:title,time:time,summaries:summaries, details:details,emptyMsg:emptyMsg});
           });
     },
enter: function(command, input, preview, terminal)
       {
         CTUtils.regularMatch(command.key, input);
         var keyword = RegExp.$1;
         var num = RegExp.$2;
         num = num.replace(':','');
         if((num.length==1)&&terminal.exeShortCut(num.charCodeAt(0))){
           terminal.close();
         }else{
           preview.insertTip('Wrong Item Num: '+num);
           var url = "https://www.google.com/bookmarks/find?q="+(keyword);
           setTimeout(function(){
             terminal.createTab(url);
             terminal.close();
           },1400);
         }
       }
};

/*
 * Google email
 */
var ge_c= {
key: 'ge',
     description: 'Gmail Preview',

    enter:function(command, input, preview, terminal){
      var url = "https://mail.google.com/";
      terminal.createTab(url);
      terminal.close();
    },

preview:function(command, input, preview, terminal) {
      preview.preview('Loading Gmail information...');
      var url = "https://mail.google.com/mail/feed/atom";

      terminal.previewAjaxGet(preview, url, function(data){

        data = CTUtils.textToXml(data);
        var messages = jQuery("entry",data).get();
        var fullcount = jQuery("fullcount",data).get(0).textContent;
        var numToDisplay = 10;
        if(messages!=undefined){
          messages = messages.splice(0,numToDisplay);
        }else{
          messages = {};
        }

        var summaries =[];
        summaries.push({msg:'New messages count: ',tip:fullcount});
        var details =[];
        for(var i in messages){
          var d = {};
          var m = messages[i];
          d.msg = jQuery('title',m).get(0).textContent;
          d.tag = 'From: '+jQuery('name',m).get(0).textContent+ ' @'+CTUtils.googleLocalTime(jQuery('modified',m).get(0).textContent);
          details.push(d);
        }

        var time = CTUtils.googleLocalTime(jQuery("modified",data).get(0).textContent);
        preview.previewTemplateFile('details.html',
          { title:jQuery("title",data).get(0).textContent,summaries:summaries, time:('Last modified: '+ time), details:details, emptyMsg:'No new message' }
        );
      });

    }
};

/*
 * Google Reader preview
 */
var gr_c={
key:'gr',
    description: 'Google Reader Preview',

    enter: function(command, input, preview, terminal){
      var url = "https://www.google.com/reader/view/";
      terminal.createTab(url);
      terminal.close();
    },

preview: function(command, input, preview, terminal){
      preview.preview('Loading Google Reader information...');
      var url = "https://www.google.com/reader/atom/?n=0";
      terminal.previewAjaxGet(preview, url, function(data){
            data = CTUtils.textToXml(data);
            //Get id
            var id = jQuery('id',data).get(0).textContent;
            var data = id.match(/tag:google.com,(\d+):reader\/user\/(\d+)\/state\/com.google\/reading-list/i);
            var url = 'http://www.google.com/reader/atom/user/'+data[2]+'/state/com.google/reading-list?&xt=user/'+data[2]+'/state/com.google/read'
            terminal.previewAjaxGet(preview, url, function(data){
              data = CTUtils.textToXml(data);

              //Set header information
              var title = jQuery('title', data).get(0).textContent;
              var time = CTUtils.googleLocalTime(jQuery('updated',data).get(0).textContent);
              var emptyMsg = 'No new Entry.';

              var entries = jQuery('entry', data).get();
              var length = entries.length;

              var summaries =[];
              summaries.push({msg:'New Entries count:',tip:length});

              var displaySize=8;
              entries = entries.splice(0, displaySize);
              var details = [];
              for(var i in entries){
                var entry = entries[ i ];
                details.push({msg:jQuery('title', entry).get(0).textContent,tag:'@'+CTUtils.googleLocalTime(jQuery('published', entry).get(0).textContent)});
              }
              if(length>displaySize)details.push({msg:'......',tag:''});

              preview.previewTemplateFile('details.html',
                { title:title,time:time, summaries:summaries, details:details, emptyMsg:emptyMsg }
                );
            });
      });
    }
};

/*
 * Google Search command
 */
var gs_c = {
nums: '123',
// Initialize the key
initialize: function(command)
{
  command.key = 'gs( [^:]*)?(:['+command.nums+']?)?';
},
     description: 'Google Search',
     preview: function(command, input, preview, terminal)
     {
       preview.preview('Google Search...');
       CTUtils.regularMatch(command.key, input);
       var keyword = RegExp.$1;
       var url = "http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q="+(keyword);

       terminal.previewAjaxGet(preview, url, function(data){
           var data = JSON.parse(data);
           var results=data.responseData.results;
           var pre = preview;

           // Set the value for template of details
           var title = 'Google Search result';
           var time = (new Date()).toLocaleString();
           var emptyMsg = 'No item found.';

           // Set the value for template of details
           var summaries = [];
           summaries.push({msg:'Keyword:',tip:keyword});
           summaries.push({msg:'Result size:',tip:results.length});

           var nums=command.nums;
           results= results.splice(0,nums.length);
           summaries.push({msg:'Display size:',tip:results.length});

           // Set the value for template of details
           var details = [];
           for(var i in results) {
             var result = results[i];
             // Add shortcut action
             var action = CTerminal.addShortcut(nums.charAt(i),function(action){ CTerminal.createTab(action['url']); });
             result.key = nums.charAt(i);

             action['url']=result.unescapedUrl;
             details.push({msg:result.key+': '+result.title,tag:result.content});
           }

           pre.previewTemplateFile('details.html',{title:title,time:time,summaries:summaries, details:details,emptyMsg:emptyMsg});
           });
     },
enter: function(command, input, preview, terminal)
       {
         CTUtils.regularMatch(command.key, input);
         var keyword = RegExp.$1;
         var num = RegExp.$2;
         num = num.replace(':','');
         if((num.length==1)&&terminal.exeShortCut(num.charCodeAt(0))){
           terminal.close();
         }else{
           preview.insertTip('Wrong Item Num: '+num);
           var url = "http://www.google.com/search?q="+(keyword);
           setTimeout(function(){
             terminal.createTab(url);
             terminal.close();
           },1000);
         }
       }
};

CTerminal.addCommand(ge_c);
CTerminal.addCommand(gr_c);
CTerminal.addCommand(gbk_c);
CTerminal.addCommand(gs_c);

