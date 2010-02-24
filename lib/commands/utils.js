/*
 * Chrome local bookmark search command
 */
var bk = {
nums: '123456789a',
// Initialize the key
initialize: function(command)
{
  command.key = 'bk( [^:]*)?(:['+command.nums+']?)?';
},
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

         var nums = command.nums;
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
         CTUtils.regularMatch(command.key, input);
         var keyword = RegExp.$1;
         var num = RegExp.$2;
         num = num.replace(':','');
         if((num.length==1)&&terminal.exeShortCut(num.charCodeAt(0))){
           terminal.close();
         }else{
           preview.insertTip('Wrong Item Num: '+num);
         }
       }
};

CTerminal.addCommand(bk);

/*
 * Chrome local status
 * weather, time
 */
var status_c = {
key: 'status( .*)?',
     description: 'Chrome Local status',
     preview: function(command, input, preview, terminal)
     {

       /**********************************************
        * Get Weather information BEGIN
        **********************************************/
       function weatherInformation(xml, user_location){
         var el = jQuery(xml);
         if (el.length == 0)
           return null;
         var condition = el.find("condition").attr("data");

         var imgSrc = 'http://www.google.com'+jQuery(el).find('icon').attr("data");

         var wind = null;
         try{
           //change wind speed to kmh based on geolocation
           var wind_text = el.find("wind_condition").attr("data").split("at");
           var wind_speed = parseInt(wind_text[1].split(" ")[1]);
           var wind_units = "mph";
           var temp_units = 'celsius';
           //http://en.wikipedia.org/wiki/Si_units
           //UK uses mph
           if (user_location && ["US","UM", "LR", "MM", "GB"].indexOf(user_location.country_code) == -1) {
             wind_units = "km/h";
             wind_speed = wind_speed * 1.6;
           }
           wind = wind_text[0] + " at " + wind_speed.toFixed(1) + wind_units;
         }catch(err){
           wind = '';
         }
         var w= {
           condition: condition,
           temp_units: temp_units,
           tempc: el.find("temp_c").attr("data"),
           tempf: el.find("temp_f").attr("data"),
           humidity: el.find("humidity").attr("data"),
           wind: wind,
           img: imgSrc
         };
         if((w.tempc!=undefined)&&(w.tempf!=undefined)){
           var tmp = w.tempc+'°C';
           if (w.temp_units == "fahrenheit") tmp = w.tempf+'°F';
           w.temp = tmp;
         }else{
           w.temp ='';
         }
         return w;
         /**********************************************
          * Get Weather information END
          **********************************************/
       };

       CTUtils.useGoogleJSAPI(function(google){
         CTUtils.regularMatch(command.key, input);
         var keyword = RegExp.$1;
         if(!keyword || CTUtils.regularMatch("\t*",keyword)){
           try{
             keyword = google.loader.ClientLocation.address.city;
           }catch(err){
             keyword= 'Beijing';
             console.log(err);
           }
         }

         var url = "http://www.google.com/ig/api?weather="+keyword;
         terminal.previewAjaxGet(preview, url, function(data){
           var xml= CTUtils.textToXml(data);

           // Set the value for template of details
           var title = 'Chrome Local status';
           var time = (new Date()).toLocaleString();
           var emptyMsg = 'No Information.';
           var summaries = [];
           summaries.push({msg:'Location:',tip:keyword});
           summaries.push({msg:'Chinese Traditional Day: ', tip:google.chineseTraditionalDay});

           // Set the value for template of details
           var details = [];

           var ws=[];
           ws.push({msg:'Now',w: weatherInformation(jQuery(xml).find("current_conditions"), keyword)});
           var tws = jQuery('forecast_conditions', xml).get();
           for(var i in tws){
             var w = tws[i];
             console.log(w);
             ws.push({msg:jQuery(w).find('day_of_week').attr('data'), w: weatherInformation(w, keyword)});
           }
           for(var i in ws){
             var w = ws[i];
             if(w!=null){
               details.push({msg:w.msg,tag:['<img src=\''+w.w.img+'\'/>', w.w.temp, w.w.condition, w.w.wind, w.w.humidity].join(' ')});
             }
           }

           preview.previewTemplateFile('details.html',{title:title,time:time,summaries:summaries, details:details,emptyMsg:emptyMsg});
         });

       });
     },

enter: function(command, input, preview, terminal)
       {
         CTUtils.useGoogleJSAPI(function(google){
           // Set the value for template of details
           var title = 'Chrome Local status';
           var time = (new Date()).toLocaleString();
           var emptyMsg = 'No Information.';
           var summaries = [];
           // Set the value for template of details
           var details = [];
           details.push({msg:'Chinese Traditional Day: ', tag:google.chineseTraditionalDay});

           preview.previewTemplateFile('details.html',{title:title,time:time,summaries:summaries, details:details,emptyMsg:emptyMsg});
         });
       }
};

CTerminal.addCommand(status_c);

