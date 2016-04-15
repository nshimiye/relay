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
.then( relayInstance => {
  // post message to a channel
  console.log('start the listener ...', relayInstance);

  let lastTime, users, channels, user, channel, message;
  lastTime = Date.now();

  setTimeout(() => {

    message = `Heyo! [ before disconnect ] ${Date.now() - lastTime}`;
    let status = relayInstance.send(message, 'mars');
    console.log('message send action setTimeout = ', status);

    relayInstance.disconnect();
    setTimeout(() => {
      message = `Heyo! [ after disconnect SHOULD FAIL ] ${Date.now() - lastTime}`;
      let status = relayInstance.send(message, 'mars');
      console.log('message send action setTimeout = ', status);

      setTimeout(() => {
        slackRelay.connect().then( relayInstance => {
          message = `Heyo! [ after disconnect SHOULD SUCCEED ] ${Date.now() - lastTime}`;
          let status = relayInstance.send(message, 'mars');
          console.log('message send action setTimeout = ', status);

        }, connectionError => {});

      }, 5000);
    }, 5000);
  }, 5000);

}, connectionError => {
  // you can try to reconnect
  // you can verify with slack to make sure your token is still valid
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
