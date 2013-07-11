var express = require('express');
var fs = require('fs');

var sIndexFileName = 'index.html';
var sData = fs.readFileSync(sIndexFileName);

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  response.send(sData);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
