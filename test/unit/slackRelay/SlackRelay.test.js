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
    });
    it('resolves with an instance of SlackRelay class', function (done) {
      throw new Error('Not implemented yet');
    });
    it('rejects with a json object as output', function (done) {
      throw new Error('Not implemented yet');
    });

  });

  describe('#send()', function() {
    it('returns a promise all the time', function (done) {
      throw new Error('Not implemented yet');
    });

  });

  describe('#post()', function() {
    it('returns a promise all the time', function (done) {
    throw new Error('Not implemented yet');
    });

  });

  describe('#broadcast()', function() {
    it('returns a promise all the time', function (done) {
    throw new Error('Not implemented yet');
    });

  });

});
