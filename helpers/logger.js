'use strict';
/**
 * Top level helpers.
 */

const ConsoleTransport = require('winston').transports.Console;
const bind = require('lodash').bind;
const winston = require('winston');


/**
 *
 * @param {string} optLogLevel
 * @param {Object} optTransport
 * @returns {function(this:*)|Function|*}
 */
let getLogger = function getLogger(optLogLevel, optTransport) {
  let logger = new winston.Logger({
    level: optLogLevel || 'info',
    transports: [optTransport || new ConsoleTransport()]
  });
  return bind(logger.log, logger);
};


module.exports = getLogger;
