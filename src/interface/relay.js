'use strict';

const getLogger = require('../../helpers').getLogger;

class Relay {

  constructor() {
    let logger = getLogger();
    logger('verbose', 'relay instance created 1'); // @TODO find out how this works
    console.log('relay instance created 2');
  }
  /**
   * public
   * Send a message to one user
   */
  send(message, user) {
    return new Promise((resolve, reject) => { reject({ok: false, message: 'not implemented yet' }); } );
  }

  /**
   * public
   * Send message to all users
   */
  broadcast(message) {

    return new Promise((resolve, reject) => { reject({ok: false, message: 'not implemented yet' }); } );
  }

}

module.exports = Relay;
