'use strict';
const relay = require('../../index');

const config = require('../../config').slack;
const token = config.SLACK_API_TOKEN; // for @chatty bot
const request = require('request');


let slackRelay;

// when instance is created, the connection is also made
slackRelay = relay.slackRelay(token);

// // query slack db
// slackWeb = relay.slackWeb(token);

// this more of connect than start
slackRelay.connect()
.then(relayInstance => {
  console.log('start the listener ...', relayInstance.users);

  //@TODO for direct message, it does not make sense to provide a channel field
  let replyHandler = function(relayObject, message, user, channel) {
    console.log('respond to user ...', relayObject, message, user, channel);
    if(user) {
      slackRelay.notify(user, 'user_typing');
      relayObject.send('Sorry for spamming!', user);
    }
  };
  // when receiving messages from a channel, it is also helpful to provide the user who posted the message
  // @TODO in your handler, you may want to send private message to this user
  let channelReplyHandler = function(relayObject, message, user, channel) {
    if (channel) {
      // @TODO relayObject.post('Sorry for spamming!', channel);
      slackRelay.notify(channel, 'user_typing');

      // @source: http://tambal.azurewebsites.net/joke/random
      let source = 'http://tambal.azurewebsites.net/joke/random';
      let tellMeAJoke = new Promise(function(resolve, reject) {
        request(source, (error, response, body) => {
          if (!error && response.statusCode == 200) {
            console.log(body); // Show the HTML for the Google homepage.
            resolve(JSON.parse(body).joke);
          } else {
            reject({ ok: false, message: 'no joke found' });
          }
        });
      });
      tellMeAJoke.then(joke => {
        console.log(joke);
        relayObject.post(`${joke} :sweat_smile: :sweat_smile:`, channel);
      }, error => {
        // @TODO report error
        console.error(error);
        relayObject.post(`not found :(`, channel);
      })
      .catch(e => {
        relayObject.post(`not found :(`, channel);

      });

    }
  };

  // return void or throws an error if something wrong happens
  console.log('start the listener ...');
  relayInstance.listen('direct_message', replyHandler);
  relayInstance.listen('direct_mention', channelReplyHandler);

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
