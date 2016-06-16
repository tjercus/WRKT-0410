var casper = require('casper').create();

casper.start('http://localhost:3000', function() {
    this.echo(this.getTitle());
});

casper.run();