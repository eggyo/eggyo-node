var express = require('express');
var app = express();
var LatLon = require('geodesy').LatLonEllipsoidal;

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

app.get('/loadGoogleMapImage/center=:lat,:lon&zoom=:zoom&gridCount=:count', function(request, response) {
  var loc = new LatLon(request.params.lat,request.params.lon);
  var zoom_scale = request.params.zoom;
  var grid_row_count = request.params.count;
  var metrePerPixel = 156543.03392 * Math.cos(14.390 * Math.PI / 180) / Math.pow(2, zoom_scale);
  var pic_size = 580;
  var grid_w = (pic_size * metrePerPixel) * (grid_row_count/2);

  var start_n = loc.destinationPoint(grid_w,0);
  var start_s = loc.destinationPoint(grid_w,180);
  var start_e = loc.destinationPoint(grid_w,90);
  var start_w = loc.destinationPoint(grid_w,270);

  var line_w = pic_size * metrePerPixel;
  var array = [];

  for (i = 0; i < grid_row_count+1 ; i++) {
    var start = new LatLon(start_n.lat, start_w.lon);  //nw
    var endLeft = start.destinationPoint(line_w * i),180;
    var endRight = new LatLon(endLeft.lat, start_e.lon);
    if (i != grid_row_count){
      for (j = 0; j < grid_row_count ; j++) {
        var rowPos = endLeft.destinationPoint(line_w * j,90);// center of grid
        var centerX = rowPos.destinationPoint(line_w/2,90);
        var centerY = rowPos.destinationPoint(line_w/2,180);
        var center = new LatLon(centerY.lat,centerX.lon);
        array.push({"center":center});
      }
    }
    response.json(array);


  }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});






//
