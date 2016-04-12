'use strict';

const BotkitRelay = require('./BotkitRelay');

let _relayInstance  = null; // not really private
class BotkitRelayFactory {

  constructor() {

  }

  static get relayInstance() { return _relayInstance; } // getter
  static set relayInstance(value) { _relayInstance = value; } // setter

  static relay(token) {
    if (!BotkitRelayFactory.relayInstance) {
      BotkitRelayFactory.relayInstance = new BotkitRelay(token);
    }
    return BotkitRelayFactory.relayInstance;
  }

}

module.exports = BotkitRelayFactory;
