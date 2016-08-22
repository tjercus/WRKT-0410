var restify = require('restify'),
  fs = require('fs'),
  url = require("url");

// var corsHeaders = {
//   "access-control-allow-origin": "*",
//   "access-control-allow-methods": "GET, PUT, OPTIONS",
//   "access-control-allow-headers": "content-type, accept",
//   "access-control-max-age": 10, // Seconds.
//   "content-length": 0
// };

//var subject = url.parse(request.url).pathname;

var server = restify.createServer();

server.use(restify.CORS({
    //headers: corsHeaders // sets expose-headers
}));

server.use(restify.queryParser());
//server.use(restify.bodyParser());

server.get("/trainings", restify.serveStatic({
  directory: './data',
  file: "trainings.js"
}));

server.get("/traininginstances", restify.serveStatic({
  directory: './data',
  file: "traininginstances.js"
}));

server.get("/plans", restify.serveStatic({
  directory: './data',
  file: "plans.js"
}));

  // if (request.method == "OPTIONS") {
  //   console.log("sending OPTIONS response");
  //   response.writeHead(200, "OK", corsHeaders);
  //   return response.end();
  // }
  
  // var filename = "";
  // var prefix = "";
  // var version = " /* " + new Date() + " */ ";
  // if (subject === "/plans") {
  //   filename = "./data/plans.js";
  //   prefix = " export const plans = ";
  // }
  // if (subject === "/trainings") {
  //   filename = "./data/trainings.js";
  //   prefix = " export const trainings = ";
  // }
  // if (subject === "/traininginstances") {
  //   filename = "./data/traininginstances.js";
  //   prefix = " export const traininginstances = ";
  // }

  // if (request.method == "GET" && filename !== "") {
  //   console.log("handling GET for " + subject);
  //   var allHeaders = Object.assign({}, corsHeaders);
  //   allHeaders["content-type"] = "text/html";
  //   //response.writeHead(200, allHeaders);
  //   //response.end("{'uuid':'some data'}", "utf-8");
    
  //   fs.exists(filename, function(exists) {  
  //     if (exists) {
  //       console.log("filePath exists? " + exists);
  //     }
  //   });
    
  //   fs.readFile(filename, function(error, content) {
  //     if (error) {
  //       response.writeHead(500);
  //       response.end();
  //     } else {
  //       response.writeHead(200, allHeaders);
  //       response.end(content, 'utf-8');
  //     }
  //   });
  //   // fs.readFileSync(filename, "utf8", function(err, data) {
  //   //     if (err) {
  //   //       console.log(err);
  //   //       return;
  //   //     }
  //   //     //console.log(data);
  //   //     response.write(data);        
  //   // });
  // }

  // if (request.method == "PUT") {
  //   request.on("data", function(chunk) {
  //     console.log("Received body data:");
  //     var trainingsStr = version + prefix + chunk.toString();
  //     // simple JSON check as validation
  //     //var obj = JSON.parse(chunk.toString());
  //     //if (obj[0].uuid === "new-training") {
  //     fs.writeFile(filename, trainingsStr, (err) => {
  //       if (err) {
  //         console.log(err);
  //       } else {
  //         console.log("saved " + filename + " @ " + new Date());
  //       }
  //     });
  //     //} else {
  //     //console.log("trainings JSON was corrupt");
  //     //}
  //     console.log(trainingsStr);
  //   });

  //   request.on("end", function() {
  //     response.writeHead(200, "OK", corsHeaders);
  //     return response.end();
  //   });
  //   // } else {
  //   //   console.log("sending response for method other then GET, OPTIONS or PUT");
  //   //   console.log("URL was: " + request.url);
  //   //   response.writeHead(200, "try using PUT with a JSON in the body");
  //   //   return response.end();
  // }

server.listen(3333);
console.log("rest-api running at http://127.0.0.1:3333/");
