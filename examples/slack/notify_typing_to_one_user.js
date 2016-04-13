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
    message = { text: `Heyo! Time since my birth is ${Date.now() - lastTime}` };
    let status = slackRelay.send(message, 'mars');
  }, 5000);

}, 15000);
