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

app.get('/geo/:lat/:lon', function(request, response) {
  var loc = new LatLon(request.params.lat,request.params.lon);
  var utm = loc.toUtm()
  var mgrs = utm.toMgrs()
  
  var data = {
        "result": {
            "utm": utm,
            "mgrs": mgrs
        }
    }; 
        response.json(data);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


