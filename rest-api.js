var restify = require('restify'),
  fs = require('fs'),
  url = require("url");

var server = restify.createServer();

server.use(restify.CORS({}));
server.opts('/\.*/', corsHandler, optionsRoute);

server.use(restify.queryParser());
server.use(restify.bodyParser());

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

server.put('/trainings', function(req, res, next) {
  writeFileFromRequestbody("./data/trainings.js", req, res);
  return next();
});

server.put('/plans', function(req, res, next) {  
  writeFileFromRequestbody("./data/plans.js", req, res);
  return next();
});

server.put('/traininginstances', function(req, res, next) {
  writeFileFromRequestbody("./data/traininginstances.js", req, res);
  return next();
});

function writeFileFromRequestbody(filename, req, res) {
  fs.writeFile(filename, req.body, (err) => {
    if (err) {      
      res.writeHead(500);
      res.send(err);
    } else {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8'
      });
      res.end();
      console.log(`saved ${filename} @ ${new Date()}`);
    }
  });
};

function corsHandler(req, res, next) {  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
  res.setHeader('Access-Control-Max-Age', '1000');
  return next();
}

function optionsRoute(req, res, next) {
  res.send(200);
  return next();
}

server.listen(3333);
console.log("rest-api running at http://127.0.0.1:3333/");
