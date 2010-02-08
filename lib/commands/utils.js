/*
 * Google bookmark command
 */
var bk = {
key: 'bk( .*)?',
     description: 'Chrome Local bookmark search',
     preview: function(command, input, preview, terminal)
     {
       CTUtils.getLocalBookmarkTree(function(tree){

         CTUtils.regularMatch(command.key, input);
         var keyword = RegExp.$1;

         // Set the value for template of details
         var title = 'Local bookmark Search result';
         var time = (new Date()).toLocaleString();
         var emptyMsg = 'No bookmark found.';
         var summaries = [];
         summaries.push({msg:'Keyword:',tip:keyword});

         keyword = keyword.replace(/\s/g,'.*');
         keyword = '.*'+keyword+'.*';

         var bookmarks = [];
         var status = {deps:[]};
         CTUtils.getDTValues(tree, bookmarks,
           //isEnd by url
           function(node){return node.url!=undefined;},
           //setValueInTraveral
           function(node, status, depth){
             status.deps = status.deps.splice(0, depth);
             status.deps[depth] = node.title;
             return null;
           },
           //setValueInEnd
           function(node, status, depth){
             var bookmark = {};
             bookmark.tag = status.deps.join('>>');
             bookmark.url = node.url;
             bookmark.title = node.title;
             return bookmark;
           },
           status,
           //isValue(value)
           function(value){
             if (value!=null){
               return CTUtils.regularMatch(keyword,value.title) || CTUtils.regularMatch(keyword,value.tag) || CTUtils.regularMatch(keyword,value.url);
             }else{
               return false;
             }
           },
           0,
           //getTree(node)
           function(node){
             return node.children;
           }
          );

         // Set the value for template of details
         summaries.push({msg:'Result size:',tip:bookmarks.length});

         var nums="123456789a";
         bookmarks = bookmarks.splice(0,nums.length);
         summaries.push({msg:'Display size:',tip:bookmarks.length});

         // Set the value for template of details
         var details = [];
         for(var i in bookmarks) {
           var bookmark = bookmarks[i];
           // Add shortcut action
           var action = CTerminal.addShortcut(nums.charAt(i),function(action){ CTerminal.createTab(action['url']); });
           bookmark.key = nums.charAt(i);

           action['url']=bookmark.url;
           details.push({msg:bookmarks[i].key+': '+bookmark.title,tag:bookmark.tag});
         }

         preview.previewTemplateFile('details.html',{title:title,time:time,summaries:summaries, details:details,emptyMsg:emptyMsg});
       });
     },

enter: function(command, input, preview, terminal)
       {
         preview.preview('Please open the Bookmark manager by hand.');
       }
};

CTerminal.addCommand(bk);

