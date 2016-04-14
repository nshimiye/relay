/*jshint mocha:true */
'use strict';

before(function(done) {

  // Increase the Mocha timeout so that Sails has enough time to lift.
  this.timeout(200000);
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  done();
});
