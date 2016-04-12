'use strict';
const relay = require('../../index');

const config = require('../../config').slack;
const token = config.SLACK_API_TOKEN; // for @chatty bot

let slackRelay, lastTime;

// when instance is created, the connection is also made
slackRelay = relay.slackRelay(token);

// // query slack db
// slackWeb = relay.slackWeb(token);

// this more of connect than start
slackRelay.connect();

lastTime = Date.now();
setInterval(() => {
  let users, channels, user, channel, message;
  // people that this bot can reach
  users = slackRelay.users;

  // .find function is an es6 function
  user = users.find(user => { return user.name === 'mars'; }); // { name: '@mars', userid: 'U0QEFMFD5', channelid: 'U0QEFMFD5' };
  console.log('Found user = ', user);
  message = { text: `Heyo! Time since my birth is ${Date.now() - lastTime}` };
  let status = slackRelay.send(message, user);
  console.log('message send action setTimeout = ', status);
  // @TODO send message to all users
  // status = slackRelay.broadcast(message);

  // @TODO slackRelay.disconnect();
  // console.log('message broadcast setTimeout = ', status);

}, 15000);
