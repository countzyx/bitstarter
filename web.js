var express = require('express');
var fs = require('fs');
var app = express();

app.get('/', function(request, response) {
  var sIndexHtml = fs.readFileSync('./index.html', 'utf8').toString();
  response.send(sIndexHtml);
});


var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
