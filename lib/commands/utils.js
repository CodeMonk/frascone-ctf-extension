/*
 * Chrome local bookmark search command
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

/*
 * Chrome local status
 * weather, time
 */
var status = {
key: 'status( .*)?',
     description: 'Chrome Local status',
     preview: function(command, input, preview, terminal)
     {
       CTUtils.useGoogleJSAPI(function(google){
         CTUtils.regularMatch(command.key, input);
         var keyword = RegExp.$1;
         if(!keyword || CTUtils.regularMatch("\t*",keyword)) keyword = google.loader.ClientLocation.address.city;

         var url = "http://www.google.com/ig/api?weather="+keyword;
         terminal.previewAjaxGet(preview, url, function(data){
           /**********************************************
            * Get Weather information BEGIN
            **********************************************/
           var xml= CTUtils.textToXml(data);
           var el = jQuery(xml).find("current_conditions");
           if (el.length == 0)
             return;
           var condition = el.find("condition").attr("data");
           var place = jQuery(xml).find("forecast_information > city").attr("data");

           var weatherId = CTUtils.WEATHER_TYPES.indexOf( condition.toLowerCase() );
           var imgSrc = "http://l.yimg.com/us.yimg.com/i/us/nws/weather/gr/";
           imgSrc += weatherId + "d.png";
           //change wind speed to kmh based on geolocation
           var wind_text = el.find("wind_condition").attr("data").split("at");
           var wind_speed = parseInt(wind_text[1].split(" ")[1]);
           var wind_units = "mph";
           var user_location = google.loader.ClientLocation.address;
           var temp_units = 'celsius';
           //http://en.wikipedia.org/wiki/Si_units
           //UK uses mph
           if (user_location && ["US","UM", "LR", "MM", "GB"].indexOf(user_location.country_code) == -1) {
             wind_units = "km/h";
             wind_speed = wind_speed * 1.6;
           }
           var wind = wind_text[0] + " at " + wind_speed.toFixed(1) + wind_units;
           var w= {
             condition: condition,
             temp_units: temp_units,
             tempc: el.find("temp_c").attr("data"),
             tempf: el.find("temp_f").attr("data"),
             humidity: el.find("humidity").attr("data").replace('Humidity: ',''),
             wind: wind.replace('Wind: ',''),
             img: imgSrc
           };
           console.log(w);
           /**********************************************
            * Get Weather information END
            **********************************************/

           // Set the value for template of details
           var title = 'Chrome Local status';
           var time = (new Date()).toLocaleString();
           var emptyMsg = 'No Information.';
           var summaries = [];
           summaries.push({msg:'Location:',tip:keyword});
           summaries.push({msg:'<img src=\''+w.img+'\'/>',tip:''});
           summaries.push({msg:'Chinese Tranditional Day: ', tip:google.chineseTranditionalDay});

           // Set the value for template of details
           var details = [];
           var tmp = w.tempc+'°C';
           if (w.temp_units == "fahrenheit") tmp = w.tempf+'°F';

           details.push({msg:'Temperature: ',tag:tmp});
           details.push({msg:'Condition: ',tag:w.condition});
           details.push({msg:'Wind: ',tag:w.wind});
           details.push({msg:'Humidity: ',tag:w.humidity});

           preview.previewTemplateFile('details.html',{title:title,time:time,summaries:summaries, details:details,emptyMsg:emptyMsg});
         });

       });
     },

enter: function(command, input, preview, terminal)
       {
       }
};

CTerminal.addCommand(status);

