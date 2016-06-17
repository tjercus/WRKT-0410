//casper.test.begin("The App should load with default state", 1, function suite(test) {
//casper.start("http://localhost:3000", function() {
casper.start("file:///home/tvalentijn/projects/lab/WRKT-0410/dist/index.html", function() {
  this.test.assertSelectorHasText("title", "WRKT-0410");
  // //test.assertExists("header#app-header");
  // casper.wait(1000, function() {
  //   test.echo("I've waited for a second.");
  // });
  // test.waitForSelector("header#panel-header", function() {
  //   this.debugPage();  
  // });
  // test.assertExists("aside#container-aside");
  // test.assertExists("article#container main");
  // test.assertSelectorHasText("header#panel-header", "New training");
});

casper.then(function() {
  this.wait(5000, function() {
    // this.capture('test/e2e/foo.jpg', undefined, {
    //   format: 'jpg',
    //   quality: 90
    // });
    //test.waitForSelector("header#panel-header", function() {
      this.debugPage();  
    //});
  });
});

casper.run();