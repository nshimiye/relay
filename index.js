'use strict';
/**
 * @author Marcellin<mars@fusemachines.com>
 */

const SlackRelay = require('./src/slackRelay/index');
const BotkitRelay = require('./src/botkitRelay/index'); // this is the botkit from howdy

module.exports = {
   botkitRelay(token) {
     return BotkitRelay.relay(token);
   },
   slackRelay(token) {
     return SlackRelay.relay(token);
   }
};
