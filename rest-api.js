var http = require("http");
var fs = require("fs");

var corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, PUT, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  "content-length": 0
};

var server = http.createServer(function(request, response) {
  if (request.method == "OPTIONS") {
    console.log("sending OPTIONS response");
    response.writeHead(200, "OK", corsHeaders);
    return response.end();
  }
  if (request.method == "PUT") {
    console.log("sending PUT response");
    request.on("data", function(chunk) {
      console.log("Received body data:");
      var trainingsStr = "export const trainings = " + chunk.toString();
      // TODO simple JSON check as validation
      fs.writeFile("src/stores/trainings.js", trainingsStr, (err) => {
        if (err) { 
          console.log(err);
        } else {        
          console.log("saved ./src/stores/trainings.js");
        }
      }); 
      console.log(trainingsStr);
    });

    request.on("end", function() {
      response.writeHead(200, "OK", corsHeaders);
      return response.end();
    });
  } else {
    console.log("sending GET response");
    response.writeHead(200, "try using PUT with a JSON in the body");
    return response.end();
  }
});
server.listen(3333);
