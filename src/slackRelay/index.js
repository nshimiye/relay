'use strict';

const SlackRelay = require('./SlackRelay');

let _relayInstance = null;
class SlackRelayFactory {

  constructor() {}

  static get relayInstance() { return _relayInstance; } // getter
  static set relayInstance(value) { _relayInstance = value; } // setter

  static relay(token) {
    if (!SlackRelayFactory.relayInstance) {
      SlackRelayFactory.relayInstance = new SlackRelay(token);
    }
    return SlackRelayFactory.relayInstance;
  }

}

module.exports = SlackRelayFactory;
