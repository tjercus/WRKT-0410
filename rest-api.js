var http = require("http");
var fs = require("fs");
var url = require("url");

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
    var filename = "";
    var prefix = "";
    var subject = url.parse(request.url).pathname;
    if (subject === "/plans") {
      filename = "src/stores/plans.js";
      prefix = "export const plans = ";
    }
    if (subject === "/trainings") {
      filename = "src/stores/trainings.js";
      prefix = "export const trainings = ";
    }
    if (subject === "/traininginstances") {
      filename = "src/stores/traininginstances.js";
      prefix = "export const traininginstances = ";
    }    

    request.on("data", function(chunk) {
      console.log("Received body data:");
      var trainingsStr = prefix + chunk.toString();
      // simple JSON check as validation
      //var obj = JSON.parse(chunk.toString());
      //if (obj[0].uuid === "new-training") {
      fs.writeFile(filename, trainingsStr, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("saved " + filename);
        }
      });
      //} else {
      //console.log("trainings JSON was corrupt");
      //}
      console.log(trainingsStr);
    });

    request.on("end", function() {
      response.writeHead(200, "OK", corsHeaders);
      return response.end();
    });
  } else {
    console.log("sending GET response");
    console.log("URL was: " + request.url);
    response.writeHead(200, "try using PUT with a JSON in the body");
    return response.end();
  }
});
server.listen(3333);
