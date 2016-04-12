'use strict';

/**
 * Stand for a bot user
 * in charge of carrying messages from a locally confugured bot to slack
 */
const RtmClient = require('@slack/client').RtmClient;
const RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

// how to create private properties
const rtm = new WeakMap();

class SlackWeb {

  constructor(token, debug) {

    let _rtm = new RtmClient(token, {logLevel: 'none'});

    // you need to wait for the client to fully connect before you can send messages
    _rtm.on(RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED, function () {
      // This will send the message 'this is a test message' to the channel identified by id 'C0CHZA86Q'
      console.log('connection opened!', arguments);
    });

    _rtm.on(RTM_CLIENT_EVENTS.DISCONNECT, function () {
      // This will send the message 'this is a test message' to the channel identified by id 'C0CHZA86Q'
      console.log('connection closed', arguments);
    });

    _rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
      console.log('Message:', message);
    });

    _rtm.on(RTM_EVENTS.REACTION_ADDED, function handleRtmReactionAdded(reaction) {
      console.log('Reaction added:', reaction);
    });

    _rtm.on(RTM_EVENTS.REACTION_REMOVED, function handleRtmReactionRemoved(reaction) {
      console.log('Reaction removed:', reaction);
    });

    //@TODO how to make this async
    _rtm.start(function() {
      console.log('rtm connection started!', arguments);
    });
    rtm.set(this, _rtm);

  }

  /**
   * public
   */
  connect() {
    let _rtm = rtm.get(this);
    console.log('== connect ==', _rtm.slackAPIUrl, _rtm.userAgent, _rtm._token, _rtm.token);
    _rtm.disconnect();

  }

  /**
   * public
   */
  disconnect() {
    let _rtm = rtm.get(this);
    console.log('== disconnect ==', _rtm.slackAPIUrl, _rtm.userAgent, _rtm._token, _rtm.token);
    _rtm.disconnect();
  }
  configBot(options) { // set the name, the image ... of your bot
    throw new Error('Not implemented');
  }

  /**
   * public
   */
  send(message, user) { // => message = { text: <> } user = { username: <>, userid: <> }
    // rtm.sendMessage('this is a test message', 'C0CHZA86Q', function messageSent() {
    //   // optionally, you can supply a callback to execute once the message has been sent
    // });
    let _rtm = rtm.get(this);
    _rtm.sendMessage(message, user.userid || user.username, function messageSent() {
      console.log('done', arguments);
    });
    return new Promise((resolve, reject) => { resolve({ok: false, message: 'not sure if message got sent' }); } );
  }

  /**
   * public
   */
  broadcast(message) {

    return new Promise((resolve, reject) => { reject({ok: false, message: 'not implemented yet' }); } );
  }

}

// @TODO what is the difference between module.export
module.exports = SlackWeb;
