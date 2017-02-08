var express = require('express');
var app = express();
var LatLon = require('geodesy').LatLonEllipsoidal;
var _Request = require('request');
var Jimp = require("jimp");
var fs = require("fs");

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/geo/:lat,:lon', function(request, response) {
  var loc = new LatLon(request.params.lat,request.params.lon);
  var utm = loc.toUtm()
  var mgrs = utm.toMgrs()

  var data = {
        "result": {
            "latLon": loc.toString(),
            "utm": utm.toString(),
            "mgrs": mgrs.toString()
        }
    };
        response.json(data);
});

app.get('/loadGoogleMapImage/center=:lat,:lon&zoom=:zoom&gridCount=:gridCount', function(request, response) {
  var loc = new LatLon(request.params.lat,request.params.lon);
  var zoom_scale = request.params.zoom;
  var grid_row_count = request.params.gridCount;
  var metrePerPixel = 156543.03392 * Math.cos(loc.lat * Math.PI / 180) / Math.pow(2, zoom_scale);
  var pic_size = 580;
  var grid_w = (pic_size * metrePerPixel) * (grid_row_count/2);

  var start_n = loc.destinationPoint(grid_w,0);
  var start_s = loc.destinationPoint(grid_w,180);
  var start_e = loc.destinationPoint(grid_w,90);
  var start_w = loc.destinationPoint(grid_w,270);

  var line_w = pic_size * metrePerPixel;
  var array = [];

  for (var i = 0; i < grid_row_count  ; i++) {
    var start = new LatLon(start_n.lat, start_w.lon);  //nw
    var endLeft = start.destinationPoint(line_w * i,180);
    if (i != grid_row_count){
      for (var j = 0; j < grid_row_count ; j++) {
        var rowPos = endLeft.destinationPoint(line_w * j,90);// center of grid
        var centerX = rowPos.destinationPoint(line_w/2,90);
        var centerY = rowPos.destinationPoint(line_w/2,180);
        var center = new LatLon(centerY.lat,centerX.lon);
        array.push({"center":{"lat":center.lat,"lon":center.lon}});
        var url = 'http://maps.googleapis.com/maps/api/staticmap?center='+center.lat+','+center.lon+'&zoom='+zoom_scale+'&size=580x640&scale=2&maptype=satellite&key=AIzaSyDWgJlI9jXcz_brngz2mnJ-cwnHvetXAzo'

        Jimp.read(url).then(function (image) {
          // do stuff with the image
          console.log("image : " +image);
          image.crop( 0, 60, 1160, 1160).write("map.png");         // crop to the given region
          response.sendFile("map.png");
        }).catch(function (err) {
          console.log("image err: " +err);
        });

        console.log("i : " +i+"/j : "+j+ "lat : "+center.lat +" lon : "+center.lon);
      }
    }
  }
  //response.json({"metrePerPixel":metrePerPixel,"grid_w":grid_w,"line_w":line_w,"grid_row_count":grid_row_count,"result":array.length,"array":array});

});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});






//
