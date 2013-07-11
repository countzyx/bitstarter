var express = require('express');
var fs = require('fs');

var sIndexHtml = fs.readFileSync('./index.html', 'utf8').toString();

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  response.send(sIndexHtml);
});


var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
