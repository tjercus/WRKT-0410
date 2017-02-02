var fileinput = require("fileinput");
var glob = require("glob");

var filenames = glob.sync("./src/**/*.js");
fileinput.input(filenames).on("line", function(line) {
  var line = line.toString("utf8"); // TODO strip redundant newlines
  if (line.indexOf("eventbus.on") !== -1 || line.indexOf("eventbus.emit") !== -1) {
    console.log(line);
  }
});
