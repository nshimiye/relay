'use strict';
const dateFormat = require('dateformat');
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

setTimeout(() => {
  let users, channels, user, channel, message;
  // people that this bot can reach
  users = slackRelay.users;

  // .find function is an es6 function
  user = users.find(user => { return user.name === 'mars'; }); // { name: '@mars', userid: 'U0QEFMFD5', channelid: 'U0QEFMFD5' };
  console.log('Found user = ', user);
  let fdate = dateFormat(Date.now(), "mmmm dS, yyyy, h:MM:ss TT");
  message = {
    text: `[${ fdate }] Come on Smile, that's the point of life!`,
    data: {
      attachments: [{
        "fallback": "Testing fields",
        "color": "#36a64f",
        // "pretext": "Come on Smile, that's the point of life!",
        "text": "What it feels like to kick-start an awesome new project",
        fields: [{
          title: 'hi there',
          value: 'I am good',
          short: true
        }, {
          title: 'Who are you',
          value: 'Mars',
          short: true
        }]
      }]
    }
  };
  console.log('message send action setTimeout = ', message);
  let status = slackRelay.send(message, user);
  // @TODO send message to all users
  // status = slackRelay.broadcast(message);

  // @TODO slackRelay.disconnect();
  // console.log('message broadcast setTimeout = ', status);

}, 15000);
