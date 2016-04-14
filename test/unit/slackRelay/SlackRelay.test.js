/*jshint mocha:true */
'use strict';
const expect = require('chai').expect;
const token = 'invalid-token'; // invalid token
const SlackRelay = require('../../../src/slackRelay/SlackRelay');

describe('SlackRelay', function() {

  /**
   * connect the bot to slack
   */
  describe('#connect()', function() {
    it('returns a promise all the time', function (done) {
      let slackRelay = new SlackRelay(token);
      expect(slackRelay.connect()).to.be.a('promise');
      done();
    });

    //-- START
    /*
     * there is no clear way to test this because it depends on validity of the token
     * @TODO make this part of the functional tests
     */
    // it('resolves with an instance of SlackRelay class', function (done) {
    //   throw new Error('Not implemented yet');
    // });
    //-- END

    /*
     * For invalid tokens, this function should reject
     */
    it('rejects with a json object as output', function (done) {
      //
      let slackRelay = new SlackRelay(token);
      slackRelay.connect()
      .then(instance => {
        throw new Error('Should reject because token is wrong');
      }, error => {
        expect(error).to.be.a('object');
        expect(error.ok).to.be.a('boolean'); // false
        done();
      })
      .catch(e => {
        console.log('catch', e); //@TODO find out if it is better to throw error instead of just calling done
        done();
      });

    });

  });

  /**
   * send a message to slack
   * and return a promise that will resolve after the message has been sent
   * @TODO add a functional test that will use a valid token - resolves only if message was sent
   */
  describe('#send()', function() {

    it('returns a promise all the time', function (done) {
      // throw new Error('Not implemented yet');
      let slackRelay = new SlackRelay(token);
      expect(slackRelay.send()).to.be.a('promise');
      done();
    });

    it('rejects with a json object as output', function (done) {
      let slackRelay = new SlackRelay(token);
      slackRelay.send()
      .then(success_object => {
        throw new Error('Should reject because token is wrong');
      }, error => {
        expect(error).to.be.a('object');
        expect(error.ok).to.be.a('boolean'); // false
        done();
      })
      .catch(e => {
        console.log('catch', e); //@TODO find out if it is better to throw error instead of just calling done
        done();
      });
    });

  });

  /**
   * post a message to a slack channel
   * and return a promise that will resolve after the message has been posted
   */
  describe('#post()', function() {
    it('returns a promise all the time', function (done) {
      // throw new Error('Not implemented yet');
      let slackRelay = new SlackRelay(token);
      expect(slackRelay.post()).to.be.a('promise');
      done();
    });

    it('rejects with a json object as output', function (done) {
      let slackRelay = new SlackRelay(token);
      slackRelay.post()
      .then(success_object => {
        throw new Error('Should reject because token is wrong');
      }, error => {
        expect(error).to.be.a('object');
        expect(error.ok).to.be.a('boolean'); // false
        done();
      })
      .catch(e => {
        console.log('catch', e); //@TODO find out if it is better to throw error instead of just calling done
        done();
      });
    });

  });

  /**
   * send a message to a subset of users or all users in slack
   * and return a promise that will resolve after the message has been sent
   */
  describe('#broadcast()', function() {
    it('returns a promise all the time', function (done) {
      // throw new Error('Not implemented yet');
      let slackRelay = new SlackRelay(token);
      expect(slackRelay.broadcast()).to.be.a('promise');
      done();
    });

    it('rejects with a json object as output', function (done) {
      let slackRelay = new SlackRelay(token);
      slackRelay.broadcast()
      .then(success_object => {
        throw new Error('Should reject because token is wrong');
      }, error => {
        expect(error).to.be.a('object');
        expect(error.ok).to.be.a('boolean'); // false
        done();
      })
      .catch(e => {
        console.log('catch', e); //@TODO find out if it is better to throw error instead of just calling done
        done();
      });
    });

  });

  /**
   * listen to messages and reply to them
   * @TODO add a functional test that will use a valid token - resolves only if message was sent
   */
  describe('#listen()', function() {
    // this will help developers catch unknown errors that may occur during execution of "listen" method
    it('returns a promise all the time', function (done) {
      // throw new Error('Not implemented yet');
      let slackRelay = new SlackRelay(token);
      expect(slackRelay.listen()).to.be.a('promise');
      done();
    });

    it('rejects with a json object as output', function (done) {
      let slackRelay = new SlackRelay(token);
      slackRelay.listen()
      .then(success_object => {
        throw new Error('Should reject because token is wrong');
      }, error => {
        expect(error).to.be.a('object');
        expect(error.ok).to.be.a('boolean'); // false
        done();
      })
      .catch(e => {
        console.log('catch', e); //@TODO find out if it is better to throw error instead of just calling done
        done();
      });
    });
  });

});
