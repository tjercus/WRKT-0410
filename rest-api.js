var restify = require("restify"),
  fs = require("fs"),
  url = require("url");

var server = restify.createServer();

server.use(restify.CORS({}));
server.opts("/\.*/", corsHandler, optionsRoute);

server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get("/trainings", restify.serveStatic({
  directory: "./data",
  file: "trainings.js"
}));

server.get("/plans/", (req, res, next) => {
  // TODO replace static data with IO action for real UUIDs and names
  const plans = [
    {"uuid": "a83a78aa-5d69-11e6-b3a3-1f76e6105d92", "name": "Pfitzinger 85/18"},
    {"uuid": "acc3d1b8-33ae-4d70-dda3-d0e885f516f4", "name": "10k plan #1"},
    {"uuid": "c4415a10-7677-11e6-88c3-471fa3acb3f8", "name": "Hansons Advanced Plan"}
  ];
  res.send(200, plans);
});

server.get("/traininginstances/:uuid", (req, res, next) => {
  console.log(`GET traininginstances STARTED with: ${req.params.uuid}`);
  res.setHeader("Content-Type", "text/json");
  fs.readFile("./data/traininginstances_" + req.params.uuid + ".js", "utf8", (err, contents) => {
    res.send(200, contents);
  });
  console.log(`GET traininginstances ${req.params.uuid}`);
  return next();
});

server.get("/plans/:uuid", (req, res, next) => {
  console.log(`GET plans STARTED with: ${req.params.uuid}`);
  res.setHeader("Content-Type", "text/json");
  fs.readFile(`./data/plan_${req.params.uuid}.js`, "utf8", (err, contents) => {
    res.send(200, contents);
  });
  console.log(`GET plans ${req.params.uuid}`);
  return next();
});

server.post("/plans", (req, res, next) => {
  //writeFileFromRequestbody("./data/plan_" + uuid + ".js", req, res);
  // TODO also "./data/traininginstances_" + uuid + ".js"
  return next();
});

server.put("/trainings", (req, res, next) => {
  writeFileFromRequestbody("./data/trainings.js", req, res);
  return next();
});

server.put("/plans/:uuid", (req, res, next) => {
  writeFileFromRequestbody("./data/plan_" + req.params.uuid + ".js", req, res);
  return next();
});

server.put("/traininginstances/:uuid", (req, res, next) => {
  writeFileFromRequestbody("./data/traininginstances_" + req.params.uuid + ".js", req, res);
  return next();
});

function writeFileFromRequestbody(filename, req, res) {
  console.log("writeFileFromRequestbody");
  fs.writeFile(filename, req.body, (err) => {
    if (err) {
      res.writeHead(500);
      res.send(err);
      console.log(`NOT saved ${filename} @ ${new Date()}: ${err}`);
    } else {
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8"
      });
      res.end();
      console.log(`saved ${filename} @ ${new Date()}`);
    }
  });
};

function corsHandler(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.setHeader("Access-Control-Expose-Headers", "X-Api-Version, X-Request-Id, X-Response-Time");
  res.setHeader("Access-Control-Max-Age", "1000");
  return next();
}

function optionsRoute(req, res, next) {
  res.send(200);
  return next();
}

server.listen(3333);
console.log("rest-api running at http://127.0.0.1:3333/");
