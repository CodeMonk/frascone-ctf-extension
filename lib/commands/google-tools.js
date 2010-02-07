/*
 * Google bookmark command
 */
var gbk = {
key: 'gbk( .*)?',
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
           bookmarks = jQuery('bookmark',data).get();
           //console.log(bookmarks.length);
           nums="123456789abcdefg";
           bookmarks = bookmarks.splice(0,nums.length);
           for(var i in bookmarks) {
             var action = CTerminal.addShortcut(nums.charAt(i),function(action){ CTerminal.createTab(action['url']); });
           bookmarks[i].key = nums.charAt(i);
             action['url']=jQuery('url',bookmarks[i]).get(0).textContent;
           }
           pre.previewTemplateFile('gbk.html',{bookmarks:bookmarks});
           });
     },
enter: function(command, input, preview, terminal)
       {
         var url = "https://www.google.com/bookmarks";
         terminal.createTab(url);
         terminal.close();
       }
};

/*
 * Google email
 */
var ge= {
key: 'ge',
     description: 'Google Email Preview',

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
          d.tag = 'From: '+jQuery('name',m).get(0).textContent+ ' At: '+CTUtils.googleLocalTime(jQuery('modified',m).get(0).textContent);
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
var gr={
key:'gr',
    description: 'Google Reader Preview',

    enter: function(command, input, preview, terminal){
      var url = "https://www.google.com/reader/view/";
      terminal.createTab(url);
      terminal.close();
    },

preview: function(command, input, preview, terminal){
      preview.preview('Loading Google Reader information...');
      var url = "http://www.google.com/reader/api/0/unread-count?output=json";
      terminal.previewAjaxGet(preview, url, function(data){
        data = JSON.parse(data);
        var labels = {};
        for(var i in data.unreadcounts){
          var item = data.unreadcounts[i];
          item.id = jQuery.trim(item.id);
          if(CTUtils.regularMatch("user\/\\d+\/label\/(.+)",item.id)){
            labels[item.id] = {
              'name': RegExp.$1,
              'count': item.count
            };
          }
        }
        preview.previewTemplateFile('gr.html',
          { labels: labels }
          );
      });
    }
};

/*
 * Google Reader preview
 */
var gu={
key:'gu',
    description: 'Go to url in This page',

    enter: function(command, input, preview, terminal){
    },

preview: function(command, input, preview, terminal){
      preview.preview('Loading Page urls...');
      var urls = jQuery("a");
      //var urls = jQuery("a").attr("href", function(arr){
      //      console.log(arr);
      //      CTUtils.regularMatch('^([htps]+):',arr[0]);
      //      return arr[0].replace(RegExp.$1, 'https');
      //    });
      console.log(urls);
    }
};

CTerminal.addCommand(ge);
CTerminal.addCommand(gr);
CTerminal.addCommand(gbk);
//CTerminal.addCommand(gu);

