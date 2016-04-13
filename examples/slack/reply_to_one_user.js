'use strict';
const relay = require('../../index');

const config = require('../../config').slack;
const token = config.SLACK_API_TOKEN; // for @chatty bot

let slackRelay;

// when instance is created, the connection is also made
slackRelay = relay.slackRelay(token);

// // query slack db
// slackWeb = relay.slackWeb(token);

// this more of connect than start
slackRelay.connect()
.then(relayInstance => {
  console.log('start the listener ...', relayInstance.users);

  let replyHandler = function(relayObject, message, user, channel) {

    console.log('respond to user ...', relayObject, message, user, channel);

    if (channel) {
      // @TODO relayObject.post('Sorry for spamming!', channel);
      slackRelay.notify(channel, 'user_typing');
      setTimeout(() => {
        relayObject.send('Sorry for spamming!', channel);
      }, 3000);

    } else {
      slackRelay.notify(user, 'user_typing');
      relayObject.send('Sorry for spamming!', user);
    }
  };
  // return void or throws an error if something wrong happens
  console.log('start the listener ...');
  relayInstance.listen('direct_message', replyHandler);

});



/** START for readme **/
// const relay = require('bot-relay');
// let token = '<slack bot token>'; //@TODO add url to get this token
// let slackRelay = relay.slackRelay(token);
//
// slackRelay.connect().then( relayInstance => {
//   // send messages to known users
//   relayInstance.send('Hi there!', 'mars');
//   // broadcast messages to all users
//   relayInstance.broadcast('Sorry for spamming!');
//   // post messages to channels
//   relayInstance.post('Helloo! I am alive :)');
//
// }, connectionError => {
//   // you can try to reconnect
//   // you can verify with slack to make sure your token is still valid
// });

/** END for readme **/
