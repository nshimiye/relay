'use strict';

class Relay {

  constructor() {}
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
