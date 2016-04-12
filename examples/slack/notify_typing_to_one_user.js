'use strict';
const relay = require('../../index');

const config = require('../../config/index').slack;
const token = config.SLACK_API_TOKEN; // for @chatty bot

let slackRelay, lastTime;

// when instance is created, the connection is also made
slackRelay = relay.slackRelay(token);

// connect to slack
slackRelay.connect();

lastTime = Date.now();
setTimeout(() => {
  let users, channels, user, channel, message;
  // people that this bot can reach
  users = slackRelay.users;

  // notification
  slackRelay.notify('mars', 'user_typing');
  setTimeout(() => {
    // .find function is an es6 function
    user = users.find(user => { return user.name === 'mars'; }); // { name: '@mars', userid: 'U0QEFMFD5', channelid: 'U0QEFMFD5' };
    console.log('Found user = ', user);
    message = { text: `Heyo! Time since my birth is ${Date.now() - lastTime}` };
    let status = slackRelay.send(message, user);
  }, 5000);

}, 15000);
